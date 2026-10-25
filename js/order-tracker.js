(() => {
  "use strict";

  function getClient() {
    const candidates = [
      window.supabaseClient,
      window.sbClient,
      window.client
    ];

    return candidates.find(
      client => client && typeof client.from === "function"
    ) || null;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  const statusSteps = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready for pickup",
    "Out for delivery",
    "Completed"
  ];

  async function getOrder(orderId, phone) {
    const client = getClient();

    if (!client) {
      throw new Error("Supabase client is unavailable.");
    }

    if (!orderId || !phone) {
      throw new Error("Order ID and phone number are required.");
    }

    const { data, error } = await client
      .from("Orders")
      .select("id, customer_name, phone, items, total, status, delivery_method, created_at")
      .eq("id", orderId)
      .eq("phone", phone)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error("Order not found. Check the order ID and phone number.");
    }

    return data;
  }

  function renderOrder(order, container) {
    if (!container) {
      throw new Error("Order display element was not found.");
    }

    const status = order.status || "Pending";
    const currentStep = statusSteps.indexOf(status);

    const progress = statusSteps.map((step, index) => {
      const complete = currentStep >= 0 && index <= currentStep;

      return `
        <div style="padding:8px;margin:5px 0;border-radius:6px;
          background:${complete ? "#e4f6e9" : "#f3f4f6"};">
          ${complete ? "✓" : "○"} ${escapeHTML(step)}
        </div>
      `;
    }).join("");

    const items = Array.isArray(order.items)
      ? order.items.map(item => {
          const name = escapeHTML(item.name || item.product_name || "Item");
          const quantity = escapeHTML(item.quantity ?? 1);
          return `<li>${name} × ${quantity}</li>`;
        }).join("")
      : "<li>Order item details unavailable</li>";

    container.innerHTML = `
      <section style="border:1px solid #ddd;border-radius:10px;padding:16px;">
        <h3>Order #${escapeHTML(order.id)}</h3>
        <p><strong>Customer:</strong> ${escapeHTML(order.customer_name)}</p>
        <p><strong>Status:</strong> ${escapeHTML(status)}</p>
        <p><strong>Method:</strong> ${escapeHTML(order.delivery_method || "Not specified")}</p>
        <p><strong>Total:</strong> ₹${escapeHTML(order.total)}</p>
        <h4>Items</h4>
        <ul>${items}</ul>
        <h4>Order progress</h4>
        ${status === "Cancelled"
          ? "<p style='color:#b42318'>This order was cancelled.</p>"
          : progress}
        <small>Last available order record: ${
          escapeHTML(order.created_at ? new Date(order.created_at).toLocaleString() : "Unknown")
        }</small>
      </section>
    `;
  }

  async function trackOrder(orderId, phone, containerId = "order-tracking-result") {
    const container = document.getElementById(containerId);

    if (container) container.textContent = "Loading order...";

    try {
      const order = await getOrder(orderId, phone);
      renderOrder(order, container);
      return order;
    } catch (error) {
      if (container) {
        container.textContent = error.message || "Unable to load this order.";
      }
      throw error;
    }
  }

  function init() {
    const form = document.getElementById("order-tracking-form");
    if (!form || form.dataset.pkTrackerBound === "true") return;

    form.dataset.pkTrackerBound = "true";

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const orderId = document.getElementById("tracking-order-id")?.value.trim();
      const phone = document.getElementById("tracking-phone")?.value.trim();

      try {
        await trackOrder(orderId, phone);
      } catch (_) {
        // The error is displayed in the tracking result area.
      }
    });
  }

  window.PKOrderTracker = {
    getOrder,
    renderOrder,
    trackOrder
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
