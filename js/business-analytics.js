(() => {
  "use strict";

  function calculateRevenue(orders) {
    return (orders || [])
      .filter(order => order.status === "completed")
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  }

  function calculateProfit(revenue, expenses, costOfGoods = 0) {
    return Number(revenue || 0) -
      Number(expenses || 0) -
      Number(costOfGoods || 0);
  }

  function summarizeSales(orders) {
    const summary = {};

    for (const order of orders || []) {
      if (order.status !== "completed") continue;

      let items = order.items || [];

      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch {
          continue;
        }
      }

      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const name = item.name || item.product_name;

        if (!name) continue;

        const quantity = Number(item.quantity || item.qty) || 0;
        summary[name] = (summary[name] || 0) + quantity;
      }
    }

    return summary;
  }

  window.PKBusinessAnalytics = {
    calculateRevenue,
    calculateProfit,
    summarizeSales
  };
})();
