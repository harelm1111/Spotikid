import { supabase } from "./supabase";

/* ---------- AUTH ---------- */

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => listener.subscription.unsubscribe();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

/* ---------- ACTIVITIES ---------- */

export async function fetchActivities() {
  const { data, error } = await supabase
    .from("activities")
    .select("*, reviews(rating)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  // attach computed average rating + review count to each activity
  return data.map((a) => {
    const ratings = a.reviews || [];
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;
    return { ...a, avgRating: avg, reviewCount: ratings.length };
  });
}

export async function fetchActivityById(id) {
  const { data, error } = await supabase.from("activities").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createActivity(activity) {
  const { data, error } = await supabase.from("activities").insert(activity).select().single();
  if (error) throw error;
  return data;
}

export async function updateActivity(id, updates, userId) {
  const { data, error } = await supabase.from("activities").update(updates).eq("id", id).select().single();
  if (error) throw error;

  // Log the edit for the wiki-style history view (best-effort, doesn't block the update).
  await supabase.from("activity_history").insert({
    activity_id: id,
    edited_by: userId,
    changed_fields: updates,
  });

  return data;
}

export async function fetchActivityHistory(activityId) {
  const { data, error } = await supabase
    .from("activity_history")
    .select("*, profiles(email)")
    .eq("activity_id", activityId)
    .order("edited_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* ---------- REVIEWS ---------- */

export async function fetchReviews(activityId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(email)")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createReview(review) {
  const { data, error } = await supabase.from("reviews").insert(review).select().single();
  if (error) throw error;
  return data;
}

/* ---------- USER PROFILE DATA ---------- */

export async function fetchMyActivities(userId) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchMyReviews(userId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, activities(id, name, city)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* ---------- SAVED ACTIVITIES (likes) ---------- */

export async function fetchSavedActivities(userId) {
  const { data, error } = await supabase
    .from("saved_activities")
    .select("activity_id, activities(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => row.activities);
}

export async function fetchSavedActivityIds(userId) {
  const { data, error } = await supabase.from("saved_activities").select("activity_id").eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => row.activity_id);
}

export async function saveActivity(userId, activityId) {
  const { error } = await supabase.from("saved_activities").insert({ user_id: userId, activity_id: activityId });
  if (error) throw error;
}

export async function unsaveActivity(userId, activityId) {
  const { error } = await supabase.from("saved_activities").delete().eq("user_id", userId).eq("activity_id", activityId);
  if (error) throw error;
}

export async function createActivitiesBulk(activities) {
  const { data, error } = await supabase.from("activities").insert(activities).select();
  if (error) throw error;
  return data;
}

// Inserts new activities (no id) and updates existing ones (has id) in one call.
export async function upsertActivitiesBulk(activities) {
  const { data, error } = await supabase.from("activities").upsert(activities, { onConflict: "id" }).select();
  if (error) throw error;
  return data;
}

export async function fetchAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function setUserAdminStatus(userId, isAdmin) {
  const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId);
  if (error) throw error;
}

/* ---------- PHOTO UPLOAD ---------- */

export async function uploadPhoto(file, folder = "activities") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("activity-photos").upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("activity-photos").getPublicUrl(fileName);
  return data.publicUrl;
}
