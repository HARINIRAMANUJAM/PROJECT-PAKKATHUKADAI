
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

    const { error } = await client
      .from("Products")
      .insert([{
        name: name.trim(),
        price,
        quantity,
        shop_name: shopName.trim(),
        unit: unitInput.trim()
      }]);

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
