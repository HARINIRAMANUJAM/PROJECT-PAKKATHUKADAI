
document.addEventListener("DOMContentLoaded", () => {
  const client = window.supabaseClient;

  if (!client) {
    console.error("Supabase client not found.");
    return;
  }

  // Create a product using the existing Products table.
  window.addNewProduct = async function () {
    const name = prompt("Enter product name:");
    if (!name || !name.trim()) return;

    const priceInput = prompt("Enter price:");
    if (priceInput === null) return;

    const quantityInput = prompt("Enter quantity:");
    if (quantityInput === null) return;

    const shopName = prompt("Enter shop name:");
    if (!shopName || !shopName.trim()) return;

    const unitInput = prompt("Enter unit (kg, litre, piece, etc.):");
    if (!unitInput || !unitInput.trim()) return;

    // Optional expiry date
    const expiryInput = prompt(
      "Enter expiry date (YYYY-MM-DD), or leave blank if not applicable:"
    );

    if (expiryInput === null) return;

    const expiryDate = expiryInput.trim();

    if (
      expiryDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)
    ) {
      alert("Enter the expiry date in YYYY-MM-DD format.");
      return;
    }

    if (expiryDate) {
      const parsedDate = new Date(`${expiryDate}T00:00:00Z`);

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== expiryDate
      ) {
        alert("Enter a valid calendar date.");
        return;
      }
    }

    const price = Number(priceInput);
    const quantity = Number(quantityInput);

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      alert("Enter a valid price and quantity.");
      return;
    }

    const product = {
      name: name.trim(),
      price,
      quantity,
      shop_name: shopName.trim(),
      unit: unitInput.trim(),
      expiry_date: expiryDate || null
    };

    const { error } = await client
      .from("Products")
      .insert([product]);

    if (error) {
      alert("Could not add product: " + error.message);
      return;
    }

    alert("Product added successfully!");

    if (typeof window.loadProducts === "function") {
      await window.loadProducts();
    } else {
      location.reload();
    }
  };
});
