
(() => {
  "use strict";

  const POINTS_TABLE = "customer_points";
  const PROMOTIONS_TABLE = "promotions";

  function db() {
    if (!window.supabaseClient) {
      throw new Error("Supabase is not connected. Check js/supabase.js.");
    }
    return window.supabaseClient;
  }

  function validCustomerId(value) {
    const id = String(value || "").trim();
    if (!id) throw new Error("Enter a customer ID or phone number.");
    return id;
  }

  async function addPoints(customerId, points) {
    const id = validCustomerId(customerId);
    const amount = Number(points);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error("Points must be a positive whole number.");
    }

    const client = db();

    const { data: existing, error: readError } = await client
      .from(POINTS_TABLE)
      .select("customer_id, points")
      .eq("customer_id", id)
      .maybeSingle();

    if (readError) throw readError;

    const updated = Number(existing?.points || 0) + amount;

    const { error } = await client
      .from(POINTS_TABLE)
      .upsert(
        { customer_id: id, points: updated },
        { onConflict: "customer_id" }
      );

    if (error) throw error;
    return updated;
  }

  async function getPoints(customerId) {
    const id = validCustomerId(customerId);

    const { data, error } = await db()
      .from(POINTS_TABLE)
      .select("points")
      .eq("customer_id", id)
      .maybeSingle();

    if (error) throw error;
    return Number(data?.points || 0);
  }

  async function addPromotion(title, discountPercent, productName = "") {
    const name = String(title || "").trim();
    const discount = Number(discountPercent);
    const product = String(productName || "").trim();

    if (!name) throw new Error("Enter a promotion title.");

    if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
      throw new Error("Discount must be between 1 and 100.");
    }

    const { data, error } = await db()
      .from(PROMOTIONS_TABLE)
      .insert({
        title: name,
        discount_percent: discount,
        product_name: product || null,
        active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function getPromotions() {
    const { data, error } = await db()
      .from(PROMOTIONS_TABLE)
      .select("id, title, discount_percent, product_name, active, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  function recommendProducts(products, budget) {
    const limit = Number(budget);

    if (!Array.isArray(products) ||
        !Number.isFinite(limit) || limit < 0) {
      return [];
    }

    return products
      .filter(product =>
        Number.isFinite(Number(product.price)) &&
        Number(product.price) <= limit
      )
      .slice()
      .sort((a, b) => Number(a.price) - Number(b.price));
  }

  async function showCustomerEngagement() {
    const choice = prompt(
      "CUSTOMER ENGAGEMENT\n\n" +
      "1 - Add customer points\n" +
      "2 - Check customer points\n" +
      "3 - Create promotion\n" +
      "4 - View promotions\n\n" +
      "Enter 1, 2, 3, or 4:"
    );

    if (choice === null) return;

    try {
      if (choice === "1") {
        const customerId = prompt("Customer ID or phone number:");
        if (customerId === null) return;

        const pointsText = prompt("Points to add (whole number):");
        if (pointsText === null) return;

        const total = await addPoints(customerId, Number(pointsText));
        alert("Points saved successfully.\nCustomer total: " + total);
      } else if (choice === "2") {
        const customerId = prompt("Customer ID or phone number:");
        if (customerId === null) return;

        const points = await getPoints(customerId);
        alert("Customer points: " + points);
      } else if (choice === "3") {
        const title = prompt("Promotion title:");
        if (title === null) return;

        const discountText = prompt("Discount percentage (1–100):");
        if (discountText === null) return;

        const productName = prompt("Product name (optional):");
        if (productName === null) return;

        const promotion = await addPromotion(
          title,
          Number(discountText),
          productName
        );

        alert("Promotion saved: " + promotion.title);
      } else if (choice === "4") {
        const promotions = await getPromotions();

        alert(
          promotions.length
            ? promotions.map(p =>
                `${p.title} — ${p.discount_percent}% off` +
                (p.product_name ? ` (${p.product_name})` : "") +
                (p.active ? "" : " [Inactive]")
              ).join("\n")
            : "No promotions found."
        );
      } else {
        alert("Please enter 1, 2, 3, or 4.");
      }
    } catch (error) {
      console.error("Customer engagement error:", error);
      alert("Could not complete the action:\n" + error.message);
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

  // Connect to the existing dashboard button without editing shopkeeper.html.
  function connectDashboardButton() {
    const button = document.getElementById("customer-insights-button");
    if (!button || button.dataset.engagementConnected === "true") return;

    button.dataset.engagementConnected = "true";

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showCustomerEngagement();
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", connectDashboardButton);
  } else {
    connectDashboardButton();
  }
})();
