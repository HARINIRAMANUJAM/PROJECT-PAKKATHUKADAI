(async () => {
"use strict";
const role = document.body.dataset.requiredRole;
if (!role) return;

const db = window.supabaseClient;
const deny = () => location.replace("account.html");

try {
  if (!db) return deny();

  const { data: auth, error: authError } = await db.auth.getUser();
  if (authError || !auth.user) return deny();

  const { data: profile, error } = await db.from("profiles")
    .select("role,status")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error || !profile ||
      profile.role !== role ||
      profile.status !== "active") {
    await db.auth.signOut();
    return deny();
  }
} catch {
  deny();
}
})();
