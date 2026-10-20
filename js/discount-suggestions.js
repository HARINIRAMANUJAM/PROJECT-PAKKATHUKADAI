
(() => {
  "use strict";

  window.showDiscountSuggestions = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Products")
      .select("name, price, quantity, unit, shop_name")
      .order("quantity", { ascending: false });

    if (error) {
      alert("Could not load products: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No products found.");
      return;
    }

    const suggestions = data.filter(
      product => Number(product.quantity) >= 20 &&
                 Number(product.price) > 0
    );

    if (suggestions.length === 0) {
      alert("No high-stock products to suggest discounts for.");
      return;
    }

    alert(
      "🏷️ DISCOUNT SUGGESTIONS\n\n" +
      suggestions.slice(0, 10).map(product => {
        const price = Number(product.price);
        const discountedPrice = price * 0.9;

        return `${product.name} (${product.shop_name || "Shop"})\n` +
          `Stock: ${product.quantity} ${product.unit || ""}\n` +
          `Current price: ₹${price.toFixed(2)}\n` +
          `Suggested 10% discount: ₹${discountedPrice.toFixed(2)}`;
      }).join("\n\n") +
      "\n\nSuggestions only — prices are not changed."
    );
  };
})();
