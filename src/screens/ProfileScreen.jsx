import React, { useState, useEffect } from "react";
import {
  Globe, ArrowRight, ArrowLeft, MapPin, Star, Heart, LogOut, User as UserIcon, PlusCircle, MessageSquare,
  Users, UserPlus, Calendar, Shield, ShieldOff, Lock, Eye, Clock, Flag, Check, X,
} from "lucide-react";
import {
  fetchMyActivities, fetchMyReviews, fetchSavedActivities, signOut, fetchProfile,
  fetchAllUsers, setUserAdminStatus, fetchMostViewedActivities, fetchTotalTimeSpentByUser,
  fetchOpenReports, resolveReport, deleteActivity, deleteReview,
} from "../lib/api";
import Logo from "../components/Logo";
import CategoryIllustration from "../components/CategoryIllustration";
import { isSuperAdmin, isAdminUser } from "../lib/adminConfig";

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
    adminImport: "ייבוא אטרקציות",
    adminPanel: "ניהול האפליקציה",
    usersTitle: "סטטיסטיקת משתמשים",
    totalUsers: "סך משתמשים",
    newThisWeek: "נרשמו השבוע",
    newThisMonth: "נרשמו החודש",
    recentUsers: "משתמשים אחרונים",
    manageAdmins: "ניהול מנהלים",
    makeAdmin: "הפוך למנהל",
    removeAdmin: "הסר ניהול",
    superAdmin: "מנהל ראשי",
    adminBadge: "מנהל",
    mostViewed: "האטרקציות הנצפות ביותר",
    timeSpentTitle: "זמן צפייה לפי משתמש",
    views: "צפיות",
    noViewsYet: "אין עדיין נתוני צפייה.",
    reportsTitle: "דיווחים פתוחים",
    noOpenReports: "אין דיווחים פתוחים כרגע.",
    reportedActivity: "אטרקציה",
    reportedReview: "ביקורת",
    reportReason: "סיבת הדיווח",
    reportedBy: "דווח על ידי",
    dismiss: "סגירה ללא פעולה",
    deleteContent: "מחיקת התוכן",
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
    adminImport: "Import activities",
    adminPanel: "App management",
    usersTitle: "User statistics",
    totalUsers: "Total users",
    newThisWeek: "Joined this week",
    newThisMonth: "Joined this month",
    recentUsers: "Recent users",
    manageAdmins: "Manage admins",
    makeAdmin: "Make admin",
    removeAdmin: "Remove admin",
    superAdmin: "Super admin",
    adminBadge: "Admin",
    mostViewed: "Most viewed activities",
    timeSpentTitle: "Time spent by user",
    views: "views",
    noViewsYet: "No view data yet.",
    reportsTitle: "Open reports",
    noOpenReports: "No open reports right now.",
    reportedActivity: "Activity",
    reportedReview: "Review",
    reportReason: "Report reason",
    reportedBy: "Reported by",
    dismiss: "Dismiss",
    deleteContent: "Delete content",
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

function formatDuration(totalSeconds, lang) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return lang === "he" ? `${seconds} שנ׳` : `${seconds}s`;
  return lang === "he" ? `${minutes} דק׳ ${seconds} שנ׳` : `${minutes}m ${seconds}s`;
}

export default function ProfileScreen({ lang, setLang, onBack, onSignedOut, onOpenActivity, onAdd, onAdminImport, user }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [tab, setTab] = useState("activities");
  const [myActivities, setMyActivities] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  // Admin panel data — only fetched/shown for admins, after we know admin status.
  const [allUsers, setAllUsers] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [timeSpent, setTimeSpent] = useState([]);
  const [openReports, setOpenReports] = useState([]);
  const [adminDataLoading, setAdminDataLoading] = useState(false);

  const amAdmin = isAdminUser(user, myProfile);

  useEffect(() => {
    Promise.all([fetchMyActivities(user.id), fetchMyReviews(user.id), fetchSavedActivities(user.id), fetchProfile(user.id)])
      .then(([acts, revs, savedActs, profile]) => {
        setMyActivities(acts);
        setMyReviews(revs);
        setSaved(savedActs);
        setMyProfile(profile);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    if (!amAdmin) return;
    setAdminDataLoading(true);
    Promise.all([fetchAllUsers(), fetchMostViewedActivities(10), fetchTotalTimeSpentByUser(), fetchOpenReports()])
      .then(([users, viewed, time, reports]) => {
        setAllUsers(users);
        setMostViewed(viewed);
        setTimeSpent(time);
        setOpenReports(reports);
      })
      .finally(() => setAdminDataLoading(false));
  }, [amAdmin]);

  const handleToggleAdmin = async (targetUser, currentlyAdmin) => {
    if (isSuperAdmin(targetUser)) return;
    try {
      await setUserAdminStatus(targetUser.id, !currentlyAdmin);
      setAllUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, is_admin: !currentlyAdmin } : u)));
    } catch {
      // Silent failure is acceptable here; the button simply won't update.
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      await resolveReport(reportId, "dismissed");
      setOpenReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      // No-op on failure — report stays in the queue for retry.
    }
  };

  const handleDeleteReportedContent = async (report) => {
    try {
      if (report.review_id) {
        await deleteReview(report.review_id);
      } else if (report.activity_id) {
        await deleteActivity(report.activity_id);
      }
      await resolveReport(report.id, "resolved");
      setOpenReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch {
      // No-op on failure — report stays in the queue for retry.
    }
  };

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
        <div className="flex items-center gap-2">
          <Logo size={26} />
          <span className="font-bold text-ink">{t.title}</span>
        </div>
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

        {/* Admin panel — visible only to admins, placed right at the top near the name */}
        {amAdmin && (
          <div className="rounded-2xl border border-line bg-surface p-4 mb-6">
            <h2 className="font-bold text-ink mb-3">{t.adminPanel}</h2>

            {adminDataLoading ? (
              <div className="text-sm text-inkSoft">{t.loading}</div>
            ) : (
              <>
                {/* Reports queue — shown first since it's the most actionable item */}
                <div className="text-xs font-semibold text-inkSoft mb-2">{t.reportsTitle} {openReports.length > 0 && `(${openReports.length})`}</div>
                {openReports.length === 0 ? (
                  <p className="text-xs text-inkSoft mb-4">{t.noOpenReports}</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {openReports.map((report) => (
                      <div key={report.id} className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-1">
                          <Flag size={11} />
                          {report.activity_id ? t.reportedActivity : t.reportedReview}
                        </div>
                        <p className="text-sm text-ink mb-1">
                          {report.activities?.name || report.reviews?.text || "—"}
                        </p>
                        <p className="text-xs text-inkSoft mb-1">{t.reportReason}: {report.reason}</p>
                        <p className="text-xs text-inkSoft mb-2.5">{t.reportedBy}: {report.profiles?.email || "—"}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDismissReport(report.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-medium rounded-full py-1.5 border border-line text-ink"
                          >
                            <X size={11} /> {t.dismiss}
                          </button>
                          <button
                            onClick={() => handleDeleteReportedContent(report)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-medium rounded-full py-1.5 bg-red-500 text-white"
                          >
                            <Check size={11} /> {t.deleteContent}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* User stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl bg-tint p-3 text-center">
                    <Users size={16} className="text-primaryDk mx-auto mb-1" />
                    <div className="font-bold text-lg text-ink">{allUsers.length}</div>
                    <div className="text-[11px] text-inkSoft">{t.totalUsers}</div>
                  </div>
                  <div className="rounded-xl bg-tint p-3 text-center">
                    <UserPlus size={16} className="text-primaryDk mx-auto mb-1" />
                    <div className="font-bold text-lg text-ink">
                      {allUsers.filter((u) => new Date(u.created_at) > new Date(Date.now() - 7 * 86400000)).length}
                    </div>
                    <div className="text-[11px] text-inkSoft">{t.newThisWeek}</div>
                  </div>
                  <div className="rounded-xl bg-tint p-3 text-center">
                    <Calendar size={16} className="text-primaryDk mx-auto mb-1" />
                    <div className="font-bold text-lg text-ink">
                      {allUsers.filter((u) => new Date(u.created_at) > new Date(Date.now() - 30 * 86400000)).length}
                    </div>
                    <div className="text-[11px] text-inkSoft">{t.newThisMonth}</div>
                  </div>
                </div>

                {/* Most viewed activities */}
                <div className="text-xs font-semibold text-inkSoft mb-2">{t.mostViewed}</div>
                {mostViewed.length === 0 ? (
                  <p className="text-xs text-inkSoft mb-4">{t.noViewsYet}</p>
                ) : (
                  <div className="space-y-1.5 mb-4">
                    {mostViewed.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b border-line pb-1.5">
                        <span className="text-ink truncate">{a.name} <span className="text-inkSoft text-xs">({a.city})</span></span>
                        <span className="flex items-center gap-1 text-xs text-primaryDk shrink-0">
                          <Eye size={11} /> {a.count} {t.views}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Time spent by user */}
                <div className="text-xs font-semibold text-inkSoft mb-2">{t.timeSpentTitle}</div>
                {timeSpent.length === 0 ? (
                  <p className="text-xs text-inkSoft mb-4">{t.noViewsYet}</p>
                ) : (
                  <div className="space-y-1.5 mb-4">
                    {timeSpent.slice(0, 10).map((u, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b border-line pb-1.5">
                        <span className="text-ink truncate">{u.email}</span>
                        <span className="flex items-center gap-1 text-xs text-primaryDk shrink-0">
                          <Clock size={11} /> {formatDuration(u.seconds, lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* User list + admin management */}
                <div className="text-xs font-semibold text-inkSoft mb-2">{t.recentUsers}</div>
                <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                  {allUsers.slice(0, 30).map((u) => {
                    const userIsSuperAdmin = isSuperAdmin(u);
                    return (
                      <div key={u.id} className="flex items-center justify-between text-sm border-b border-line pb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-ink truncate">{u.email}</span>
                          {userIsSuperAdmin && (
                            <span className="flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 bg-primaryDk text-white shrink-0">
                              <Lock size={9} /> {t.superAdmin}
                            </span>
                          )}
                          {!userIsSuperAdmin && u.is_admin && (
                            <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-tint text-primaryDk shrink-0">{t.adminBadge}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-inkSoft">
                            {new Date(u.created_at).toLocaleDateString(lang === "he" ? "he-IL" : "en-US")}
                          </span>
                          {!userIsSuperAdmin && (
                            <button
                              onClick={() => handleToggleAdmin(u, u.is_admin)}
                              className={`flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 border ${u.is_admin ? "border-red-200 text-red-500" : "border-line text-primaryDk"}`}
                            >
                              {u.is_admin ? <ShieldOff size={11} /> : <Shield size={11} />}
                              {u.is_admin ? t.removeAdmin : t.makeAdmin}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button onClick={onAdminImport} className="w-full text-sm font-semibold rounded-full px-5 py-2.5 bg-primary text-white">
                  {t.adminImport}
                </button>
              </>
            )}
          </div>
        )}

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
                        <CategoryIllustration category={a.category} photoUrl={a.photo_url} alt={a.name} className="w-full h-full" />
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
                      <div className="h-20 bg-tint overflow-hidden">
                        <CategoryIllustration category={a.category} photoUrl={a.photo_url} alt={a.name} className="w-full h-full" />
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

        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 mt-4 py-3">
          <LogOut size={16} /> {t.signOut}
        </button>
      </div>
    </div>
  );
}
