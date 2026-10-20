
(() => {
  "use strict";

  window.calculateProductProfit = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Products")
      .select("name, price, quantity, unit, shop_name");

    if (error) {
      alert("Could not load products: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No products found.");
      return;
    }

    const productName = prompt("Enter the product name:");
    if (!productName || !productName.trim()) return;

    const matches = data.filter(product =>
      product.name.toLowerCase().includes(productName.trim().toLowerCase())
    );

    if (matches.length === 0) {
      alert("Product not found.");
      return;
    }

    const product = matches[0];
    const costInput = prompt(
      `Enter cost price per ${product.unit || "unit"} for ${product.name}:`
    );

    if (costInput === null) return;

    const cost = Number(costInput);
    const sellingPrice = Number(product.price);

    if (!Number.isFinite(cost) || cost < 0) {
      alert("Enter a valid cost price.");
      return;
    }

    const profitPerUnit = sellingPrice - cost;
    const stockProfit = profitPerUnit * Number(product.quantity || 0);

    alert(
      "💰 PROFIT ESTIMATE\n\n" +
      `Product: ${product.name}\n` +
      `Shop: ${product.shop_name || "Unknown"}\n` +
      `Selling price: ₹${sellingPrice.toFixed(2)}\n` +
      `Cost price: ₹${cost.toFixed(2)}\n` +
      `Profit/loss per unit: ₹${profitPerUnit.toFixed(2)}\n` +
      `Estimated profit/loss on current stock: ₹${stockProfit.toFixed(2)}\n\n` +
      "Estimate only; other expenses are excluded."
    );
  };
})();
