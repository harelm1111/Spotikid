import React, { useState, useEffect } from "react";
import {
  MapPin, Clock, Globe, Camera, FileText, Tag as TagIcon, Check, ArrowRight, ArrowLeft,
  Phone, Link as LinkIcon, Calendar, Users, Layers,
} from "lucide-react";
import { createActivity, uploadPhoto, fetchProfile } from "../lib/api";
import { isAdminUser } from "../lib/adminConfig";

const COPY = {
  he: {
    dir: "rtl",
    addTitle: "הוספת מקום",
    addSub: "עזרו לאחרים לגלות את המקום הזה",
    type: "סוג המקום",
    name: "שם המקום",
    namePh: "לדוגמה: מסעדת הים, גן החיות, פסטיבל הג׳אז",
    location: "כתובת / עיר",
    locationPh: "לדוגמה: תל אביב, רחוב דיזנגוף 50",
    description: "תיאור",
    descriptionPh: "מה מיוחד במקום? למה כדאי לבוא?",
    hours: "שעות פעילות (לא חובה)",
    hoursPh: "לדוגמה: ראשון–חמישי 09:00–17:00",
    category: "קטגוריה",
    occasion: "מתאים ל (אפשר לבחור כמה)",
    priceLevel: "רמת מחיר (לא חובה)",
    phone: "טלפון (לא חובה)",
    phonePh: "לדוגמה: 052-1234567",
    website: "אתר אינטרנט (לא חובה)",
    websitePh: "לדוגמה: https://example.com",
    eventStart: "תאריך ושעת התחלה",
    eventEnd: "תאריך ושעת סיום (לא חובה)",
    photo: "תמונה (לא חובה)",
    addPhoto: "הוספת תמונה",
    photoSelected: "תמונה נבחרה",
    publish: "פרסום המקום",
    submitForReview: "שליחה לאישור",
    publishing: "שומר...",
    required: "שדה חובה",
    missingFields: "אנא מלאו שם, מיקום, תיאור וקטגוריה",
    missingEventDate: "לאירוע נדרש תאריך התחלה",
    genericError: "משהו השתבש. נסו שוב.",
    pendingTitle: "הגשה נשלחה!",
    pendingMsg: "הגשתכם התקבלה ותפורסם לאחר אישור מנהל. תודה!",
    backHome: "חזרה לדף הבית",
    price1: "₪ — נוח לכיס",
    price2: "₪₪ — בינוני",
    price3: "₪₪₪ — יוקרתי",
  },
  en: {
    dir: "ltr",
    addTitle: "Add a place",
    addSub: "Help others discover this place",
    type: "Place type",
    name: "Place name",
    namePh: "e.g. The Sea Restaurant, City Zoo, Jazz Festival",
    location: "Address / City",
    locationPh: "e.g. Tel Aviv, 50 Dizengoff St",
    description: "Description",
    descriptionPh: "What's special about it? Why should people visit?",
    hours: "Opening hours (optional)",
    hoursPh: "e.g. Sun–Thu 09:00–17:00",
    category: "Category",
    occasion: "Good for (select all that apply)",
    priceLevel: "Price level (optional)",
    phone: "Phone (optional)",
    phonePh: "e.g. 052-1234567",
    website: "Website (optional)",
    websitePh: "e.g. https://example.com",
    eventStart: "Start date & time",
    eventEnd: "End date & time (optional)",
    photo: "Photo (optional)",
    addPhoto: "Add photo",
    photoSelected: "Photo selected",
    publish: "Publish place",
    submitForReview: "Submit for review",
    publishing: "Saving...",
    required: "Required",
    missingFields: "Please fill in name, location, description, and category",
    missingEventDate: "Events require a start date",
    genericError: "Something went wrong. Please try again.",
    pendingTitle: "Submission received!",
    pendingMsg: "Your submission is pending review and will be published once approved. Thank you!",
    backHome: "Back to home",
    price1: "$ — Budget-friendly",
    price2: "$$ — Moderate",
    price3: "$$$ — Upscale",
  },
};

const TYPE_OPTIONS = {
  he: [
    { key: "attraction", label: "אטרקציה" },
    { key: "restaurant", label: "מסעדה / בית קפה" },
    { key: "event", label: "אירוע / הופעה" },
  ],
  en: [
    { key: "attraction", label: "Attraction" },
    { key: "restaurant", label: "Restaurant / Café" },
    { key: "event", label: "Event / Show" },
  ],
};

const TYPE_COLORS = { attraction: "#5B8C68", restaurant: "#C2854A", event: "#4F9AA8" };

const CATEGORIES_BY_TYPE = {
  attraction: [
    { key: "nature",     he: "טבע ובעלי חיים",          en: "Nature & Animals" },
    { key: "water",      he: "מים וקיץ",                en: "Water & Summer" },
    { key: "culture",    he: "תרבות ולמידה",            en: "Culture & Learning" },
    { key: "outdoor",    he: "טיולים בטבע",             en: "Outdoor & Hiking" },
    { key: "games",      he: "אתגר ומשחק",              en: "Games & Challenges" },
    { key: "experience", he: "חוויה ייחודית",           en: "Unique Experience" },
  ],
  restaurant: [
    { key: "cafe",      he: "בית קפה",                  en: "Café" },
    { key: "israeli",   he: "ישראלי / מזרח-תיכוני",    en: "Israeli / Middle Eastern" },
    { key: "asian",     he: "אסייאתי",                  en: "Asian" },
    { key: "italian",   he: "איטלקי / פיצה",            en: "Italian / Pizza" },
    { key: "bar",       he: "בר / אלכוהול",             en: "Bar / Drinks" },
    { key: "breakfast", he: "ארוחת בוקר",               en: "Breakfast" },
  ],
  event: [
    { key: "concert",   he: "הופעה / מוזיקה",           en: "Concert / Music" },
    { key: "standup",   he: "סטנדאפ",                   en: "Stand-up" },
    { key: "theater",   he: "תיאטרון / מחזמר",          en: "Theater / Musical" },
    { key: "sports",    he: "ספורט",                    en: "Sports" },
    { key: "festival",  he: "פסטיבל",                   en: "Festival" },
    { key: "workshop",  he: "סדנה / קורס",              en: "Workshop / Course" },
  ],
};

const CATEGORY_COLORS = {
  nature: "#5B8C68", water: "#4F9AA8", culture: "#C2854A",
  outdoor: "#7D8C5B", games: "#A6724F", experience: "#9B6B9E",
  cafe: "#8C7B5B", israeli: "#C2854A", asian: "#7B5E3A",
  italian: "#C2564A", bar: "#4A5A8C", breakfast: "#D4A843",
  concert: "#7B4A9B", standup: "#C27B4A", theater: "#4A7B9B",
  sports: "#4A9B6B", festival: "#C2574A", workshop: "#5B7A8C",
};

const OCCASION_OPTIONS = {
  he: [
    { key: "couple",  label: "זוגי / דייט" },
    { key: "family",  label: "משפחתי" },
    { key: "kids",    label: "עם ילדים" },
    { key: "friends", label: "עם חברים" },
  ],
  en: [
    { key: "couple",  label: "Couple / Date" },
    { key: "family",  label: "Family" },
    { key: "kids",    label: "With kids" },
    { key: "friends", label: "With friends" },
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
    // best-effort; activity saved without coordinates
  }
  return { lat: null, lng: null };
}

export default function AddActivityScreen({ lang, setLang, onBack, onPublished, user }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [myProfile, setMyProfile] = useState(null);
  useEffect(() => {
    if (user) fetchProfile(user.id).then(setMyProfile).catch(() => {});
  }, [user?.id]);
  const isAdmin = isAdminUser(user, myProfile);

  const [type, setType] = useState("attraction");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [category, setCategory] = useState(null);
  const [occasionTags, setOccasionTags] = useState([]);
  const [priceLevel, setPriceLevel] = useState(null);
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(null);
  };

  const toggleOccasion = (key) => {
    setOccasionTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handlePublish = async () => {
    setError("");
    if (!name || !city || !description || !category) {
      setError(t.missingFields);
      return;
    }
    if (type === "event" && !eventStart) {
      setError(t.missingEventDate);
      return;
    }

    setPublishing(true);
    try {
      let photo_url = null;
      if (photoFile) photo_url = await uploadPhoto(photoFile, "activities");

      const { lat, lng } = await geocodeAddress(city);

      await createActivity({
        created_by: user.id,
        status: isAdmin ? "published" : "pending",
        type,
        name,
        city,
        description,
        hours: hours || null,
        category,
        occasion_tags: occasionTags,
        price_level: priceLevel || null,
        phone: phone || null,
        website_url: websiteUrl || null,
        event_start: eventStart || null,
        event_end: eventEnd || null,
        photo_url,
        lat,
        lng,
      });

      if (isAdmin) {
        onPublished();
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.message || t.genericError);
    } finally {
      setPublishing(false);
    }
  };

  const inputClass =
    "w-full rounded-xl py-3 px-4 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors";

  if (submitted) {
    return (
      <div dir={t.dir} className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-tint flex items-center justify-center mb-4">
          <Check size={28} className="text-primaryDk" />
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">{t.pendingTitle}</h2>
        <p className="text-sm text-inkSoft mb-8 max-w-xs">{t.pendingMsg}</p>
        <button onClick={onPublished} className="text-sm font-semibold rounded-full px-6 py-3 bg-primary text-white">
          {t.backHome}
        </button>
      </div>
    );
  }

  const currentCategories = CATEGORIES_BY_TYPE[type] || [];

  return (
    <div dir={t.dir} className="min-h-screen bg-bg">
      <div className="sticky top-0 backdrop-blur-sm border-b border-line px-4 py-3 flex items-center justify-between z-10 bg-bg/95">
        <button onClick={onBack} className="text-ink"><BackIcon size={18} /></button>
        <span className="font-bold text-ink">{t.addTitle}</span>
        <button
          onClick={() => setLang(lang === "he" ? "en" : "he")}
          className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink"
        >
          <Globe size={14} />
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm mb-6 text-inkSoft">{t.addSub}</p>

        {error && (
          <div className="mb-4 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-5">

          {/* Type */}
          <Field icon={<Layers size={14} />} label={t.type} required>
            <div className="flex gap-2 flex-wrap">
              {TYPE_OPTIONS[lang].map((opt) => {
                const isSelected = type === opt.key;
                const color = TYPE_COLORS[opt.key];
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleTypeChange(opt.key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${isSelected ? "text-white" : "bg-surface text-ink border-line"}`}
                    style={isSelected ? { background: color, borderColor: color } : undefined}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Name */}
          <Field icon={<FileText size={14} />} label={t.name} required>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePh} className={inputClass} />
          </Field>

          {/* Location */}
          <Field icon={<MapPin size={14} />} label={t.location} required>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t.locationPh} className={inputClass} />
          </Field>

          {/* Description */}
          <Field icon={<FileText size={14} />} label={t.description} required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPh}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* Event dates — only for events */}
          {type === "event" && (
            <>
              <Field icon={<Calendar size={14} />} label={t.eventStart} required>
                <input type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} className={inputClass} />
              </Field>
              <Field icon={<Calendar size={14} />} label={t.eventEnd}>
                <input type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} className={inputClass} />
              </Field>
            </>
          )}

          {/* Hours */}
          <Field icon={<Clock size={14} />} label={t.hours}>
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder={t.hoursPh} className={inputClass} />
          </Field>

          {/* Category */}
          <Field icon={<TagIcon size={14} />} label={t.category} required>
            <div className="flex flex-wrap gap-2">
              {currentCategories.map((c) => {
                const isSelected = category === c.key;
                const color = CATEGORY_COLORS[c.key] || "#5B8C68";
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${isSelected ? "text-white" : "bg-surface text-ink border-line"}`}
                    style={isSelected ? { background: color, borderColor: color } : undefined}
                  >
                    {c[lang]}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Occasion tags */}
          <Field icon={<Users size={14} />} label={t.occasion}>
            <div className="flex flex-wrap gap-2">
              {OCCASION_OPTIONS[lang].map((opt) => {
                const isSelected = occasionTags.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleOccasion(opt.key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${isSelected ? "bg-primaryDk text-white border-primaryDk" : "bg-surface text-ink border-line"}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Price level */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-ink">{t.priceLevel}</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => setPriceLevel(priceLevel === level ? null : level)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${priceLevel === level ? "bg-primaryDk text-white border-primaryDk" : "bg-surface text-ink border-line"}`}
                >
                  {t[`price${level}`]}
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <Field icon={<Phone size={14} />} label={t.phone}>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePh} className={inputClass} />
          </Field>

          {/* Website */}
          <Field icon={<LinkIcon size={14} />} label={t.website}>
            <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder={t.websitePh} className={inputClass} />
          </Field>

          {/* Photo */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-ink">{t.photo}</label>
            <label className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-colors cursor-pointer ${photoFile ? "border-primary bg-tint" : "border-line"}`}>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhotoFile(f); }} className="hidden" />
              {photoFile ? (
                <><Check size={22} className="text-primaryDk" /><span className="text-sm font-medium text-primaryDk">{t.photoSelected}</span></>
              ) : (
                <><Camera size={22} className="text-inkSoft" /><span className="text-sm font-medium text-inkSoft">{t.addPhoto}</span></>
              )}
            </label>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full font-semibold rounded-xl py-3.5 transition-colors mt-2 text-white bg-primary disabled:opacity-50"
          >
            {publishing ? t.publishing : isAdmin ? t.publish : t.submitForReview}
          </button>

        </div>
      </div>
    </div>
  );
}
