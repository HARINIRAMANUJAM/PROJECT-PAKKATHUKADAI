
(() => {
  "use strict";

  const STORAGE_KEY = "pakkathuSupplierContacts";

  window.manageSupplierContacts = function () {
    let suppliers = [];

    try {
      suppliers = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
    } catch {
      alert("Could not read saved supplier contacts.");
      return;
    }

    const action = prompt(
      "SUPPLIER CONTACTS\n\n" +
      "1 - Add supplier\n" +
      "2 - View suppliers\n" +
      "3 - Delete supplier\n\n" +
      "Enter 1, 2, or 3:"
    );

    if (action === "1") {
      const name = prompt("Supplier name:");
      if (!name || !name.trim()) return;

      const phone = prompt("Supplier phone number:");
      if (!phone || !phone.trim()) return;

      const products = prompt("Products supplied (optional):") || "";

      suppliers.push({
        name: name.trim(),
        phone: phone.trim(),
        products: products.trim()
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
      alert("Supplier contact saved on this browser.");
    } else if (action === "2") {
      alert(
        suppliers.length
          ? suppliers.map((s, i) =>
              `${i + 1}. ${s.name}\nPhone: ${s.phone}\nProducts: ${s.products || "Not specified"}`
            ).join("\n\n")
          : "No supplier contacts saved."
      );
    } else if (action === "3") {
      if (!suppliers.length) {
        alert("No suppliers to delete.");
        return;
      }

      const number = Number(prompt(
        suppliers.map((s, i) => `${i + 1}. ${s.name} — ${s.phone}`).join("\n") +
        "\n\nEnter the number to delete:"
      ));

      if (!Number.isInteger(number) || number < 1 || number > suppliers.length) {
        alert("Invalid supplier number.");
        return;
      }

      suppliers.splice(number - 1, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
      alert("Supplier contact deleted.");
    }
  };
})();
