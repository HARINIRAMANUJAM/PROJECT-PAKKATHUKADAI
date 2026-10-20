
(() => {
  "use strict";

  window.trackPriceChange = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const name = prompt("Enter product name:");
    if (!name || !name.trim()) return;

    const { data, error } = await db
      .from("Products")
      .select("name, price, shop_name, unit")
      .ilike("name", `%${name.trim()}%`);

    if (error) {
      alert("Could not load product: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Product not found.");
      return;
    }

    const product = data[0];
    const referenceInput = prompt(
      `Current price of ${product.name}: ₹${Number(product.price).toFixed(2)}\n` +
      "Enter the previous/reference price:"
    );

    if (referenceInput === null) return;

    const reference = Number(referenceInput);
    const current = Number(product.price);

    if (!Number.isFinite(reference) || reference < 0) {
      alert("Enter a valid reference price.");
      return;
    }

    const difference = current - reference;
    const percentage = reference > 0
      ? (difference / reference) * 100
      : null;

    const change = difference > 0
      ? "Price increased"
      : difference < 0
        ? "Price decreased"
        : "No price change";

    alert(
      "💹 PRICE COMPARISON\n\n" +
      `Product: ${product.name}\n` +
      `Shop: ${product.shop_name || "Unknown"}\n` +
      `Reference price: ₹${reference.toFixed(2)}\n` +
      `Current price: ₹${current.toFixed(2)}\n` +
      `${change}: ₹${Math.abs(difference).toFixed(2)}\n` +
      `Percentage change: ${percentage === null ? "N/A" : percentage.toFixed(2) + "%"}`
    );
  };
})();
