
(() => {
  "use strict";

  const SUPABASE_URL =
    "https://qjywimxvejnkfbatukut.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_GXCZjh_C8Y-bsq9AwngaAQ_nQziTHu6";

  if (!window.supabase) {
    console.error("Supabase library is missing.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  console.log("Supabase client initialized.");
})();
