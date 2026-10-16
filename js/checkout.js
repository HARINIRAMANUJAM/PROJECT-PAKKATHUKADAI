
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

  const getShop = item =>
    item.shop || item.shop_name || "Local shop";

  const getItemTotal = item =>
    Number(item.price) * Number(item.quantity);

  const total = cart.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );

  if (itemsBox) {
    itemsBox.replaceChildren();

    if (cart.length === 0) {
      itemsBox.textContent = "Your cart is empty.";
    } else {
      cart.forEach(item => {
        const p = document.createElement("p");
        p.textContent =
          `${item.name} × ${Number(item.quantity)} — ${getShop(item)}`;
        itemsBox.appendChild(p);
      });
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
      status.textContent = "Database connection is not configured.";
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

      if (!customerName || !phone || !address) {
        status.textContent = "Please fill in all checkout details.";
        button.disabled = false;
        return;
      }

      // Group items by their actual shop name.
      const shopGroups = new Map();

      cart.forEach(item => {
        const shopName = getShop(item);

        if (!shopGroups.has(shopName)) {
          shopGroups.set(shopName, []);
        }

        shopGroups.get(shopName).push(item);
      });

      // Build one database row per shop.
      const orders = Array.from(shopGroups.entries()).map(
        ([shopName, items]) => ({
          customer_name: customerName,
          phone,
          delivery_address: address,
          items,
          total: items.reduce(
            (sum, item) => sum + getItemTotal(item),
            0
          ),
          status: "Pending"
        })
      );

      console.log("Shop groups:", [...shopGroups.keys()]);
      console.log("Orders being submitted:", orders);

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
        `Order placed successfully! ${orders.length} shop order(s) created.`;

      form.reset();

      if (itemsBox) {
        itemsBox.textContent = "Order confirmed!";
      }

      if (totalBox) {
        totalBox.textContent = "₹0.00";
      }

      button.disabled = true;
    } catch (error) {
      status.textContent = "Order failed: " + error.message;
      button.disabled = false;
    }
  });
})();
