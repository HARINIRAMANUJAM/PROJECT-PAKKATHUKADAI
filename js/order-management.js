(() => {
  "use strict";

  const VALID_STATUSES = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready for Pickup",
    "Out for Delivery",
    "Completed",
    "Cancelled"
  ];

  function validateOrderStatus(status) {
    return VALID_STATUSES.includes(status);
  }

  function createFulfilmentDetails(type, address = "") {
    const method = String(type || "").trim();
    const deliveryAddress = String(address || "").trim();

    if (!["Pickup", "Delivery"].includes(method)) {
      throw new Error("Choose Pickup or Delivery.");
    }

    if (method === "Delivery" && !deliveryAddress) {
      throw new Error("Delivery address is required.");
    }

    return {
      delivery_method: method,
      delivery_address:
        method === "Delivery" ? deliveryAddress : ""
    };
  }

  function createReceipt(order) {
    if (!order || typeof order !== "object") {
      throw new Error("A valid order is required.");
    }

    const items = Array.isArray(order.items) ? order.items : [];

    const itemLines = items.map(item => {
      const name = item.name || item.product_name || "Product";
      const quantity = Number(item.quantity || item.qty || 1);
      const price = Number(item.price || 0);

      return `${name} × ${quantity} — ₹${(
        quantity * price
      ).toFixed(2)}`;
    });

    const method =
      order.delivery_method ||
      order.fulfilment_method ||
      "Pickup";

    return [
      "PAKKATHU KADAI — ORDER RECEIPT",
      "--------------------------------",
      `Order ID: ${order.id ?? "Pending"}`,
      `Customer: ${order.customer_name || ""}`,
      `Phone: ${order.phone || ""}`,
      `Method: ${method}`,
      ...(method === "Delivery"
        ? [`Address: ${order.delivery_address || ""}`]
        : []),
      `Status: ${order.status || "Pending"}`,
      "--------------------------------",
      ...itemLines,
      "--------------------------------",
      `Total: ₹${Number(order.total || 0).toFixed(2)}`
    ].join("\n");
  }

  function createWhatsAppLink(phone, message) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (!digits) {
      throw new Error("A valid phone number is required.");
    }

    return (
      "https://wa.me/" +
      digits +
      "?text=" +
      encodeURIComponent(String(message || ""))
    );
  }

  window.PKOrderManagement = Object.freeze({
    VALID_STATUSES: [...VALID_STATUSES],
    validateOrderStatus,
    createFulfilmentDetails,
    createReceipt,
    createWhatsAppLink
  });
})();
