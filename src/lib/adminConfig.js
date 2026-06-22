// The super-admin's email is hardcoded here, not in the database.
// This means it cannot be changed or removed through the app's admin UI,
// even by mistake — only by editing this file and redeploying.
export const SUPER_ADMIN_EMAIL = "harelm@gmail.com";

export function isSuperAdmin(user) {
  return user?.email === SUPER_ADMIN_EMAIL;
}

// A user has admin access if they are the super-admin OR their profile's is_admin flag is true.
export function isAdminUser(user, profile) {
  if (isSuperAdmin(user)) return true;
  return !!profile?.is_admin;
}
