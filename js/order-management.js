
(() => {
  "use strict";

  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready for pickup",
    "Out for delivery",
    "Completed",
    "Cancelled"
  ];

  function getDatabase() {
    if (!window.supabaseClient) {
      throw new Error("Supabase is not connected.");
    }
    return window.supabaseClient;
  }

  async function getOrders() {
    const { data, error } = await getDatabase()
      .from("Orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async function updateOrderStatus(orderId, status) {
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid order status.");
    }

    const { data, error } = await getDatabase()
      .from("Orders")
      .update({ status })
      .eq("id", orderId)
      .select("id, status");

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(
        "Order was not updated. Check database permissions."
      );
    }

    return data[0];
  }

  async function showOrderManagement() {
    try {
      const orders = await getOrders();

      if (!orders.length) {
        alert("No orders found in the database yet.");
        return;
      }

      const summary = orders.map(order =>
        `Order #${order.id}\n` +
        `Customer: ${order.customer_name || "N/A"}\n` +
        `Total: ₹${order.total ?? "N/A"}\n` +
        `Status: ${order.status || "Pending"}`
      ).join("\n\n");

      const id = prompt(
        `PAKKATHU KADAI — ORDERS\n\n${summary}\n\n` +
        "Enter the order ID to update:"
      );

      if (!id) return;

      const order = orders.find(
        item => String(item.id) === id.trim()
      );

      if (!order) {
        alert("Order ID not found.");
        return;
      }

      const options = allowedStatuses.map(
        (status, index) => `${index + 1} - ${status}`
      ).join("\n");

      const choice = prompt(
        `Update Order #${order.id}\n\n${options}\n\n` +
        "Enter the number:"
      );

      if (!choice) return;

      const index = Number(choice) - 1;

      if (!Number.isInteger(index) ||
          index < 0 ||
          index >= allowedStatuses.length) {
        alert("Invalid selection.");
        return;
      }

      const updated = await updateOrderStatus(
        order.id,
        allowedStatuses[index]
      );

      alert(
        `Order #${updated.id} updated to: ${updated.status}`
      );
    } catch (error) {
      console.error("Order management:", error);
      alert("Order update failed: " + error.message);
    }
  }

  window.PKOrderManagement = {
    getOrders,
    updateOrderStatus,
    showOrderManagement
  };

  window.showOrderManagement = showOrderManagement;
})();
