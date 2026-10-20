
document.addEventListener("DOMContentLoaded", () => {
  const db = window.supabaseClient;

  const main = document.querySelector("main.dashboard");
  if (!main) return;

  const section = document.createElement("section");
  section.className = "dashboard-section";
  section.id = "order-management";

  section.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="eyebrow">CUSTOMER ORDERS</p>
        <h2>Order management</h2>
        <p>Review orders and update their progress.</p>
      </div>
      <button class="secondary-button" id="refresh-orders" type="button">
        Refresh
      </button>
    </div>

    <p id="orders-status" role="status" aria-live="polite">
      Loading orders...
    </p>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody id="orders-body">
          <tr><td colspan="7">Loading orders...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const inventory = document.getElementById("inventory");
  main.insertBefore(section, inventory ? inventory.nextSibling : main.firstChild);

  const statusEl = section.querySelector("#orders-status");
  const body = section.querySelector("#orders-body");
  const refreshButton = section.querySelector("#refresh-orders");

  function showMessage(message) {
    statusEl.textContent = message;
  }

  function formatItems(items) {
    if (!items) return "—";

    if (Array.isArray(items)) {
      return items.map(item => {
        const name = item.name || item.product_name || "Product";
        const qty = item.quantity ?? item.qty ?? 1;
        return `${name} × ${qty}`;
      }).join(", ");
    }

    if (typeof items === "object") {
      return Object.entries(items)
        .map(([name, value]) => {
          if (value && typeof value === "object") {
            return `${value.name || name} × ${value.quantity ?? value.qty ?? 1}`;
          }
          return `${name} × ${value}`;
        })
        .join(", ");
    }

    return String(items);
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadOrders() {
    if (!db) {
      showMessage("Supabase client not found. Check js/supabase.js.");
      body.innerHTML = "";
      return;
    }

    showMessage("Loading orders...");
    refreshButton.disabled = true;

    const { data, error } = await db
      .from("Orders")
      .select("id, customer_name, phone, items, total, status, created_at")
      .order("created_at", { ascending: false });

    refreshButton.disabled = false;

    if (error) {
      body.innerHTML = "";
      showMessage("Could not load orders: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      body.innerHTML = `
        <tr><td colspan="7">No orders found yet.</td></tr>
      `;
      showMessage("No orders to display.");
      return;
    }

    body.innerHTML = data.map(order => {
      const currentStatus = order.status || "Pending";
      const statuses = ["Pending", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"];

      const options = statuses.map(status => `
        <option value="${status}"
          ${status.toLowerCase() === currentStatus.toLowerCase() ? "selected" : ""}>
          ${status}
        </option>
      `).join("");

      return `
        <tr>
          <td>${escapeHTML(order.id)}</td>
          <td>${escapeHTML(order.customer_name)}</td>
          <td>${escapeHTML(order.phone)}</td>
          <td>${escapeHTML(formatItems(order.items))}</td>
          <td>₹${Number(order.total || 0).toFixed(2)}</td>
          <td>${escapeHTML(currentStatus)}</td>
          <td>
            <select class="order-status-select"
              data-order-id="${escapeHTML(order.id)}"
              aria-label="Status for order ${escapeHTML(order.id)}">
              ${options}
            </select>
            <button class="secondary-button save-order-status"
              data-order-id="${escapeHTML(order.id)}" type="button">
              Save
            </button>
          </td>
        </tr>
      `;
    }).join("");

    showMessage(`${data.length} order(s) loaded.`);
  }

  body.addEventListener("click", async event => {
    const button = event.target.closest(".save-order-status");
    if (!button) return;

    const id = button.dataset.orderId;
    const select = body.querySelector(
      `.order-status-select[data-order-id="${CSS.escape(id)}"]`
    );

    if (!select) return;

    button.disabled = true;
    showMessage(`Updating order ${id}...`);

    const { error } = await db
      .from("Orders")
      .update({ status: select.value })
      .eq("id", id);

    button.disabled = false;

    if (error) {
      showMessage("Could not update order: " + error.message);
      return;
    }

    showMessage(`Order ${id} updated to ${select.value}.`);
    await loadOrders();
  });

  refreshButton.addEventListener("click", loadOrders);
  loadOrders();
});
