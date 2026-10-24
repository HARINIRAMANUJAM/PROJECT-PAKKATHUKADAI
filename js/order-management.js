
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

    const allowed = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Ready for pickup",
      "Out for delivery",
      "Completed",
      "Cancelled"
    ];

    if (!allowed.includes(status)) {
      throw new Error("Invalid order status.");
    }

    const { error } = await db
      .from("Orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;
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
        `Fulfilment: ${order.fulfilment_method || "Not selected"}`
      ).join("\n\n");

      const selectedId = prompt(
        "ORDER MANAGEMENT\n\n" + summary +
        "\n\nEnter the order ID to update, or Cancel to exit:"
      );

      if (!selectedId) return;

      const order = orders.find(
        item => String(item.id) === selectedId.trim()
      );

      if (!order) {
        alert("Order ID not found.");
        return;
      }

      const action = prompt(
        "Choose an action:\n" +
        "1 - Set Pickup\n" +
        "2 - Set Delivery\n" +
        "3 - Confirm order\n" +
        "4 - Mark Preparing\n" +
        "5 - Ready for pickup\n" +
        "6 - Out for delivery\n" +
        "7 - Complete order\n" +
        "8 - Cancel order"
      );

      const actions = {
        "1": () => setFulfilment(order.id, "Pickup"),
        "2": () => setFulfilment(order.id, "Delivery"),
        "3": () => updateOrderStatus(order.id, "Confirmed"),
        "4": () => updateOrderStatus(order.id, "Preparing"),
        "5": () => updateOrderStatus(order.id, "Ready for pickup"),
        "6": () => updateOrderStatus(order.id, "Out for delivery"),
        "7": () => updateOrderStatus(order.id, "Completed"),
        "8": () => updateOrderStatus(order.id, "Cancelled")
      };

      if (!actions[action]) return;

      await actions[action]();
      alert("Order updated successfully.");
    } catch (error) {
      console.error("Order management error:", error);
      alert("Order error: " + error.message);
    }
  }

  window.PKOrderManagement = {
    getOrders,
    updateOrderStatus,
    setFulfilment,
    showOrderManagement
  };
})();
