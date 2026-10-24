
(() => {
"use strict";

const db = window.supabaseClient;
const $ = id => document.getElementById(id);
let mode = "login";

function setMode(next) {
  mode = next;
  $("submit").textContent = mode === "login" ? "Log in" : "Create account";
  $("name-box").hidden = mode === "login";
  $("shop-box").hidden = mode !== "signup" || $("role").value !== "shopkeeper";
  $("name").required = mode === "signup";
  $("shop").required = mode === "signup" && $("role").value === "shopkeeper";
  $("role").disabled = mode === "login";
  $("msg").textContent = "";
}

$("login-mode").onclick = () => setMode("login");
$("signup-mode").onclick = () => setMode("signup");
$("role").onchange = () => setMode(mode);

$("account-form").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("submit"), msg = $("msg");
  if (!db) {
    msg.textContent = "Supabase connection unavailable.";
    return;
  }

  btn.disabled = true;
  msg.textContent = "Please wait…";

  try {
    const email = $("email").value.trim();
    const password = $("password").value;
    const role = $("role").value;
    let result;

    if (mode === "signup") {
      if (role === "admin") throw Error("Admin registration is not public.");

      result = await db.auth.signUp({
        email, password,
        options: { data: {
          full_name: $("name").value.trim(),
          requested_role: role,
          shop_name: role === "shopkeeper" ? $("shop").value.trim() : ""
        }}
      });
      if (result.error) throw result.error;

      if (!result.data.session) {
        msg.textContent = "Account created. Confirm your email, then log in.";
        return;
      }
    } else {
      result = await db.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
    }

    const user = result.data.user;
    const { data: profile, error } = await db.from("profiles")
      .select("role,status").eq("id", user.id).maybeSingle();

    if (error || !profile) throw Error("Profile not found. Contact admin.");

    if (profile.status !== "active") {
      await db.auth.signOut();
      msg.textContent = "Your account is awaiting admin approval.";
      return;
    }

    const pages = {
      customer: "index.html",
      shopkeeper: "shopkeeper.html",
      delivery: "delivery.html",
      admin: "admin.html"
    };

    if (!pages[profile.role]) throw Error("Invalid account role.");
    location.href = pages[profile.role];

  } catch (err) {
    msg.textContent = err.message || "Something went wrong.";
  } finally {
    btn.disabled = false;
  }
});

setMode("login");
})();
