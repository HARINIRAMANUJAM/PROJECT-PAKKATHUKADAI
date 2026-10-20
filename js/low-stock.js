
window.checkLowStock = async function () {
  const client = window.supabaseClient;

  if (!client) {
    alert("Supabase is not connected.");
    return;
  }

  const { data, error } = await client
    .from("Products")
    .select("name, quantity, unit, shop_name")
    .lte("quantity", 5)
    .order("quantity", { ascending: true });

  if (error) {
    alert("Could not check stock: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("All products have sufficient stock!");
    return;
  }

  const message = data.map(product =>
    `${product.name} (${product.shop_name}): ${product.quantity} ${product.unit}`
  ).join("\n");

  alert("⚠️ LOW-STOCK ALERT\n\n" + message);
};
