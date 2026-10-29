
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

  const TABLE_NAME = "Orders";
  let currentOrders = [];
  let modalElement = null;

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
      delivery_address: method === "Delivery" ? deliveryAddress : ""
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

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function getClient() {
    const client = window.supabaseClient;

    if (!client || typeof client.from !== "function") {
      throw new Error(
        "Supabase client not found. Check that js/supabase.js loads before js/order-management.js."
      );
    }

    return client;
  }

  function getOrderItems(order) {
    if (Array.isArray(order.items)) return order.items;

    if (typeof order.items === "string") {
      try {
        const parsed = JSON.parse(order.items);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  function formatItems(order) {
    const items = getOrderItems(order);

    if (!items.length) return "No item details available";

    return items.map(item => {
      const name = item.name || item.product_name || "Product";
      const qty = Number(item.quantity || item.qty || 1);
      const unit = item.unit ? ` ${item.unit}` : "";

      return `${name} × ${qty}${unit}`;
    }).join(", ");
  }

  function ensureModal() {
    if (modalElement && document.body.contains(modalElement)) {
      return modalElement;
    }

    modalElement = document.createElement("div");
    modalElement.id = "pk-order-management-modal";

    modalElement.innerHTML = `
      <div class="pk-om-backdrop"></div>
      <section class="pk-om-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pk-om-title">

        <header class="pk-om-header">
          <div>
            <h2 id="pk-om-title">Manage Orders</h2>
            <p>View customer orders and update order status.</p>
          </div>
          <button type="button" class="pk-om-close"
            aria-label="Close order management">×</button>
        </header>

        <div class="pk-om-toolbar">
          <input id="pk-om-search" type="search"
            placeholder="Search order, customer or phone">

          <select id="pk-om-filter" aria-label="Filter orders">
            <option value="All">All statuses</option>
            ${VALID_STATUSES.map(status =>
              `<option value="${escapeHTML(status)}">${escapeHTML(status)}</option>`
            ).join("")}
          </select>

          <button type="button" id="pk-om-refresh">Refresh</button>
        </div>

        <p id="pk-om-message" role="status" aria-live="polite"></p>
        <div id="pk-om-list" class="pk-om-list"></div>
      </section>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #pk-order-management-modal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        font-family: Arial, sans-serif;
        color: #203128;
      }
      #pk-order-management-modal * { box-sizing: border-box; }
      .pk-om-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.55);
      }
      .pk-om-panel {
        position: absolute;
        inset: 3vh 3vw;
        overflow: auto;
        background: #f5f8f5;
        border-radius: 16px;
        padding: 22px;
        box-shadow: 0 12px 45px rgba(0,0,0,.25);
      }
      .pk-om-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        border-bottom: 1px solid #dce5dd;
        padding-bottom: 14px;
      }
      .pk-om-header h2 { margin: 0 0 6px; }
      .pk-om-header p { margin: 0; color: #627066; }
      .pk-om-close {
        font-size: 28px;
        border: 0;
        background: transparent;
        cursor: pointer;
      }
      .pk-om-toolbar {
        display: flex;
        gap: 10px;
        margin: 18px 0;
        flex-wrap: wrap;
      }
      .pk-om-toolbar input {
        flex: 1 1 220px;
      }
      .pk-om-toolbar input,
      .pk-om-toolbar select,
      .pk-om-toolbar button,
      .pk-om-actions select,
      .pk-om-actions button {
        padding: 10px;
        border: 1px solid #ccd8ce;
        border-radius: 8px;
        font-size: 14px;
      }
      .pk-om-toolbar button,
      .pk-om-actions button {
        cursor: pointer;
        background: #176b45;
        color: white;
        border-color: #176b45;
      }
      #pk-om-message { white-space: pre-wrap; }
      .pk-om-card {
        background: white;
        border: 1px solid #dce5dd;
        border-radius: 12px;
        padding: 16px;
        margin: 12px 0;
      }
      .pk-om-card h3 { margin: 0 0 8px; }
      .pk-om-card p { margin: 6px 0; overflow-wrap: anywhere; }
      .pk-om-muted { color: #68756c; font-size: 13px; }
      .pk-om-status {
        display: inline-block;
        padding: 5px 9px;
        border-radius: 20px;
        background: #edf4ee;
        font-size: 12px;
        font-weight: bold;
      }
      .pk-om-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .pk-om-actions select { max-width: 100%; }
      .pk-om-actions .pk-om-secondary {
        background: white;
        color: #176b45;
      }
      .pk-om-empty {
        padding: 28px 12px;
        text-align: center;
        color: #627066;
      }
      @media(max-width:600px) {
        .pk-om-panel { inset: 1vh 2vw; padding: 14px; }
        .pk-om-toolbar { display: grid; }
        .pk-om-toolbar input { min-width: 0; }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modalElement);

    modalElement.querySelector(".pk-om-backdrop")
      .addEventListener("click", closeOrderManagement);

    modalElement.querySelector(".pk-om-close")
      .addEventListener("click", closeOrderManagement);

    modalElement.querySelector("#pk-om-refresh")
      .addEventListener("click", loadOrders);

    modalElement.querySelector("#pk-om-search")
      .addEventListener("input", renderOrders);

    modalElement.querySelector("#pk-om-filter")
      .addEventListener("change", renderOrders);

    modalElement.addEventListener("click", handleOrderAction);

    document.addEventListener("keydown", handleEscape);

    return modalElement;
  }

  function handleEscape(event) {
    if (event.key === "Escape" && modalElement) {
      closeOrderManagement();
    }
  }

  function closeOrderManagement() {
    if (modalElement) {
      modalElement.remove();
      modalElement = null;
    }

    document.removeEventListener("keydown", handleEscape);
  }

  function setMessage(message, isError = false) {
    if (!modalElement) return;

    const element = modalElement.querySelector("#pk-om-message");
    element.textContent = message;
    element.style.color = isError ? "#b42318" : "#176b45";
  }

  async function loadOrders() {
    ensureModal();

    const list = modalElement.querySelector("#pk-om-list");
    list.innerHTML = '<p class="pk-om-empty">Loading orders…</p>';
    setMessage("");

    try {
      const client = getClient();

      const { data, error } = await client
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      currentOrders = Array.isArray(data) ? data : [];
      renderOrders();

      if (!currentOrders.length) {
        setMessage("No orders found. New customer orders will appear here.");
      } else {
        setMessage(`Loaded ${currentOrders.length} order(s).`);
      }
    } catch (error) {
      currentOrders = [];
      list.innerHTML = `
        <div class="pk-om-empty">
          Could not load orders from Supabase.
        </div>
      `;

      setMessage(
        `${error.message || "Unknown error"}\n` +
        "Check the Orders table name, SELECT permissions and Row Level Security (RLS).",
        true
      );
    }
  }

  function renderOrders() {
    if (!modalElement) return;

    const list = modalElement.querySelector("#pk-om-list");
    const search = modalElement.querySelector("#pk-om-search")
      .value.trim().toLowerCase();
    const filter = modalElement.querySelector("#pk-om-filter").value;

    const filtered = currentOrders.filter(order => {
      const status = order.status || "Pending";
      const searchable = [
        order.id,
        order.customer_name,
        order.phone,
        order.delivery_address,
        formatItems(order)
      ].join(" ").toLowerCase();

      return (!search || searchable.includes(search)) &&
        (filter === "All" || status === filter);
    });

    if (!filtered.length) {
      list.innerHTML =
        '<div class="pk-om-empty">No matching orders.</div>';
      return;
    }

    list.innerHTML = filtered.map(order => {
      const status = order.status || "Pending";
      const method =
        order.delivery_method ||
        order.fulfilment_method ||
        "Pickup";

      const itemText = formatItems(order);
      const createdAt = order.created_at
        ? new Date(order.created_at).toLocaleString()
        : "Time unavailable";

      const receiptAvailable = Boolean(order.phone);

      return `
        <article class="pk-om-card" data-order-id="${escapeHTML(order.id)}">
          <h3>Order #${escapeHTML(order.id)}</h3>
          <p class="pk-om-muted">${escapeHTML(createdAt)}</p>
          <p><strong>Customer:</strong>
            ${escapeHTML(order.customer_name || "Not provided")}</p>
          <p><strong>Phone:</strong>
            ${escapeHTML(order.phone || "Not provided")}</p>
          <p><strong>Items:</strong> ${escapeHTML(itemText)}</p>
          <p><strong>Fulfilment:</strong> ${escapeHTML(method)}</p>
          ${method === "Delivery" ? `
            <p><strong>Address:</strong>
              ${escapeHTML(order.delivery_address || "Not provided")}</p>
          ` : ""}
          <p><strong>Total:</strong>
            ₹${Number(order.total || 0).toFixed(2)}</p>
          <p><strong>Status:</strong>
            <span class="pk-om-status">${escapeHTML(status)}</span>
          </p>

          <div class="pk-om-actions">
            <select class="pk-om-status-select"
              aria-label="New status for order ${escapeHTML(order.id)}">
              ${VALID_STATUSES.map(option => `
                <option value="${escapeHTML(option)}"
                  ${option === status ? "selected" : ""}>
                  ${escapeHTML(option)}
                </option>
              `).join("")}
            </select>

            <button type="button" data-action="update">Update Status</button>

            <button type="button" class="pk-om-secondary"
              data-action="receipt">View Receipt</button>

            ${receiptAvailable ? `
              <button type="button" class="pk-om-secondary"
                data-action="whatsapp">WhatsApp Customer</button>
            ` : ""}
          </div>
        </article>
      `;
    }).join("");
  }

  async function updateOrderStatus(orderId, status) {
    if (!validateOrderStatus(status)) {
      setMessage("Please select a valid status.", true);
      return;
    }

    try {
      setMessage(`Updating order #${orderId}…`);

      const client = getClient();

      const { data, error } = await client
        .from(TABLE_NAME)
        .update({ status })
        .eq("id", orderId)
        .select("id, status");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "No order was updated. Check UPDATE permission and Row Level Security (RLS)."
        );
      }

      const order = currentOrders.find(
        item => String(item.id) === String(orderId)
      );

      if (order) order.status = status;

      renderOrders();
      setMessage(`Order #${orderId} updated to ${status}.`);
    } catch (error) {
      setMessage(
        `Could not update order #${orderId}: ${error.message || "Unknown error"}`,
        true
      );
    }
  }

  function handleOrderAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || !modalElement) return;

    const card = button.closest("[data-order-id]");
    if (!card) return;

    const orderId = card.dataset.orderId;
    const order = currentOrders.find(
      item => String(item.id) === String(orderId)
    );

    if (!order) {
      setMessage("Order not found. Refresh the list.", true);
      return;
    }

    const action = button.dataset.action;

    if (action === "update") {
      const select = card.querySelector(".pk-om-status-select");
      updateOrderStatus(order.id, select.value);
      return;
    }

    if (action === "receipt") {
      try {
        const receipt = createReceipt(order);
        setMessage(receipt);

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(receipt).catch(() => {});
        }
      } catch (error) {
        setMessage(error.message, true);
      }

      return;
    }

    if (action === "whatsapp") {
      try {
        const receipt = createReceipt(order);
        const link = createWhatsAppLink(
          order.phone,
          `Hello ${order.customer_name || "Customer"}, here is your Pakkathu Kadai order update:\n\n${receipt}`
        );

        window.open(link, "_blank", "noopener,noreferrer");
      } catch (error) {
        setMessage(error.message, true);
      }
    }
  }

  function showOrderManagement() {
    ensureModal();
    loadOrders();
  }

  window.PKOrderManagement = Object.freeze({
    VALID_STATUSES: [...VALID_STATUSES],
    validateOrderStatus,
    createFulfilmentDetails,
    createReceipt,
    createWhatsAppLink,
    showOrderManagement,
    loadOrders,
    closeOrderManagement
  });
})();
