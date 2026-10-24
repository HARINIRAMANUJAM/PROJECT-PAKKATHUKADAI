(() => {
  "use strict";

  const suppliers = [];

  function addSupplier(name, phone, products = []) {
    const cleanName = String(name || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!cleanName || !cleanPhone) {
      throw new Error("Supplier name and phone are required.");
    }

    const supplier = {
      id: Date.now(),
      name: cleanName,
      phone: cleanPhone,
      products: Array.isArray(products) ? products : []
    };

    suppliers.push(supplier);
    return { ...supplier, products: [...supplier.products] };
  }

  function getSuppliers() {
    return suppliers.map(supplier => ({
      ...supplier,
      products: [...supplier.products]
    }));
  }

  function createBulkPurchase(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Add products before creating a bulk purchase.");
    }

    return items.map(item => {
      const product = String(item.product || "").trim();
      const quantity = Number(item.quantity);

      if (!product || !Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Each item needs a product and a quantity above zero.");
      }

      return {
        product,
        quantity,
        unit: String(item.unit || "pieces"),
        shops: Array.isArray(item.shops) ? [...item.shops] : []
      };
    });
  }

  window.PKSupplierManagement = {
    addSupplier,
    getSuppliers,
    createBulkPurchase
  };
})();
