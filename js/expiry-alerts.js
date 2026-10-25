
(() => {
  "use strict";

  async function checkExpiryAlerts() {
    try {
      const tracking = window.PKExpiryTracking;

      if (!tracking) {
        throw new Error("Load js/expiry-tracking.js first.");
      }

      const products = await tracking.getExpiringProducts(7);

      if (!products.length) {
        alert("No expiry alerts for the next 7 days.");
        return;
      }

      const message = products.map(product => {
        const state = product.expired ? "EXPIRED" : "EXPIRING SOON";
        return `${state}: ${product.name}\nExpiry: ${product.expiry_date}`;
      }).join("\n\n");

      alert("⚠️ STOCK EXPIRY ALERTS\n\n" + message);
    } catch (error) {
      console.error(error);
      alert("Could not check expiry alerts: " + error.message);
    }
  }

  window.checkExpiryAlerts = checkExpiryAlerts;
  window.PKExpiryAlerts = { checkExpiryAlerts };
})();
