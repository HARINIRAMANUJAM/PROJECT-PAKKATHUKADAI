```javascript
(() => {
  "use strict";

  const suppliers = [];
  const purchaseRequests = [];

  window.PKSupplierManagement = {
    addSupplier(name, phone = "", products = "") {
      if (!name || !name.trim()) {
        return { success: false, message: "Enter a supplier name." };
      }

      const supplier = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        products: products.trim()
      };

      suppliers.push(supplier);
      return { success: true, supplier };
    },

    getSuppliers() {
      return [...suppliers];
    },

    createBulkPurchase(product, quantity, unit, notes = "") {
      if (!product || !product.trim() ||
          !Number.isFinite(Number(quantity)) ||
          Number(quantity) <= 0 || !unit || !unit.trim()) {
        return { success: false, message: "Enter valid purchase details." };
      }

      const request = {
        id: Date.now(),
        product: product.trim(),
        quantity: Number(quantity),
        unit: unit.trim(),
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      purchaseRequests.push(request);
      return { success: true, request };
    },

    getPurchaseRequests() {
      return [...purchaseRequests];
    }
  };
})();
```
