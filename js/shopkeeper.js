
(() => {
  "use strict";

  const supabase = () => window.supabaseClient;

  const status = document.getElementById("inventory-status");
  const inventoryBody = document.getElementById("inventory-body");
  const searchInput = document.getElementById("inventory-search");

  let products = [];

  function showStatus(message, error = false) {
    if (!status) return;
    status.textContent = message;
    status.style.color = error ? "#b42318" : "";
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

  async function loadInventory() {
    if (!supabase()) {
      showStatus("Database connection will be configured later.");
      return;
    }

    showStatus("Loading inventory...");

    const { data, error } = await supabase()
      .from("Products")
      .select("id, name, price, quantity, shop_name, unit")
      .order("id");

    if (error) {
      showStatus("Could not load inventory: " + error.message, true);
      return;
    }

    products = data || [];
    renderInventory();
    updateStats();
    showStatus(`${products.length} products loaded.`);
  }

  function renderInventory() {
    if (!inventoryBody) return;

    const search = (searchInput?.value || "").toLowerCase().trim();

    const filtered = products.filter(product =>
      `${product.name} ${product.shop_name}`
        .toLowerCase()
        .includes(search)
    );

    if (!filtered.length) {
      inventoryBody.innerHTML =
        '<tr><td colspan="5">No matching products found.</td></tr>';
      return;
    }

    inventoryBody.innerHTML = filtered.map(product => {
      const lowStock = Number(product.quantity) <= 5;

      return `
        <tr>
          <td>${escapeHTML(product.name)}</td>
          <td>${escapeHTML(product.shop_name)}</td>
          <td>₹${Number(product.price).toFixed(2)}</td>
          <td>${escapeHTML(product.quantity)} ${escapeHTML(product.unit)}</td>
          <td>${lowStock ? "Low stock" : "Available"}</td>
        </tr>
      `;
    }).join("");
  }

  function updateStats() {
    const productStat = document.getElementById("stat-products");
    const lowStockStat = document.getElementById("stat-low-stock");
    const groupStat = document.getElementById("stat-groups");

    if (productStat) productStat.textContent = products.length;

    if (lowStockStat) {
      lowStockStat.textContent = products.filter(
        p => Number(p.quantity) <= 5
      ).length;
    }

    if (groupStat) {
      groupStat.textContent = new Set(
        products.map(p => p.shop_name).filter(Boolean)
      ).size;
    }
  }

  searchInput?.addEventListener("input", renderInventory);

  document.getElementById("add-product-button")?.addEventListener("click", () => {
    alert(
      "Product editing will be added after database permissions and shopkeeper login are configured."
    );
  });

  document.getElementById("create-purchase-button")?.addEventListener("click", () => {
    document.getElementById("purchase-workspace")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  document.getElementById("browse-purchases-button")?.addEventListener("click", () => {
    document.getElementById("purchase-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  document.getElementById("cancel-purchase-button")?.addEventListener("click", () => {
    document.getElementById("purchase-workspace")?.classList.add("hidden");
  });

  document.getElementById("purchase-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const purchaseStatus = document.getElementById("purchase-status");

    if (purchaseStatus) {
      purchaseStatus.textContent =
        "Shared purchasing requests will be connected to the database in a later step.";
    }
  });

  loadInventory();
})();
