
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

  function addPanel() {
    if (document.getElementById("pk-expiry-entry")) return;

    const panel = document.createElement("section");
    panel.id = "pk-expiry-entry";
    panel.style.cssText =
      "margin:16px 0;padding:16px;border:1px solid #ddd;" +
      "border-radius:12px;background:#fff;";

    panel.innerHTML = `
      <h3>Product Expiry Date</h3>
      <label for="pk-expiry-product">Product</label>
      <select id="pk-expiry-product" style="display:block;width:100%;padding:10px;margin:8px 0;">
        <option value="">Loading products...</option>
      </select>

      <label for="pk-expiry-date">Expiry date</label>
      <input id="pk-expiry-date" type="date"
        style="display:block;width:100%;padding:10px;margin:8px 0;">

      <button id="pk-expiry-save" type="button"
        style="padding:10px 16px;cursor:pointer;">
        Save expiry date
      </button>

      <p id="pk-expiry-message" role="status"></p>
    `;

    const target =
      document.querySelector("main") ||
      document.querySelector(".container") ||
      document.body;

    target.appendChild(panel);

    document.getElementById("pk-expiry-save")
      .addEventListener("click", saveExpiryDate);

    loadProducts();
  }

  function message(text, isError = false) {
    const element = document.getElementById("pk-expiry-message");
    if (!element) return;

    element.textContent = text;
    element.style.color = isError ? "#b42318" : "#16703c";
  }

  async function loadProducts() {
    const client = getClient();
    const select = document.getElementById("pk-expiry-product");

    if (!client) {
      message("Supabase client unavailable. Check js/supabase.js.", true);
      return;
    }

    const { data, error } = await client
      .from("Products")
      .select("id, name, shop_name, expiry_date")
      .order("name");

    if (error) {
      select.innerHTML = '<option value="">Could not load products</option>';
      message(error.message, true);
      return;
    }

    select.innerHTML = '<option value="">Choose a product</option>';

    (data || []).forEach(product => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent =
        `${product.name}${product.shop_name ? " — " + product.shop_name : ""}`;
      option.dataset.expiry = product.expiry_date || "";
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const selected = select.options[select.selectedIndex];
      document.getElementById("pk-expiry-date").value =
        selected?.dataset.expiry || "";
    });

    if (!data || data.length === 0) {
      message("No products found.", true);
    }
  }

  async function saveExpiryDate() {
    const client = getClient();
    const select = document.getElementById("pk-expiry-product");
    const dateInput = document.getElementById("pk-expiry-date");
    const button = document.getElementById("pk-expiry-save");

    if (!client) {
      message("Supabase client unavailable.", true);
      return;
    }

    if (!select.value) {
      message("Choose a product first.", true);
      return;
    }

    if (!dateInput.value) {
      message("Choose an expiry date.", true);
      return;
    }

    button.disabled = true;

    const { error } = await client
      .from("Products")
      .update({ expiry_date: dateInput.value })
      .eq("id", select.value);

    button.disabled = false;

    if (error) {
      message("Could not save: " + error.message, true);
      return;
    }

    select.options[select.selectedIndex].dataset.expiry = dateInput.value;
    message("Expiry date saved successfully.");
  }

  window.PKExpiryEntry = { loadProducts, saveExpiryDate };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addPanel);
  } else {
    addPanel();
  }
})();
