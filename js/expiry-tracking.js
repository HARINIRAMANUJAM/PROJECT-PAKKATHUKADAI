
(() => {
  "use strict";

  const KEY = "pakkathuExpiryItems";

  function loadItems() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function getExpiryStatus(item) {
    const expiry = new Date(item.expiryDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Math.round(
      (expiry.getTime() - today.getTime()) / 86400000
    );

    if (days < 0) return { label: "EXPIRED", days };
    if (days === 0) return { label: "EXPIRES TODAY", days };
    if (days <= 3) return { label: "EXPIRING SOON", days };

    return { label: "OK", days };
  }

  function addExpiryItem(name, expiryDate, quantity, shopName) {
    if (!name || !expiryDate) {
      throw new Error("Enter the product name and expiry date.");
    }

    const date = new Date(expiryDate + "T00:00:00");

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== expiryDate
    ) {
      throw new Error("Enter a valid date in YYYY-MM-DD format.");
    }

    const items = loadItems();

    items.push({
      id: Date.now().toString(),
      name: name.trim(),
      expiryDate,
      quantity: Math.max(1, Number(quantity) || 1),
      shopName: (shopName || "").trim()
    });

    saveItems(items);
    return items;
  }

  function getExpiryAlerts() {
    return loadItems()
      .map(item => ({
        ...item,
        expiryStatus: getExpiryStatus(item)
      }))
      .filter(item => item.expiryStatus.days <= 3);
  }

  function formatItem(item) {
    const status = getExpiryStatus(item);

    return `${item.name}
Expiry: ${item.expiryDate}
Quantity: ${item.quantity}
Status: ${status.label}` +
      (item.shopName ? `\nShop: ${item.shopName}` : "");
  }

  function showExpiryDashboard() {
    const action = prompt(
      "PAKKATHU KADAI — EXPIRY TRACKER\n\n" +
      "1. Add product expiry\n" +
      "2. View all products\n" +
      "3. View expiry alerts\n" +
      "4. Delete an entry\n\nEnter 1, 2, 3 or 4:"
    );

    if (action === "1") {
      const name = prompt("Product name:");
      if (!name || !name.trim()) return;

      const expiryDate = prompt("Expiry date (YYYY-MM-DD):");
      if (!expiryDate) return;

      const quantity = prompt("Quantity:", "1");
      const shopName = prompt("Shop name (optional):") || "";

      try {
        addExpiryItem(name, expiryDate, quantity, shopName);
        alert("Expiry date saved successfully!");
      } catch (error) {
        alert(error.message);
      }

      return;
    }

    if (action === "2" || action === "3") {
      const items = action === "2"
        ? loadItems()
        : getExpiryAlerts();

      if (!items.length) {
        alert(
          action === "2"
            ? "No expiry entries saved yet."
            : "No expiry alerts. Nothing is expired or expiring within 3 days."
        );
        return;
      }

      alert(items.map(formatItem).join("\n\n----------------\n\n"));
      return;
    }

    if (action === "4") {
      const items = loadItems();

      if (!items.length) {
        alert("No entries to delete.");
        return;
      }

      const list = items
        .map((item, index) =>
          `${index + 1}. ${item.name} — ${item.expiryDate}`
        )
        .join("\n");

      const choice = Number(
        prompt(`${list}\n\nEnter the entry number to delete:`)
      );

      if (
        !Number.isInteger(choice) ||
        choice < 1 ||
        choice > items.length
      ) {
        alert("Invalid entry number.");
        return;
      }

      items.splice(choice - 1, 1);
      saveItems(items);
      alert("Entry deleted successfully!");
    }
  }

  window.PKExpiryTracking = {
    addExpiryItem,
    getExpiryAlerts,
    getExpiryStatus,
    showExpiryDashboard
  };

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("expiry-tracking-button");

    if (button) {
      button.addEventListener("click", showExpiryDashboard);
    }
  });
})();
