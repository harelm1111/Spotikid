import React, { useState, useEffect } from "react";
import {
  MapPin, Clock, Star, Globe, ArrowRight, ArrowLeft, Image as ImageIcon, Pencil, History, ExternalLink,
} from "lucide-react";
import { fetchActivityById, fetchReviews, createReview, uploadPhoto } from "../lib/api";

const COPY = {
  he: {
    dir: "rtl",
    about: "על המקום",
    reviews: "ביקורות",
    writeReview: "כתיבת ביקורת",
    yourRating: "הדירוג שלך",
    reviewPh: "שתפו הורים אחרים בחוויה שלכם...",
    addReviewPhoto: "הוספת תמונה לביקורת",
    photoAdded: "תמונה נבחרה",
    submitReview: "שליחת ביקורת",
    submitting: "שולח...",
    loginToReview: "התחברו כדי לכתוב ביקורת",
    loading: "טוען...",
    noReviewsYet: "אין עדיין ביקורות. היו הראשונים לכתוב!",
    noRatingsYet: "אין דירוגים עדיין",
    ratingRequired: "בחרו דירוג לפני השליחה",
    anonymous: "הורה",
    justNow: "הרגע",
    editActivity: "ערוך פרטים",
    viewHistory: "היסטוריה",
    openInMaps: "ראו ביקורות ב-Google Maps",
  },
  en: {
    dir: "ltr",
    about: "About this place",
    reviews: "Reviews",
    writeReview: "Write a review",
    yourRating: "Your rating",
    reviewPh: "Share your experience with other parents...",
    addReviewPhoto: "Add a photo to your review",
    photoAdded: "Photo added",
    submitReview: "Submit review",
    submitting: "Submitting...",
    loginToReview: "Log in to write a review",
    loading: "Loading...",
    noReviewsYet: "No reviews yet. Be the first to write one!",
    noRatingsYet: "No ratings yet",
    ratingRequired: "Pick a rating before submitting",
    anonymous: "Parent",
    justNow: "Just now",
    editActivity: "Edit details",
    viewHistory: "History",
    openInMaps: "See reviews on Google Maps",
  },
};

function StarRating({ value, onChange, size = 22 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange && onChange(n)} type="button">
          <Star size={size} className={n <= value ? "fill-star text-star" : "text-line"} />
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr, lang) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return lang === "he" ? "היום" : "Today";
  if (days === 1) return lang === "he" ? "אתמול" : "Yesterday";
  if (days < 30) return lang === "he" ? `לפני ${days} ימים` : `${days} days ago`;
  const months = Math.floor(days / 30);
  return lang === "he" ? `לפני ${months} חודשים` : `${months} months ago`;
}

export default function ActivityDetailScreen({ lang, setLang, onBack, isLoggedIn, onRequireLogin, activityId, user, onEdit, onViewHistory }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [activity, setActivity] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [myPhotoFile, setMyPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (!activityId) return;
    Promise.all([fetchActivityById(activityId), fetchReviews(activityId)])
      .then(([a, r]) => {
        setActivity(a);
        setReviews(r);
      })
      .finally(() => setLoading(false));
  }, [activityId]);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const handleSubmitReview = async () => {
    setReviewError("");
    if (myRating === 0) {
      setReviewError(t.ratingRequired);
      return;
    }
    setSubmitting(true);
    try {
      let photo_url = null;
      if (myPhotoFile) {
        photo_url = await uploadPhoto(myPhotoFile, "reviews");
      }
      const newReview = await createReview({
        activity_id: activityId,
        user_id: user.id,
        rating: myRating,
        text: myText || null,
        photo_url,
      });
      setReviews([{ ...newReview, profiles: { email: user.email } }, ...reviews]);
      setMyRating(0);
      setMyText("");
      setMyPhotoFile(null);
    } catch (err) {
      setReviewError(err.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !activity) {
    return (
      <div dir={t.dir} className="min-h-screen bg-bg flex items-center justify-center">
        <span className="text-inkSoft text-sm">{t.loading}</span>
      </div>
    );
  }

  return (
    <div dir={t.dir} className="min-h-screen bg-bg">
      <div className="sticky top-0 backdrop-blur-sm border-b border-line px-4 py-3 flex items-center justify-between z-10 bg-bg/95">
        <button onClick={onBack} className="text-ink"><BackIcon size={18} /></button>
        <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink">
          <Globe size={14} />
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>

      <div className="h-48 w-full bg-tint">
        {activity.photo_url && <img src={activity.photo_url} alt={activity.name} className="w-full h-full object-cover" />}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <h1 className="text-2xl font-bold mb-2 text-ink">{activity.name}</h1>
        <div className="flex items-center gap-4 text-sm mb-1.5 text-inkSoft">
          <span className="flex items-center gap-1"><MapPin size={14} /> {activity.city}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {activity.hours}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-5">
          {avgRating ? (
            <>
              <Star size={16} className="fill-star text-star" />
              <span className="font-bold text-ink">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-inkSoft">({reviews.length} {t.reviews.toLowerCase()})</span>
            </>
          ) : (
            <span className="text-sm text-inkSoft">{t.noRatingsYet}</span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => (isLoggedIn ? onEdit(activityId) : onRequireLogin())}
            className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border border-line text-inkSoft"
          >
            <Pencil size={12} /> {t.editActivity}
          </button>
          <button
            onClick={() => onViewHistory(activityId)}
            className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border border-line text-inkSoft"
          >
            <History size={12} /> {t.viewHistory}
          </button>
          
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name + " " + activity.city)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border border-line text-inkSoft"
          >
            <ExternalLink size={12} /> {t.openInMaps}
          </a>
        </div>

        <h2 className="font-bold mb-2 text-ink">{t.about}</h2>
        <p className="text-sm leading-relaxed mb-7 text-ink">{activity.description}</p>

        <div className="h-px mb-6 bg-line" />

        <h2 className="font-bold mb-3 text-ink">{t.writeReview}</h2>
        {isLoggedIn ? (
          <div className="rounded-2xl p-4 mb-7 border border-line bg-surface">
            {reviewError && <div className="mb-3 text-sm rounded-xl px-3 py-2 bg-red-50 text-red-600 border border-red-200">{reviewError}</div>}
            <div className="mb-3">
              <span className="text-sm font-medium block mb-1.5 text-inkSoft">{t.yourRating}</span>
              <StarRating value={myRating} onChange={setMyRating} />
            </div>
            <textarea
              value={myText}
              onChange={(e) => setMyText(e.target.value)}
              placeholder={t.reviewPh}
              rows={3}
              className="w-full rounded-xl py-2.5 px-3.5 text-sm outline-none border border-line bg-bg text-ink focus:border-primary transition-colors resize-none mb-3"
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className={`flex items-center gap-1.5 text-sm font-medium rounded-full px-3 py-1.5 border cursor-pointer transition-colors ${myPhotoFile ? "bg-tint border-primary text-primaryDk" : "border-line text-inkSoft"}`}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setMyPhotoFile(e.target.files?.[0] || null)} />
                <ImageIcon size={14} /> {myPhotoFile ? t.photoAdded : t.addReviewPhoto}
              </label>
              <button onClick={handleSubmitReview} disabled={submitting} className="text-sm font-semibold rounded-full px-5 py-2 transition-colors text-white bg-primaryDk disabled:opacity-50">
                {submitting ? t.submitting : t.submitReview}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={onRequireLogin} className="w-full border-2 border-dashed rounded-2xl py-4 text-sm font-medium mb-7 transition-colors border-line text-inkSoft">
            {t.loginToReview}
          </button>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-inkSoft text-center py-6">{t.noReviewsYet}</p>
          ) : (
            reviews.map((r) => {
              const displayName = r.profiles?.email ? r.profiles.email.split("@")[0] : t.anonymous;
              return (
                <div key={r.id} className="border-b pb-4 border-line">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-primary">
                      {displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{displayName}</div>
                      <div className="text-xs text-inkSoft">{timeAgo(r.created_at, lang)}</div>
                    </div>
                  </div>
                  <StarRating value={r.rating} size={14} />
                  {r.text && <p className="text-sm leading-relaxed mt-2 text-ink">{r.text}</p>}
                  {r.photo_url && <img src={r.photo_url} alt="" className="w-20 h-20 rounded-lg mt-2.5 object-cover" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
