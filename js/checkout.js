(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const db = window.supabaseClient;

  function readCart() {
    try {
      const cart = JSON.parse(
        sessionStorage.getItem("pakkathuCart") || "[]"
      );
      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }

  function itemName(item) {
    return item.name || item.product_name || "Product";
  }

  function itemPrice(item) {
    return Number(item.price || 0);
  }

  function itemQuantity(item) {
    return Number(item.quantity || item.qty || 1);
  }

  function renderSummary() {
    const cart = readCart();
    const container = $("checkout-items");
    const totalElement = $("checkout-total");

    if (!container || !totalElement) return;

    if (!cart.length) {
      container.innerHTML = "<p>Your cart is empty.</p>";
      totalElement.textContent = "₹0.00";
      return;
    }

    container.replaceChildren();
    let total = 0;

    cart.forEach(item => {
      const price = itemPrice(item);
      const quantity = itemQuantity(item);
      const subtotal = price * quantity;
      total += subtotal;

      const line = document.createElement("p");
      line.textContent =
        `${itemName(item)} × ${quantity} — ₹${subtotal.toFixed(2)}`;
      container.appendChild(line);
    });

    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  function updateAddressVisibility() {
    const method = $("fulfilment-method");
    const section = $("delivery-address-section");
    const address = $("delivery-address");

    if (!method || !section || !address) return;

    const delivery = method.value === "Delivery";
    section.hidden = !delivery;
    address.required = delivery;
  }

  function setStatus(message, isError = false) {
    const status = $("checkout-status");

    if (!status) {
      alert(message);
      return;
    }

    status.textContent = message;
    status.style.color = isError ? "red" : "";
  }

  async function placeOrder(event) {
    event.preventDefault();

    if (!db) {
      setStatus(
        "Supabase is not connected. Refresh and try again.",
        true
      );
      return;
    }

    const name = $("customer-name")?.value.trim() || "";
    const phone = $("customer-phone")?.value.trim() || "";
    const fulfilment =
      $("fulfilment-method")?.value || "Pickup";
    const address =
      $("delivery-address")?.value.trim() || "";
    const cart = readCart();

    if (!name || !phone) {
      setStatus("Enter your name and phone number.", true);
      return;
    }

    if (!["Pickup", "Delivery"].includes(fulfilment)) {
      setStatus("Choose Pickup or Delivery.", true);
      return;
    }

    if (fulfilment === "Delivery" && !address) {
      setStatus("Enter your delivery address.", true);
      return;
    }

    if (!cart.length) {
      setStatus(
        "Your cart is empty. Add products before checkout.",
        true
      );
      return;
    }

    const items = cart.map(item => ({
      id: item.id ?? null,
      name: itemName(item),
      price: itemPrice(item),
      quantity: itemQuantity(item),
      shop_name: item.shop_name || item.shopName || ""
    }));

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (
      items.some(item =>
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      )
    ) {
      setStatus(
        "A cart item has an invalid price or quantity.",
        true
      );
      return;
    }

    const button = $("place-order-button");
    if (button) button.disabled = true;

    setStatus("Placing your order...");

    try {
      const order = {
        customer_name: name,
        phone,
        delivery_address:
          fulfilment === "Delivery" ? address : "",
        items,
        total,
        status: "Pending",
        delivery_method: fulfilment
      };

      const { error } = await db
        .from("Orders")
        .insert(order);

      if (error) throw error;

      sessionStorage.removeItem("pakkathuCart");
      renderSummary();
      $("checkout-form")?.reset();
      updateAddressVisibility();

      setStatus(
        `Order placed successfully! ${fulfilment} selected. Total: ₹${total.toFixed(2)}`
      );
    } catch (error) {
      console.error("Checkout error:", error);
      setStatus(`Order failed: ${error.message}`, true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderSummary();

    $("fulfilment-method")?.addEventListener(
      "change",
      updateAddressVisibility
    );

    $("checkout-form")?.addEventListener(
      "submit",
      placeOrder
    );

    updateAddressVisibility();
  });
})();
