
(() => {
  "use strict";

  const db = window.supabaseClient;

  async function getOrders() {
    if (!db) throw new Error("Supabase client not connected.");

    const { data, error } = await db
      .from("Orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async function updateOrderStatus(orderId, status) {
    if (!db) throw new Error("Supabase client not connected.");

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Ready for pickup",
      "Out for delivery",
      "Completed",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid order status.");
    }

    const { error } = await db
      .from("Orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;

    notifyCustomerOrderStatus(orderId, status);
    return true;
  }

  async function setFulfilment(orderId, method) {
    if (!db) throw new Error("Supabase client not connected.");
    if (!["Pickup", "Delivery"].includes(method)) {
      throw new Error("Choose Pickup or Delivery.");
    }

    const { error } = await db
      .from("Orders")
      .update({ fulfilment_method: method })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  }

  async function notifyCustomerOrderStatus(orderId, status) {
    if (!("Notification" in window)) return;

    try {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        new Notification("Pakkathu Kadai — Order Update", {
          body: `Order #${orderId}: ${status}`
        });
      }
    } catch (error) {
      console.warn("Browser notification unavailable:", error);
    }
  }

  async function showOrderManagement() {
    try {
      const orders = await getOrders();

      if (!orders.length) {
        alert("No orders found.");
        return;
      }

      const summary = orders.map(order =>
        `Order #${order.id}\n` +
        `Customer: ${order.customer_name || "N/A"}\n` +
        `Total: ₹${order.total ?? "N/A"}\n` +
        `Status: ${order.status || "Pending"}\n` +
        `Method: ${order.fulfilment_method || "Not selected"}`
      ).join("\n\n");

      const orderId = prompt(
        `ORDER MANAGEMENT\n\n${summary}\n\nEnter an order ID:`
      );

      if (!orderId) return;

      const order = orders.find(
        item => String(item.id) === orderId.trim()
      );

      if (!order) {
        alert("Order not found.");
        return;
      }

      const choice = prompt(
        "Choose action:\n" +
        "1 - Confirm order\n" +
        "2 - Preparing\n" +
        "3 - Ready for pickup\n" +
        "4 - Out for delivery\n" +
        "5 - Complete order\n" +
        "6 - Cancel order\n" +
        "7 - Set Pickup\n" +
        "8 - Set Delivery"
      );

      const statusChoices = {
        "1": "Confirmed",
        "2": "Preparing",
        "3": "Ready for pickup",
        "4": "Out for delivery",
        "5": "Completed",
        "6": "Cancelled"
      };

      if (statusChoices[choice]) {
        await updateOrderStatus(order.id, statusChoices[choice]);
        alert("Order status updated.");
      } else if (choice === "7" || choice === "8") {
        await setFulfilment(
          order.id,
          choice === "7" ? "Pickup" : "Delivery"
        );
        alert("Fulfilment method updated.");
      }
    } catch (error) {
      console.error("Order management error:", error);
      alert("Order error: " + error.message);
    }
  }

  window.PKOrderManagement = {
    getOrders,
    updateOrderStatus,
    setFulfilment,
    notifyCustomerOrderStatus,
    showOrderManagement
  };
})();
