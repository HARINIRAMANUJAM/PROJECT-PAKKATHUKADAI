
(() => {
  "use strict";

  window.showOrderDelivery = async function () {
    const db = window.supabaseClient;
    if (!db) return alert("Supabase is not connected.");

    const { data, error } = await db
      .from("Orders")
      .select("id, customer_name, phone, delivery_address, total, status, created_at")
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);
    if (!data?.length) return alert("No orders found.");

    alert("RECENT ORDERS\n\n" + data.slice(0, 10).map(o =>
      `Order #${o.id}\nCustomer: ${o.customer_name || "N/A"}\n` +
      `Phone: ${o.phone || "N/A"}\nAddress: ${o.delivery_address || "N/A"}\n` +
      `Total: ₹${Number(o.total || 0).toFixed(2)}\nStatus: ${o.status || "pending"}`
    ).join("\n\n"));
  };

  window.openWhatsAppOrderMessage = function () {
    const phone = prompt("WhatsApp number with country code (digits only):");
    if (!phone || !/^[0-9]{8,15}$/.test(phone.trim())) {
      return alert("Enter a valid number with country code.");
    }

    const message = prompt("Enter your message:", "Hello! I'd like to place an order.");
    if (message === null) return;

    window.open(
      "https://wa.me/" + phone.trim() + "?text=" + encodeURIComponent(message),
      "_blank",
      "noopener,noreferrer"
    );
  };
})();
