import React, { useState, useEffect } from "react";
import {
  Globe, ArrowRight, ArrowLeft, MapPin, Star, Heart, LogOut, User as UserIcon, PlusCircle, MessageSquare,
} from "lucide-react";
import { fetchMyActivities, fetchMyReviews, fetchSavedActivities, signOut } from "../lib/api";

const COPY = {
  he: {
    dir: "rtl",
    title: "האזור שלי",
    memberSince: "חבר/ה מאז",
    tabActivities: "האטרקציות שלי",
    tabReviews: "הביקורות שלי",
    tabSaved: "שמורים",
    noActivities: "עדיין לא הוספת אטרקציות.",
    noReviews: "עדיין לא כתבת ביקורות.",
    noSaved: "עדיין לא שמרת אטרקציות. לחצו על הלב בכל כרטיס כדי לשמור!",
    addOne: "הוספת אטרקציה ראשונה",
    signOut: "התנתקות",
    loading: "טוען...",
    yourReviewOn: "הביקורת שלך על",
  },
  en: {
    dir: "ltr",
    title: "My Area",
    memberSince: "Member since",
    tabActivities: "My Activities",
    tabReviews: "My Reviews",
    tabSaved: "Saved",
    noActivities: "You haven't added any activities yet.",
    noReviews: "You haven't written any reviews yet.",
    noSaved: "No saved activities yet. Tap the heart on any card to save it!",
    addOne: "Add your first activity",
    signOut: "Sign out",
    loading: "Loading...",
    yourReviewOn: "Your review on",
  },
};

function StarRow({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={12} className={n <= value ? "fill-star text-star" : "text-line"} />
      ))}
    </div>
  );
}

export default function ProfileScreen({ lang, setLang, onBack, onSignedOut, onOpenActivity, onAdd, user }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [tab, setTab] = useState("activities");
  const [myActivities, setMyActivities] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMyActivities(user.id), fetchMyReviews(user.id), fetchSavedActivities(user.id)])
      .then(([acts, revs, savedActs]) => {
        setMyActivities(acts);
        setMyReviews(revs);
        setSaved(savedActs);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleSignOut = async () => {
    await signOut();
    onSignedOut();
  };

  const joinDate = new Date(user.created_at).toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "long",
  });

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
        {/* User card */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 bg-primary">
            {user.email[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-ink">{user.email.split("@")[0]}</div>
            <div className="text-sm text-inkSoft">{t.memberSince} {joinDate}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setTab("activities")}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${tab === "activities" ? "bg-primary text-white border-primary" : "bg-surface text-ink border-line"}`}
          >
            <PlusCircle size={14} /> {t.tabActivities} ({myActivities.length})
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${tab === "reviews" ? "bg-primary text-white border-primary" : "bg-surface text-ink border-line"}`}
          >
            <MessageSquare size={14} /> {t.tabReviews} ({myReviews.length})
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${tab === "saved" ? "bg-primary text-white border-primary" : "bg-surface text-ink border-line"}`}
          >
            <Heart size={14} /> {t.tabSaved} ({saved.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-inkSoft">{t.loading}</div>
        ) : (
          <>
            {tab === "activities" && (
              myActivities.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-inkSoft mb-4">{t.noActivities}</p>
                  <button onClick={onAdd} className="text-sm font-semibold rounded-full px-5 py-2.5 bg-primary text-white">{t.addOne}</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myActivities.map((a) => (
                    <button key={a.id} onClick={() => onOpenActivity(a.id)} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-line bg-surface text-start">
                      <div className="w-14 h-14 rounded-xl shrink-0 bg-tint overflow-hidden">
                        {a.photo_url && <img src={a.photo_url} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-ink">{a.name}</div>
                        <div className="flex items-center gap-1 text-xs text-inkSoft"><MapPin size={11} /> {a.city}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}

            {tab === "reviews" && (
              myReviews.length === 0 ? (
                <p className="text-sm text-inkSoft text-center py-10">{t.noReviews}</p>
              ) : (
                <div className="space-y-3">
                  {myReviews.map((r) => (
                    <button key={r.id} onClick={() => onOpenActivity(r.activities?.id)} className="w-full p-3 rounded-2xl border border-line bg-surface text-start block">
                      <div className="text-xs text-inkSoft mb-1">{t.yourReviewOn} <span className="font-semibold text-ink">{r.activities?.name}</span></div>
                      <StarRow value={r.rating} />
                      {r.text && <p className="text-sm text-ink mt-1.5">{r.text}</p>}
                    </button>
                  ))}
                </div>
              )
            )}

            {tab === "saved" && (
              saved.length === 0 ? (
                <p className="text-sm text-inkSoft text-center py-10">{t.noSaved}</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {saved.map((a) => (
                    <button key={a.id} onClick={() => onOpenActivity(a.id)} className="rounded-2xl border border-line bg-surface overflow-hidden text-start">
                      <div className="h-20 bg-tint">
                        {a.photo_url && <img src={a.photo_url} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div className="p-2.5">
                        <div className="font-semibold text-xs text-ink leading-snug">{a.name}</div>
                        <div className="text-xs text-inkSoft mt-0.5">{a.city}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </>
        )}

        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 mt-10 py-3">
          <LogOut size={16} /> {t.signOut}
        </button>
      </div>
    </div>
  );
}
