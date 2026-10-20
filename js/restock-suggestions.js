
(() => {
  "use strict";

  window.showRestockSuggestions = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Products")
      .select("name, quantity, unit, shop_name, price")
      .order("quantity", { ascending: true });

    if (error) {
      alert("Could not load inventory: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No products found.");
      return;
    }

    const suggestions = data.filter(
      product => Number(product.quantity) <= 5
    );

    if (suggestions.length === 0) {
      alert("All products have sufficient stock!");
      return;
    }

    alert(
      "📦 SMART RESTOCK SUGGESTIONS\n\n" +
      suggestions.map(product =>
        `${product.name} (${product.shop_name || "Shop"})\n` +
        `Current stock: ${product.quantity} ${product.unit || ""}\n` +
        `Suggested reorder: ${Math.max(10 - Number(product.quantity), 0)} ${product.unit || ""}`
      ).join("\n\n")
    );
  };
})();
