```javascript
(() => {
  "use strict";

  const suppliers = [];
  const purchaseRequests = [];

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  window.PKSupplierManagement = Object.freeze({
    addSupplier(name, phone = "", products = "") {
      name = cleanText(name);
      phone = cleanText(phone);
      products = cleanText(products);

      if (!name) {
        return {
          success: false,
          message: "Enter a supplier name."
        };
      }

      const supplier = {
        id: Date.now(),
        name,
        phone,
        products
      };

      suppliers.push(supplier);

      return {
        success: true,
        supplier
      };
    },

    getSuppliers() {
      return suppliers.map(supplier => ({ ...supplier }));
    },

    createBulkPurchase(product, quantity, unit, notes = "") {
      product = cleanText(product);
      unit = cleanText(unit);
      notes = cleanText(notes);

      const amount = Number(quantity);

      if (
        !product ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !unit
      ) {
        return {
          success: false,
          message: "Enter valid purchase details."
        };
      }

      const request = {
        id: Date.now(),
        product,
        quantity: amount,
        unit,
        notes,
        createdAt: new Date().toISOString()
      };

      purchaseRequests.push(request);

      return {
        success: true,
        request
      };
    },

    getPurchaseRequests() {
      return purchaseRequests.map(request => ({ ...request }));
    }
  });
})();
```
