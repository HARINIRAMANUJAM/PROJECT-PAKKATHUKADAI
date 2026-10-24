
(() => {
  "use strict";

  const db = window.supabaseClient;
  const $ = id => document.getElementById(id);

  function getCart() {
    try {
      return JSON.parse(sessionStorage.getItem("pakkathuCart") || "[]");
    } catch {
      return [];
    }
  }

  function getItemName(item) {
    return item.name || item.product_name || "Product";
  }

  function getItemPrice(item) {
    return Number(item.price || 0);
  }

  function getItemQuantity(item) {
    return Number(item.quantity || item.qty || 1);
  }

  function getTotal(items) {
    return items.reduce(
      (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
      0
    );
  }

  function showMessage(message) {
    alert(message);
  }

  async function placeOrder() {
    if (!db) {
      showMessage("Supabase is not connected. Please refresh and try again.");
      return;
    }

    const nameInput = $("customer-name");
    const phoneInput = $("customer-phone");
    const addressInput = $("delivery-address");
    const fulfilmentInput = $("fulfilment-method");

    if (!nameInput || !phoneInput || !addressInput) {
      showMessage(
        "Checkout fields were not found. Check the field IDs in checkout.html."
      );
      return;
    }

    const customerName = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const fulfilment = fulfilmentInput?.value || "Pickup";
    const cart = getCart();

    if (!customerName || !phone) {
      showMessage("Please enter your name and phone number.");
      return;
    }

    if (fulfilment === "Delivery" && !address) {
      showMessage("Please enter your delivery address.");
      return;
    }

    if (!cart.length) {
      showMessage("Your cart is empty.");
      return;
    }

    const items = cart.map(item => ({
      id: item.id ?? null,
      name: getItemName(item),
      price: getItemPrice(item),
      quantity: getItemQuantity(item),
      shop_name: item.shop_name || item.shopName || ""
    }));

    const total = getTotal(cart);

    if (!Number.isFinite(total) || total < 0) {
      showMessage("The cart total is invalid.");
      return;
    }

    const order = {
      customer_name: customerName,
      phone,
      delivery_address: fulfilment === "Delivery" ? address : "",
      items,
      total,
      status: "Pending",
      fulfilment_method: fulfilment
    };

    const button = $("place-order-button");
    if (button) button.disabled = true;

    try {
      const { error } = await db
        .from("Orders")
        .insert(order);

      if (error) throw error;

      sessionStorage.removeItem("pakkathuCart");
      showMessage(
        `Order placed successfully!\n` +
        `Fulfilment: ${fulfilment}\n` +
        `Total: ₹${total.toFixed(2)}`
      );

      window.location.href = "index.html";
    } catch (error) {
      console.error("Order submission failed:", error);
      showMessage("Order failed: " + (error.message || "Unknown error"));
    } finally {
      if (button) button.disabled = false;
    }
  }

  window.PKCheckout = { placeOrder };

  document.addEventListener("DOMContentLoaded", () => {
    const button = $("place-order-button");

    if (button) {
      button.addEventListener("click", event => {
        event.preventDefault();
        placeOrder();
      });
    }
  });
})();
