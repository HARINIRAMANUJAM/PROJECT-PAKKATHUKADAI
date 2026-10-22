(() => {
  "use strict";

  const VALID_STATUSES = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "completed",
    "cancelled"
  ];

  function validateOrderStatus(status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error("Invalid order status.");
    }

    return status;
  }

  function createFulfilmentDetails(type, address = "") {
    if (!["pickup", "delivery"].includes(type)) {
      throw new Error("Choose pickup or delivery.");
    }

    if (type === "delivery" && !String(address).trim()) {
      throw new Error("A delivery address is required.");
    }

    return {
      type,
      address: type === "delivery" ? String(address).trim() : ""
    };
  }

  function createReceipt(order) {
    if (!order || typeof order !== "object") {
      throw new Error("Valid order data is required.");
    }

    return {
      orderId: order.id,
      customer: order.customer_name || "Customer",
      items: order.items || [],
      total: Number(order.total) || 0,
      status: order.status || "pending",
      createdAt: order.created_at || new Date().toISOString()
    };
  }

  function createWhatsAppLink(phone, message) {
    const number = String(phone || "").replace(/\D/g, "");

    if (!number || !message) {
      throw new Error("Phone number and message are required.");
    }

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  window.PKOrderManagement = {
    validateOrderStatus,
    createFulfilmentDetails,
    createReceipt,
    createWhatsAppLink
  };
})();
