(() => {
  "use strict";

  const db = window.supabaseClient;

  async function getPromotions() {
    if (!db) {
      throw new Error("Supabase client not connected.");
    }

    const { data, error } = await db
      .from("promotions")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async function addPromotion(title, discountPercent, productName = "") {
    if (!db) throw new Error("Supabase client not connected.");

    const { data, error } = await db
      .from("promotions")
      .insert({
        title: title.trim(),
        discount_percent: Number(discountPercent),
        product_name: productName.trim() || null,
        active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function addPoints(customerId, points) {
    if (!db) throw new Error("Supabase client not connected.");

    const { data: existing, error: readError } = await db
      .from("customer_points")
      .select("points")
      .eq("customer_id", customerId)
      .maybeSingle();

    if (readError) throw readError;

    const newPoints = Number(existing?.points || 0) + Number(points);

    const { error } = await db
      .from("customer_points")
      .upsert({
        customer_id: customerId,
        points: newPoints,
        updated_at: new Date().toISOString()
      }, { onConflict: "customer_id" });

    if (error) throw error;
    return newPoints;
  }

  async function getPoints(customerId) {
    if (!db) throw new Error("Supabase client not connected.");

    const { data, error } = await db
      .from("customer_points")
      .select("points")
      .eq("customer_id", customerId)
      .maybeSingle();

    if (error) throw error;
    return data?.points ?? 0;
  }

  function recommendProducts(products, budget) {
    return (products || [])
      .filter(product => Number(product.price) <= Number(budget))
      .sort((a, b) => Number(a.price) - Number(b.price));
  }

  async function showCustomerEngagement() {
    const choice = prompt(
      "CUSTOMER INSIGHTS\n\n" +
      "1 - Add customer points\n" +
      "2 - Check customer points\n" +
      "3 - Create promotion\n" +
      "4 - View saved promotions"
    );

    try {
      if (choice === "1") {
        const id = prompt("Enter test customer ID:");
        if (!id) return;

        const points = prompt("Enter points to add:");
        if (points === null || points.trim() === "" ||
            !Number.isFinite(Number(points)) || Number(points) <= 0) {
          alert("Enter a valid positive number of points.");
          return;
        }

        const total = await addPoints(id.trim(), Number(points));
        alert(`Success! ${id} now has ${total} points.`);
      } else if (choice === "2") {
        const id = prompt("Enter customer ID:");
        if (!id) return;

        const points = await getPoints(id.trim());
        alert(`${id} has ${points} points.`);
      } else if (choice === "3") {
        const title = prompt("Promotion title:");
        if (!title?.trim()) return;

        const discount = prompt("Discount percentage (1-100):");
        const value = Number(discount);
        if (!Number.isFinite(value) || value < 1 || value > 100) {
          alert("Enter a discount from 1 to 100.");
          return;
        }

        const product = prompt("Product name (optional):") || "";
        await addPromotion(title, value, product);
        alert("Promotion saved successfully!");
      } else if (choice === "4") {
        const promotions = await getPromotions();

        if (!promotions.length) {
          alert("No active promotions found.");
          return;
        }

        alert(promotions.map(p =>
          `${p.title} — ${p.discount_percent}% off` +
          (p.product_name ? ` (${p.product_name})` : "")
        ).join("\n"));
      }
    } catch (error) {
      console.error("Customer engagement error:", error);
      alert("Feature error: " + (error.message || "Unknown error"));
    }
  }

  window.PKCustomerEngagement = {
    addPoints,
    getPoints,
    addPromotion,
    getPromotions,
    recommendProducts
  };

  window.showCustomerEngagement = showCustomerEngagement;

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("customer-insights-button");
    if (!button) return;

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showCustomerEngagement();
    }, true);
  });
})();
