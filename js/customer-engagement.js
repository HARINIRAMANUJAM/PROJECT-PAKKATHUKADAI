(() => {
  "use strict";

  const customerPoints = new Map();
  const promotions = [];

  function addPoints(customerId, points) {
    const id = String(customerId || "").trim();
    const amount = Number(points);

    if (!id || !Number.isFinite(amount) || amount < 0) {
      throw new Error("Enter a valid customer ID and non-negative points.");
    }

    const updated = (customerPoints.get(id) || 0) + amount;
    customerPoints.set(id, updated);
    return updated;
  }

  function getPoints(customerId) {
    return customerPoints.get(String(customerId || "").trim()) || 0;
  }

  function addPromotion(title, discountPercent, productName = "") {
    const name = String(title || "").trim();
    const discount = Number(discountPercent);

    if (!name || !Number.isFinite(discount) ||
        discount <= 0 || discount > 100) {
      throw new Error("Enter a title and a discount from 1 to 100.");
    }

    const promotion = {
      id: Date.now(),
      title: name,
      discountPercent: discount,
      productName: String(productName || "").trim(),
      createdAt: new Date().toISOString()
    };

    promotions.push(promotion);
    return { ...promotion };
  }

  function getPromotions() {
    return promotions.map(promotion => ({ ...promotion }));
  }

  function recommendProducts(products, budget) {
    const limit = Number(budget);

    if (!Array.isArray(products) ||
        !Number.isFinite(limit) || limit < 0) {
      return [];
    }

    return products
      .filter(product =>
        Number.isFinite(Number(product.price)) &&
        Number(product.price) <= limit
      )
      .slice()
      .sort((a, b) => Number(a.price) - Number(b.price));
  }

  window.PKCustomerEngagement = {
    addPoints,
    getPoints,
    addPromotion,
    getPromotions,
    recommendProducts
  };
})();
