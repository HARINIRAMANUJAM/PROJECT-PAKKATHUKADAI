
(() => {
  "use strict";

  const cart = JSON.parse(
    sessionStorage.getItem("pakkathuCart") || "[]"
  );

  const itemsBox = document.getElementById("checkout-items");
  const totalBox = document.getElementById("checkout-total");
  const form = document.getElementById("checkout-form");
  const status = document.getElementById("checkout-status");
  const button = document.getElementById("place-order-button");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (itemsBox) {
    itemsBox.innerHTML = cart.length
      ? cart.map(item =>
          `<p>${String(item.name)} × ${Number(item.quantity)}</p>`
        ).join("")
      : "<p>Your cart is empty.</p>";
  }

  if (totalBox) totalBox.textContent = `₹${total.toFixed(2)}`;

  form?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!cart.length) {
      status.textContent = "Your cart is empty.";
      return;
    }

    const db = window.supabaseClient;

    if (!db) {
      status.textContent = "Database connection is not configured yet.";
      return;
    }

    button.disabled = true;
    status.textContent = "Placing your order...";

    const order = {
      customer_name: document.getElementById("customer-name").value.trim(),
      phone: document.getElementById("customer-phone").value.trim(),
      delivery_address: document.getElementById("delivery-address").value.trim(),
      items: cart,
      total,
      status: "Pending"
    };

    const { error } = await db.from("Orders").insert(order);

    if (error) {
      status.textContent = "Order failed: " + error.message;
      button.disabled = false;
      return;
    }

    sessionStorage.removeItem("pakkathuCart");
    status.textContent = "Order placed successfully!";
    form.reset();
    if (itemsBox) itemsBox.innerHTML = "<p>Order confirmed!</p>";
    if (totalBox) totalBox.textContent = "₹0.00";
    button.disabled = true;
  });
})();
