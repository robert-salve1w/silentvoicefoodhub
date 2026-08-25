// ========== ADMIN DASHBOARD SCRIPT ==========

// API URL
const API_URL = "https://your-backend-url.onrender.com/api";

// ========== SESSION CHECK ==========
function checkAdminSession() {
  const loggedIn = sessionStorage.getItem("staffLoggedIn");
  const role = sessionStorage.getItem("staffRole");
  const name = sessionStorage.getItem("staffName") || "Admin";

  if (loggedIn !== "true" || role !== "admin") {
    window.location.href = "staff-login.html";
    return false;
  }

  updateAdminRoleDisplay();
  return true;
}

// ========== LOGOUT ==========
function adminLogout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("staffLoggedIn");
    sessionStorage.removeItem("staffRole");
    sessionStorage.removeItem("staffName");
    sessionStorage.removeItem("staffUsername");
    window.location.href = "staff-login.html";
  }
}

// ========== LOAD ADMIN DASHBOARD ==========
async function loadAdminDashboard() {
  const loading = document.getElementById("adminLoading");
  const emptyState = document.getElementById("adminEmptyState");
  const tableBody = document.getElementById("adminTableBody");

  if (loading) loading.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  try {
    const response = await fetch(`${API_URL}/orders`);
    const orders = await response.json();

    if (loading) loading.style.display = "none";

    if (!orders || orders.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      if (tableBody) tableBody.innerHTML = "";
      updateAdminStats([]);
      return;
    }

    updateAdminStats(orders);
    renderAdminTable(orders);
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    if (loading) loading.style.display = "none";
    showToast("Failed to load dashboard data");
  }
}

// ========== UPDATE ADMIN STATS ==========
function updateAdminStats(orders) {
  // Today's orders
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => {
    const orderDate = new Date(o.orderedAt).toDateString();
    return orderDate === today;
  });

  // Total revenue
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  document.getElementById("adminTodayOrders").textContent = todayOrders.length;
  document.getElementById("adminRevenue").textContent = `₱${totalRevenue}`;
}

// ========== RENDER ADMIN TABLE ==========
function renderAdminTable(orders) {
  const tableBody = document.getElementById("adminTableBody");
  const emptyState = document.getElementById("adminEmptyState");
  if (!tableBody) return;

  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.orderedAt) - new Date(a.orderedAt);
  });

  if (sortedOrders.length === 0) {
    tableBody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  tableBody.innerHTML = sortedOrders
    .slice(0, 10)
    .map(
      (order) => `
    <tr>
      <td><strong>${order.orderNumberFormatted || "#" + order.orderNumber}</strong></td>
      <td>${order.customerNumber}</td>
      <td>${order.items
        .map((i) => i.name)
        .slice(0, 2)
        .join(", ")}${order.items.length > 2 ? "..." : ""}</td>
      <td><span class="status-badge ${order.status || "pending"}">${order.status || "pending"}</span></td>
      <td><strong>₱${order.totalAmount.toFixed(2)}</strong></td>
    </tr>
  `,
    )
    .join("");
}

// ========== ADMIN ORDER MANAGEMENT ==========
function renderAdminOrders(orders) {
  const tableBody = document.getElementById("adminOrdersBody");
  const emptyState = document.getElementById("adminOrdersEmpty");
  if (!tableBody) return;

  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.orderedAt) - new Date(a.orderedAt);
  });

  if (sortedOrders.length === 0) {
    tableBody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  tableBody.innerHTML = sortedOrders
    .map(
      (order) => `
    <tr>
      <td><span class="status-badge ${order.status || "pending"}">${order.status || "pending"}</span></td>
      <td>${formatTime(order.orderedAt)}</td>
      <td><strong>${order.orderNumberFormatted || "#" + order.orderNumber}</strong></td>
      <td>${order.customerNumber}</td>
      <td>${order.estimatedTime || "—"}</td>
      <td><strong>₱${order.totalAmount.toFixed(2)}</strong></td>
      <td>
        <button class="action-btn view" onclick="showAdminOrderDetails('${order._id}')">View</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// ========== ADMIN MENU MANAGEMENT ==========
async function loadAdminMenu() {
  const tableBody = document.getElementById("adminMenuBody");
  const emptyState = document.getElementById("adminMenuEmpty");
  const loading = document.getElementById("adminMenuLoading");

  if (!tableBody) return;

  if (loading) loading.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  try {
    const response = await fetch(`${API_URL}/menu`);
    const menuItems = await response.json();

    if (loading) loading.style.display = "none";

    if (!menuItems || menuItems.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    tableBody.innerHTML = menuItems
      .map(
        (item) => `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>${item.category || "—"}</td>
        <td><strong>₱${item.price}</strong></td>
        <td>
          <span class="availability-badge ${item.available !== false ? "available" : "unavailable"}">
            ${item.available !== false ? "✅ Available" : "❌ Unavailable"}
          </span>
        </td>
        <td>
          <button class="action-btn view" onclick="editAdminMenuItem('${item._id}')">Edit</button>
          <button class="action-btn complete" onclick="deleteAdminMenuItem('${item._id}')" style="background: #dc3545;">Delete</button>
        </td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading admin menu:", error);
    if (loading) loading.style.display = "none";
    showToast("Failed to load menu items");
  }
}

// ========== ADMIN ANALYTICS ==========
async function loadAdminAnalytics() {
  try {
    // Get all orders for analytics
    const response = await fetch(`${API_URL}/orders`);
    const orders = await response.json();

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const customers = [...new Set(orders.map((o) => o.customerNumber))];

    // Top selling items
    const itemCounts = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.name;
        if (!itemCounts[key]) itemCounts[key] = { quantity: 0, revenue: 0 };
        itemCounts[key].quantity += item.quantity;
        itemCounts[key].revenue += item.quantity * item.price;
      });
    });

    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5);

    // Dietary trends
    const dietaryCounts = {
      vegetarian: 0,
      vegan: 0,
      glutenFree: 0,
      pescatarian: 0,
      lowCarb: 0,
      highProtein: 0,
    };

    orders.forEach((order) => {
      if (order.dietary) {
        if (order.dietary.vegetarian) dietaryCounts.vegetarian++;
        if (order.dietary.vegan) dietaryCounts.vegan++;
        if (order.dietary.glutenFree) dietaryCounts.glutenFree++;
        if (order.dietary.pescatarian) dietaryCounts.pescatarian++;
        if (order.dietary.lowCarb) dietaryCounts.lowCarb++;
        if (order.dietary.highProtein) dietaryCounts.highProtein++;
      }
    });

    // Update stats
    document.getElementById("analyticsTotalCustomers").textContent =
      customers.length;
    document.getElementById("analyticsTotalOrders").textContent = totalOrders;
    document.getElementById("analyticsTotalRevenue").textContent =
      `₱${totalRevenue}`;
    document.getElementById("analyticsAvgOrder").textContent =
      `₱${avgOrder.toFixed(2)}`;

    // Update top items
    const topItemsContainer = document.getElementById("analyticsTopItems");
    if (topItems.length === 0) {
      topItemsContainer.innerHTML = `<p style="color: #888; text-align:center; padding: 1rem;">No items sold yet</p>`;
    } else {
      topItemsContainer.innerHTML = topItems
        .map(
          ([name, data]) => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0e2d2;">
          <span><strong>${name}</strong></span>
          <span>Sold: ${data.quantity} | Revenue: ₱${data.revenue}</span>
        </div>
      `,
        )
        .join("");
    }

    // Update dietary trends
    const trendsContainer = document.getElementById("analyticsDietaryTrends");
    const totalDietary = Object.values(dietaryCounts).reduce(
      (a, b) => a + b,
      0,
    );
    if (totalDietary === 0) {
      trendsContainer.innerHTML = `<p style="color: #888; text-align:center; padding: 1rem;">No dietary preferences recorded yet</p>`;
    } else {
      const trendLabels = {
        vegetarian: "🌱 Vegetarian",
        vegan: "🌿 Vegan",
        glutenFree: "🚫 Gluten-Free",
        pescatarian: "🐟 Pescatarian",
        lowCarb: "🥗 Low-Carb",
        highProtein: "💪 High-Protein",
      };
      trendsContainer.innerHTML = Object.entries(dietaryCounts)
        .filter(([_, count]) => count > 0)
        .map(
          ([key, count]) => `
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0e2d2;">
          <span>${trendLabels[key] || key}</span>
          <span><strong>${count}</strong> orders</span>
        </div>
      `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading analytics:", error);
    showToast("Failed to load analytics");
  }
}

// ========== CHART PERIOD ==========
function setChartPeriod(period) {
  document.querySelectorAll(".chart-filter").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.period === period) {
      btn.classList.add("active");
    }
  });
  showToast(`Chart view: ${period.charAt(0).toUpperCase() + period.slice(1)}`);
}

// ========== FORMAT TIME ==========
function formatTime(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ========== SHOW ORDER DETAILS ==========
function showAdminOrderDetails(orderId) {
  fetch(`${API_URL}/orders`)
    .then((res) => res.json())
    .then((orders) => {
      const order = orders.find((o) => o._id === orderId);
      if (order) {
        const slip = {
          orderNumber: order.orderNumber,
          orderNumberFormatted:
            order.orderNumberFormatted || "#" + order.orderNumber,
          customerNumber: order.customerNumber,
          items: order.items,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          timestamp: order.orderedAt,
          estimatedTime: order.estimatedTime || "20 minutes",
          status: order.status,
          dietary: order.dietary,
        };
        showOrderDetailsModalFromSlip(slip);
      }
    })
    .catch((error) => {
      console.error("Error fetching order details:", error);
      showToast("Error loading order details");
    });
}

// ========== SHOW ORDER DETAILS MODAL ==========
function showOrderDetailsModalFromSlip(slip) {
  const originalSlips = orderSlips || [];
  orderSlips = [slip];
  if (typeof showOrderDetailsModal === "function") {
    showOrderDetailsModal(slip.orderNumber);
  } else {
    alert(
      `Order ${slip.orderNumberFormatted}\nCustomer: ${slip.customerNumber}\nItems: ${slip.items.map((i) => `${i.name} x${i.quantity}`).join("\n")}\nTotal: ₱${slip.totalAmount}`,
    );
  }
  orderSlips = originalSlips;
}

// ========== TOAST ==========
function showToast(message) {
  const existing = document.getElementById("customToast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "customToast";
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: #2c2b28;
    color: white;
    padding: 10px 20px;
    border-radius: 40px;
    font-size: 0.85rem;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2000);
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// ========== SIDEBAR FUNCTIONS ==========
function toggleSidebar() {
  const sidebar = document.getElementById("staffSidebar");
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle("open");
    const overlay = document.getElementById("sidebarOverlay");
    if (overlay) overlay.classList.toggle("open");
  } else {
    sidebar.classList.toggle("collapsed");
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("staffSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

// ========== UPDATE ROLE DISPLAY ==========
function updateAdminRoleDisplay() {
  const name = sessionStorage.getItem("staffName") || "Administrator";
  const nameDisplay = document.getElementById("adminNameDisplay");

  if (nameDisplay) {
    nameDisplay.textContent = `👋 Hello, ${name}`;
  }
}

// ========== SIDEBAR NAVIGATION ==========
function initAdminSidebarNavigation() {
  const sidebarBtns = document.querySelectorAll(".sidebar-btn");
  const pages = {
    dashboard: "pageDashboard",
    orders: "pageOrders",
    menu: "pageMenu",
    analytics: "pageAnalytics",
  };
  const titles = {
    dashboard: "📊 Dashboard",
    orders: "📦 Order Management",
    menu: "🍽️ Menu Management",
    analytics: "📊 Analytics",
  };

  sidebarBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sidebarBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const pageId = btn.dataset.page;
      const title = titles[pageId] || "Dashboard";
      document.getElementById("pageTitle").textContent = title;

      Object.keys(pages).forEach((key) => {
        const el = document.getElementById(pages[key]);
        if (key === pageId) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });

      // Load data based on page
      if (pageId === "analytics") {
        loadAdminAnalytics();
      }

      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // Hamburger button
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleSidebar();
    });
  }

  // Close sidebar on outside click (mobile)
  document.addEventListener("click", function (e) {
    const sidebar = document.getElementById("staffSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const isMobile = window.innerWidth <= 768;
    const toggleBtn = document.getElementById("hamburgerBtn");

    if (isMobile && sidebar && sidebar.classList.contains("open")) {
      const isClickInsideSidebar = sidebar.contains(e.target);
      const isClickOnToggle = toggleBtn && toggleBtn.contains(e.target);
      const isClickOnOverlay = overlay && overlay.contains(e.target);

      if (!isClickInsideSidebar && !isClickOnToggle && !isClickOnOverlay) {
        closeSidebar();
      }
    }
  });
}

// ========== ADMIN MENU FUNCTIONS ==========
function editAdminMenuItem(itemId) {
  fetch(`${API_URL}/menu`)
    .then((res) => res.json())
    .then((menuItems) => {
      const item = menuItems.find((i) => i._id === itemId);
      if (!item) {
        showToast("Item not found");
        return;
      }

      const overlay = document.createElement("div");
      overlay.id = "menuModalOverlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
      `;

      const modal = document.createElement("div");
      modal.style.cssText = `
        background: white;
        max-width: 420px;
        width: 90%;
        border-radius: 24px;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        font-family: 'Inter', sans-serif;
      `;

      modal.innerHTML = `
        <h3 style="margin-bottom: 1rem; font-size: 1.3rem; color: #2c2b28;">✏️ Edit Dish</h3>
        <form id="editAdminMenuItemForm">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px;">Menu Name *</label>
            <input type="text" id="editAdminMenuNameInput" value="${item.name}" required style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px;">Category *</label>
            <select id="editAdminMenuCategoryInput" style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
              <option value="Rice Meals" ${item.category === "Rice Meals" ? "selected" : ""}>Rice Meals</option>
              <option value="Sandwiches" ${item.category === "Sandwiches" ? "selected" : ""}>Sandwiches</option>
              <option value="Salads" ${item.category === "Salads" ? "selected" : ""}>Salads</option>
              <option value="Snacks" ${item.category === "Snacks" ? "selected" : ""}>Snacks</option>
              <option value="Drinks" ${item.category === "Drinks" ? "selected" : ""}>Drinks</option>
              <option value="Desserts" ${item.category === "Desserts" ? "selected" : ""}>Desserts</option>
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px;">Price (₱) *</label>
            <input type="number" id="editAdminMenuPriceInput" value="${item.price}" required min="1" step="1" style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px;">Availability</label>
            <select id="editAdminMenuAvailabilityInput" style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
              <option value="true" ${item.available !== false ? "selected" : ""}>✅ Available</option>
              <option value="false" ${item.available === false ? "selected" : ""}>❌ Unavailable</option>
            </select>
          </div>
          <div style="display: flex; gap: 12px;">
            <button type="submit" style="flex: 1; background: #dc143c; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">Update Dish</button>
            <button type="button" onclick="closeMenuModal()" style="flex: 1; background: #ddd; color: #333; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">Cancel</button>
          </div>
        </form>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      document
        .getElementById("editAdminMenuItemForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          await updateAdminMenuItem(itemId);
        });
    })
    .catch((error) => {
      console.error("Error fetching item:", error);
      showToast("Error loading item details");
    });
}

async function updateAdminMenuItem(itemId) {
  const name = document.getElementById("editAdminMenuNameInput").value.trim();
  const category = document.getElementById("editAdminMenuCategoryInput").value;
  const price = parseInt(
    document.getElementById("editAdminMenuPriceInput").value,
  );
  const available =
    document.getElementById("editAdminMenuAvailabilityInput").value === "true";

  if (!name || !price) {
    showToast("Please fill in all required fields");
    return;
  }

  const updatedItem = {
    name: name,
    category: category,
    price: price,
    available: available,
  };

  try {
    const response = await fetch(`${API_URL}/menu/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });

    const result = await response.json();

    if (result.success) {
      showToast("✅ Menu item updated successfully!");
      closeMenuModal();
      loadAdminMenu();
    } else {
      showToast("Failed to update menu item");
    }
  } catch (error) {
    console.error("Error updating menu item:", error);
    showToast("Error updating menu item");
  }
}

async function deleteAdminMenuItem(itemId) {
  if (!confirm("Are you sure you want to delete this menu item?")) return;

  try {
    const response = await fetch(`${API_URL}/menu/${itemId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showToast("✅ Menu item deleted successfully!");
      loadAdminMenu();
    } else {
      showToast("Failed to delete menu item");
    }
  } catch (error) {
    console.error("Error deleting menu item:", error);
    showToast("Error deleting menu item");
  }
}

function closeMenuModal() {
  const modal = document.getElementById("menuModalOverlay");
  if (modal) modal.remove();
}

// ========== INITIALIZE ==========
document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin DOM loaded, initializing...");

  if (!checkAdminSession()) return;

  loadAdminDashboard();
  loadAdminMenu();
  initAdminSidebarNavigation();
  updateAdminRoleDisplay();

  // Also load admin orders for order management
  fetch(`${API_URL}/orders`)
    .then((res) => res.json())
    .then((orders) => {
      renderAdminOrders(orders);
    })
    .catch((error) => console.error("Error loading admin orders:", error));

  // Also load admin menu for menu management
  setTimeout(() => {
    loadAdminMenu();
  }, 500);

  setTimeout(function () {
    const btn = document.getElementById("hamburgerBtn");
    if (btn) {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        toggleSidebar();
      });
    }
  }, 100);

  // Auto-refresh every 60 seconds
  setInterval(() => {
    loadAdminDashboard();
  }, 60000);
});
