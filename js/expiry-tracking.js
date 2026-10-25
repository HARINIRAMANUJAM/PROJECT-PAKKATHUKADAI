
(() => {
  "use strict";

  const db = () => window.supabaseClient;

  async function getExpiringProducts(days = 7) {
    if (!db()) throw new Error("Supabase is not connected.");

    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + days);

    const format = date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const { data, error } = await db()
      .from("Products")
      .select("id, name, shop_name, quantity, expiry_date")
      .not("expiry_date", "is", null)
      .lte("expiry_date", format(end))
      .order("expiry_date", { ascending: true });

    if (error) throw error;

    return (data || []).map(product => ({
      ...product,
      expired: product.expiry_date < format(today)
    }));
  }

  async function showExpiryDashboard() {
    try {
      const products = await getExpiringProducts();

      if (!products.length) {
        alert("No products are expiring within the next 7 days.");
        return;
      }

      const report = products.map(product =>
        `${product.name} (${product.shop_name || "Shop"})\n` +
        `Quantity: ${product.quantity}\n` +
        `Expiry: ${product.expiry_date}\n` +
        `${product.expired ? "EXPIRED" : "Expiring soon"}`
      ).join("\n\n");

      alert("EXPIRY REPORT\n\n" + report);
    } catch (error) {
      console.error(error);
      alert("Expiry report failed: " + error.message);
    }
  }

  window.PKExpiryTracking = {
    getExpiringProducts,
    showExpiryDashboard
  };

  window.showExpiryDashboard = showExpiryDashboard;
})();
