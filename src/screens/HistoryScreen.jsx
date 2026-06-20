import React, { useState, useEffect } from "react";
import { Globe, ArrowRight, ArrowLeft, Clock, User as UserIcon } from "lucide-react";
import { fetchActivityHistory, fetchActivityById } from "../lib/api";

const COPY = {
  he: {
    dir: "rtl",
    title: "היסטוריית שינויים",
    noHistory: "לא נרשמו שינויים עדיין.",
    loading: "טוען...",
    fieldNames: {
      name: "שם",
      city: "עיר",
      description: "תיאור",
      hours: "שעות פעילות",
      age_min: "גיל מינימום",
      age_max: "גיל מקסימום",
      category: "קטגוריה",
      photo_url: "תמונה",
      lat: "מיקום (קו רוחב)",
      lng: "מיקום (קו אורך)",
    },
    changedFieldsLabel: "שדות ששונו",
    anonymous: "משתמש",
  },
  en: {
    dir: "ltr",
    title: "Edit history",
    noHistory: "No edits recorded yet.",
    loading: "Loading...",
    fieldNames: {
      name: "Name",
      city: "City",
      description: "Description",
      hours: "Opening hours",
      age_min: "Min age",
      age_max: "Max age",
      category: "Category",
      photo_url: "Photo",
      lat: "Location (lat)",
      lng: "Location (lng)",
    },
    changedFieldsLabel: "Changed fields",
    anonymous: "User",
  },
};

function timeAgo(dateStr, lang) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return lang === "he" ? "הרגע" : "Just now";
  if (minutes < 60) return lang === "he" ? `לפני ${minutes} דק׳` : `${minutes}m ago`;
  if (hours < 24) return lang === "he" ? `לפני ${hours} שע׳` : `${hours}h ago`;
  if (days < 30) return lang === "he" ? `לפני ${days} ימים` : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(lang === "he" ? "he-IL" : "en-US");
}

export default function HistoryScreen({ lang, setLang, onBack, activityId }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [activity, setActivity] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchActivityById(activityId), fetchActivityHistory(activityId)]).then(([a, h]) => {
      setActivity(a);
      setHistory(h);
      setLoading(false);
    });
  }, [activityId]);

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
        {loading ? (
          <div className="text-center py-16 text-sm text-inkSoft">{t.loading}</div>
        ) : (
          <>
            {activity && <h1 className="text-xl font-bold text-ink mb-5">{activity.name}</h1>}

            {history.length === 0 ? (
              <p className="text-sm text-inkSoft text-center py-10">{t.noHistory}</p>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => {
                  const editorName = entry.profiles?.email ? entry.profiles.email.split("@")[0] : t.anonymous;
                  const fields = Object.keys(entry.changed_fields || {});
                  return (
                    <div key={entry.id} className="rounded-2xl border border-line bg-surface p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-primary">
                            {editorName[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-ink">{editorName}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-inkSoft">
                          <Clock size={11} /> {timeAgo(entry.edited_at, lang)}
                        </span>
                      </div>
                      <div className="text-xs text-inkSoft mb-1.5">{t.changedFieldsLabel}:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {fields.map((f) => (
                          <span key={f} className="text-xs font-medium rounded-full px-2.5 py-1 bg-tint text-primaryDk">
                            {t.fieldNames[f] || f}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
