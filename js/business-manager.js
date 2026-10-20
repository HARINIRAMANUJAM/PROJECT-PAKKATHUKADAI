
(() => {
  "use strict";

  const KEY = "pakkathuBusinessExpenses";

  window.manageBusinessExpenses = function () {
    let expenses = [];

    try {
      expenses = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(expenses)) expenses = [];
    } catch {
      expenses = [];
    }

    const action = prompt(
      "BUSINESS MANAGER\n1 - Add expense\n2 - View expenses\nEnter 1 or 2:"
    );

    if (action === "1") {
      const description = prompt("Expense description:");
      if (!description?.trim()) return;

      const amountText = prompt("Amount in ₹:");
      if (amountText === null) return;

      const amount = Number(amountText);
      if (!Number.isFinite(amount) || amount <= 0) {
        return alert("Enter a valid positive amount.");
      }

      expenses.push({
        description: description.trim(),
        amount,
        date: new Date().toISOString()
      });

      localStorage.setItem(KEY, JSON.stringify(expenses));
      alert("Expense saved in this browser.");
    } else if (action === "2") {
      const total = expenses.reduce(
        (sum, e) => sum + Number(e.amount || 0), 0
      );

      alert(
        `EXPENSE SUMMARY\n\nEntries: ${expenses.length}\nTotal: ₹${total.toFixed(2)}\n\n` +
        (expenses.length
          ? expenses.map((e, i) =>
              `${i + 1}. ${e.description}: ₹${Number(e.amount).toFixed(2)}`
            ).join("\n")
          : "No expenses recorded.")
      );
    }
  };

  window.showBusinessManagerSummary = async function () {
    const db = window.supabaseClient;
    if (!db) return alert("Supabase is not connected.");

    const [p, o] = await Promise.all([
      db.from("Products").select("name, price, quantity"),
      db.from("Orders").select("id, total, status")
    ]);

    if (p.error || o.error) {
      return alert("Could not load data: " + (p.error || o.error).message);
    }

    const products = p.data || [];
    const orders = o.data || [];
    const inventoryValue = products.reduce(
      (sum, x) => sum + Number(x.price || 0) * Number(x.quantity || 0), 0
    );
    const completed = orders.filter(
      x => String(x.status || "").toLowerCase() === "completed"
    );
    const revenue = completed.reduce(
      (sum, x) => sum + Number(x.total || 0), 0
    );

    alert(
      `BUSINESS SUMMARY\n\nProducts: ${products.length}\n` +
      `Estimated inventory value: ₹${inventoryValue.toFixed(2)}\n` +
      `Total orders: ${orders.length}\n` +
      `Completed-order revenue: ₹${revenue.toFixed(2)}\n\n` +
      "Revenue is not net profit."
    );
  };
})();
