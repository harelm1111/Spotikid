import React, { useState } from "react";
import { Globe, ArrowRight, ArrowLeft, Upload, Check, AlertTriangle } from "lucide-react";
import { createActivitiesBulk } from "../lib/api";

// Edit this list to add or remove admins who can access the bulk import screen.
const ADMIN_EMAILS = ["harelm@gmail.com"];

const VALID_CATEGORIES = ["nature", "water", "culture", "outdoor", "games"];

const COPY = {
  he: {
    dir: "rtl",
    title: "ייבוא אטרקציות",
    notAuthorized: "אין לך הרשאה לגשת לעמוד זה.",
    instructions: "העלו קובץ Excel (.xlsx) או CSV עם העמודות: שם, עיר, תיאור, שעות_פעילות, גיל_מינימום, גיל_מקסימום, קטגוריה, קישור_תמונה",
    chooseFile: "בחירת קובץ",
    parsing: "קורא את הקובץ...",
    geocoding: "מאתר מיקומים על המפה...",
    importing: "מייבא אטרקציות...",
    rowsFound: "שורות נמצאו בקובץ",
    rowsValid: "שורות תקינות לייבוא",
    rowsInvalid: "שורות עם שגיאה (לא יובאו)",
    startImport: "ייבוא לדאטהבייס",
    doneTitle: "הייבוא הושלם!",
    doneMessage: "אטרקציות נוספו בהצלחה למאגר.",
    backHome: "חזרה לעמוד הבית",
    invalidCategory: "קטגוריה לא תקינה",
    missingField: "שדה חובה חסר",
  },
  en: {
    dir: "ltr",
    title: "Import activities",
    notAuthorized: "You don't have permission to access this page.",
    instructions: "Upload an Excel (.xlsx) or CSV file with columns: name, city, description, hours, age_min, age_max, category, photo_url",
    chooseFile: "Choose file",
    parsing: "Reading file...",
    geocoding: "Looking up locations on the map...",
    importing: "Importing activities...",
    rowsFound: "rows found in file",
    rowsValid: "valid rows ready to import",
    rowsInvalid: "rows with errors (will be skipped)",
    startImport: "Import to database",
    doneTitle: "Import complete!",
    doneMessage: "Activities were successfully added to the database.",
    backHome: "Back to home",
    invalidCategory: "Invalid category",
    missingField: "Missing required field",
  },
};

async function geocodeAddress(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const results = await res.json();
    if (results && results.length > 0) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    }
  } catch {
    // Best-effort geocoding.
  }
  return { lat: null, lng: null };
}

// Normalizes a parsed spreadsheet row (Hebrew or English headers) into our DB schema.
function normalizeRow(row, t) {
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
    errors,
    data: {
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

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const [stage, setStage] = useState("idle"); // idle | parsing | review | geocoding | importing | done
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  if (!isAdmin) {
    return (
      <div dir={t.dir} className="min-h-screen bg-bg flex items-center justify-center px-4">
        <p className="text-sm text-inkSoft text-center">{t.notAuthorized}</p>
      </div>
    );
  }

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

      // Skip the instructions row (row 2 in the template) if it looks like a note, not real data.
      const dataRows = json.filter((r) => {
        const firstVal = Object.values(r)[0];
        return firstVal && !String(firstVal).includes("חובה");
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
      const { lat, lng } = await geocodeAddress(r.data.city);
      withCoords.push({ ...r.data, created_by: user.id, lat, lng });
    }

    setStage("importing");
    try {
      await createActivitiesBulk(withCoords);
      setStage("done");
    } catch (err) {
      setError(err.message);
      setStage("review");
    }
  };

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;

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
                <span className="flex items-center gap-1.5 text-primaryDk"><Check size={14} /> {t.rowsValid}</span>
                <span className="font-semibold text-primaryDk">{validCount}</span>
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
