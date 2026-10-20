
(() => {
  "use strict";

  window.showCustomerInsights = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Orders")
      .select("customer_name, phone, total");

    if (error) {
      alert("Could not load customer insights: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No customer orders found.");
      return;
    }

    const customers = {};

    data.forEach(order => {
      const key = order.phone || order.customer_name || "Unknown";

      if (!customers[key]) {
        customers[key] = {
          name: order.customer_name || "Unknown",
          orders: 0,
          spending: 0
        };
      }

      customers[key].orders++;
      customers[key].spending += Number(order.total || 0);
    });

    const ranked = Object.values(customers)
      .sort((a, b) => b.spending - a.spending);

    alert(
      "👥 CUSTOMER INSIGHTS\n\n" +
      `Unique customers: ${ranked.length}\n\n` +
      "TOP CUSTOMERS\n\n" +
      ranked.slice(0, 5).map((customer, index) =>
        `${index + 1}. ${customer.name}\n` +
        `Orders: ${customer.orders}\n` +
        `Total spending: ₹${customer.spending.toFixed(2)}`
      ).join("\n\n")
    );
  };
})();
