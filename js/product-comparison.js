
(() => {
  "use strict";

  window.compareProducts = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const searchName = prompt("Enter the product name to compare:");

    if (!searchName || !searchName.trim()) return;

    const { data, error } = await db
      .from("Products")
      .select("name, price, quantity, unit, shop_name")
      .ilike("name", `%${searchName.trim()}%`)
      .order("price", { ascending: true });

    if (error) {
      alert("Could not compare products: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No matching products found.");
      return;
    }

    alert(
      "🛍️ PRODUCT PRICE COMPARISON\n\n" +
      data.map((product, index) =>
        `${index + 1}. ${product.name}\n` +
        `Shop: ${product.shop_name || "Unknown"}\n` +
        `Price: ₹${Number(product.price).toFixed(2)} / ${product.unit || "unit"}\n` +
        `Stock: ${product.quantity}`
      ).join("\n\n")
    );
  };
})();
