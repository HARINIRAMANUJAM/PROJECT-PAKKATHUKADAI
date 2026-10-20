
(() => {
  "use strict";

  const KEY = "pakkathuSupplierContacts";

  window.manageSupplierHub = function () {
    let suppliers = [];

    try {
      suppliers = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(suppliers)) suppliers = [];
    } catch {
      suppliers = [];
    }

    const action = prompt(
      "SUPPLIER HUB\n1 - Add supplier\n2 - View suppliers\n3 - Delete supplier\nEnter 1, 2, or 3:"
    );

    if (action === "1") {
      const name = prompt("Supplier name:");
      if (!name?.trim()) return;

      const phone = prompt("Phone number:");
      if (!phone?.trim()) return;

      const products = prompt("Products supplied:") || "";

      suppliers.push({
        name: name.trim(),
        phone: phone.trim(),
        products: products.trim()
      });

      localStorage.setItem(KEY, JSON.stringify(suppliers));
      alert("Supplier saved in this browser.");
    } else if (action === "2") {
      alert(suppliers.length
        ? suppliers.map((s, i) =>
            `${i + 1}. ${s.name}\nPhone: ${s.phone}\nProducts: ${s.products || "N/A"}`
          ).join("\n\n")
        : "No suppliers saved.");
    } else if (action === "3") {
      if (!suppliers.length) return alert("No suppliers to delete.");

      const n = Number(prompt(
        suppliers.map((s, i) => `${i + 1}. ${s.name}`).join("\n") +
        "\nEnter number to delete:"
      ));

      if (!Number.isInteger(n) || n < 1 || n > suppliers.length) {
        return alert("Invalid number.");
      }

      suppliers.splice(n - 1, 1);
      localStorage.setItem(KEY, JSON.stringify(suppliers));
      alert("Supplier deleted.");
    }
  };
})();
