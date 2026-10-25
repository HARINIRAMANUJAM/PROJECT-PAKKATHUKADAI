
(() => {
  "use strict";

  const db = () => window.supabaseClient;

  async function setDeliveryMethod(orderId, method) {
    if (!["Pickup", "Delivery"].includes(method)) {
      throw new Error("Choose Pickup or Delivery.");
    }

    if (!db()) throw new Error("Supabase is not connected.");

    const { data, error } = await db()
      .from("Orders")
      .update({ delivery_method: method })
      .eq("id", orderId)
      .select("id, delivery_method");

    if (error) throw error;
    if (!data || !data.length) {
      throw new Error("Order not updated. Check permissions.");
    }

    return data[0];
  }

  async function chooseDeliveryMethod() {
    const orderId = prompt("Enter the order ID:");
    if (!orderId) return;

    const choice = prompt(
      "Choose order fulfilment:\n1. Pickup\n2. Delivery"
    );

    if (choice === null) return;

    const method = choice.trim() === "1" ? "Pickup"
      : choice.trim() === "2" ? "Delivery"
      : null;

    if (!method) {
      alert("Invalid choice.");
      return;
    }

    try {
      const result = await setDeliveryMethod(orderId.trim(), method);
      alert(`Order #${result.id}: ${result.delivery_method}`);
    } catch (error) {
      console.error(error);
      alert("Could not update order: " + error.message);
    }
  }

  window.PKOrderDelivery = { setDeliveryMethod, chooseDeliveryMethod };
  window.showOrderDelivery = chooseDeliveryMethod;
})();
