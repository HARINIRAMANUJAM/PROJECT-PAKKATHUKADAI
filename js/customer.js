
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  let products = [];
  let cart = [];
  let activeCategory = "all";
  let activeShop = "";

  const money = (value) => "₹" + Number(value || 0).toFixed(2);

  // ---------------- CART STORAGE ----------------

  function loadCart() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("pakkathuCart") || "[]"
      );
      cart = Array.isArray(saved) ? saved : [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    sessionStorage.setItem("pakkathuCart", JSON.stringify(cart));
    renderCart();
  }

  // ---------------- CATEGORIES ----------------

  function getCategory(product) {
    const name = String(product.name || "").toLowerCase();

    if (/milk|curd|yogurt|butter|cheese|paneer/.test(name)) {
      return "dairy";
    }

    if (/apple|banana|mango|orange|grape|fruit|guava/.test(name)) {
      return "fruits";
    }

    if (
      /tomato|potato|onion|carrot|spinach|cabbage|vegetable|beans/.test(name)
    ) {
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

  // ---------------- SHOP CARDS ----------------

  function ensureShopSection() {
    let section = $("shops-section");

    if (section) return section;

    const productGrid = $("product-grid");
    if (!productGrid) return null;

    section = document.createElement("section");
    section.id = "shops-section";
    section.className = "shops-section";

    const heading = document.createElement("h2");
    heading.textContent = "Shop by Store";

    const description = document.createElement("p");
    description.className = "shops-description";
    description.textContent =
      "Choose your neighbourhood shop and explore its products.";

    const grid = document.createElement("div");
    grid.id = "shops-grid";
    grid.className = "shops-grid";

    section.append(heading, description, grid);
    productGrid.parentElement.insertBefore(section, productGrid);

    // Basic styling for the dynamically created shop cards.
    if (!$("shop-card-styles")) {
      const style = document.createElement("style");
      style.id = "shop-card-styles";
      style.textContent = `
        .shops-section {
          margin: 24px 0;
        }
        .shops-section h2 {
          margin-bottom: 8px;
        }
        .shops-description {
          margin-bottom: 16px;
          color: #666;
        }
        .shops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 16px;
        }
        .shop-card {
          border: 1px solid #dce8dd;
          border-radius: 14px;
          padding: 18px;
          background: #fff;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .shop-card h3 {
          margin: 0;
          color: #167d45;
        }
        .shop-card p {
          margin: 0;
          color: #555;
        }
        .shop-card button {
          border: 0;
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          background: #167d45;
          color: white;
          font-weight: 600;
          margin-top: auto;
        }
        .shop-card button:hover {
          background: #105e33;
        }
        .shop-card.selected {
          border: 2px solid #167d45;
          background: #f1faf3;
        }
        .shop-card button:focus-visible {
          outline: 3px solid #8bc99f;
          outline-offset: 3px;
        }
        @media (max-width: 480px) {
          .shops-grid {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return section;
  }

  function renderShops() {
    const section = ensureShopSection();
    const grid = $("shops-grid");

    if (!section || !grid) return;

    grid.replaceChildren();

    // Group all products by their shop name.
    const groupedShops = new Map();

    products.forEach((product) => {
      const shopName = String(product.shop_name || "").trim();

      if (!shopName) return;

      if (!groupedShops.has(shopName)) {
        groupedShops.set(shopName, []);
      }

      groupedShops.get(shopName).push(product);
    });

    const shopNames = [...groupedShops.keys()].sort((a, b) =>
      a.localeCompare(b)
    );

    if (shopNames.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No shops available yet.";
      grid.appendChild(empty);
      return;
    }

    shopNames.forEach((shopName) => {
      const shopProducts = groupedShops.get(shopName);

      const card = document.createElement("article");
      card.className =
        "shop-card" + (activeShop === shopName ? " selected" : "");

      const icon = document.createElement("div");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "🏪";

      const title = document.createElement("h3");
      title.textContent = shopName;

      const count = document.createElement("p");
      count.textContent =
        `${shopProducts.length} product` +
        (shopProducts.length === 1 ? "" : "s");

      const button = document.createElement("button");
      button.type = "button";
      button.textContent =
        activeShop === shopName ? "Viewing shop" : "View products";

      button.addEventListener("click", () => {
        activeShop = shopName;

        const shopFilter = $("shop-filter");
        if (shopFilter) shopFilter.value = shopName;

        renderShops();
        renderProducts();

        $("product-grid")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });

      card.append(icon, title, count, button);
      grid.appendChild(card);
    });
  }

  // ---------------- PRODUCT DISPLAY ----------------

  function renderProducts() {
    const grid = $("product-grid");
    const status = $("product-status");

    if (!grid) return;

    const search = ($("product-search")?.value || "")
      .trim()
      .toLowerCase();

    const shopFilter = $("shop-filter")?.value || "";
    const selectedShop = shopFilter || activeShop;

    const filtered = products.filter((product) => {
      const matchesSearch =
        String(product.name || "").toLowerCase().includes(search) ||
        String(product.shop_name || "").toLowerCase().includes(search);

      const matchesShop =
        !selectedShop || product.shop_name === selectedShop;

      const matchesCategory =
        activeCategory === "all" ||
        getCategory(product) === activeCategory;

      return matchesSearch && matchesShop && matchesCategory;
    });

    grid.replaceChildren();

    if (!filtered.length) {
      if (status) {
        status.textContent = products.length
          ? "No matching products found. Try another search or filter."
          : "Products could not be displayed. Check the database connection.";
      }
      return;
    }

    if (status) {
      status.textContent = `${filtered.length} product(s) found`;
    }

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
      price.appendChild(document.createTextNode(money(product.price)));

      const unit = document.createElement("span");
      unit.className = "product-unit";
      unit.textContent = product.unit ? ` / ${product.unit}` : "";
      price.appendChild(unit);

      const stockText = document.createElement("p");
      stockText.className = "product-stock";
      stockText.textContent =
        stock > 0 ? `Available: ${remaining}` : "Out of stock";

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "primary-button";
      addButton.textContent =
        remaining > 0 ? "Add to cart" : "Unavailable";
      addButton.disabled = remaining <= 0;

      addButton.addEventListener("click", () => addToCart(product.id));

      info.append(title, shopName, price, stockText, addButton);
      card.append(image, info);
      grid.appendChild(card);
    });
  }

  // ---------------- ADD TO CART ----------------

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
      existing.quantity = Number(existing.quantity) + 1;
      existing.stock = stock;
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

    const stock = product
      ? availableStock(product)
      : Number(item.stock || 0);

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

  // ---------------- CART DISPLAY ----------------

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
      amount.textContent =
        `${money(item.price)} × ${quantity} = ${money(subtotal)}`;

      const shop = document.createElement("p");
      shop.textContent = item.shop || "Local shop";

      details.append(name, amount, shop);

      const controls = document.createElement("div");

      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `Remove one ${item.name}`);
      minus.addEventListener("click", () =>
        changeQuantity(item.id, -1)
      );

      const quantityText = document.createTextNode(` ${quantity} `);

      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `Add one ${item.name}`);
      plus.addEventListener("click", () =>
        changeQuantity(item.id, 1)
      );

      controls.append(minus, quantityText, plus);
      row.append(details, controls);
      container.appendChild(row);
    });

    if (!cart.length) {
      const empty = document.createElement("p");
      empty.textContent = "Your cart is empty.";
      container.appendChild(empty);
    }

    if ($("cart-count")) {
      $("cart-count").textContent = count;
    }

    if ($("cart-total")) {
      $("cart-total").textContent = money(total);
    }

    const checkoutButton = $("checkout-button");
    if (checkoutButton) {
      checkoutButton.disabled = cart.length === 0;
    }
  }

  // ---------------- SEARCH AND FILTERS ----------------

  function populateShopFilter() {
    const select = $("shop-filter");
    if (!select) return;

    const currentValue = activeShop || select.value;

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All shops";
    select.appendChild(allOption);

    const shops = [
      ...new Set(
        products
          .map((product) => String(product.shop_name || "").trim())
          .filter(Boolean)
      )
    ].sort();

    shops.forEach((shop) => {
      const option = document.createElement("option");
      option.value = shop;
      option.textContent = shop;
      select.appendChild(option);
    });

    select.value = shops.includes(currentValue) ? currentValue : "";
    activeShop = select.value;
  }

  function setupFilters() {
    $("product-search")?.addEventListener("input", renderProducts);

    $("shop-filter")?.addEventListener("change", () => {
      activeShop = $("shop-filter").value || "";
      renderShops();
      renderProducts();
    });

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

  // ---------------- CART BUTTONS ----------------

  function setupCartButtons() {
    $("open-cart")?.addEventListener("click", () => {
      if ($("cart-panel")) {
        $("cart-panel").hidden = false;
      }
    });

    $("close-cart")?.addEventListener("click", () => {
      if ($("cart-panel")) {
        $("cart-panel").hidden = true;
      }
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

  // ---------------- LOAD PRODUCTS FROM SUPABASE ----------------

  async function loadProducts() {
    const status = $("product-status");

    try {
      if (!window.supabaseClient) {
        throw new Error(
          "Supabase client is missing. Check the script order in index.html."
        );
      }

      const { data, error } = await window.supabaseClient
        .from("Products")
        .select("id, name, price, quantity, shop_name, unit")
        .order("id", { ascending: true });

      if (error) throw error;

      products = Array.isArray(data) ? data : [];

      populateShopFilter();
      renderShops();
      renderProducts();

      console.log(
        `Loaded ${products.length} products from Supabase.`
      );
    } catch (error) {
      console.error("Product loading failed:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: error.status
      });

      if (status) {
        status.textContent =
          "Could not load shops or products. Check the Console for the database error.";
      }

      renderShops();
    }
  }

  // ---------------- INITIALIZE ----------------

  document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    setupFilters();
    setupCartButtons();
    renderCart();

    if ($("current-year")) {
      $("current-year").textContent = new Date().getFullYear();
    }

    ensureShopSection();
    loadProducts();
  });
})();
