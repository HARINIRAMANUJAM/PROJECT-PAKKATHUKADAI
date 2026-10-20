
(() => {
  "use strict";

  const db = window.supabaseClient;

  const inventoryBody = document.getElementById("inventory-body");
  const inventorySearch = document.getElementById("inventory-search");
  const inventoryStatus = document.getElementById("inventory-status");
  const addProductButton = document.getElementById("add-product-button");

  const productStat = document.getElementById("stat-products");
  const lowStockStat = document.getElementById("stat-low-stock");
  const groupsStat = document.getElementById("stat-groups");

  let products = [];

  const LOW_STOCK_LIMIT = 5;

  function cell(value) {
    const td = document.createElement("td");
    td.textContent = value ?? "";
    return td;
  }

  function renderInventory(search = "") {
    if (!inventoryBody) return;

    inventoryBody.replaceChildren();

    const filtered = products.filter(product =>
      [product.name, product.shop_name]
        .some(value =>
          String(value || "").toLowerCase().includes(search.toLowerCase())
        )
    );

    if (!filtered.length) {
      const tr = document.createElement("tr");
      const td = cell("No matching products found.");
      td.colSpan = 5;
      tr.appendChild(td);
      inventoryBody.appendChild(tr);
      return;
    }

    filtered.forEach(product => {
      const tr = document.createElement("tr");
      const quantity = Number(product.quantity) || 0;

      tr.append(
        cell(product.name),
        cell(product.shop_name),
        cell(`₹${Number(product.price || 0).toFixed(2)}`),
        cell(`${quantity} ${product.unit || ""}`),
        cell(quantity <= LOW_STOCK_LIMIT ? "Low stock" : "Available")
      );

      inventoryBody.appendChild(tr);
    });
  }

  function updateStats() {
    if (productStat) productStat.textContent = products.length;

    if (lowStockStat) {
      lowStockStat.textContent = products.filter(
        product => Number(product.quantity) <= LOW_STOCK_LIMIT
      ).length;
    }

    if (groupsStat) {
      groupsStat.textContent = "—";
    }
  }

  async function loadProducts() {
    if (!db) {
      inventoryStatus.textContent =
        "Database connection unavailable. Check js/supabase.js.";
      return;
    }

    inventoryStatus.textContent = "Loading inventory...";

    const { data, error } = await db
      .from("Products")
      .select("id, name, price, quantity, shop_name, unit")
      .order("id", { ascending: true });

    if (error) {
      inventoryStatus.textContent =
        "Could not load inventory: " + error.message;
      return;
    }

    products = data || [];
    renderInventory(inventorySearch?.value || "");
    updateStats();

    inventoryStatus.textContent =
      `Loaded ${products.length} products.`;
  }

  inventorySearch?.addEventListener("input", () => {
    renderInventory(inventorySearch.value);
  });

  addProductButton?.addEventListener("click", async () => {
    const name = prompt("Enter product name:");
    if (!name || !name.trim()) return;

    const priceInput = prompt("Enter price in ₹:");
    if (priceInput === null) return;

    const quantityInput = prompt("Enter available quantity:");
    if (quantityInput === null) return;

    const shopName = prompt(
      "Enter the shop name exactly as it appears in your existing products:"
    );
    if (!shopName || !shopName.trim()) return;

    const price = Number(priceInput);
    const quantity = Number(quantityInput);

    if (
      !Number.isFinite(price) || price < 0 ||
      !Number.isInteger(quantity) || quantity < 0
    ) {
      alert("Enter a valid price and a whole-number quantity.");
      return;
    }

    const unit = prompt("Enter unit (kg, litre, pieces, etc.):") || "pieces";

    const { error } = await db.from("Products").insert({
      name: name.trim(),
      price,
      quantity,
      shop_name: shopName.trim(),
      unit: unit.trim()
    });

    if (error) {
      alert("Could not add product: " + error.message);
      return;
    }

    alert("Product added successfully!");
    await loadProducts();
  });

  loadProducts();
})();
