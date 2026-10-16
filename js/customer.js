
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  let products = [];
  let cart = [];
  let activeCategory = "all";

  const money = (value) =>
    "₹" + Number(value || 0).toFixed(2);

  function loadCart() {
    try {
      cart = JSON.parse(sessionStorage.getItem("pakkathuCart") || "[]");
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    sessionStorage.setItem("pakkathuCart", JSON.stringify(cart));
    renderCart();
  }

  function getCategory(product) {
    const name = String(product.name || "").toLowerCase();

    if (/milk|curd|yogurt|butter|cheese|paneer/.test(name)) {
      return "dairy";
    }
    if (/apple|banana|mango|orange|grape|fruit|guava/.test(name)) {
      return "fruits";
    }
    if (/tomato|potato|onion|carrot|spinach|cabbage|vegetable|beans/.test(name)) {
      return "vegetables";
    }
    return "groceries";
  }

  function availableStock(product) {
    return Math.max(0, Number(product.quantity) || 0);
  }

  function getCartQuantity(productId) {
    return cart
      .filter((item) => String(item.id) === String(productId))
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  function renderProducts() {
    const grid = $("product-grid");
    const status = $("product-status");
    if (!grid) return;

    const search = ($("product-search")?.value || "")
      .trim()
      .toLowerCase();

    const shop = $("shop-filter")?.value || "";

    const filtered = products.filter((product) => {
      const matchesSearch =
        String(product.name || "").toLowerCase().includes(search) ||
        String(product.shop_name || "").toLowerCase().includes(search);

      const matchesShop = !shop || product.shop_name === shop;
      const matchesCategory =
        activeCategory === "all" ||
        getCategory(product) === activeCategory;

      return matchesSearch && matchesShop && matchesCategory;
    });

    grid.replaceChildren();

    if (!filtered.length) {
      status.textContent = products.length
        ? "No matching products found. Try another search or filter."
        : "No products are available yet.";
      return;
    }

    status.textContent = `${filtered.length} product(s) found`;

    filtered.forEach((product) => {
      const stock = availableStock(product);
      const inCart = getCartQuantity(product.id);
      const remaining = Math.max(0, stock - inCart);

      const card = document.createElement("article");
      card.className = "product-card";

      const image = document.createElement("div");
      image.className = "product-image";
      image.setAttribute("aria-hidden", "true");
      image.textContent = "🛍️";

      const info = document.createElement("div");
      info.className = "product-info";

      const title = document.createElement("h3");
      title.textContent = product.name || "Unnamed product";

      const shopName = document.createElement("p");
      shopName.className = "product-shop";
      shopName.textContent = product.shop_name || "Local shop";

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = money(product.price);

      const unit = document.createElement("span");
      unit.className = "product-unit";
      unit.textContent = product.unit ? ` / ${product.unit}` : "";
      price.appendChild(unit);

      const stockText = document.createElement("p");
      stockText.className = "product-stock";
      stockText.textContent = stock > 0
        ? `Available: ${remaining}`
        : "Out of stock";

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "primary-button";
      addButton.textContent = remaining > 0 ? "Add to cart" : "Unavailable";
      addButton.disabled = remaining <= 0;

      addButton.addEventListener("click", () => addToCart(product.id));

      info.append(title, shopName, price, stockText, addButton);
      card.append(image, info);
      grid.appendChild(card);
    });
  }

  function addToCart(productId) {
    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    if (!product) return;

    const stock = availableStock(product);
    const currentQuantity = getCartQuantity(product.id);

    if (currentQuantity >= stock) {
      alert("You cannot add more than the available stock.");
      return;
    }

    const existing = cart.find(
      (item) => String(item.id) === String(product.id)
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        shop: product.shop_name || "Local shop",
        price: Number(product.price) || 0,
        quantity: 1,
        stock,
        unit: product.unit || ""
      });
    }

    saveCart();
    renderProducts();
  }

  function changeQuantity(productId, change) {
    const item = cart.find(
      (entry) => String(entry.id) === String(productId)
    );

    if (!item) return;

    const product = products.find(
      (entry) => String(entry.id) === String(productId)
    );

    const stock = product ? availableStock(product) : Number(item.stock || 0);
    const nextQuantity = Number(item.quantity) + change;

    if (nextQuantity > stock) {
      alert("You cannot order more than the available stock.");
      return;
    }

    if (nextQuantity <= 0) {
      cart = cart.filter(
        (entry) => String(entry.id) !== String(productId)
      );
    } else {
      item.quantity = nextQuantity;
    }

    saveCart();
    renderProducts();
  }

  function renderCart() {
    const container = $("cart-items");
    if (!container) return;

    container.replaceChildren();

    let total = 0;
    let count = 0;

    cart.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const subtotal = (Number(item.price) || 0) * quantity;

      total += subtotal;
      count += quantity;

      const row = document.createElement("div");
      row.className = "cart-item";

      const details = document.createElement("div");
      const name = document.createElement("h3");
      name.textContent = item.name;

      const amount = document.createElement("p");
      amount.textContent = `${money(item.price)} × ${quantity} = ${money(subtotal)}`;

      const shop = document.createElement("p");
      shop.textContent = item.shop || "Local shop";

      details.append(name, amount, shop);

      const controls = document.createElement("div");

      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `Remove one ${item.name}`);
      minus.addEventListener("click", () => changeQuantity(item.id, -1));

      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `Add one ${item.name}`);
      plus.addEventListener("click", () => changeQuantity(item.id, 1));

      controls.append(minus, document.createTextNode(` ${quantity} `), plus);
      row.append(details, controls);
      container.appendChild(row);
    });

    if (!cart.length) {
      const empty = document.createElement("p");
      empty.textContent = "Your cart is empty.";
      container.appendChild(empty);
    }

    if ($("cart-count")) $("cart-count").textContent = count;
    if ($("cart-total")) $("cart-total").textContent = money(total);

    const checkoutButton = $("checkout-button");
    if (checkoutButton) checkoutButton.disabled = cart.length === 0;
  }

  function setupFilters() {
    $("product-search")?.addEventListener("input", renderProducts);
    $("shop-filter")?.addEventListener("change", renderProducts);

    $("category-list")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;

      activeCategory = button.dataset.category || "all";

      document.querySelectorAll("[data-category]").forEach((chip) => {
        chip.classList.toggle("active", chip === button);
      });

      renderProducts();
    });
  }

  function setupCartButtons() {
    $("open-cart")?.addEventListener("click", () => {
      $("cart-panel").hidden = false;
    });

    $("close-cart")?.addEventListener("click", () => {
      $("cart-panel").hidden = true;
    });

    $("checkout-button")?.addEventListener("click", () => {
      if (!cart.length) {
        alert("Please add a product to your cart first.");
        return;
      }

      sessionStorage.setItem("pakkathuCart", JSON.stringify(cart));
      sessionStorage.setItem("pakkathuProducts", JSON.stringify(products));
      window.location.href = "checkout.html";
    });
  }

  function populateShopFilter() {
    const select = $("shop-filter");
    if (!select) return;

    const currentValue = select.value;
    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All shops";
    select.appendChild(allOption);

    const shops = [...new Set(
      products.map((product) => product.shop_name).filter(Boolean)
    )].sort();

    shops.forEach((shop) => {
      const option = document.createElement("option");
      option.value = shop;
      option.textContent = shop;
      select.appendChild(option);
    });

    select.value = shops.includes(currentValue) ? currentValue : "";
  }

  async function loadProducts() {
    const status = $("product-status");

    try {
      if (!window.supabaseClient) {
        if (status) {
          status.textContent =
            "Database connection will be enabled in the integration step.";
        }
        renderProducts();
        return;
      }

      const { data, error } = await window.supabaseClient
        .from("Products")
        .select("id, name, price, quantity, shop_name, unit")
        .order("id", { ascending: true });

      if (error) throw error;

      products = Array.isArray(data) ? data : [];

      populateShopFilter();
      renderProducts();
    } catch (error) {
      console.error("Product loading failed:", error);
      if (status) {
        status.textContent =
          "Could not load products. Please check the database connection and table permissions.";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    setupFilters();
    setupCartButtons();
    renderCart();

    if ($("current-year")) {
      $("current-year").textContent = new Date().getFullYear();
    }

    loadProducts();
  });
})();
