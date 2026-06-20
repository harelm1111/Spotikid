import React, { useState } from "react";
import {
  MapPin, Clock, Globe, Camera, FileText, Tag as TagIcon, Check, ArrowRight, ArrowLeft,
} from "lucide-react";
import { createActivity, uploadPhoto } from "../lib/api";

const COPY = {
  he: {
    dir: "rtl",
    addTitle: "הוספת אטרקציה",
    addSub: "עזרו להורים אחרים למצוא את המקום הזה",
    name: "שם האטרקציה",
    namePh: "לדוגמה: גן החיות התנכי",
    location: "כתובת / עיר",
    locationPh: "לדוגמה: ירושלים, רחוב המלך דוד 1",
    description: "תיאור",
    descriptionPh: "מה מיוחד במקום? למה כדאי לבוא?",
    hours: "שעות פעילות",
    hoursPh: "לדוגמה: 09:00–17:00",
    ageRange: "מתאים לגילאים",
    category: "קטגוריה",
    photo: "תמונה (לא חובה)",
    addPhoto: "הוספת תמונה",
    photoSelected: "תמונה נבחרה",
    publish: "פרסום האטרקציה",
    publishing: "מפרסם...",
    required: "שדה חובה",
    missingFields: "אנא מלאו שם, מיקום, תיאור, שעות וקטגוריה",
    genericError: "משהו השתבש בפרסום. נסו שוב.",
  },
  en: {
    dir: "ltr",
    addTitle: "Add an activity",
    addSub: "Help other parents discover this place",
    name: "Activity name",
    namePh: "e.g. Biblical Zoo",
    location: "Address / City",
    locationPh: "e.g. Jerusalem, 1 King David St",
    description: "Description",
    descriptionPh: "What's special about it? Why should families visit?",
    hours: "Opening hours",
    hoursPh: "e.g. 09:00–17:00",
    ageRange: "Good for ages",
    category: "Category",
    photo: "Photo (optional)",
    addPhoto: "Add photo",
    photoSelected: "Photo selected",
    publish: "Publish activity",
    publishing: "Publishing...",
    required: "Required",
    missingFields: "Please fill in name, location, description, hours, and category",
    genericError: "Something went wrong publishing. Please try again.",
  },
};

const CATEGORY_COLORS = {
  nature: "#5B8C68",
  water: "#4F9AA8",
  culture: "#C2854A",
  outdoor: "#7D8C5B",
  games: "#A6724F",
};

const CATEGORY_OPTIONS = {
  he: [
    { key: "nature", label: "טבע ובעלי חיים" },
    { key: "water", label: "מים וקיץ" },
    { key: "culture", label: "תרבות ולמידה" },
    { key: "outdoor", label: "טיולים בטבע" },
    { key: "games", label: "אתגר ומשחק" },
  ],
  en: [
    { key: "nature", label: "Nature & Animals" },
    { key: "water", label: "Water & Summer" },
    { key: "culture", label: "Culture & Learning" },
    { key: "outdoor", label: "Outdoor & Hiking" },
    { key: "games", label: "Games & Challenges" },
  ],
};

function Field({ icon, label, required, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-ink">
        {icon} {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
    </div>
  );
}

// Looks up lat/lng for a free-text address using OpenStreetMap's free Nominatim service.
async function geocodeAddress(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const results = await res.json();
    if (results && results.length > 0) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    }
  } catch {
    // Geocoding is best-effort; activity is still saved without coordinates.
  }
  return { lat: null, lng: null };
}

export default function AddActivityScreen({ lang, setLang, onBack, onPublished, user }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const categories = CATEGORY_OPTIONS[lang];
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [ageRange, setAgeRange] = useState([1, 12]);
  const [category, setCategory] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  const handlePublish = async () => {
    setError("");
    if (!name || !city || !description || !hours || !category) {
      setError(t.missingFields);
      return;
    }

    setPublishing(true);
    try {
      let photo_url = null;
      if (photoFile) {
        photo_url = await uploadPhoto(photoFile, "activities");
      }

      const { lat, lng } = await geocodeAddress(city);

      await createActivity({
        created_by: user.id,
        name,
        city,
        description,
        hours,
        age_min: ageRange[0],
        age_max: ageRange[1],
        category,
        photo_url,
        lat,
        lng,
      });

      onPublished();
    } catch (err) {
      setError(err.message || t.genericError);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div dir={t.dir} className="min-h-screen bg-bg">
      <div className="sticky top-0 backdrop-blur-sm border-b border-line px-4 py-3 flex items-center justify-between z-10 bg-bg/95">
        <button onClick={onBack} className="text-ink"><BackIcon size={18} /></button>
        <span className="font-bold text-ink">{t.addTitle}</span>
        <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink">
          <Globe size={14} />
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm mb-6 text-inkSoft">{t.addSub}</p>

        {error && <div className="mb-4 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-200">{error}</div>}

        <div className="space-y-5">
          <Field icon={<FileText size={14} />} label={t.name} required>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePh} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors" />
          </Field>

          <Field icon={<MapPin size={14} />} label={t.location} required>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t.locationPh} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors" />
          </Field>

          <Field icon={<Clock size={14} />} label={t.hours} required>
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder={t.hoursPh} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors" />
          </Field>

          <Field icon={<FileText size={14} />} label={t.description} required>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.descriptionPh} rows={4} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors resize-none" />
          </Field>

          <div>
            <label className="text-sm font-semibold mb-2 block text-ink">{t.ageRange}</label>
            <div className="rounded-xl p-4 border border-line bg-surface">
              <div className="flex items-center justify-between text-sm font-semibold mb-2 text-primaryDk">
                <span>{ageRange[0]}</span><span>{ageRange[1]}+</span>
              </div>
              <div className="flex gap-2">
                <input type="range" min="0" max="14" value={ageRange[0]} onChange={(e) => setAgeRange([Math.min(parseInt(e.target.value), ageRange[1]), ageRange[1]])} className="flex-1 accent-primary" />
                <input type="range" min="0" max="14" value={ageRange[1]} onChange={(e) => setAgeRange([ageRange[0], Math.max(parseInt(e.target.value), ageRange[0])])} className="flex-1 accent-primary" />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-ink"><TagIcon size={14} /> {t.category} <span className="text-primary">*</span></label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isSelected = category === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${isSelected ? "text-white" : "bg-surface text-ink border-line"}`}
                    style={isSelected ? { background: CATEGORY_COLORS[c.key], borderColor: CATEGORY_COLORS[c.key] } : undefined}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block text-ink">{t.photo}</label>
            <label className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-colors cursor-pointer ${photoFile ? "border-primary bg-tint" : "border-line"}`}>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              {photoFile ? (
                <><Check size={22} className="text-primaryDk" /><span className="text-sm font-medium text-primaryDk">{t.photoSelected}</span></>
              ) : (
                <><Camera size={22} className="text-inkSoft" /><span className="text-sm font-medium text-inkSoft">{t.addPhoto}</span></>
              )}
            </label>
          </div>

          <button onClick={handlePublish} disabled={publishing} className="w-full font-semibold rounded-xl py-3.5 transition-colors mt-2 text-white bg-primary disabled:opacity-50">
            {publishing ? t.publishing : t.publish}
          </button>
        </div>
      </div>
    </div>
  );
}
