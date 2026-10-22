(() => {
  "use strict";

  const customerPoints = new Map();
  const promotions = [];

  function addPoints(customerId, points) {
    if (!customerId || !Number.isFinite(Number(points))) {
      throw new Error("Valid customer ID and points are required.");
    }

    const current = customerPoints.get(customerId) || 0;
    const updated = Math.max(0, current + Number(points));

    customerPoints.set(customerId, updated);
    return updated;
  }

  function getPoints(customerId) {
    return customerPoints.get(customerId) || 0;
  }

  function addPromotion(title, discountPercent, productName = "") {
    const discount = Number(discountPercent);

    if (!title || !Number.isFinite(discount) ||
        discount < 0 || discount > 100) {
      throw new Error("Enter a valid promotion and discount.");
    }

    const promotion = {
      id: Date.now(),
      title: String(title).trim(),
      discountPercent: discount,
      productName: String(productName).trim()
    };

    promotions.push(promotion);
    return promotion;
  }

  function recommendProducts(products, budget) {
    const limit = Number(budget);

    if (!Array.isArray(products) || !Number.isFinite(limit) || limit < 0) {
      return [];
    }

    return products
      .filter(product => Number(product.price) <= limit)
      .sort((a, b) => Number(a.price) - Number(b.price));
  }

  window.PKCustomerEngagement = {
    addPoints,
    getPoints,
    addPromotion,
    getPromotions: () => [...promotions],
    recommendProducts
  };
})();
