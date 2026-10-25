
(() => {
  "use strict";

  const TABLE = "BulkPurchases";

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

  function get(id) {
    return document.getElementById(id);
  }

  function setStatus(message, isError = false) {
    const element = get("purchase-status");
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "#b42318" : "#16703c";
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

  async function loadPurchases() {
    const client = getClient();
    const list = get("purchase-list");

    if (!client) {
      setStatus("Supabase client not available. Check js/supabase.js.", true);
      return;
    }

    if (!list) {
      setStatus("Purchase list element not found.", true);
      return;
    }

    list.textContent = "Loading shared purchase requests...";

    const { data, error } = await client
      .from(TABLE)
      .select("id, product_name, quantity, unit, notes, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      list.textContent = "Could not load purchase requests.";
      setStatus(error.message, true);
      return;
    }

    if (!data || data.length === 0) {
      list.textContent = "No shared purchase requests yet.";
      setStatus("Purchase requests loaded.");
      return;
    }

    list.innerHTML = data.map(item => `
      <article style="border:1px solid #ddd;border-radius:8px;padding:12px;margin:8px 0;">
        <strong>${escapeHTML(item.product_name)}</strong>
        <p>Quantity: ${escapeHTML(item.quantity)} ${escapeHTML(item.unit)}</p>
        <p>Status: ${escapeHTML(item.status)}</p>
        ${item.notes ? `<p>Notes: ${escapeHTML(item.notes)}</p>` : ""}
        <small>${escapeHTML(
          item.created_at
            ? new Date(item.created_at).toLocaleString()
            : ""
        )}</small>
      </article>
    `).join("");

    setStatus("Purchase requests loaded.");
  }

  async function createPurchase(event) {
    if (event) event.preventDefault();

    const client = getClient();
    if (!client) {
      setStatus("Supabase client not available. Check js/supabase.js.", true);
      return;
    }

    const product = get("bulk-product");
    const quantity = get("bulk-quantity");
    const unit = get("bulk-unit");
    const notes = get("bulk-notes");

    if (!product || !quantity || !unit) {
      setStatus("Purchase form fields are missing from the page.", true);
      return;
    }

    const productName = product.value.trim();
    const amount = Number(quantity.value);
    const allowedUnits = ["kg", "litre", "pieces", "bags"];

    if (!productName || !Number.isFinite(amount) || amount <= 0) {
      setStatus("Enter a product name and a quantity greater than zero.", true);
      return;
    }

    if (!allowedUnits.includes(unit.value)) {
      setStatus("Choose a valid unit.", true);
      return;
    }

    const button = get("create-purchase-button");
    if (button) button.disabled = true;

    const { error } = await client.from(TABLE).insert({
      product_name: productName,
      quantity: amount,
      unit: unit.value,
      notes: notes ? notes.value.trim() || null : null,
      status: "Open"
    });

    if (button) button.disabled = false;

    if (error) {
      setStatus("Could not save request: " + error.message, true);
      return;
    }

    setStatus("Shared purchase request created successfully.");

    const form = get("purchase-form");
    if (form) form.reset();

    await loadPurchases();
  }

  function init() {
    const form = get("purchase-form");
    if (form && !form.dataset.pkBound) {
      form.addEventListener("submit", createPurchase);
      form.dataset.pkBound = "true";
    }

    const browseButton = get("browse-purchases-button");
    if (browseButton && !browseButton.dataset.pkBound) {
      browseButton.addEventListener("click", loadPurchases);
      browseButton.dataset.pkBound = "true";
    }

    const createButton = get("create-purchase-button");

    if (createButton && createButton.type !== "submit" &&
        !createButton.dataset.pkBound) {
      createButton.addEventListener("click", createPurchase);
      createButton.dataset.pkBound = "true";
    }

    loadPurchases();
  }

  window.PKBulkPurchase = {
    loadPurchases,
    createPurchase
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
