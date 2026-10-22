(() => {
  "use strict";

  const suppliers = [];

  function addSupplier(name, phone, products = []) {
    if (!name || !phone) {
      throw new Error("Supplier name and phone are required.");
    }

    const supplier = {
      id: Date.now(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      products: Array.isArray(products) ? products : []
    };

    suppliers.push(supplier);
    return supplier;
  }

  function getSuppliers() {
    return [...suppliers];
  }

  function createBulkPurchase(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Add products before creating a bulk purchase.");
    }

    return items.map(item => ({
      product: item.product,
      quantity: Math.max(0, Number(item.quantity) || 0),
      shops: Array.isArray(item.shops) ? item.shops : []
    }));
  }

  window.PKSupplierManagement = {
    addSupplier,
    getSuppliers,
    createBulkPurchase
  };
})();
