
(() => {
  "use strict";

  window.showOrderTracker = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Orders")
      .select("id, customer_name, total, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Could not load orders: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No orders found.");
      return;
    }

    const summary = data.reduce((result, order) => {
      const status = String(order.status || "pending").toLowerCase();
      result[status] = (result[status] || 0) + 1;
      return result;
    }, {});

    const details = data.slice(0, 10).map(order =>
      `Order #${order.id}\n` +
      `Customer: ${order.customer_name || "N/A"}\n` +
      `Total: ₹${Number(order.total || 0).toFixed(2)}\n` +
      `Status: ${order.status || "pending"}`
    );

    alert(
      "📦 ORDER TRACKER\n\n" +
      Object.entries(summary)
        .map(([status, count]) => `${status}: ${count}`)
        .join("\n") +
      "\n\nLATEST ORDERS\n\n" +
      details.join("\n\n")
    );
  };
})();
