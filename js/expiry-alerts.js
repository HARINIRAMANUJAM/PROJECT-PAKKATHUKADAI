
(() => {
  "use strict";

  window.checkExpiryAlerts = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Products")
      .select("name, expiry_date, shop_name")
      .not("expiry_date", "is", null)
      .order("expiry_date", { ascending: true });

    if (error) {
      alert(
        "Expiry tracking needs an expiry_date column in Products."
      );
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = (data || []).filter(product => {
      const expiry = new Date(product.expiry_date);
      const daysLeft = Math.ceil(
        (expiry - today) / 86400000
      );

      return daysLeft <= 7;
    });

    if (!upcoming.length) {
      alert("No products expiring within 7 days.");
      return;
    }

    alert(
      "⚠️ EXPIRY ALERTS\n\n" +
      upcoming.map(product => {
        const days = Math.ceil(
          (new Date(product.expiry_date) - today) / 86400000
        );

        return `${product.name} (${product.shop_name || "Shop"}): ${
          days < 0 ? "EXPIRED" : days === 0 ? "Expires today" : `${days} day(s) left`
        }`;
      }).join("\n")
    );
  };
})();
