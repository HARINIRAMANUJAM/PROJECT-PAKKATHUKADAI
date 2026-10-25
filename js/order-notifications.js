
(() => {
  "use strict";

  const client = () =>
    window.supabaseClient || window.supabase;

  let channel = null;

  async function enableNotifications() {
    if (!("Notification" in window)) {
      alert("Browser notifications are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Please allow browser notifications to use this feature.");
      return;
    }

    const db = client();

    if (!db || typeof db.channel !== "function") {
      alert("Supabase connection not found. Check js/supabase.js.");
      return;
    }

    if (channel) {
      alert("Order notifications are already enabled.");
      return;
    }

    channel = db
      .channel("pakkathu-kadai-order-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Orders"
        },
        (payload) => {
          const order = payload.new || {};

          new Notification("Pakkathu Kadai — New Order", {
            body:
              `Order #${order.id ?? ""}\n` +
              `Customer: ${order.customer_name || "Customer"}\n` +
              `Total: ₹${order.total ?? "—"}`
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          alert("Order notifications enabled!");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Order notification subscription failed.");
        }
      });
  }

  window.PKOrderNotifications = { enableNotifications };
})();
