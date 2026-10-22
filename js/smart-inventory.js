(() => {
  "use strict";

  const LOW_STOCK_LIMIT = 5;
  const RESTOCK_TARGET = 10;

  function getSupabase() {
    return window.supabaseClient;
  }

  async function getInventoryInsights() {
    const db = getSupabase();

    if (!db) {
      throw new Error("Supabase client not found.");
    }

    const { data, error } = await db
      .from("Products")
      .select("id,name,quantity,shop_name,unit,price");

    if (error) throw error;

    const products = data || [];

    return {
      lowStock: products.filter(
        product => Number(product.quantity) <= LOW_STOCK_LIMIT
      ),

      restockSuggestions: products
        .filter(product => Number(product.quantity) <= LOW_STOCK_LIMIT)
        .map(product => ({
          id: product.id,
          name: product.name,
          shop: product.shop_name,
          currentStock: Number(product.quantity) || 0,
          suggestedRestock: Math.max(
            0,
            RESTOCK_TARGET - (Number(product.quantity) || 0)
          )
        }))
    };
  }

  window.PKSmartInventory = {
    getInventoryInsights
  };
})();
