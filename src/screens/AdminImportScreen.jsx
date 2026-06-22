import React, { useState, useEffect } from "react";
import { Globe, ArrowRight, ArrowLeft, Upload, Download, Check, AlertTriangle } from "lucide-react";
import { createActivitiesBulk, upsertActivitiesBulk, fetchActivities, fetchProfile } from "../lib/api";
import { isAdminUser } from "../lib/adminConfig";

const VALID_CATEGORIES = ["nature", "water", "culture", "outdoor", "games"];

const COPY = {
  he: {
    dir: "rtl",
    title: "ייבוא וייצוא אטרקציות",
    notAuthorized: "אין לך הרשאה לגשת לעמוד זה.",
    exportTitle: "ייצוא המאגר הקיים",
    exportSub: "מוריד קובץ Excel עם כל האטרקציות הקיימות. ערכו את הקובץ — הוסיפו שורות חדשות בתחתית, או ערכו שורות קיימות — ואז העלו אותו בחזרה.",
    exportButton: "ייצוא לקובץ Excel",
    exporting: "מייצא...",
    importTitle: "ייבוא קובץ",
    instructions: "העלו קובץ Excel (.xlsx) או CSV. שורות עם עמודת id קיימת יעודכנו; שורות בלי id יתווספו כחדשות.",
    chooseFile: "בחירת קובץ",
    parsing: "קורא את הקובץ...",
    geocoding: "מאתר מיקומים על המפה...",
    importing: "מייבא אטרקציות...",
    rowsFound: "שורות נמצאו בקובץ",
    rowsValid: "שורות תקינות לייבוא",
    rowsInvalid: "שורות עם שגיאה (לא יובאו)",
    newRows: "שורות חדשות",
    updatedRows: "שורות שיעודכנו",
    startImport: "ייבוא לדאטהבייס",
    doneTitle: "הייבוא הושלם!",
    doneMessage: "האטרקציות נוספו/עודכנו בהצלחה במאגר.",
    backHome: "חזרה לעמוד הבית",
    invalidCategory: "קטגוריה לא תקינה",
    missingField: "שדה חובה חסר",
    loading: "טוען...",
  },
  en: {
    dir: "ltr",
    title: "Import & export activities",
    notAuthorized: "You don't have permission to access this page.",
    exportTitle: "Export current database",
    exportSub: "Downloads an Excel file with all existing activities. Edit it — add new rows at the bottom, or edit existing ones — then upload it back.",
    exportButton: "Export to Excel",
    exporting: "Exporting...",
    importTitle: "Import file",
    instructions: "Upload an Excel (.xlsx) or CSV file. Rows with an existing id will be updated; rows without an id will be added as new.",
    chooseFile: "Choose file",
    parsing: "Reading file...",
    geocoding: "Looking up locations on the map...",
    importing: "Importing activities...",
    rowsFound: "rows found in file",
    rowsValid: "valid rows ready to import",
    rowsInvalid: "rows with errors (will be skipped)",
    newRows: "new rows",
    updatedRows: "rows to update",
    startImport: "Import to database",
    doneTitle: "Import complete!",
    doneMessage: "Activities were successfully added/updated in the database.",
    backHome: "Back to home",
    invalidCategory: "Invalid category",
    missingField: "Missing required field",
    loading: "Loading...",
  },
};

const COLUMN_HEADERS_HE = ["id", "שם", "עיר", "תיאור", "שעות_פעילות", "גיל_מינימום", "גיל_מקסימום", "קטגוריה", "קישור_תמונה"];

async function geocodeAddress(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const results = await res.json();
    if (results && results.length > 0) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    }
  } catch {
  }
  return { lat: null, lng: null };
}

function normalizeRow(row, t) {
  const id = row["id"] || row["ID"] || null;
  const name = row["שם"] || row["name"];
  const city = row["עיר"] || row["city"];
  const description = row["תיאור"] || row["description"];
  const hours = row["שעות_פעילות"] || row["hours"];
  const ageMin = row["גיל_מינימום"] ?? row["age_min"];
  const ageMax = row["גיל_מקסימום"] ?? row["age_max"];
  const category = (row["קטגוריה"] || row["category"] || "").toString().trim();
  const photoUrl = row["קישור_תמונה"] || row["photo_url"] || null;

  const errors = [];
  if (!name) errors.push(t.missingField + ": name");
  if (!city) errors.push(t.missingField + ": city");
  if (!description) errors.push(t.missingField + ": description");
  if (!hours) errors.push(t.missingField + ": hours");
  if (ageMin === undefined || ageMin === "") errors.push(t.missingField + ": age_min");
  if (ageMax === undefined || ageMax === "") errors.push(t.missingField + ": age_max");
  if (!VALID_CATEGORIES.includes(category)) errors.push(`${t.invalidCategory}: ${category}`);

  return {
    valid: errors.length === 0,
    isUpdate: !!id,
    errors,
    data: {
      ...(id ? { id } : {}),
      name,
      city,
      description,
      hours,
      age_min: parseInt(ageMin, 10),
      age_max: parseInt(ageMax, 10),
      category,
      photo_url: photoUrl || null,
    },
  };
}

export default function AdminImportScreen({ lang, setLang, onBack, user }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [stage, setStage] = useState("idle");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [myProfile, setMyProfile] = useState(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const isAdmin = isAdminUser(user, myProfile);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id)
      .then(setMyProfile)
      .finally(() => setCheckingAdmin(false));
  }, [user]);

  if (checkingAdmin) {
    return (
      <div dir={t.dir} className="min-h-screen bg-bg flex items-center justify-center px-4">
        <p className="text-sm text-inkSoft">{t.loading}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div dir={t.dir} className="min-h-screen bg-bg flex items-center justify-center px-4">
        <p className="text-sm text-inkSoft text-center">{t.notAuthorized}</p>
      </div>
    );
  }

  const handleExport = async () => {
    setError("");
    setStage("exporting");
    try {
      const activities = await fetchActivities();
      const XLSX = await import("xlsx");

      const rowsForExport = activities.map((a) => ({
        id: a.id,
        שם: a.name,
        עיר: a.city,
        תיאור: a.description,
        שעות_פעילות: a.hours,
        גיל_מינימום: a.age_min,
        גיל_מקסימום: a.age_max,
        קטגוריה: a.category,
        קישור_תמונה: a.photo_url || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rowsForExport, { header: COLUMN_HEADERS_HE });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "אטרקציות");
      XLSX.writeFile(workbook, `spotikid-activities-${new Date().toISOString().slice(0, 10)}.xlsx`);

      setStage("idle");
    } catch (err) {
      setError(err.message);
      setStage("idle");
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setStage("parsing");

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const dataRows = json.filter((r) => {
        const values = Object.values(r);
        const hasAnyValue = values.some((v) => v !== "" && v !== null && v !== undefined);
        const looksLikeInstructions = values.some((v) => String(v).includes("חובה"));
        return hasAnyValue && !looksLikeInstructions;
      });

      const normalized = dataRows.map((r) => normalizeRow(r, t));
      setRows(normalized);
      setStage("review");
    } catch (err) {
      setError(err.message);
      setStage("idle");
    }
  };

  const handleImport = async () => {
    setStage("geocoding");
    const validRows = rows.filter((r) => r.valid);

    const withCoords = [];
    for (const r of validRows) {
      if (r.isUpdate) {
        withCoords.push(r.data);
      } else {
        const { lat, lng } = await geocodeAddress(r.data.city);
        withCoords.push({ ...r.data, created_by: user.id, lat, lng });
      }
    }

    setStage("importing");
    try {
      await upsertActivitiesBulk(withCoords);
      setStage("done");
    } catch (err) {
      setError(err.message);
      setStage("review");
    }
  };

  const validRows = rows.filter((r) => r.valid);
  const validCount = validRows.length;
  const invalidCount = rows.length - validCount;
  const newCount = validRows.filter((r) => !r.isUpdate).length;
  const updateCount = validRows.filter((r) => r.isUpdate).length;

  return (
    <div dir={t.dir} className="min-h-screen bg-bg">
      <div className="sticky top-0 backdrop-blur-sm border-b border-line px-4 py-3 flex items-center justify-between z-10 bg-bg/95">
        <button onClick={onBack} className="text-ink"><BackIcon size={18} /></button>
        <span className="font-bold text-ink">{t.title}</span>
        <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink">
          <Globe size={14} />
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && <div className="mb-4 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-200">{error}</div>}

        <div className="rounded-2xl border border-line bg-surface p-4 mb-6">
          <h2 className="font-bold text-ink mb-1.5">{t.exportTitle}</h2>
          <p className="text-sm text-inkSoft mb-4">{t.exportSub}</p>
          <button
            onClick={handleExport}
            disabled={stage === "exporting"}
            className="flex items-center justify-center gap-2 w-full font-semibold rounded-xl py-3 text-white bg-primaryDk disabled:opacity-50"
          >
            <Download size={16} />
            {stage === "exporting" ? t.exporting : t.exportButton}
          </button>
        </div>

        <div className="h-px bg-line mb-6" />

        <h2 className="font-bold text-ink mb-3">{t.importTitle}</h2>

        {stage === "idle" && (
          <>
            <p className="text-sm text-inkSoft mb-5">{t.instructions}</p>
            <label className="w-full border-2 border-dashed border-line rounded-xl py-10 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors">
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
              <Upload size={24} className="text-inkSoft" />
              <span className="text-sm font-medium text-inkSoft">{t.chooseFile}</span>
            </label>
          </>
        )}

        {stage === "parsing" && <div className="text-center py-16 text-sm text-inkSoft">{t.parsing}</div>}

        {stage === "review" && (
          <>
            <div className="rounded-2xl border border-line bg-surface p-4 mb-5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-inkSoft">{t.rowsFound}</span>
                <span className="font-semibold text-ink">{rows.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-primaryDk"><Check size={14} /> {t.newRows}</span>
                <span className="font-semibold text-primaryDk">{newCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-primaryDk"><Check size={14} /> {t.updatedRows}</span>
                <span className="font-semibold text-primaryDk">{updateCount}</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-red-500"><AlertTriangle size={14} /> {t.rowsInvalid}</span>
                  <span className="font-semibold text-red-500">{invalidCount}</span>
                </div>
              )}
            </div>

            {invalidCount > 0 && (
              <div className="mb-5 space-y-1.5">
                {rows.filter((r) => !r.valid).map((r, i) => (
                  <div key={i} className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                    {r.data.name || `Row ${i + 1}`}: {r.errors.join(", ")}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={validCount === 0}
              className="w-full font-semibold rounded-xl py-3.5 text-white bg-primary disabled:opacity-50"
            >
              {t.startImport} ({validCount})
            </button>
          </>
        )}

        {stage === "geocoding" && <div className="text-center py-16 text-sm text-inkSoft">{t.geocoding}</div>}
        {stage === "importing" && <div className="text-center py-16 text-sm text-inkSoft">{t.importing}</div>}

        {stage === "done" && (
          <div className="text-center py-16">
            <Check size={40} className="text-primary mx-auto mb-3" />
            <h2 className="font-bold text-ink mb-1">{t.doneTitle}</h2>
            <p className="text-sm text-inkSoft mb-6">{t.doneMessage}</p>
            <button onClick={onBack} className="text-sm font-semibold rounded-full px-5 py-2.5 bg-primary text-white">
              {t.backHome}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
