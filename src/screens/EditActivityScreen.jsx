import React, { useState, useEffect } from "react";
import {
  MapPin, Clock, Globe, Camera, FileText, Tag as TagIcon, Check, ArrowRight, ArrowLeft, History,
} from "lucide-react";
import { fetchActivityById, updateActivity, uploadPhoto } from "../lib/api";

const COPY = {
  he: {
    dir: "rtl",
    editTitle: "עריכת אטרקציה",
    editSub: "כל משתמש רשום יכול לעדכן פרטים. כל שינוי נשמר בהיסטוריה ומוצג בשקיפות מלאה.",
    name: "שם האטרקציה",
    location: "כתובת / עיר",
    description: "תיאור",
    hours: "שעות פעילות",
    ageRange: "מתאים לגילאים",
    category: "קטגוריה",
    photo: "תמונה",
    addPhoto: "החלפת תמונה",
    photoSelected: "תמונה חדשה נבחרה",
    save: "שמירת שינויים",
    saving: "שומר...",
    viewHistory: "היסטוריית שינויים",
    missingFields: "אנא מלאו שם, מיקום, תיאור, שעות וקטגוריה",
    genericError: "משהו השתבש בשמירה. נסו שוב.",
    loading: "טוען...",
  },
  en: {
    dir: "ltr",
    editTitle: "Edit activity",
    editSub: "Any registered user can update details. Every change is logged and shown transparently.",
    name: "Activity name",
    location: "Address / City",
    description: "Description",
    hours: "Opening hours",
    ageRange: "Good for ages",
    category: "Category",
    photo: "Photo",
    addPhoto: "Replace photo",
    photoSelected: "New photo selected",
    save: "Save changes",
    saving: "Saving...",
    viewHistory: "Edit history",
    missingFields: "Please fill in name, location, description, hours, and category",
    genericError: "Something went wrong saving. Please try again.",
    loading: "Loading...",
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

function Field({ icon, label, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-ink">{icon} {label}</label>
      {children}
    </div>
  );
}

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

export default function EditActivityScreen({ lang, setLang, onBack, onSaved, onViewHistory, activityId, user }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const categories = CATEGORY_OPTIONS[lang];
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [ageRange, setAgeRange] = useState([1, 12]);
  const [category, setCategory] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchActivityById(activityId).then((a) => {
      setOriginal(a);
      setName(a.name);
      setCity(a.city);
      setDescription(a.description);
      setHours(a.hours);
      setAgeRange([a.age_min, a.age_max]);
      setCategory(a.category);
      setLoading(false);
    });
  }, [activityId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  const handleSave = async () => {
    setError("");
    if (!name || !city || !description || !hours || !category) {
      setError(t.missingFields);
      return;
    }

    setSaving(true);
    try {
      const updates = {};
      if (name !== original.name) updates.name = name;
      if (description !== original.description) updates.description = description;
      if (hours !== original.hours) updates.hours = hours;
      if (ageRange[0] !== original.age_min) updates.age_min = ageRange[0];
      if (ageRange[1] !== original.age_max) updates.age_max = ageRange[1];
      if (category !== original.category) updates.category = category;

      if (city !== original.city) {
        updates.city = city;
        const { lat, lng } = await geocodeAddress(city);
        updates.lat = lat;
        updates.lng = lng;
      }

      if (photoFile) {
        updates.photo_url = await uploadPhoto(photoFile, "activities");
      }

      if (Object.keys(updates).length > 0) {
        await updateActivity(activityId, updates, user.id);
      }

      onSaved();
    } catch (err) {
      setError(err.message || t.genericError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div dir={t.dir} className="min-h-screen bg-bg flex items-center justify-center">
        <span className="text-sm text-inkSoft">{t.loading}</span>
      </div>
    );
  }

  return (
    <div dir={t.dir} className="min-h-screen bg-bg">
      <div className="sticky top-0 backdrop-blur-sm border-b border-line px-4 py-3 flex items-center justify-between z-10 bg-bg/95">
        <button onClick={onBack} className="text-ink"><BackIcon size={18} /></button>
        <span className="font-bold text-ink">{t.editTitle}</span>
        <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink">
          <Globe size={14} />
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm mb-3 text-inkSoft">{t.editSub}</p>
        <button onClick={onViewHistory} className="flex items-center gap-1.5 text-sm font-medium text-primaryDk mb-6">
          <History size={14} /> {t.viewHistory}
        </button>

        {error && <div className="mb-4 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-200">{error}</div>}

        <div className="space-y-5">
          <Field icon={<FileText size={14} />} label={t.name}>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors" />
          </Field>

          <Field icon={<MapPin size={14} />} label={t.location}>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors" />
          </Field>

          <Field icon={<Clock size={14} />} label={t.hours}>
            <input value={hours} onChange={(e) => setHours(e.target.value)} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors" />
          </Field>

          <Field icon={<FileText size={14} />} label={t.description}>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors resize-none" />
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
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-ink"><TagIcon size={14} /> {t.category}</label>
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

          <button onClick={handleSave} disabled={saving} className="w-full font-semibold rounded-xl py-3.5 transition-colors mt-2 text-white bg-primary disabled:opacity-50">
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
