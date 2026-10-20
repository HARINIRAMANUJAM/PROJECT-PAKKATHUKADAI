
(() => {
  "use strict";

  window.showAIInsights = async function () {
    const db = window.supabaseClient;
    if (!db) return alert("Supabase is not connected.");

    const { data, error } = await db
      .from("Products")
      .select("name, quantity, unit, shop_name, price")
      .order("quantity", { ascending: true });

    if (error) return alert(error.message);
    if (!data?.length) return alert("No products found.");

    const low = data.filter(p => Number(p.quantity) <= 5);
    const high = data.filter(p => Number(p.quantity) >= 20);

    alert(
      "STOCK INSIGHTS\n\nLOW STOCK:\n" +
      (low.length
        ? low.map(p => `${p.name}: ${p.quantity} ${p.unit || ""} (${p.shop_name || "Shop"})`).join("\n")
        : "None") +
      "\n\nHIGH STOCK:\n" +
      (high.length
        ? high.map(p => `${p.name}: ${p.quantity} ${p.unit || ""}`).join("\n")
        : "None") +
      "\n\nThese are stock-based suggestions, not AI sales predictions."
    );
  };
})();
