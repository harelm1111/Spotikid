import React, { useState } from "react";
import { Mail, Lock, Globe } from "lucide-react";
import { signIn, signUp } from "../lib/api";

const COPY = {
  he: {
    dir: "rtl",
    loginTitle: "ברוכים השבים",
    loginSub: "התחברו כדי להגיב, לדרג ולהוסיף אטרקציות",
    signupTitle: "יוצרים חשבון",
    signupSub: "כמה שניות, וסיימנו",
    email: "אימייל",
    password: "סיסמה",
    confirmPassword: "אימות סיסמה",
    login: "התחברות",
    signupBtn: "הרשמה",
    noAccount: "אין לך חשבון?",
    haveAccount: "יש לך חשבון?",
    createOne: "הרשמה",
    loginInstead: "התחברות",
    continueBrowsing: "המשך גלישה בלי הרשמה",
    passwordMismatch: "הסיסמאות לא תואמות",
    confirmEmailNotice: "נרשמת בהצלחה! אם נדרש אימות, בדקו את תיבת המייל שלכם.",
    genericError: "משהו השתבש. בדקו את הפרטים ונסו שוב.",
  },
  en: {
    dir: "ltr",
    loginTitle: "Welcome back",
    loginSub: "Log in to comment, rate, and add activities",
    signupTitle: "Create your account",
    signupSub: "Takes a few seconds",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    login: "Log in",
    signupBtn: "Sign up",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    createOne: "Sign up",
    loginInstead: "Log in",
    continueBrowsing: "Continue browsing without an account",
    passwordMismatch: "Passwords don't match",
    confirmEmailNotice: "Signed up successfully! If email confirmation is required, check your inbox.",
    genericError: "Something went wrong. Check your details and try again.",
  },
};

export default function AuthScreen({ lang, setLang, onDone, onSkip }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const [mode, setMode] = useState("login");
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setInfo("");

    if (!isLogin && password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        onDone();
      } else {
        const result = await signUp(email, password);
        if (result.session) {
          // Email confirmation disabled in Supabase settings — user is logged in immediately
          onDone();
        } else {
          setInfo(t.confirmEmailNotice);
        }
      }
    } catch (err) {
      setError(err.message || t.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={t.dir} className="min-h-screen flex flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 bg-primary">🌿</div>
        <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink">
          <Globe size={14} />
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-1.5 text-center text-ink">{isLogin ? t.loginTitle : t.signupTitle}</h1>
          <p className="text-sm text-center mb-7 text-inkSoft">{isLogin ? t.loginSub : t.signupSub}</p>

          {error && (
            <div className="mb-4 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-200">{error}</div>
          )}
          {info && (
            <div className="mb-4 text-sm rounded-xl px-3.5 py-2.5 bg-tint text-primaryDk border border-line">{info}</div>
          )}

          <div className="space-y-3.5 mb-5">
            <div className="relative">
              <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-inkSoft ${isRTL ? "right-4" : "left-4"}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email}
                className={`w-full rounded-xl py-3 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
              />
            </div>
            <div className="relative">
              <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-inkSoft ${isRTL ? "right-4" : "left-4"}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password}
                className={`w-full rounded-xl py-3 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
              />
            </div>
            {!isLogin && (
              <div className="relative">
                <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-inkSoft ${isRTL ? "right-4" : "left-4"}`} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPassword}
                  className={`w-full rounded-xl py-3 text-[15px] outline-none border border-line bg-surface text-ink focus:border-primary transition-colors ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full font-semibold rounded-xl py-3.5 transition-colors mb-4 text-white bg-primary disabled:opacity-50"
          >
            {loading ? "…" : isLogin ? t.login : t.signupBtn}
          </button>

          <p className="text-center text-sm mb-6 text-inkSoft">
            {isLogin ? t.noAccount : t.haveAccount}{" "}
            <button
              onClick={() => { setMode(isLogin ? "signup" : "login"); setError(""); setInfo(""); }}
              className="font-semibold text-primaryDk"
            >
              {isLogin ? t.createOne : t.loginInstead}
            </button>
          </p>

          <button onClick={onSkip} className="w-full text-center text-sm font-medium text-inkSoft">
            {t.continueBrowsing}
          </button>
        </div>
      </div>
    </div>
  );
}
