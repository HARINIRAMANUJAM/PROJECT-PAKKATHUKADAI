
(() => {
  "use strict";

  const db = window.supabaseClient;

  const form = document.getElementById("checkout-form");
  const itemsContainer = document.getElementById("checkout-items");
  const totalElement = document.getElementById("checkout-total");
  const statusElement = document.getElementById("checkout-status");
  const submitButton = document.getElementById("place-order-button");

  if (!form || !itemsContainer || !totalElement ||
      !statusElement || !submitButton) {
    console.error("Checkout setup error: required HTML elements are missing.");
    return;
  }

  function getCart() {
    try {
      const cart = JSON.parse(
        sessionStorage.getItem("pakkathuCart") || "[]"
      );
      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }

  function getTotal(cart) {
    return cart.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < 0 ||
        quantity <= 0
      ) {
        return sum;
      }

      return sum + price * quantity;
    }, 0);
  }

  function renderCart() {
    const cart = getCart();
    itemsContainer.replaceChildren();

    if (cart.length === 0) {
      const message = document.createElement("p");
      message.textContent = "Your cart is empty.";
      itemsContainer.appendChild(message);
      totalElement.textContent = "₹0.00";
      return;
    }

    cart.forEach((item) => {
      const row = document.createElement("p");
      const name = String(item.name || "Product");
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      row.textContent =
        `${name} × ${quantity} — ₹${(price * quantity).toFixed(2)}`;

      itemsContainer.appendChild(row);
    });

    totalElement.textContent = `₹${getTotal(cart).toFixed(2)}`;
  }

  function getFulfilmentMethod() {
    const selected = form.querySelector(
      '[name="fulfilment_method"]:checked, ' +
      '[name="fulfilment"]:checked'
    );

    const control = selected || form.querySelector(
      'select[name="fulfilment_method"], ' +
      'select[name="fulfilment"], ' +
      '#fulfilment-method, #fulfilment'
    );

    const value = String(control?.value || "Delivery")
      .trim()
      .toLowerCase();

    return value === "pickup" ? "Pickup" : "Delivery";
  }

  function showStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.style.color = isError ? "red" : "";
  }

  async function placeOrder(event) {
    event.preventDefault();

    if (!window.supabaseClient) {
      showStatus("Database connection unavailable. Please try again.", true);
      return;
    }

    const cart = getCart();

    if (cart.length === 0) {
      showStatus("Your cart is empty.", true);
      renderCart();
      return;
    }

    const name = document.getElementById("customer-name")
      ?.value.trim();

    const phone = document.getElementById("customer-phone")
      ?.value.trim();

    const address = document.getElementById("delivery-address")
      ?.value.trim();

    const fulfilment = getFulfilmentMethod();

    if (!name || !phone) {
      showStatus("Please enter your name and phone number.", true);
      return;
    }

    if (fulfilment === "Delivery" && !address) {
      showStatus("Please enter your delivery address.", true);
      return;
    }

    const total = getTotal(cart);

    if (
      !Number.isFinite(total) ||
      cart.some((item) =>
        !item.name ||
        !Number.isFinite(Number(item.price)) ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.price) < 0 ||
        Number(item.quantity) <= 0
      )
    ) {
      showStatus("Your cart contains invalid items. Please check it.", true);
      return;
    }

    submitButton.disabled = true;
    showStatus("Placing your order...");

    try {
      // Require a valid authenticated Supabase user.
      const { data: authData, error: authError } =
        await db.auth.getUser();

      if (authError || !authData?.user?.id) {
        showStatus(
          "Please log in again before placing your order.",
          true
        );
        submitButton.disabled = false;
        return;
      }

      // Link this order to the authenticated customer.
      const order = {
        user_id: authData.user.id,
        customer_name: name,
        phone: phone,
        delivery_address:
          fulfilment === "Delivery" ? address : "",
        items: cart,
        total: total,
        status: "Pending",
        fulfilment_method: fulfilment
      };

      const { error: insertError } = await db
        .from("Orders")
        .insert(order);

      if (insertError) {
        throw insertError;
      }

      sessionStorage.removeItem("pakkathuCart");
      form.reset();
      renderCart();

      showStatus("Order placed successfully!");

      // Prevent duplicate submission of the completed order.
      submitButton.disabled = true;
    } catch (error) {
      console.error("Checkout error:", error);

      showStatus(
        "Order failed: " +
          (error?.message || "Please try again."),
        true
      );

      submitButton.disabled = false;
    }
  }

  form.addEventListener("submit", placeOrder);
  renderCart();
})();
