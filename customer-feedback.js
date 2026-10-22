(() => {
  "use strict";

  const feedbackEntries = [];

  function submitFeedback(customerId, shopName, rating, comment = "") {
    const score = Number(rating);

    if (!customerId || !shopName ||
        !Number.isInteger(score) || score < 1 || score > 5) {
      throw new Error("Provide a customer, shop and rating from 1 to 5.");
    }

    const feedback = {
      id: Date.now(),
      customerId: String(customerId),
      shopName: String(shopName),
      rating: score,
      comment: String(comment).trim(),
      createdAt: new Date().toISOString()
    };

    feedbackEntries.push(feedback);
    return feedback;
  }

  function getFeedback(shopName) {
    return feedbackEntries.filter(
      entry => entry.shopName === shopName
    );
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
