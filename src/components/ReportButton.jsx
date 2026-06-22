import React, { useState } from "react";
import { Flag, X } from "lucide-react";
import { submitReport } from "../lib/api";

const COPY = {
  he: {
    report: "דיווח על תוכן",
    reportTitle: "מה הבעיה עם התוכן הזה?",
    reasons: ["מידע שגוי", "תוכן פוגעני או לא הולם", "ספאם או פרסומת", "כפילות", "אחר"],
    submit: "שליחת דיווח",
    submitting: "שולח...",
    cancel: "ביטול",
    thanks: "תודה, הדיווח נשלח לבדיקת הצוות.",
  },
  en: {
    report: "Report content",
    reportTitle: "What's wrong with this content?",
    reasons: ["Incorrect info", "Offensive or inappropriate", "Spam or advertising", "Duplicate", "Other"],
    submit: "Submit report",
    submitting: "Submitting...",
    cancel: "Cancel",
    thanks: "Thanks, the report has been sent to our team.",
  },
};

export default function ReportButton({ lang, isRTL, activityId, reviewId, userId, onRequireLogin }) {
  const t = COPY[lang];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleOpen = () => {
    if (!userId) {
      onRequireLogin();
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await submitReport({ reporterId: userId, activityId, reviewId, reason });
      setDone(true);
    } catch {
      // Best-effort; closing the modal is enough feedback either way.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border border-line text-inkSoft"
      >
        <Flag size={12} /> {t.report}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setOpen(false)}>
          <div dir={isRTL ? "rtl" : "ltr"} className="bg-surface rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink">{t.reportTitle}</h3>
              <button onClick={() => setOpen(false)} className="text-inkSoft"><X size={18} /></button>
            </div>

            {done ? (
              <p className="text-sm text-primaryDk py-2">{t.thanks}</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {t.reasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full text-start text-sm rounded-xl px-3 py-2.5 border ${reason === r ? "border-primary bg-tint text-primaryDk" : "border-line text-ink"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className="w-full text-sm font-semibold rounded-full py-2.5 bg-primary text-white disabled:opacity-50"
                >
                  {submitting ? t.submitting : t.submit}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
