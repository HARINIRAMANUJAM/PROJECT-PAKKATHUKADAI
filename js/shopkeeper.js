
(() => {
  "use strict";

  const db = window.supabaseClient;
  const body = document.getElementById("inventory-body");
  const status = document.getElementById("inventory-status");
  const search = document.getElementById("inventory-search");

  let products = [];

  async function loadProducts() {
    if (!body || !status) return;

    if (!db) {
      status.textContent = "ERROR: Supabase client not connected.";
      return;
    }

    status.textContent = "Connecting to database...";
    body.innerHTML = '<tr><td colspan="5">Please wait...</td></tr>';

    try {
      const result = await Promise.race([
        db.from("Products")
          .select("id, name, price, quantity, shop_name, unit")
          .order("id", { ascending: true }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(
            "Connection timed out. Check Supabase URL, key and internet."
          )), 10000)
        )
      ]);

      if (result.error) throw result.error;

      products = result.data || [];
      renderProducts();

      const productStat = document.getElementById("stat-products");
      const lowStat = document.getElementById("stat-low-stock");
      const groupStat = document.getElementById("stat-groups");

      if (productStat) productStat.textContent = products.length;
      if (lowStat) {
        lowStat.textContent = products.filter(
          p => Number(p.quantity) <= 5
        ).length;
      }
      if (groupStat) {
        groupStat.textContent = new Set(
          products.map(p => p.shop_name).filter(Boolean)
        ).size;
      }

      status.textContent = `${products.length} products loaded.`;
    } catch (error) {
      status.textContent = "ERROR: " + (error.message || "Could not load products.");
      body.innerHTML =
        '<tr><td colspan="5">Products could not be loaded. See message above.</td></tr>';
    }
  }

  function renderProducts() {
    if (!body) return;

    const query = (search?.value || "").trim().toLowerCase();

    const filtered = products.filter(p =>
      `${p.name || ""} ${p.shop_name || ""}`.toLowerCase().includes(query)
    );

    if (!filtered.length) {
      body.innerHTML =
        '<tr><td colspan="5">No products found.</td></tr>';
      return;
    }

    body.innerHTML = filtered.map(p => {
      const qty = Number(p.quantity) || 0;
      const availability = qty <= 0
        ? "Out of stock"
        : qty <= 5 ? "Low stock" : "Available";

      return `<tr>
        <td>${escapeHTML(p.name)}</td>
        <td>${escapeHTML(p.shop_name || "Local shop")}</td>
        <td>₹${Number(p.price || 0).toFixed(2)}</td>
        <td>${qty} ${escapeHTML(p.unit || "")}</td>
        <td>${availability}</td>
      </tr>`;
    }).join("");
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  search?.addEventListener("input", renderProducts);
  loadProducts();
})();
