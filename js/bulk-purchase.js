
(() => {
  "use strict";

  const TABLE = "BulkPurchases";

  function getClient() {
    const client = window.supabaseClient;
    if (!client) {
      throw new Error("Supabase client is not connected.");
    }
    return client;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setStatus(message) {
    const node = el("purchase-status");
    if (node) node.textContent = message;
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
    const list = el("purchase-list");
    if (!list) return;

    list.textContent = "Loading shared purchase requests…";

    const { data, error } = await getClient()
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      list.textContent =
        "Unable to load requests. The BulkPurchases table may not exist yet.";
      console.error("Bulk purchasing load failed:", error);
      return;
    }

    if (!data || data.length === 0) {
      list.textContent = "No shared purchase requests yet.";
      return;
    }

    list.innerHTML = data.map(item => `
      <article style="border:1px solid #ddd;padding:12px;margin:10px 0;border-radius:8px">
        <h3>${escapeHTML(item.product_name || item.product || "Product")}</h3>
        <p>Quantity: ${escapeHTML(item.quantity ?? "—")}
          ${escapeHTML(item.unit || "")}</p>
        <p>Status: ${escapeHTML(item.status || "Open")}</p>
        <p>${escapeHTML(item.notes || "")}</p>
      </article>
    `).join("");
  }

  async function createPurchase(event) {
    if (event) event.preventDefault();

    const product = el("bulk-product")?.value.trim();
    const quantity = Number(el("bulk-quantity")?.value);
    const unit = el("bulk-unit")?.value || "kg";
    const notes = el("bulk-notes")?.value.trim() || "";

    if (!product || !Number.isFinite(quantity) || quantity <= 0) {
      setStatus("Enter a product and a quantity greater than zero.");
      return;
    }

    setStatus("Saving request…");

    const record = {
      product_name: product,
      quantity,
      unit,
      notes,
      status: "Open"
    };

    const { error } = await getClient()
      .from(TABLE)
      .insert(record);

    if (error) {
      console.error("Bulk purchase save failed:", error);
      setStatus(
        "Could not save. The BulkPurchases table or its permissions may need setup."
      );
      return;
    }

    setStatus("Purchase request saved.");
    el("purchase-form")?.reset();
    await loadPurchases();
  }

  function setup() {
    const workspace = el("purchase-workspace");

    el("create-purchase-button")?.addEventListener("click", () => {
      if (workspace) workspace.classList.toggle("hidden");
    });

    el("cancel-purchase-button")?.addEventListener("click", () => {
      workspace?.classList.add("hidden");
    });

    el("purchase-form")?.addEventListener("submit", createPurchase);
    el("browse-purchases-button")?.addEventListener("click", loadPurchases);

    loadPurchases();
  }

  window.PKBulkPurchase = { loadPurchases, createPurchase };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
