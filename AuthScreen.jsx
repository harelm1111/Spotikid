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

/* ---------- PHOTO UPLOAD ---------- */

export async function uploadPhoto(file, folder = "activities") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("activity-photos").upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("activity-photos").getPublicUrl(fileName);
  return data.publicUrl;
}
