
(() => {
  "use strict";

  const form = document.getElementById("purchase-form");
  const workspace = document.getElementById("purchase-workspace");
  const list = document.getElementById("purchase-list");
  const status = document.getElementById("purchase-status");

  if (!form) return;

  const requests = JSON.parse(
    localStorage.getItem("pakkathuBulkRequests") || "[]"
  );

  function renderRequests() {
    if (!list) return;

    list.innerHTML = requests.length
      ? requests.map(request => `
          <div class="purchase-card">
            <h3>${request.product}</h3>
            <p>Quantity: ${request.quantity} ${request.unit}</p>
            <p>${request.notes || "No additional notes"}</p>
          </div>
        `).join("")
      : "<p>No shared purchase requests yet.</p>";
  }

  document.getElementById("create-purchase-button")
    ?.addEventListener("click", () => {
      workspace?.classList.remove("hidden");
    });

  document.getElementById("cancel-purchase-button")
    ?.addEventListener("click", () => {
      workspace?.classList.add("hidden");
    });

  form.addEventListener("submit", event => {
    event.preventDefault();

    const request = {
      product: document.getElementById("bulk-product").value.trim(),
      quantity: document.getElementById("bulk-quantity").value,
      unit: document.getElementById("bulk-unit").value,
      notes: document.getElementById("bulk-notes").value.trim()
    };

    requests.push(request);
    localStorage.setItem(
      "pakkathuBulkRequests",
      JSON.stringify(requests)
    );

    status.textContent = "Purchase request saved on this browser.";
    form.reset();
    renderRequests();
  });

  renderRequests();
})();

