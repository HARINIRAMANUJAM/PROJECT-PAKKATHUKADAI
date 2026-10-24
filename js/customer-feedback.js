(() => {
  "use strict";

  const feedbackEntries = [];

  function submitFeedback(customerId, shopName, rating, comment = "") {
    const customer = String(customerId || "").trim();
    const shop = String(shopName || "").trim();
    const score = Number(rating);

    if (!customer || !shop ||
        !Number.isInteger(score) || score < 1 || score > 5) {
      throw new Error(
        "Provide a customer ID, shop name and rating from 1 to 5."
      );
    }

    const feedback = {
      id: Date.now(),
      customerId: customer,
      shopName: shop,
      rating: score,
      comment: String(comment || "").trim(),
      createdAt: new Date().toISOString()
    };

    feedbackEntries.push(feedback);
    return { ...feedback };
  }

  function getFeedback(shopName) {
    const shop = String(shopName || "").trim();

    return feedbackEntries
      .filter(entry => entry.shopName === shop)
      .map(entry => ({ ...entry }));
  }

  function getAverageRating(shopName) {
    const entries = getFeedback(shopName);

    if (!entries.length) return 0;

    return entries.reduce((sum, entry) => sum + entry.rating, 0)
      / entries.length;
  }

  window.PKCustomerFeedback = {
    submitFeedback,
    getFeedback,
    getAverageRating
  };
})();
