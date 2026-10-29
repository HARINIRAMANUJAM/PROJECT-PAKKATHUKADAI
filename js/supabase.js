```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pakkathu Kadai | Admin Dashboard</title>
  <link rel="stylesheet" href="css/style.css">

  <style>
    body {
      margin: 0;
      background: #f5f7f5;
      color: #202820;
      font-family: Arial, sans-serif;
    }

    header {
      background: #087b43;
      color: white;
      padding: 20px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    header h1 { margin: 0; font-size: 24px; }

    button {
      background: #087b43;
      color: white;
      border: 0;
      padding: 10px 15px;
      border-radius: 7px;
      cursor: pointer;
    }

    header button { background: white; color: #087b43; }

    main { max-width: 1200px; margin: 25px auto; padding: 0 16px; }

    .panel, .stat {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px #0000000b;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 16px;
    }

    .stat p { color: #5b655e; }
    .stat strong { font-size: 27px; color: #087b43; }

    .message {
      padding: 12px;
      background: #edf5ef;
      border-radius: 7px;
      overflow-wrap: anywhere;
    }

    .error { background: #fff0f0; color: #a21d1d; }

    .table-wrap { overflow-x: auto; }

    table { width: 100%; border-collapse: collapse; min-width: 600px; }

    th, td {
      text-align: left;
      padding: 11px;
      border-bottom: 1px solid #e4e8e4;
      font-size: 14px;
    }

    th { background: #f1f6f2; }

    [hidden] { display: none !important; }
  </style>
</head>

<body>
  <header>
    <h1>Pakkathu Kadai — Admin Dashboard</h1>
    <button id="logout-button" type="button">Log out</button>
  </header>

  <main>
    <p id="page-message" class="message">Connecting to Supabase...</p>

    <section id="access-denied" class="panel" hidden>
      <h2>Access denied</h2>
      <p id="access-message"></p>
      <button id="retry-button" type="button">Try again</button>
    </section>

    <div id="dashboard-content" hidden>
      <section class="panel">
        <h2>Platform overview</h2>
        <p id="welcome-message">Welcome, Admin.</p>
      </section>

      <section class="stats">
        <div class="stat">
          <p>Total products</p>
          <strong id="stat-products">—</strong>
        </div>
        <div class="stat">
          <p>Total orders</p>
          <strong id="stat-orders">—</strong>
        </div>
        <div class="stat">
          <p>Shopkeepers</p>
          <strong id="stat-shopkeepers">—</strong>
        </div>
        <div class="stat">
          <p>Registered accounts</p>
          <strong id="stat-accounts">—</strong>
        </div>
      </section>

      <section class="panel">
        <h2>Recent orders</h2>
        <button id="refresh-orders" type="button">Refresh orders</button>
        <p id="orders-message"></p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Phone</th>
                <th>Total</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody id="orders-body"></tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <h2>Registered accounts</h2>
        <button id="refresh-accounts" type="button">Refresh accounts</button>
        <p id="accounts-message"></p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Account ID</th><th>Role</th>
                <th>Shop name</th><th>Status</th><th>Registered</th>
              </tr>
            </thead>
            <tbody id="accounts-body"></tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <h2>Product inventory</h2>
        <p id="products-message"></p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Shop</th><th>Price</th>
                <th>Quantity</th><th>Unit</th>
              </tr>
            </thead>
            <tbody id="products-body"></tbody>
          </table>
        </div>
      </section>
    </div>
  </main>

  <!-- Load the library first, then initialize the shared client. -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase.js"></script>

  <script>
    (() => {
      "use strict";

      const db = window.supabaseClient;
      const $ = id => document.getElementById(id);

      function showMessage(id, text, error = false) {
        const element = $(id);
        element.textContent = text;
        element.classList.toggle("error", error);
      }

      function safe(value) {
        return String(value ?? "—").replace(/[&<>"']/g, char => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[char]);
      }

      function dateText(value) {
        if (!value) return "—";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
      }

      function renderRows(bodyId, rows, emptyText, colCount) {
        const body = $(bodyId);

        if (!rows.length) {
          body.innerHTML =
            `<tr><td colspan="${colCount}">${safe(emptyText)}</td></tr>`;
          return;
        }

        body.innerHTML = rows.map(row =>
          "<tr>" + row.map(value => `<td>${safe(value)}</td>`).join("") + "</tr>"
        ).join("");
      }

      async function loadAccounts() {
        const { data, error } = await db
          .from("profiles")
          .select("id, full_name, role, status, shop_name, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        $("stat-accounts").textContent = data.length;
        $("stat-shopkeepers").textContent =
          data.filter(account => account.role === "shopkeeper").length;

        renderRows("accounts-body", data.map(account => [
          account.full_name,
          account.id,
          account.role,
          account.shop_name,
          account.status,
          dateText(account.created_at)
        ]), "No profiles found.", 6);

        showMessage("accounts-message", "Accounts loaded.");
      }

      async function loadProducts() {
        const { data, error } = await db
          .from("Products")
          .select("name, shop_name, price, quantity, unit")
          .order("name");

        if (error) throw error;

        $("stat-products").textContent = data.length;

        renderRows("products-body", data.map(product => [
          product.name,
          product.shop_name,
          product.price,
          product.quantity,
          product.unit
        ]), "No products found.", 5);

        showMessage("products-message", "Products loaded.");
      }

      async function loadOrders() {
        const { data, error } = await db
          .from("Orders")
          .select("id, customer_name, phone, total, status, created_at")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        $("stat-orders").textContent = data.length;

        renderRows("orders-body", data.map(order => [
          order.id,
          order.customer_name,
          order.phone,
          order.total,
          order.status,
          dateText(order.created_at)
        ]), "No orders found.", 6);

        showMessage("orders-message", "Orders loaded.");
      }

      async function loadDashboard() {
        $("dashboard-content").hidden = true;
        $("access-denied").hidden = true;

        if (!db) {
          showMessage(
            "page-message",
            "Supabase client is missing. Check js/supabase.js and script order.",
            true
          );
          return;
        }

        showMessage("page-message", "Checking admin access...");

        try {
          const { data: sessionData, error: sessionError } =
            await db.auth.getSession();

          if (sessionError) throw sessionError;

          const user = sessionData.session?.user;

          if (!user) {
            location.href = "account.html";
            return;
          }

          const { data: profile, error: profileError } = await db
            .from("profiles")
            .select("id, full_name, role, status")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          if (!profile) {
            throw new Error("Profile not found for this logged-in account.");
          }

          if (profile.role !== "admin" || profile.status !== "active") {
            $("access-message").textContent =
              "Admin access required. Role: " +
              (profile.role || "missing") +
              "; status: " + (profile.status || "missing") + ".";
            $("access-denied").hidden = false;
            showMessage("page-message", "Admin access denied.", true);
            return;
          }

          $("welcome-message").textContent =
            "Welcome, " + (profile.full_name || "Admin");

          $("dashboard-content").hidden = false;
          showMessage("page-message", "Admin access verified.");

          const results = await Promise.allSettled([
            loadAccounts(),
            loadProducts(),
            loadOrders()
          ]);

          const failures = results.filter(result => result.status === "rejected");

          if (failures.length) {
            const details = failures.map(result =>
              result.reason?.message || "Unknown error"
            ).join(" | ");

            showMessage("page-message",
              "Admin verified, but some data failed to load: " + details,
              true
            );
          }
        } catch (error) {
          $("access-message").textContent =
            error.message || "Unable to verify admin access.";
          $("access-denied").hidden = false;
          showMessage(
            "page-message",
            error.message || "Dashboard error.",
            true
          );
        }
      }

      $("logout-button").addEventListener("click", async () => {
        if (!db) return;

        const { error } = await db.auth.signOut();

        if (error) {
          showMessage("page-message", error.message, true);
          return;
        }

        location.href = "account.html";
      });

      $("retry-button").addEventListener("click", loadDashboard);

      $("refresh-orders").addEventListener("click", async () => {
        try {
          await loadOrders();
        } catch (error) {
          showMessage("orders-message", error.message, true);
        }
      });

      $("refresh-accounts").addEventListener("click", async () => {
        try {
          await loadAccounts();
        } catch (error) {
          showMessage("accounts-message", error.message, true);
        }
      });

      loadDashboard();
    })();
  </script>
</body>
</html>
```
