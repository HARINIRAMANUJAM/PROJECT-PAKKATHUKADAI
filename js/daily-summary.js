
(() => {
  "use strict";

  window.showDailySummary = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const { data, error } = await db
      .from("Orders")
      .select("id, total, status, created_at")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());

    if (error) {
      alert("Could not load daily summary: " + error.message);
      return;
    }

    const orders = data || [];
    const completed = orders.filter(
      order => String(order.status || "").toLowerCase() === "completed"
    );

    const revenue = completed.reduce(
      (sum, order) => sum + Number(order.total || 0), 0
    );

    alert(
      "📅 DAILY SUMMARY\n\n" +
      `Orders today: ${orders.length}\n` +
      `Completed orders: ${completed.length}\n` +
      `Pending/other orders: ${orders.length - completed.length}\n` +
      `Completed sales: ₹${revenue.toFixed(2)}`
    );
  };
})();
