
(() => {
  "use strict";

  window.showInventoryReport = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Products")
      .select("name, price, quantity, unit, shop_name");

    if (error) {
      alert("Could not generate report: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No products available for the report.");
      return;
    }

    const totalProducts = data.length;
    const totalUnits = data.reduce(
      (sum, p) => sum + Number(p.quantity || 0), 0
    );
    const inventoryValue = data.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0), 0
    );
    const lowStock = data.filter(
      p => Number(p.quantity) <= 5
    ).length;
    const outOfStock = data.filter(
      p => Number(p.quantity) === 0
    ).length;

    alert(
      "📊 INVENTORY REPORT\n\n" +
      `Total products: ${totalProducts}\n` +
      `Total stock units: ${totalUnits}\n` +
      `Estimated inventory value: ₹${inventoryValue.toFixed(2)}\n` +
      `Low-stock products: ${lowStock}\n` +
      `Out-of-stock products: ${outOfStock}`
    );
  };
})();
