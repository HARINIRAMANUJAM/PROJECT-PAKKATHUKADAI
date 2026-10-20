
(() => {
  "use strict";

  const db = () => window.supabaseClient;

  const status = document.getElementById("inventory-status");
  const inventoryBody = document.getElementById("inventory-body");
  const searchInput = document.getElementById("inventory-search");
  const addButton = document.getElementById("add-product-button");

  let products = [];

  function showStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#b42318" : "";
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[char]);
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

  function renderInventory() {
    if (!inventoryBody) return;

    const query = (searchInput?.value || "").trim().toLowerCase();

    const filtered = products.filter(p =>
      `${p.name || ""} ${p.shop_name || ""}`
        .toLowerCase().includes(query)
    );

    if (!filtered.length) {
      inventoryBody.innerHTML =
        '<tr><td colspan="5">No matching products found.</td></tr>';
      return;
    }

    inventoryBody.innerHTML = filtered.map(p => {
      const quantity = Number(p.quantity) || 0;
      const availability = quantity <= 0
        ? "Out of stock"
        : quantity <= 5 ? "Low stock" : "Available";

      return `
        <tr>
          <td>${escapeHTML(p.name)}</td>
          <td>${escapeHTML(p.shop_name || "Local shop")}</td>
          <td>₹${Number(p.price || 0).toFixed(2)}</td>
          <td>${quantity} ${escapeHTML(p.unit || "")}</td>
          <td>${availability}</td>
        </tr>
      `;
    }).join("");
  }

  async function loadInventory() {
    if (!db()) {
      showStatus("Supabase connection not found. Check js/supabase.js.", true);
      return;
    }

    showStatus("Loading inventory...");

    const { data, error } = await db()
      .from("Products")
      .select("id, name, price, quantity, shop_name, unit")
      .order("id", { ascending: true });

    if (error) {
      showStatus("Could not load inventory: " + error.message, true);
      return;
    }

    products = data || [];
    renderInventory();
    updateStats();
    showStatus(`${products.length} products loaded.`);
  }

  async function addProduct() {
    if (!db()) {
      showStatus("Database connection not found.", true);
      return;
    }

    const name = prompt("Product name:");
    if (name === null || !name.trim()) return;

    const priceText = prompt("Price in ₹:");
    if (priceText === null || priceText.trim() === "") return;

    const quantityText = prompt("Available quantity:");
    if (quantityText === null || quantityText.trim() === "") return;

    const shopName = prompt("Shop name:");
    if (shopName === null || !shopName.trim()) return;

    const unit = prompt("Unit (kg, litre, pieces, etc.):", "pieces");
    if (unit === null || !unit.trim()) return;

    const price = Number(priceText);
    const quantity = Number(quantityText);

    if (!Number.isFinite(price) || price < 0) {
      alert("Enter a valid price.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      alert("Quantity must be a non-negative whole number.");
      return;
    }

    addButton.disabled = true;
    showStatus("Adding product...");

    try {
      const { error } = await db()
        .from("Products")
        .insert([{
          name: name.trim(),
          price,
          quantity,
          shop_name: shopName.trim(),
          unit: unit.trim()
        }]);

      if (error) {
        showStatus("Could not add product: " + error.message, true);
        return;
      }

      showStatus("Product added successfully.");
      await loadInventory();
    } catch (error) {
      showStatus("Error: " + error.message, true);
    } finally {
      addButton.disabled = false;
    }
  }

  searchInput?.addEventListener("input", renderInventory);
  addButton?.addEventListener("click", addProduct);

  document.getElementById("create-purchase-button")
    ?.addEventListener("click", () => {
      const workspace = document.getElementById("purchase-workspace");
      if (workspace) {
        workspace.hidden = false;
        workspace.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

  document.getElementById("browse-purchases-button")
    ?.addEventListener("click", () => {
      document.getElementById("purchase-list")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

  document.getElementById("cancel-purchase-button")
    ?.addEventListener("click", () => {
      const workspace = document.getElementById("purchase-workspace");
      if (workspace) workspace.hidden = true;
    });

  document.getElementById("purchase-form")
    ?.addEventListener("submit", event => {
      event.preventDefault();
      showStatus("Shared purchasing is not connected to the database yet.");
    });

  loadInventory();
})();
