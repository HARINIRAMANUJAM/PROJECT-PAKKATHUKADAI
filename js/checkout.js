
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
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (itemsBox) {
    itemsBox.replaceChildren();

    if (cart.length) {
      cart.forEach(item => {
        const p = document.createElement("p");
        p.textContent =
          `${item.name} × ${Number(item.quantity)}` +
          ` — ${item.shop || item.shop_name || "Local shop"}`;
        itemsBox.appendChild(p);
      });
    } else {
      itemsBox.textContent = "Your cart is empty.";
    }
  }

  if (totalBox) {
    totalBox.textContent = `₹${total.toFixed(2)}`;
  }

  form?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!cart.length) {
      status.textContent = "Your cart is empty.";
      return;
    }

    const db = window.supabaseClient;

    if (!db) {
      status.textContent =
        "Database connection is not configured yet.";
      return;
    }

    button.disabled = true;
    status.textContent = "Placing your order...";

    try {
      const customerName =
        document.getElementById("customer-name").value.trim();
      const phone =
        document.getElementById("customer-phone").value.trim();
      const address =
        document.getElementById("delivery-address").value.trim();

      // Group cart items by shop.
      const shopGroups = new Map();

      cart.forEach(item => {
        const shopName =
          item.shop || item.shop_name || "Local shop";

        if (!shopGroups.has(shopName)) {
          shopGroups.set(shopName, []);
        }

        shopGroups.get(shopName).push(item);
      });

      // Create one order row for each shop.
      const orders = Array.from(shopGroups.entries()).map(
        ([shopName, items]) => ({
          customer_name: customerName,
          phone,
          delivery_address: address,
          items: items.map(item => ({
            ...item,
            shop: item.shop || item.shop_name || shopName
          })),
          total: items.reduce(
            (sum, item) =>
              sum +
              Number(item.price) * Number(item.quantity),
            0
          ),
          status: "Pending"
        })
      );

      const { error } = await db
        .from("Orders")
        .insert(orders);

      if (error) {
        status.textContent = "Order failed: " + error.message;
        button.disabled = false;
        return;
      }

      sessionStorage.removeItem("pakkathuCart");

      status.textContent =
        `Order placed successfully! ` +
        `${orders.length} shop order(s) created.`;

      form.reset();

      if (itemsBox) {
        itemsBox.textContent = "Order confirmed!";
      }

      if (totalBox) {
        totalBox.textContent = "₹0.00";
      }

      button.disabled = true;
    } catch (error) {
      status.textContent =
        "Order failed: " + error.message;
      button.disabled = false;
    }
  });
})();
