import React, { useState, useEffect } from "react";
import { onAuthChange, getCurrentUser } from "./lib/api";

import HomeScreen from "./screens/HomeScreen";
import AuthScreen from "./screens/AuthScreen";
import AddActivityScreen from "./screens/AddActivityScreen";
import ActivityDetailScreen from "./screens/ActivityDetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminImportScreen from "./screens/AdminImportScreen";
import EditActivityScreen from "./screens/EditActivityScreen";
import HistoryScreen from "./screens/HistoryScreen";

export default function App() {
  const [lang, setLang] = useState("he");
  const [screen, setScreen] = useState("home"); // 'home' | 'auth' | 'add' | 'detail'
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeActivityId, setActiveActivityId] = useState(null);

  // Keep `user` in sync with Supabase's real auth session
  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    const unsubscribe = onAuthChange((u) => setUser(u));
    return unsubscribe;
  }, []);

  const isLoggedIn = !!user;

  const goHome = () => setScreen("home");
  const goAuth = () => setScreen("auth");
  const goProfile = () => {
    if (!isLoggedIn) {
      setScreen("auth");
      return;
    }
    setScreen("profile");
  };
  const goAdd = () => {
    if (!isLoggedIn) {
      setScreen("auth");
      return;
    }
    setScreen("add");
  };
  const goAdminImport = () => {
    if (!isLoggedIn) {
      setScreen("auth");
      return;
    }
    setScreen("adminImport");
  };
  const goEditActivity = (id) => {
    if (!isLoggedIn) {
      setScreen("auth");
      return;
    }
    setActiveActivityId(id);
    setScreen("edit");
  };
  const goHistory = (id) => {
    setActiveActivityId(id);
    setScreen("history");
  };
  const openActivity = (id) => {
    setActiveActivityId(id);
    setScreen("detail");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="text-inkSoft text-sm">…</span>
      </div>
    );
  }

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          lang={lang}
          setLang={setLang}
          onOpenActivity={openActivity}
          onAdd={goAdd}
          onAuth={goAuth}
          onProfile={goProfile}
          isLoggedIn={isLoggedIn}
          userId={user?.id}
        />
      )}

      {screen === "auth" && (
        <AuthScreen lang={lang} setLang={setLang} onDone={goHome} onSkip={goHome} />
      )}

      {screen === "add" && (
        <AddActivityScreen lang={lang} setLang={setLang} onBack={goHome} onPublished={goHome} user={user} />
      )}

      {screen === "profile" && (
        <ProfileScreen
          lang={lang}
          setLang={setLang}
          onBack={goHome}
          onSignedOut={goHome}
          onOpenActivity={openActivity}
          onAdd={goAdd}
          onAdminImport={goAdminImport}
          user={user}
        />
      )}

      {screen === "adminImport" && (
        <AdminImportScreen lang={lang} setLang={setLang} onBack={goHome} user={user} />
      )}

      {screen === "edit" && (
        <EditActivityScreen
          lang={lang}
          setLang={setLang}
          onBack={() => openActivity(activeActivityId)}
          onSaved={() => openActivity(activeActivityId)}
          onViewHistory={() => goHistory(activeActivityId)}
          activityId={activeActivityId}
          user={user}
        />
      )}

      {screen === "history" && (
        <HistoryScreen
          lang={lang}
          setLang={setLang}
          onBack={() => openActivity(activeActivityId)}
          activityId={activeActivityId}
        />
      )}

      {screen === "detail" && (
        <ActivityDetailScreen
          lang={lang}
          setLang={setLang}
          onBack={goHome}
          isLoggedIn={isLoggedIn}
          onRequireLogin={goAuth}
          activityId={activeActivityId}
          user={user}
          onEdit={goEditActivity}
          onViewHistory={goHistory}
        />
      )}
    </>
  );
}
