
(() => {
  "use strict";

  const KEY = "pakkathuRewards";

  function readRewards() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveRewards(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function getBalance(customerId) {
    return Number(readRewards()[customerId] || 0);
  }

  function addPoints(customerId, points) {
    if (!customerId || !Number.isFinite(points) || points <= 0) {
      throw new Error("Enter a valid customer and positive points amount.");
    }

    const rewards = readRewards();
    rewards[customerId] = Number(rewards[customerId] || 0) + Math.floor(points);
    saveRewards(rewards);
    return rewards[customerId];
  }

  function showRewards() {
    const customerId = prompt("Enter customer ID or phone number:");
    if (!customerId) return;

    const current = getBalance(customerId.trim());
    const choice = prompt(
      `Customer: ${customerId}\nCurrent points: ${current}\n\n` +
      "Enter points to add, or 0 to view balance:"
    );

    if (choice === null) return;

    const points = Number(choice);

    if (points === 0) {
      alert(`Available points: ${current}`);
      return;
    }

    try {
      const balance = addPoints(customerId.trim(), points);
      alert(`Points updated. New balance: ${balance}`);
    } catch (error) {
      alert(error.message);
    }
  }

  window.PKRewards = { getBalance, addPoints, showRewards };
  window.showRewards = showRewards;
})();
