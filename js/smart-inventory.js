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
      throw new Error("Supabase client not found. Check js/supabase.js.");
    }

    const { data, error } = await db
      .from("Products")
      .select("id,name,quantity,shop_name,unit,price");

    if (error) throw error;

    const products = data || [];

    return {
      totalProducts: products.length,

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
          unit: product.unit || "",
          suggestedRestock: Math.max(
            0,
            RESTOCK_TARGET - (Number(product.quantity) || 0)
          )
        }))
    };
  }

  function formatInsights(insights) {
    if (!insights.totalProducts) {
      return "No products found in your inventory.";
    }

    if (!insights.lowStock.length) {
      return "All products are above the low-stock threshold.";
    }

    return insights.restockSuggestions.map(item =>
      `${item.name} (${item.shop || "Shop"}): ` +
      `${item.currentStock} ${item.unit} remaining. ` +
      `Suggested restock: ${item.suggestedRestock} ${item.unit}.`
    ).join("\n");
  }

  async function showLowStock() {
    try {
      const insights = await getInventoryInsights();
      window.alert(
        "LOW-STOCK INVENTORY\n\n" + formatInsights(insights)
      );
      return insights;
    } catch (error) {
      console.error("Low-stock check failed:", error);
      window.alert("Could not load inventory: " + error.message);
      return null;
    }
  }

  async function showRestockSuggestions() {
    try {
      const insights = await getInventoryInsights();

      window.alert(
        "RESTOCK SUGGESTIONS\n\n" + formatInsights(insights)
      );

      return insights.restockSuggestions;
    } catch (error) {
      console.error("Restock suggestions failed:", error);
      window.alert("Could not load restock suggestions: " + error.message);
      return [];
    }
  }

  window.PKSmartInventory = {
    getInventoryInsights,
    showLowStock,
    showRestockSuggestions
  };

  // Connect to existing dashboard buttons if they are present.
  window.checkLowStock = showLowStock;
  window.showRestockSuggestions = showRestockSuggestions;
})();
