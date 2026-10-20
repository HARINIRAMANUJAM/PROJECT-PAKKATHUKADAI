
(() => {
  "use strict";

  window.exportInventoryCSV = async function () {
    const db = window.supabaseClient;

    if (!db) {
      alert("Supabase is not connected.");
      return;
    }

    const { data, error } = await db
      .from("Products")
      .select("id, name, shop_name, price, quantity, unit")
      .order("name");

    if (error) {
      alert("Could not export inventory: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No products available to export.");
      return;
    }

    const columns = [
      "id", "name", "shop_name", "price", "quantity", "unit"
    ];

    const escapeCSV = value =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      columns.map(escapeCSV).join(","),
      ...data.map(product =>
        columns.map(column => escapeCSV(product[column])).join(",")
      )
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "pakkathu-kadai-inventory.csv";
    link.click();

    URL.revokeObjectURL(url);
    alert("Inventory CSV export started!");
  };
})();
