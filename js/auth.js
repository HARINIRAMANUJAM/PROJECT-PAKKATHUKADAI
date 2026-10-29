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

    .admin-header {
      background: #087b43;
      color: white;
      padding: 22px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .admin-header h1 {
      margin: 0;
      font-size: 25px;
    }

    .admin-header button,
    .admin-panel button {
      background: #087b43;
      color: white;
      border: 0;
      border-radius: 8px;
      padding: 11px 16px;
      cursor: pointer;
    }

    .admin-header button {
      background: white;
      color: #087b43;
    }

    .admin-container {
      max-width: 1200px;
      margin: 28px auto;
      padding: 0 18px;
    }

    .admin-panel {
      background: white;
      padding: 22px;
      margin-bottom: 22px;
      border-radius: 14px;
      box-shadow: 0 3px 12px #0000000b;
      overflow-x: auto;
    }

    .admin-panel h2 {
      margin-top: 0;
    }

    .admin-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 18px;
      margin-bottom: 22px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 14px;
      box-shadow: 0 3px 12px #0000000b;
    }

    .stat-card p {
      margin: 0 0 15px;
      color: #5d665f;
    }

    .stat-card strong {
      font-size: 28px;
      color: #087b43;
    }

    .message {
      padding: 13px;
      border-radius: 8px;
      margin-bottom: 18px;
      background: #edf5ef;
      overflow-wrap: anywhere;
    }

    .error {
      background: #fff0f0;
      color: #a21d1d;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      min-width: 650px;
    }

    th, td {
      padding: 12px;
      border-bottom: 1px solid #e6e9e6;
      text-align: left;
      font-size: 14px;
    }

    th {
      background: #f1f6f2;
    }

    .empty {
      color: #667067;
      padding: 14px 0;
    }

    #dashboard-content[hidden],
    #access-denied[hidden] {
      display: none;
    }
  </style>
</head>

<body>
  <header class="admin-header">
    <h1>Pakkathu Kadai — Admin Dashboard</h1>
    <button id="logout-button" type="button">Log out</button>
  </header>

  <main class="admin-container">
    <div id="page-message" class="message">Checking admin access...</div>

    <section id="access-denied" class="admin-panel" hidden>
      <h2>Access denied</h2>
      <p id="access-message">
        An active admin account is required.
      </p>
      <button id="retry-button" type="button">Try again</button>
    </section>

    <div id="dashboard-content" hidden>
      <section class="admin-panel">
        <h2>Platform overview</h2>
        <p id="welcome-message">Welcome, Admin.</p>
        <p id="data-message"></p>
      </section>

      <section class="admin-stats">
        <div class="stat-card">
          <p>Total products</p>
          <strong id="stat-products">—</strong>
        </div>

        <div class="stat-card">
          <p>Total orders</p>
          <strong id="stat-orders">—</strong>
        </div>

        <div class="stat-card">
          <p>Shopkeepers</p>
          <strong id="stat-shopkeepers">—</strong>
        </div>

        <div class="stat-card">
          <p>Registered accounts</p>
          <strong id="stat-accounts">—</strong>
        </div>
      </section>

      <section class="admin-panel">
        <h2>Recent orders</h2>
        <button id="refresh-orders" type="button">
          Refresh orders
        </button>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="orders-body">
              <tr><td colspan="6">Loading orders...</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="admin-panel">
        <h2>Registered accounts</h2>
        <button id="refresh-accounts" type="button">
          Refresh accounts
        </button>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Account ID</th>
                <th>Role</th>
                <th>Shop name</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody id="accounts-body">
              <tr><td colspan="6">Loading accounts...</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="admin-panel">
        <h2>Product inventory</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Shop</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody id="products-body">
              <tr><td colspan="5">Loading products...</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase.js"></script>

  <script>
    (() => {
      "use strict";

      const db = window.supabaseClient;
      const $ = id => document.getElementById(id);

      const message = (text, isError = false) => {
        $("page-message").textContent = text;
        $("page-message").classList.toggle("error", isError);
      };

      const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[char]);

      const formatDate = value => {
        if (!value) return "—";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
          ? "—"
          : date.toLocaleString();
      };

      const showRows = (elementId, rows, columns, emptyText) => {
        const body = $(elementId);

        if (!rows || rows.length === 0) {
          body.innerHTML =
            `<tr><td colspan="${columns}">${escapeHTML(emptyText)}</td></tr>`;
          return;
        }

        body.innerHTML = rows.map(row =>
          `<tr>${row.map(value =>
            `<td>${escapeHTML(value)}</td>`
          ).join("")}</tr>`
        ).join("");
      };

      async function loadAccounts() {
        const { data, error } = await db
          .from("profiles")
          .select("id, full_name, role, status, shop_name, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        $("stat-accounts").textContent = data.length;
        $("stat-shopkeepers").textContent =
          data.filter(account => account.role === "shopkeeper").length;

        showRows(
          "accounts-body",
          data.map(account => [
            account.full_name || "—",
            account.id,
            account.role || "—",
            account.shop_name || "—",
            account.status || "—",
            formatDate(account.created_at)
          ]),
          6,
          "No registered profiles found."
        );
      }

      async function loadProducts() {
        const { data, error } = await db
          .from("Products")
          .select("id, name, price, quantity, shop_name, unit")
          .order("name");

        if (error) throw error;

        $("stat-products").textContent = data.length;

        showRows(
          "products-body",
          data.map(product => [
            product.name,
            product.shop_name || "—",
            product.price ?? "—",
            product.quantity ?? "—",
            product.unit || "—"
          ]),
          5,
          "No products found."
        );
      }

      async function loadOrders() {
        const { data, error } = await db
          .from("Orders")
          .select("id, customer_name, phone, total, status, created_at")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        $("stat-orders").textContent = data.length;

        showRows(
          "orders-body",
          data.map(order => [
            order.id,
            order.customer_name || "—",
            order.phone || "—",
            order.total ?? "—",
            order.status || "—",
            formatDate(order.created_at)
          ]),
          6,
          "No orders found."
        );
      }

      async function loadDashboard() {
        $("dashboard-content").hidden = true;
        $("access-denied").hidden = true;

        if (!db) {
          message("Supabase connection unavailable.", true);
          return;
        }

        message("Checking admin access...");

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
            throw new Error(
              "Your profile was not found. Contact the administrator."
            );
          }

          if (profile.role !== "admin" || profile.status !== "active") {
            $("access-message").textContent =
              "Access denied. Admin account required. " +
              "Current role: " + (profile.role || "not set") +
              "; status: " + (profile.status || "not set") + ".";
            $("access-denied").hidden = false;
            message("Admin access verification failed.", true);
            return;
          }

          $("welcome-message").textContent =
            "Welcome, " + (profile.full_name || "Admin");

          $("dashboard-content").hidden = false;
          message("Admin access verified.");

          const results = await Promise.allSettled([
            loadAccounts(),
            loadProducts(),
            loadOrders()
          ]);

          const failures = results.filter(result =>
            result.status === "rejected"
          );

          if (failures.length) {
            $("data-message").textContent =
              "Some dashboard data could not load. Check table permissions " +
              "and column names. Details: " +
              failures.map(result =>
                result.reason?.message || "Unknown error"
              ).join(" | ");

            $("data-message").classList.add("error");
          } else {
            $("data-message").textContent =
              "Dashboard data loaded successfully.";
            $("data-message").classList.remove("error");
          }

        } catch (error) {
          $("access-message").textContent =
            error.message || "Unable to verify admin access.";
          $("access-denied").hidden = false;
          message(
            error.message || "Dashboard could not load.",
            true
          );
        }
      }

      $("logout-button").addEventListener("click", async () => {
        if (!db) return;

        const { error } = await db.auth.signOut();

        if (error) {
          message("Logout failed: " + error.message, true);
          return;
        }

        location.href = "account.html";
      });

      $("retry-button").addEventListener("click", loadDashboard);

      $("refresh-orders").addEventListener("click", async () => {
        try {
          await loadOrders();
        } catch (error) {
          $("data-message").textContent = error.message;
          $("data-message").classList.add("error");
        }
      });

      $("refresh-accounts").addEventListener("click", async () => {
        try {
          await loadAccounts();
        } catch (error) {
          $("data-message").textContent = error.message;
          $("data-message").classList.add("error");
        }
      });

      loadDashboard();
    })();
  </script>
</body>
</html>
```
