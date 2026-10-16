
(() => {
  "use strict";

  const area = document.getElementById("advertisement-area");

  if (!area) return;

  const advertisements = [
    {
      title: "Discover Local Brands",
      message: "Explore products available at shops near you."
    },
    {
      title: "Support Local Businesses",
      message: "Every purchase helps your neighbourhood shops grow."
    }
  ];

  area.innerHTML = advertisements.map(ad => `
    <div class="ad-card">
      <h3>${ad.title}</h3>
      <p>${ad.message}</p>
    </div>
  `).join("");
})();
