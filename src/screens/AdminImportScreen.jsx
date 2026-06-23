import React, { useState, useEffect } from "react";
import { Globe, ArrowRight, ArrowLeft, Upload, Download, Check, AlertTriangle } from "lucide-react";
import { upsertActivitiesBulk, fetchAllActivities, fetchProfile } from "../lib/api";
import { isAdminUser } from "../lib/adminConfig";

const VALID_TYPES = ["attraction", "restaurant", "event"];

const VALID_CATEGORIES = [
  // attractions
  "nature", "water", "culture", "outdoor", "games", "experience",
  // restaurants
  "cafe", "israeli", "asian", "italian", "bar", "breakfast",
  // events
  "concert", "standup", "theater", "sports", "festival", "workshop",
];

const VALID_OCCASIONS = ["couple", "family", "kids", "friends"];
const VALID_STATUSES  = ["published", "pending", "rejected"];

const COPY = {
  he: {
    dir: "rtl",
    title: "ייבוא וייצוא מקומות",
    notAuthorized: "אין לך הרשאה לגשת לעמוד זה.",
    exportTitle: "ייצוא המאגר הקיים",
    exportSub: "מוריד קובץ Excel עם כל המקומות הקיימים. ערכו את הקובץ — הוסיפו שורות חדשות בתחתית, או ערכו שורות קיימות — ואז העלו אותו בחזרה.",
    exportButton: "ייצוא לקובץ Excel",
    exporting: "מייצא...",
    importTitle: "ייבוא קובץ",
    instructions: "העלו קובץ Excel (.xlsx) או CSV. שורות עם עמודת id קיימת יעודכנו; שורות בלי id יתווספו כחדשות.",
    chooseFile: "בחירת קובץ",
    parsing: "קורא את הקובץ...",
    geocoding: "מאתר מיקומים על המפה...",
    importing: "מייבא מקומות...",
    rowsFound: "שורות נמצאו בקובץ",
    rowsValid: "שורות תקינות לייבוא",
    rowsInvalid: "שורות עם שגיאה (לא יובאו)",
    newRows: "שורות חדשות",
    updatedRows: "שורות שיעודכנו",
    startImport: "ייבוא לדאטהבייס",
    doneTitle: "הייבוא הושלם!",
    doneMessage: "המקומות נוספו/עודכנו בהצלחה במאגר.",
    backHome: "חזרה לעמוד הבית",
    invalidType: "סוג לא תקין (השתמש ב: attraction/restaurant/event)",
    invalidCategory: "קטגוריה לא תקינה",
    invalidOccasion: "תגית הזדמנות לא תקינה",
    invalidPriceLevel: "רמת מחיר לא תקינה (השתמש ב: 1, 2 או 3)",
    invalidStatus: "סטטוס לא תקין (השתמש ב: published/pending/rejected)",
    missingField: "שדה חובה חסר",
    loading: "טוען...",
  },
  en: {
    dir: "ltr",
    title: "Import & export places",
    notAuthorized: "You don't have permission to access this page.",
    exportTitle: "Export current database",
    exportSub: "Downloads an Excel file with all existing places. Edit it — add new rows at the bottom, or edit existing ones — then upload it back.",
    exportButton: "Export to Excel",
    exporting: "Exporting...",
    importTitle: "Import file",
    instructions: "Upload an Excel (.xlsx) or CSV file. Rows with an existing id will be updated; rows without an id will be added as new.",
    chooseFile: "Choose file",
    parsing: "Reading file...",
    geocoding: "Looking up locations on the map...",
    importing: "Importing places...",
    rowsFound: "rows found in file",
    rowsValid: "valid rows ready to import",
    rowsInvalid: "rows with errors (will be skipped)",
    newRows: "new rows",
    updatedRows: "rows to update",
    startImport: "Import to database",
    doneTitle: "Import complete!",
    doneMessage: "Places were successfully added/updated in the database.",
    backHome: "Back to home",
    invalidType: "Invalid type (use: attraction/restaurant/event)",
    invalidCategory: "Invalid category",
    invalidOccasion: "Invalid occasion tag",
    invalidPriceLevel: "Invalid price level (use: 1, 2, or 3)",
    invalidStatus: "Invalid status (use: published/pending/rejected)",
    missingField: "Missing required field",
    loading: "Loading...",
  },
};

const COLUMN_HEADERS_HE = [
  "id", "סוג", "שם", "עיר", "תיאור",
  "שעות_פעילות", "קטגוריה", "תגיות_הזדמנות", "רמת_מחיר",
  "טלפון", "אתר", "תאריך_התחלה", "תאריך_סיום",
  "קישור_תמונה", "סטטוס",
];

async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const results = await res.json();
    if (results?.length > 0) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    }
  } catch {
    // best-effort; saved without coordinates
  }
  return { lat: null, lng: null };
}

function normalizeRow(row, t) {
  const id = row["id"] || row["ID"] || null;

  const type     = (row["סוג"]          || row["type"]         || "").toString().trim().toLowerCase();
  const name     = row["שם"]            || row["name"];
  const city     = row["עיר"]           || row["city"];
  const desc     = row["תיאור"]         || row["description"];
  const hours    = row["שעות_פעילות"]   || row["hours"]        || null;
  const category = (row["קטגוריה"]     || row["category"]     || "").toString().trim();

  const occasionRaw  = row["תגיות_הזדמנות"] || row["occasion_tags"] || "";
  const occasion_tags = occasionRaw
    ? String(occasionRaw).split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const priceLevelRaw = row["רמת_מחיר"]  || row["price_level"];
  const price_level   = priceLevelRaw !== undefined && priceLevelRaw !== ""
    ? parseInt(priceLevelRaw, 10)
    : null;

  const phone       = row["טלפון"]         || row["phone"]       || null;
  const website_url = row["אתר"]           || row["website_url"] || null;
  const event_start = row["תאריך_התחלה"]  || row["event_start"] || null;
  const event_end   = row["תאריך_סיום"]   || row["event_end"]   || null;
  const photo_url   = row["קישור_תמונה"]  || row["photo_url"]   || null;

  const statusRaw = (row["סטטוס"] || row["status"] || "published").toString().trim().toLowerCase();

  const errors = [];
  if (!name)        errors.push(`${t.missingField}: name`);
  if (!city)        errors.push(`${t.missingField}: city`);
  if (!desc)        errors.push(`${t.missingField}: description`);
  if (!type)        errors.push(`${t.missingField}: type`);
  else if (!VALID_TYPES.includes(type))             errors.push(`${t.invalidType}: "${type}"`);
  if (!category)    errors.push(`${t.missingField}: category`);
  else if (!VALID_CATEGORIES.includes(category))   errors.push(`${t.invalidCategory}: "${category}"`);

  for (const tag of occasion_tags) {
    if (!VALID_OCCASIONS.includes(tag)) errors.push(`${t.invalidOccasion}: "${tag}"`);
  }
  if (price_level !== null && (isNaN(price_level) || price_level < 1 || price_level > 3)) {
    errors.push(t.invalidPriceLevel);
  }
  if (!VALID_STATUSES.includes(statusRaw)) {
    errors.push(`${t.invalidStatus}: "${statusRaw}"`);
  }

  return {
    valid: errors.length === 0,
    isUpdate: !!id,
    errors,
    data: {
      ...(id ? { id } : {}),
      type:          errors.length ? type  : type  || "attraction",
      name,
      city,
      description:   desc,
      hours:         hours  || null,
      category,
      occasion_tags,
      price_level:   price_level ?? null,
      phone:         phone  || null,
      website_url:   website_url || null,
      event_start:   event_start || null,
      event_end:     event_end   || null,
      photo_url:     photo_url   || null,
      status:        VALID_STATUSES.includes(statusRaw) ? statusRaw : "published",
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
      const activities = await fetchAllActivities();
      const XLSX = await import("xlsx");

      const rowsForExport = activities.map((a) => ({
        id:               a.id,
        סוג:              a.type         || "attraction",
        שם:               a.name,
        עיר:              a.city,
        תיאור:            a.description,
        שעות_פעילות:      a.hours        || "",
        קטגוריה:          a.category     || "",
        תגיות_הזדמנות:   (a.occasion_tags || []).join(","),
        רמת_מחיר:        a.price_level  || "",
        טלפון:            a.phone        || "",
        אתר:              a.website_url  || "",
        תאריך_התחלה:     a.event_start  || "",
        תאריך_סיום:      a.event_end    || "",
        קישור_תמונה:     a.photo_url    || "",
        סטטוס:            a.status       || "published",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rowsForExport, { header: COLUMN_HEADERS_HE });
      const workbook  = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "מקומות");
      XLSX.writeFile(workbook, `mah-osim-places-${new Date().toISOString().slice(0, 10)}.xlsx`);

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
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      const json     = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const dataRows = json.filter((r) => {
        const values = Object.values(r);
        const hasAnyValue        = values.some((v) => v !== "" && v !== null && v !== undefined);
        const looksLikeInstructions = values.some((v) => String(v).includes("חובה"));
        return hasAnyValue && !looksLikeInstructions;
      });

      setRows(dataRows.map((r) => normalizeRow(r, t)));
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

  const validRows   = rows.filter((r) => r.valid);
  const validCount  = validRows.length;
  const invalidCount = rows.length - validCount;
  const newCount    = validRows.filter((r) => !r.isUpdate).length;
  const updateCount = validRows.filter((r) =>  r.isUpdate).length;

  return (
    <div dir={t.dir} className="min-h-screen bg-bg">
      <div className="sticky top-0 backdrop-blur-sm border-b border-line px-4 py-3 flex items-center justify-between z-10 bg-bg/95">
        <button onClick={onBack} className="text-ink"><BackIcon size={18} /></button>
        <span className="font-bold text-ink">{t.title}</span>
        <button
          onClick={() => setLang(lang === "he" ? "en" : "he")}
          className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink"
        >
          <Globe size={14} />
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-200">{error}</div>
        )}

        {/* Export */}
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

        {stage === "parsing"   && <div className="text-center py-16 text-sm text-inkSoft">{t.parsing}</div>}
        {stage === "geocoding" && <div className="text-center py-16 text-sm text-inkSoft">{t.geocoding}</div>}
        {stage === "importing" && <div className="text-center py-16 text-sm text-inkSoft">{t.importing}</div>}

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
                    {r.data.name || `Row ${i + 1}`}: {r.errors.join(" · ")}
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
