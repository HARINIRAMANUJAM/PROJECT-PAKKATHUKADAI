
(() => {
  "use strict";

  window.showSalesAnalytics = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Orders")
      .select("id, total, status");

    if (error) {
      alert("Could not load sales: " + error.message);
      return;
    }

    const orders = data || [];
    const completedOrders = orders.filter(
      order => String(order.status || "").toLowerCase() === "completed"
    );

    const sales = completedOrders.reduce(
      (sum, order) => sum + Number(order.total || 0), 0
    );

    const average = completedOrders.length
      ? sales / completedOrders.length
      : 0;

    alert(
      "📈 SALES ANALYTICS\n\n" +
      `Total orders: ${orders.length}\n` +
      `Completed orders: ${completedOrders.length}\n` +
      `Completed sales: ₹${sales.toFixed(2)}\n` +
      `Average completed order: ₹${average.toFixed(2)}`
    );
  };
})();
