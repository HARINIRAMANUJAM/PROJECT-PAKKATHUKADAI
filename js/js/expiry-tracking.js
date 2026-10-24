
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

  function addExpiryItem(name, expiryDate, quantity = 1, shopName = "") {
    if (!name || !expiryDate) {
      throw new Error("Product name and expiry date are required.");
    }

    const date = new Date(expiryDate + "T00:00:00");
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid expiry date.");
    }

    const items = loadItems();
    items.push({
      id: Date.now().toString(),
      name: name.trim(),
      expiryDate,
      quantity: Number(quantity) || 1,
      shopName: shopName.trim(),
      createdAt: new Date().toISOString()
    });

    saveItems(items);
    return items;
  }

  function getExpiryStatus(item, today = new Date()) {
    const expiry = new Date(item.expiryDate + "T00:00:00");
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.ceil((expiry - current) / 86400000);

    if (days < 0) return { label: "EXPIRED", days };
    if (days === 0) return { label: "EXPIRES TODAY", days };
    if (days <= 3) return { label: "EXPIRING SOON", days };
    return { label: "OK", days };
  }

  function getExpiryAlerts() {
    return loadItems()
      .map(item => ({ ...item, expiryStatus: getExpiryStatus(item) }))
      .filter(item => item.expiryStatus.days <= 3);
  }

  function showExpiryDashboard() {
    const items = loadItems();

    const action = prompt(
      "EXPIRY TRACKER\n\n" +
      "1 - Add product expiry\n" +
      "2 - View all expiry dates\n" +
      "3 - View expiry alerts\n" +
      "4 - Delete an entry"
    );

    if (action === "1") {
      const name = prompt("Product name:");
      if (!name) return;

      const expiryDate = prompt("Expiry date (YYYY-MM-DD):");
      if (!expiryDate) return;

      const quantity = prompt("Quantity:", "1");
      const shop = prompt("Shop name (optional):") || "";

      try {
        addExpiryItem(name, expiryDate, quantity, shop);
        alert("Expiry date saved on this browser.");
      } catch (error) {
        alert(error.message);
      }
    } else if (action === "2" || action === "3") {
      const list = action === "2"
        ? items.map(item => ({ ...item, expiryStatus: getExpiryStatus(item) }))
        : getExpiryAlerts();

      if (!list.length) {
        alert("No expiry entries found.");
        return;
      }

      alert(list.map(item =>
        `${item.name} — ${item.expiryDate}\n` +
        `Quantity: ${item.quantity}\n` +
        `Status: ${item.expiryStatus.label}` +
        (item.shopName ? `\nShop: ${item.shopName}` : "")
      ).join("\n\n"));
    } else if (action === "4") {
      if (!items.length) {
        alert("No entries to delete.");
        return;
      }

      const list = items.map((item, index) =>
        `${index + 1}. ${item.name} — ${item.expiryDate}`
      ).join("\n");

      const choice = Number(prompt(`${list}\n\nEnter entry number to delete:`));
      if (!Number.isInteger(choice) || choice < 1 || choice > items.length) {
        alert("Invalid entry number.");
        return;
      }

      items.splice(choice - 1, 1);
      saveItems(items);
      alert("Expiry entry deleted.");
    }
  }

  window.PKExpiryTracking = {
    addExpiryItem,
    getExpiryAlerts,
    getExpiryStatus,
    showExpiryDashboard
  };
})();
