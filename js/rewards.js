
(() => {
  "use strict";

  const pointsDisplay = document.getElementById("rewards-status");

  if (!pointsDisplay) return;

  const points = Number(
    localStorage.getItem("pakkathuRewardPoints") || 0
  );

  pointsDisplay.textContent =
    `You have ${points} reward points!`;
})();
