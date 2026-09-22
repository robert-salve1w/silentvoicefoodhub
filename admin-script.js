// ========== ADMIN DASHBOARD SCRIPT ==========
// API URL
const API_URL = "http://localhost:3000/api";

console.log("🔗 API URL:", API_URL);

// ========== GLOBAL VARIABLES ==========
let allOrdersData = [];
let currentDateFilter = "today";
let customDateFrom = null;
let customDateTo = null;
let adminAutoRefreshInterval = null;

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

// ============================================================
// ========== DATE FORMATTING HELPERS ==========
// ============================================================

function formatDateDisplay(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateOnly(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ============================================================
// ========== DATE FILTER FUNCTIONS ==========
// ============================================================

function getDateRange(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from = new Date(today);
  let to = new Date(today);
  let label = "";

  switch (filter) {
    case "today":
      from = new Date(today);
      to = new Date(today);
      label = "Today";
      break;
    case "yesterday":
      from = new Date(today);
      from.setDate(from.getDate() - 1);
      to = new Date(from);
      label = "Yesterday";
      break;
    case "thisweek":
      from = new Date(today);
      from.setDate(from.getDate() - from.getDay());
      to = new Date(today);
      label = "This Week";
      break;
    case "thismonth":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(today);
      label = "This Month";
      break;
    case "thisyear":
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(today);
      label = "This Year";
      break;
    case "custom":
      if (customDateFrom && customDateTo) {
        from = new Date(customDateFrom);
        to = new Date(customDateTo);
        to.setHours(23, 59, 59, 999);
        label = `${formatDateDisplay(from)} - ${formatDateDisplay(to)}`;
      } else {
        from = new Date(today);
        to = new Date(today);
        label = "Custom Date";
      }
      break;
    default:
      from = new Date(today);
      to = new Date(today);
      label = "Today";
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to, label };
}

function applyDashboardFilter() {
  const filterSelect = document.getElementById("dashboardDateFilter");
  if (!filterSelect) return;

  currentDateFilter = filterSelect.value;

  const customRange = document.getElementById("customDateRange");
  if (currentDateFilter === "custom") {
    if (customRange) customRange.style.display = "flex";
    const fromInput = document.getElementById("customDateFrom");
    const toInput = document.getElementById("customDateTo");

    if (fromInput && fromInput.value) {
      customDateFrom = fromInput.value;
    }
    if (toInput && toInput.value) {
      customDateTo = toInput.value;
    }

    if (!customDateFrom) {
      const today = new Date().toISOString().split("T")[0];
      fromInput.value = today;
      customDateFrom = today;
    }
    if (!customDateTo) {
      const today = new Date().toISOString().split("T")[0];
      toInput.value = today;
      customDateTo = today;
    }
  } else {
    if (customRange) customRange.style.display = "none";
    customDateFrom = null;
    customDateTo = null;
  }

  const range = getDateRange(currentDateFilter);
  const filterLabel = document.getElementById("filterDateLabel");
  if (filterLabel) filterLabel.textContent = range.label;

  filterDashboardOrders(range.from, range.to);
}

function applyCustomDateRange() {
  const fromInput = document.getElementById("customDateFrom");
  const toInput = document.getElementById("customDateTo");

  if (!fromInput || !toInput) {
    showToast("⚠️ Please select both From and To dates");
    return;
  }

  if (!fromInput.value || !toInput.value) {
    showToast("⚠️ Please select both From and To dates");
    return;
  }

  const fromDate = new Date(fromInput.value);
  const toDate = new Date(toInput.value);

  if (fromDate > toDate) {
    showToast("⚠️ 'From' date cannot be later than 'To' date");
    return;
  }

  customDateFrom = fromInput.value;
  customDateTo = toInput.value;

  const filterSelect = document.getElementById("dashboardDateFilter");
  if (filterSelect) {
    filterSelect.value = "custom";
    currentDateFilter = "custom";
  }

  const range = getDateRange("custom");
  const filterLabel = document.getElementById("filterDateLabel");
  if (filterLabel) filterLabel.textContent = range.label;

  filterDashboardOrders(range.from, range.to);

  showToast(
    `✅ Showing orders from ${formatDateDisplay(fromDate)} to ${formatDateDisplay(toDate)}`,
  );
}

function updateDashboardDateRangeDisplay(fromDate, toDate) {
  const displayElement = document.getElementById("dashboardDateRangeText");
  if (!displayElement) return;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSameDay = from.toDateString() === to.toDateString();

  if (isSameDay) {
    displayElement.textContent = formatDate(from);
  } else {
    displayElement.textContent = `${formatDate(from)} - ${formatDate(to)}`;
  }
}

// ============================================================
// ========== LOAD ADMIN DASHBOARD ==========
// ============================================================

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

    allOrdersData = orders;

    if (!orders || orders.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      if (tableBody) tableBody.innerHTML = "";
      updateStats([]);
      return;
    }

    // Apply date filter
    const range = getDateRange(currentDateFilter);
    const filterLabel = document.getElementById("filterDateLabel");
    if (filterLabel) filterLabel.textContent = range.label;
    filterDashboardOrders(range.from, range.to);
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    if (loading) loading.style.display = "none";
    showToast("Failed to load dashboard data");
  }
}

// ========== FILTER DASHBOARD ORDERS ==========
function filterDashboardOrders(fromDate, toDate) {
  const tableBody = document.getElementById("adminTableBody");
  const emptyState = document.getElementById("adminEmptyState");

  if (!allOrdersData || allOrdersData.length === 0) {
    if (tableBody) tableBody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    updateStats([]);
    return;
  }

  const filteredOrders = allOrdersData.filter((order) => {
    const orderDate = new Date(order.orderedAt);
    return orderDate >= fromDate && orderDate <= toDate;
  });

  renderAdminTable(filteredOrders);
  updateStats(filteredOrders);
  updateDashboardDateRangeDisplay(fromDate, toDate);

  if (filteredOrders.length === 0) {
    if (emptyState) {
      emptyState.style.display = "block";
      const p = emptyState.querySelector("p");
      if (p) p.textContent = "No orders found for this date range";
    }
  } else {
    if (emptyState) emptyState.style.display = "none";
  }
}

// ========== UPDATE STATS ==========
function updateStats(orders) {
  // Pending orders (including confirmed, preparing, ready)
  const pending = orders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "confirmed" ||
      o.status === "preparing" ||
      o.status === "ready",
  ).length;

  // Completed orders
  const completed = orders.filter((o) => o.status === "completed").length;

  // Declined orders
  const declined = orders.filter((o) => o.status === "declined").length;

  // Total Revenue
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Update DOM
  const statPending = document.getElementById("statPending");
  const statCompleted = document.getElementById("statCompleted");
  const statDeclined = document.getElementById("statDeclined");
  const statRevenue = document.getElementById("statRevenue");

  if (statPending) statPending.textContent = pending;
  if (statCompleted) statCompleted.textContent = completed;
  if (statDeclined) statDeclined.textContent = declined;
  if (statRevenue) statRevenue.textContent = `₱${totalRevenue}`;
}

// ========== RENDER ADMIN TABLE ==========
function renderAdminTable(orders) {
  const tableBody = document.getElementById("adminTableBody");
  const emptyState = document.getElementById("adminEmptyState");
  if (!tableBody) return;

  if (!orders || orders.length === 0) {
    tableBody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.orderedAt) - new Date(a.orderedAt);
  });

  tableBody.innerHTML = sortedOrders
    .map(
      (order) => `
    <tr>
      <td><strong>${order.orderNumberFormatted || "#" + order.orderNumber}</strong></td>
      <td>${formatDateOnly(order.orderedAt)}</td>
      <td>${order.customerNumber}</td>
      <td>${order.items
        .map((i) => i.name)
        .slice(0, 2)
        .join(", ")}${order.items.length > 2 ? "..." : ""}</td>
      <td><span class="status-badge ${order.status || "pending"}">${(order.status || "pending").toUpperCase()}</span></td>
      <td><strong>₱${order.totalAmount.toFixed(2)}</strong></td>
    </tr>
  `,
    )
    .join("");
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

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleSidebar();
    });
  }

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

// ============================================================
// ========== ADMIN MENU MANAGEMENT ==========
// ============================================================

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

// ============================================================
// ========== ADMIN ANALYTICS ==========
// ============================================================

async function loadAdminAnalytics() {
  try {
    const response = await fetch(`${API_URL}/orders`);
    const orders = await response.json();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const customers = [...new Set(orders.map((o) => o.customerNumber))];

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

    document.getElementById("analyticsTotalCustomers").textContent =
      customers.length;
    document.getElementById("analyticsTotalOrders").textContent = totalOrders;
    document.getElementById("analyticsTotalRevenue").textContent =
      `₱${totalRevenue}`;
    document.getElementById("analyticsAvgOrder").textContent =
      `₱${avgOrder.toFixed(2)}`;

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

// ============================================================
// ========== INITIALIZE ==========
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin DOM loaded, initializing...");

  if (!checkAdminSession()) return;

  // Initialize date filter
  const filterSelect = document.getElementById("dashboardDateFilter");
  if (filterSelect) {
    filterSelect.value = "today";
  }

  // 🔥 Initialize order management date filter
  const ordersFilterSelect = document.getElementById("ordersDateFilter");
  if (ordersFilterSelect) {
    ordersFilterSelect.value = "all";
    ordersDateFilter = "all";
  }

  const ordersFilterLabel = document.getElementById("ordersFilterDateLabel");
  if (ordersFilterLabel) {
    ordersFilterLabel.textContent = "All Time";
  }

  const today = new Date().toISOString().split("T")[0];
  const fromInput = document.getElementById("customDateFrom");
  const toInput = document.getElementById("customDateTo");
  if (fromInput) fromInput.value = today;
  if (toInput) toInput.value = today;

  const customRange = document.getElementById("customDateRange");
  if (customRange) customRange.style.display = "none";

  const range = getDateRange("today");
  document.getElementById("filterDateLabel").textContent = range.label;

  loadAdminDashboard();
  loadAdminMenu();
  loadAdminOrders();
  initAdminSidebarNavigation();
  updateAdminRoleDisplay();

  // 🔥 ADD THIS LINE - Load chart data
  loadChartData("daily");

  // Set up auto-refresh for order management
  if (adminAutoRefreshInterval) {
    clearInterval(adminAutoRefreshInterval);
  }

  adminAutoRefreshInterval = setInterval(() => {
    const ordersPage = document.getElementById("pageOrders");
    if (ordersPage && ordersPage.classList.contains("active")) {
      console.log("🔄 Auto-refreshing admin orders...");
      loadAdminOrders();
    }
  }, 10000);

  // Auto-refresh dashboard every 60 seconds
  setInterval(() => {
    loadAdminDashboard();
    // Also refresh chart data when dashboard refreshes
    const dashboardPage = document.getElementById("pageDashboard");
    if (dashboardPage && dashboardPage.classList.contains("active")) {
      loadChartData(chartPeriod);
    }
  }, 60000);
});

// ========== CLEANUP ==========
window.addEventListener("beforeunload", function () {
  if (adminAutoRefreshInterval) {
    clearInterval(adminAutoRefreshInterval);
    adminAutoRefreshInterval = null;
  }
});

// ========== LOAD ADMIN ORDERS ==========
let adminPreviousOrdersHash = "";

async function loadAdminOrders() {
  const container = document.getElementById("adminOrdersContainer");
  const emptyState = document.getElementById("adminOrdersEmpty");
  const loading = document.getElementById("adminOrdersLoading");

  if (loading) loading.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  try {
    const response = await fetch(`${API_URL}/orders`);
    const orders = await response.json();

    if (loading) loading.style.display = "none";

    adminAllOrdersData = orders;

    if (!orders || orders.length === 0) {
      if (container) container.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      updateAdminFilterCounts([]);
      return;
    }

    // Check if orders have changed (simple hash check)
    const currentHash = JSON.stringify(
      orders.map((o) => o._id + o.status + o.estimatedTime),
    );
    if (currentHash !== adminPreviousOrdersHash) {
      adminPreviousOrdersHash = currentHash;
      renderAdminOrderCards(orders, adminCurrentFilter);
      updateAdminFilterCounts(orders);
      // Also update dashboard stats if needed
      if (typeof loadAdminDashboard === "function") {
        // Just update stats without full reload
        updateStats(orders);
      }
    }
  } catch (error) {
    console.error("Error loading admin orders:", error);
    if (loading) loading.style.display = "none";
    showToast("Failed to load orders");
  }
}
// ========== UPDATE ADMIN FILTER COUNTS ==========
function updateAdminFilterCounts(orders) {
  // 🔥 Apply date filter first
  const dateFilteredOrders = filterOrdersByDateRange(orders);

  const total = dateFilteredOrders.length;
  const pending = dateFilteredOrders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "confirmed" ||
      o.status === "preparing" ||
      o.status === "ready",
  ).length;
  const completed = dateFilteredOrders.filter(
    (o) => o.status === "completed",
  ).length;
  const declined = dateFilteredOrders.filter(
    (o) => o.status === "declined",
  ).length;

  const countAll = document.getElementById("adminCountAll");
  const countPending = document.getElementById("adminCountPending");
  const countCompleted = document.getElementById("adminCountCompleted");
  const countDeclined = document.getElementById("adminCountDeclined");

  if (countAll) countAll.textContent = total;
  if (countPending) countPending.textContent = pending;
  if (countCompleted) countCompleted.textContent = completed;
  if (countDeclined) countDeclined.textContent = declined;
}

// ========== FILTER ADMIN ORDERS ==========
function filterAdminOrders(filter) {
  adminCurrentFilter = filter;

  document.querySelectorAll("#pageOrders .filter-tab").forEach((tab) => {
    const tabFilter = tab.dataset.filter;
    if (tabFilter === filter) {
      tab.style.background =
        tabFilter === "all"
          ? "#dc143c"
          : tabFilter === "pending"
            ? "#ffc107"
            : tabFilter === "completed"
              ? "#28a745"
              : "#dc3545";
      tab.style.color = "white";
      tab.style.borderColor = tab.style.background;
    } else {
      tab.style.background = "transparent";
      tab.style.color =
        tabFilter === "all"
          ? "#dc143c"
          : tabFilter === "pending"
            ? "#856404"
            : tabFilter === "completed"
              ? "#155724"
              : "#dc3545";
      tab.style.borderColor =
        tabFilter === "all"
          ? "#dc143c"
          : tabFilter === "pending"
            ? "#ffc107"
            : tabFilter === "completed"
              ? "#28a745"
              : "#dc3545";
    }
  });

  renderAdminOrderCards(adminAllOrdersData, filter);
}
// ========== RENDER ADMIN ORDER CARDS ==========
function renderAdminOrderCards(orders, filter = "all") {
  const container = document.getElementById("adminOrdersContainer");
  const emptyState = document.getElementById("adminOrdersEmpty");

  if (!container) return;

  // 🔥 FIRST: Apply date filter
  let dateFilteredOrders = filterOrdersByDateRange(orders);

  // 🔥 SECOND: Apply status filter
  let filteredOrders = [];

  if (filter === "all") {
    filteredOrders = dateFilteredOrders;
  } else if (filter === "pending") {
    filteredOrders = dateFilteredOrders.filter(
      (o) =>
        o.status === "pending" ||
        o.status === "confirmed" ||
        o.status === "preparing" ||
        o.status === "ready",
    );
  } else if (filter === "completed") {
    filteredOrders = dateFilteredOrders.filter((o) => o.status === "completed");
  } else if (filter === "declined") {
    filteredOrders = dateFilteredOrders.filter((o) => o.status === "declined");
  }

  const statusOrder = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
    declined: 5,
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aPriority =
      statusOrder[a.status] !== undefined ? statusOrder[a.status] : 4;
    const bPriority =
      statusOrder[b.status] !== undefined ? statusOrder[b.status] : 4;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (b.orderNumber || 0) - (a.orderNumber || 0);
  });

  if (filteredOrders.length === 0) {
    container.innerHTML = "";
    if (emptyState) {
      emptyState.style.display = "block";
      const p = emptyState.querySelector("p");
      if (p) p.textContent = `No orders found for this filter`;
    }
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  let html = "";
  if (filter === "declined") {
    html = sortedOrders
      .map((order) => generateAdminDeclinedOrderCard(order))
      .join("");
  } else {
    html = sortedOrders.map((order) => generateAdminOrderCard(order)).join("");
  }

  container.innerHTML = html;
}

// ========== GENERATE ADMIN ORDER CARD ==========
function generateAdminOrderCard(order) {
  const statusDisplay = getStatusDisplay(order.status);
  const isPending = order.status === "pending";

  return `
    <div class="order-request-card ${isPending ? "new" : ""}" data-order-id="${order._id}">
      <div class="order-request-header">
        <div class="order-status-indicator">
          <span class="status-dot ${isPending ? "new" : order.status}"></span>
          <span class="order-status-text" style="font-size: 0.95rem; font-weight: 700;">${statusDisplay}</span>
        </div>
        <div class="order-request-time" style="font-size: 0.85rem; color: #666;">${formatDateTime(order.orderedAt)}</div>
      </div>

      <div class="order-request-body">
        <div class="order-request-info">
          <div class="info-item">
            <span class="info-label">📋 ORDER #</span>
            <span class="info-value">${order.orderNumberFormatted || "#" + order.orderNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-label">👤 CUSTOMER #</span>
            <span class="info-value">${order.customerNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-label">⏱️ ETA</span>
            <span class="info-value" style="color: #dc143c;">${order.estimatedTime || "—"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">💰 TOTAL</span>
            <span class="info-value price">₱${order.totalAmount.toFixed(2)}</span>
          </div>
          <div class="info-item" style="display: flex; flex-direction: row; align-items: center; justify-content: flex-end; grid-column: 1 / -1; margin-top: 8px; padding-top: 12px; border-top: 1px solid #f0e2d2; width: 100%;">
            <span class="info-value" style="display: flex; justify-content: flex-end; gap: 8px;">
              <button class="action-btn large view" onclick="openAdminOrderDetailsModal('${order._id}')" 
                      style="padding: 10px 24px; font-size: 0.9rem; font-weight: 700; border-radius: 30px; background: #dc143c; color: white; border: none; cursor: pointer; transition: all 0.2s ease; font-family: 'Inter', sans-serif; display: inline-block; min-width: 120px;"
                      onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(220,20,60,0.4)';"
                      onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                View / Edit
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== GENERATE ADMIN DECLINED ORDER CARD ==========
function generateAdminDeclinedOrderCard(order) {
  return `
    <div class="order-request-card declined" data-order-id="${order._id}" style="
      background: #fff5f5;
      border: 1px solid #f5c6cb;
      border-left: 4px solid #dc3545;
      opacity: 0.9;
    ">
      <div class="order-request-header">
        <div class="order-status-indicator">
          <span class="status-dot declined" style="background: #dc3545; width: 20px; height: 20px; border-radius: 50%; display: inline-block;"></span>
          <span class="order-status-text" style="font-size: 0.95rem; font-weight: 700; color: #dc3545;">❌ Declined</span>
        </div>
        <div class="order-request-time" style="font-size: 0.85rem; color: #666;">${formatDateTime(order.orderedAt)}</div>
      </div>

      <div class="order-request-body">
        <div class="order-request-info">
          <div class="info-item">
            <span class="info-label">📋 ORDER #</span>
            <span class="info-value">${order.orderNumberFormatted || "#" + order.orderNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-label">👤 CUSTOMER #</span>
            <span class="info-value">${order.customerNumber}</span>
          </div>
          <div class="info-item" style="grid-column: span 1;">
            <span class="info-label">💰 TOTAL</span>
            <span class="info-value price">₱${order.totalAmount.toFixed(2)}</span>
          </div>
          <div class="info-item" style="grid-column: span 2;">
            <span class="info-label">💬 DECLINE REASON</span>
            <span class="info-value" style="font-size: 0.95rem; font-weight: 600; color: #dc3545; background: #fff0f0; padding: 6px 14px; border-radius: 8px; display: inline-block; border: 1px solid #f5c6cb;">
              ${order.declineReason || "No reason provided"}
            </span>
          </div>
          <div class="info-item" style="display: flex; flex-direction: row; align-items: center; justify-content: flex-end; grid-column: 1 / -1; margin-top: 8px; padding-top: 12px; border-top: 1px solid #f0e2d2; width: 100%;">
            <span class="info-value" style="display: flex; justify-content: flex-end;">
              <button class="action-btn view" onclick="openAdminOrderDetailsModal('${order._id}')" 
                      style="padding: 8px 20px; font-size: 0.85rem; font-weight: 600; border-radius: 30px; background: #6c757d; color: white; border: none; cursor: pointer; transition: all 0.2s ease; font-family: 'Inter', sans-serif; display: inline-block;"
                      onmouseover="this.style.transform='scale(1.05)';"
                      onmouseout="this.style.transform='scale(1)';">
                View Details
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== OPEN ADMIN ORDER DETAILS MODAL ==========
function openAdminOrderDetailsModal(orderId) {
  console.log("🔍 Opening admin order details for ID:", orderId);

  if (!adminAllOrdersData || adminAllOrdersData.length === 0) {
    showToast("⚠️ No orders loaded. Please refresh the page.");
    return;
  }

  const order = adminAllOrdersData.find((o) => o._id === orderId);
  if (!order) {
    console.error("❌ Order not found with ID:", orderId);
    showToast("Order not found");
    return;
  }

  console.log("✅ Order found:", order);

  let declineReasonHtml = "";
  if (order.status === "declined" && order.declineReason) {
    declineReasonHtml = `
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; border-top: 1px solid #e0d6cc; padding-top: 8px; margin-top: 4px;">
        <span style="color: #666;">💬 Decline Reason</span>
        <span style="font-weight: 600; color: #dc3545;">${order.declineReason}</span>
      </div>
    `;
  }

  const overlay = document.createElement("div");
  overlay.id = "adminOrderDetailsModal";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  `;

  const dietaryTags = order.dietary
    ? getStaffDietaryTags(order.dietary)
    : "None";

  const itemsHtml = order.items
    .map(
      (item) => `
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0e2d2; font-size: 0.9rem;">
      <span style="flex: 2;">${item.name}</span>
      <span style="flex: 1; text-align: center; color: #dc143c; font-weight: 600;">x${item.quantity}</span>
      <span style="flex: 1; text-align: right; font-weight: 600;">₱${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `,
    )
    .join("");

  const totalAmount =
    order.totalAmount ||
    order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let statusActions = "";
  const currentStatus = order.status || "pending";

  if (currentStatus === "pending") {
    statusActions = `
      <button onclick="adminAcceptOrder('${order._id}')" style="flex: 1; background: #28a745; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">✅ Accept Order</button>
      <button onclick="adminShowDeclineReasonModal('${order._id}')" style="flex: 1; background: #dc3545; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">❌ Decline</button>
    `;
  } else if (currentStatus === "confirmed") {
    statusActions = `
      <button onclick="adminUpdateStatusAction('${order._id}', 'preparing')" style="flex: 1; background: #ffc107; color: #212529; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">👨‍🍳 Start Preparing</button>
    `;
  } else if (currentStatus === "preparing") {
    statusActions = `
      <button onclick="adminUpdateStatusAction('${order._id}', 'ready')" style="flex: 1; background: #17a2b8; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">🛵 Mark Ready</button>
    `;
  } else if (currentStatus === "ready") {
    statusActions = `
      <button onclick="adminUpdateStatusAction('${order._id}', 'completed')" style="flex: 1; background: #28a745; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">📦 Complete Order</button>
    `;
  } else if (currentStatus === "completed") {
    statusActions = `
      <div style="flex: 1; text-align: center; padding: 0.8rem; background: #e8f5e9; border-radius: 40px; color: #2e7d32; font-weight: 600;">✅ Order Completed</div>
    `;
  } else if (currentStatus === "declined") {
    statusActions = `
      <div style="flex: 1; text-align: center; padding: 0.8rem; background: #f8d7da; border-radius: 40px; color: #721c24; font-weight: 600;">❌ Order Declined</div>
    `;
  }

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white;
    max-width: 480px;
    width: 92%;
    border-radius: 24px;
    padding: 1.8rem 1.5rem 1.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
      <h3 style="font-size: 1.3rem; font-weight: 700; color: #2c2b28;">📋 Order Details</h3>
      <button onclick="closeAdminOrderDetailsModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">✕</button>
    </div>

    <div style="background: #f8f5f0; border-radius: 16px; padding: 1rem; margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
        <span style="color: #666;">Order #</span>
        <span style="font-weight: 600;">${order.orderNumberFormatted || "#" + order.orderNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
        <span style="color: #666;">Customer #</span>
        <span style="font-weight: 600;">${order.customerNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
        <span style="color: #666;">Status</span>
        <span style="font-weight: 600; color: ${getStatusColor(order.status)};">${getStatusDisplay(order.status)}</span>
      </div>
      ${declineReasonHtml}
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; border-top: 1px solid #e0d6cc; padding-top: 8px; margin-top: 4px;">
        <span style="color: #666;">🍽️ Dietary Preferences</span>
        <div style="text-align: right;">
          ${typeof dietaryTags === "string" ? dietaryTags : dietaryTags}
        </div>
      </div>
    </div>

    <div style="margin-bottom: 1rem;">
      <div style="font-weight: 700; font-size: 0.85rem; color: #dc143c; margin-bottom: 8px; letter-spacing: 0.5px;">📋 ITEMS ORDERED</div>
      <div style="background: #faf8f5; border-radius: 12px; padding: 8px 12px;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.75rem; color: #888; padding-bottom: 6px; border-bottom: 1px solid #e0d6cc;">
          <span style="flex: 2;">Item</span>
          <span style="flex: 1; text-align: center;">Qty</span>
          <span style="flex: 1; text-align: right;">Price</span>
        </div>
        ${itemsHtml}
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0 0 0; font-weight: 800; font-size: 1.1rem; border-top: 2px solid #e0d6cc; margin-top: 8px;">
        <span>TOTAL</span>
        <span style="color: #dc143c;">₱${totalAmount.toFixed(2)}</span>
      </div>
    </div>

    ${
      currentStatus !== "declined"
        ? `
    <div style="margin-bottom: 1.2rem;">
      <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: #333;">⏱️ Estimated Time (minutes)</label>
      <div style="display: flex; gap: 8px;">
        <input type="number" id="adminEtaModalInput" value="${order.estimatedTime ? parseInt(order.estimatedTime) : 20}" 
               style="flex: 1; padding: 0.7rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;" 
               min="5" max="120">
        <button onclick="adminUpdateETAModal('${order._id}')" style="padding: 0.7rem 1.2rem; background: #17a2b8; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">Set</button>
      </div>
    </div>
    `
        : ""
    }

    <div style="display: flex; gap: 12px;">
      ${statusActions}
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  if (!document.getElementById("modalAnimations")) {
    const style = document.createElement("style");
    style.id = "modalAnimations";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

function closeAdminOrderDetailsModal() {
  const modal = document.getElementById("adminOrderDetailsModal");
  if (modal) modal.remove();
}

// ========== ADMIN ORDER ACTIONS ==========

async function adminUpdateETAModal(orderId) {
  const input = document.getElementById("adminEtaModalInput");
  if (!input) return;

  const minutes = parseInt(input.value);
  if (isNaN(minutes) || minutes < 1) {
    showToast("Please enter a valid time in minutes");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estimatedTime: `${minutes} minutes` }),
    });

    const result = await response.json();

    if (result.success) {
      showToast(`✅ ETA updated to ${minutes} minutes`);
      closeAdminOrderDetailsModal();
      loadAdminOrders();
      loadAdminDashboard();
    } else {
      showToast("Failed to update ETA");
    }
  } catch (error) {
    console.error("Error updating ETA:", error);
    showToast("Error updating ETA");
  }
}

async function adminAcceptOrder(orderId) {
  if (
    !confirm(
      "✅ Accept this order?\n\nThe order will be confirmed and preparation will begin.",
    )
  )
    return;

  try {
    const etaInput = document.getElementById("adminEtaModalInput");
    const estimatedTime = etaInput
      ? `${parseInt(etaInput.value)} minutes`
      : "20 minutes";

    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "confirmed",
        estimatedTime: estimatedTime,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showToast(`✅ Order accepted! ETA: ${estimatedTime}`);
      closeAdminOrderDetailsModal();
      loadAdminOrders();
      loadAdminDashboard();
    } else {
      showToast("Failed to accept order");
    }
  } catch (error) {
    console.error("Error accepting order:", error);
    showToast("Error accepting order");
  }
}

async function adminUpdateStatusAction(orderId, newStatus) {
  const statusMessages = {
    preparing: "👨‍🍳 Start preparing this order?",
    ready: "🛵 Mark this order as ready for pickup?",
    completed:
      "📦 Complete this order?\n\nThis will mark it as done and remove from active view.",
  };

  const confirmMessages = {
    preparing: "✅ Order will be moved to PREPARING",
    ready: "✅ Order will be marked READY for pickup",
    completed: "✅ Order will be COMPLETED and archived",
  };

  if (
    !confirm(statusMessages[newStatus] + "\n\n" + confirmMessages[newStatus])
  ) {
    return;
  }

  const etaInput = document.getElementById("adminEtaModalInput");
  const estimatedTime = etaInput ? `${parseInt(etaInput.value)} minutes` : null;

  try {
    const body = { status: newStatus };
    if (estimatedTime) {
      body.estimatedTime = estimatedTime;
    }

    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.success) {
      const successMessages = {
        preparing: "👨‍🍳 Order is now being prepared!",
        ready: "🛵 Order is ready for pickup!",
        completed: "📦 Order completed!",
      };
      showToast(
        successMessages[newStatus] ||
          `✅ Order status updated to: ${newStatus}`,
      );
      closeAdminOrderDetailsModal();
      loadAdminOrders();
      loadAdminDashboard();
    } else {
      showToast("Failed to update order status");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    showToast("Error updating order status");
  }
}

// ========== ADMIN DECLINE ORDER WITH REASON ==========

function adminShowDeclineReasonModal(orderId) {
  console.log("🔍 adminShowDeclineReasonModal called with ID:", orderId);

  if (!adminAllOrdersData || adminAllOrdersData.length === 0) {
    showToast("⚠️ No orders loaded. Please refresh the page.");
    return;
  }

  const order = adminAllOrdersData.find((o) => o._id === orderId);
  if (!order) {
    console.error("❌ Order not found with ID:", orderId);
    showToast("Order not found");
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "adminDeclineReasonModal";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.2s ease;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white;
    max-width: 450px;
    width: 92%;
    border-radius: 24px;
    padding: 2rem 1.5rem 1.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
      <h3 style="font-size: 1.3rem; font-weight: 700; color: #dc143c;">❌ Decline Order</h3>
      <button onclick="closeAdminDeclineReasonModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">✕</button>
    </div>

    <div style="background: #fef3f0; border-radius: 12px; padding: 0.8rem 1rem; margin-bottom: 1.2rem; border-left: 4px solid #dc143c;">
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
        <span style="color: #666;">Order #</span>
        <span style="font-weight: 700;">${order.orderNumberFormatted || "#" + order.orderNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 4px;">
        <span style="color: #666;">Customer</span>
        <span style="font-weight: 600;">${order.customerNumber}</span>
      </div>
    </div>

    <div style="margin-bottom: 1.2rem;">
      <label style="display: block; font-weight: 600; font-size: 0.9rem; color: #333; margin-bottom: 8px;">
        📋 Please select a reason:
      </label>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="adminDeclineReason" value="Item is out of stock" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">📦 Item is out of stock</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="adminDeclineReason" value="Ingredient unavailable" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">🥬 Ingredient unavailable</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="adminDeclineReason" value="Kitchen cannot prepare this item" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">👨‍🍳 Kitchen cannot prepare this item</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="adminDeclineReason" value="Time invalid (9am - 5pm only)" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">⏰ Time invalid (9am - 5pm only)</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="adminDeclineReason" value="Other" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">📝 Other</span>
        </label>
      </div>
    </div>

    <div id="adminOtherReasonContainer" style="display: none; margin-bottom: 1.2rem;">
      <label style="display: block; font-weight: 600; font-size: 0.85rem; color: #333; margin-bottom: 6px;">
        Please specify:
      </label>
      <textarea id="adminOtherReasonInput" rows="3" placeholder="Type your reason here..." style="
        width: 100%; 
        padding: 0.8rem; 
        border: 1.5px solid #e0e0e0; 
        border-radius: 12px; 
        font-size: 0.9rem; 
        font-family: 'Inter', sans-serif;
        resize: vertical;
        transition: border-color 0.2s;
      " onfocus="this.style.borderColor='#dc143c';" onblur="this.style.borderColor='#e0e0e0';"></textarea>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 0.5rem;">
      <button onclick="closeAdminDeclineReasonModal()" style="
        flex: 1; 
        background: #e0e0e0; 
        color: #555; 
        border: none; 
        padding: 0.8rem; 
        border-radius: 40px; 
        font-weight: 600; 
        font-size: 0.95rem; 
        cursor: pointer; 
        font-family: 'Inter', sans-serif;
        transition: all 0.2s;
      " onmouseover="this.style.background='#d0d0d0';" onmouseout="this.style.background='#e0e0e0';">Cancel</button>
      
      <button onclick="adminConfirmDeclineOrder('${order._id}')" style="
        flex: 1; 
        background: #dc143c; 
        color: white; 
        border: none; 
        padding: 0.8rem; 
        border-radius: 40px; 
        font-weight: 600; 
        font-size: 0.95rem; 
        cursor: pointer; 
        font-family: 'Inter', sans-serif;
        transition: all 0.2s;
      " onmouseover="this.style.background='#b22222';" onmouseout="this.style.background='#dc143c';">Confirm Decline</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document
    .querySelectorAll('input[name="adminDeclineReason"]')
    .forEach((radio) => {
      radio.addEventListener("change", function () {
        const otherContainer = document.getElementById(
          "adminOtherReasonContainer",
        );
        if (this.value === "Other") {
          otherContainer.style.display = "block";
          document.getElementById("adminOtherReasonInput").focus();
        } else {
          otherContainer.style.display = "none";
        }
      });
    });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeAdminDeclineReasonModal();
    }
  });
}

function closeAdminDeclineReasonModal() {
  const modal = document.getElementById("adminDeclineReasonModal");
  if (modal) modal.remove();
}

async function adminConfirmDeclineOrder(orderId) {
  const selectedRadio = document.querySelector(
    'input[name="adminDeclineReason"]:checked',
  );

  if (!selectedRadio) {
    showToast("⚠️ Please select a reason for declining the order");
    return;
  }

  let reason = selectedRadio.value;

  if (reason === "Other") {
    const otherInput = document.getElementById("adminOtherReasonInput");
    if (otherInput && otherInput.value.trim()) {
      reason = otherInput.value.trim();
    } else {
      showToast("⚠️ Please specify a reason for declining the order");
      otherInput.focus();
      return;
    }
  }

  if (
    !confirm(
      `❌ Are you sure you want to DECLINE this order?\n\nReason: ${reason}\n\nThis action cannot be undone!`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "declined",
        declineReason: reason,
        declinedAt: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      showToast(`❌ Order declined: ${reason}`);
      closeAdminDeclineReasonModal();
      const orderModal = document.getElementById("adminOrderDetailsModal");
      if (orderModal) orderModal.remove();
      loadAdminOrders();
      loadAdminDashboard();
    } else {
      showToast("Failed to decline order");
    }
  } catch (error) {
    console.error("Error declining order:", error);
    showToast("Error declining order");
  }
}

// ========== STATUS HELPERS (for admin) ==========
function getStatusDisplay(status) {
  const statusMap = {
    pending: "⏳ Pending",
    confirmed: "✅ Confirmed",
    preparing: "👨‍🍳 Preparing",
    ready: "🛵 Ready for Pickup",
    completed: "📦 Completed",
    declined: "❌ Declined",
  };
  return statusMap[status] || status;
}

function getStatusColor(status) {
  const colorMap = {
    pending: "#dc143c",
    confirmed: "#28a745",
    preparing: "#ffc107",
    ready: "#17a2b8",
    completed: "#6c757d",
    declined: "#dc3545",
  };
  return colorMap[status] || "#333";
}

function formatDateTime(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStaffDietaryTags(dietary) {
  const tags = [];
  if (dietary.vegetarian) tags.push("🌱 Vegetarian");
  if (dietary.vegan) tags.push("🌿 Vegan");
  if (dietary.glutenFree) tags.push("🚫 Gluten-Free");
  if (dietary.pescatarian) tags.push("🐟 Pescatarian");
  if (dietary.lowCarb) tags.push("🥗 Low-Carb");
  if (dietary.highProtein) tags.push("💪 High-Protein");

  if (tags.length === 0) {
    return '<span style="color: #999; font-size: 0.75rem;">None</span>';
  }

  return tags
    .map(
      (tag) => `
    <span style="
      display: inline-block;
      background: #f0ede8;
      padding: 1px 8px;
      border-radius: 12px;
      font-size: 0.65rem;
      font-weight: 500;
      color: #555;
      margin: 1px 2px;
    ">${tag}</span>
  `,
    )
    .join("");
}

// ============================================================
// ========== SALES OVERVIEW CHART ==========
// ============================================================

let chartPeriod = "daily";
let salesChart = null;
let chartData = {};

// ========== LOAD CHART DATA ==========
async function loadChartData(period = "daily") {
  chartPeriod = period;

  try {
    const response = await fetch(`${API_URL}/orders`);
    const orders = await response.json();

    if (!orders || orders.length === 0) {
      const container = document.getElementById("chartContainer");
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #888;">
            <span style="font-size: 3rem;">📊</span>
            <p>No sales data available yet</p>
            <p style="font-size: 0.85rem;">Orders will appear here when customers place them</p>
          </div>
        `;
      }
      return;
    }

    // Process data based on period
    const processedData = processChartData(orders, period);
    chartData = processedData;

    // Render the chart
    renderChart(processedData, period);

    // Update filter buttons
    document.querySelectorAll(".chart-filter").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.period === period);
    });
  } catch (error) {
    console.error("Error loading chart data:", error);
    const container = document.getElementById("chartContainer");
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #dc3545;">
          <span style="font-size: 3rem;">⚠️</span>
          <p>Failed to load chart data</p>
        </div>
      `;
    }
  }
}

// ========== PROCESS CHART DATA ==========
function processChartData(orders, period) {
  const now = new Date();
  const labels = [];
  const data = [];
  const colors = [];

  // Only include completed orders for revenue
  const completedOrders = orders.filter(
    (o) =>
      o.status === "completed" ||
      o.status === "ready" ||
      o.status === "confirmed",
  );

  if (period === "daily") {
    // Last 7 days (oldest to newest, left to right)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      labels.push(dateStr);

      const dayOrders = completedOrders.filter((o) => {
        const orderDate = new Date(o.orderedAt);
        return orderDate.toDateString() === date.toDateString();
      });
      const total = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      data.push(Math.round(total));
      colors.push(total > 0 ? "#dc143c" : "#e0e0e0");
    }
  } else if (period === "weekly") {
    // Last 6 weeks (oldest to newest, left to right)
    const weekStarts = [];

    // First, collect all week start dates from oldest to newest
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      // Get the start of the week (Sunday)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - 7 * i);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      weekStarts.push({ weekStart, weekEnd });
    }

    // Now process them in chronological order (oldest first)
    weekStarts.forEach((week, index) => {
      const label = `Week ${index + 1}`;
      labels.push(label);

      const weekOrders = completedOrders.filter((o) => {
        const orderDate = new Date(o.orderedAt);
        return orderDate >= week.weekStart && orderDate <= week.weekEnd;
      });

      const total = weekOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );
      data.push(Math.round(total));
      colors.push(total > 0 ? "#dc143c" : "#e0e0e0");
    });
  } else if (period === "monthly") {
    // Last 6 months (oldest to newest, left to right)
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = month.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      labels.push(label);

      const nextMonth = new Date(month);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthOrders = completedOrders.filter((o) => {
        const orderDate = new Date(o.orderedAt);
        return orderDate >= month && orderDate < nextMonth;
      });
      const total = monthOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );
      data.push(Math.round(total));
      colors.push(total > 0 ? "#dc143c" : "#e0e0e0");
    }
  }

  return { labels, data, colors, maxValue: Math.max(...data, 100) };
}
// ========== RENDER CHART ==========
function renderChart(processedData, period) {
  const container = document.getElementById("chartContainer");
  if (!container) return;

  const { labels, data, colors, maxValue } = processedData;

  if (data.every((d) => d === 0)) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #888;">
        <span style="font-size: 3rem;">📊</span>
        <p>No sales data for this period</p>
        <p style="font-size: 0.85rem;">Complete orders will appear here</p>
      </div>
    `;
    return;
  }

  const barWidth = Math.min(
    60,
    Math.floor(container.clientWidth / labels.length / 2),
  );
  const chartHeight = 180;

  let barsHtml = labels
    .map((label, index) => {
      const heightPercent =
        data[index] > 0 ? (data[index] / maxValue) * 100 : 0;
      const barHeight = Math.max(4, (heightPercent / 100) * chartHeight);
      const isActive = data[index] > 0;

      return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 40px;
      ">
        <div style="
          position: relative;
          height: ${chartHeight}px;
          width: ${barWidth}px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          cursor: ${isActive ? "pointer" : "default"};
        " onclick="${isActive ? `showTooltip('${label}', ${data[index]})` : ""}">
          <div style="
            height: ${barHeight}px;
            width: 100%;
            background: ${colors[index]};
            border-radius: 4px 4px 0 0;
            transition: all 0.3s ease;
            position: relative;
            min-height: 4px;
          " onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
            ${
              data[index] > 0
                ? `
              <div style="
                position: absolute;
                top: -18px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.6rem;
                font-weight: 700;
                color: #333;
                white-space: nowrap;
              ">₱${data[index]}</div>
            `
                : ""
            }
          </div>
        </div>
        <div style="
          font-size: 0.6rem;
          color: #888;
          margin-top: 6px;
          text-align: center;
          max-width: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        ">${label}</div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = `
    <div style="
      width: 100%;
      padding: 0.5rem 0;
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        padding: 0 0.5rem;
      ">
        <span style="font-size: 0.7rem; color: #888;">
          ${period === "daily" ? "Daily Sales" : period === "weekly" ? "Weekly Sales" : "Monthly Sales"}
        </span>
        <span style="font-size: 0.7rem; color: #888;">
          Total: ₱${data.reduce((a, b) => a + b, 0)}
        </span>
      </div>
      <div style="
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        height: ${chartHeight + 50}px;
        padding: 0 0.5rem;
        background: #faf8f5;
        border-radius: 12px;
        border: 1px solid #f0e2d2;
        padding-top: 20px;
        padding-bottom: 10px;
      ">
        ${barsHtml}
      </div>
    </div>
  `;
}

// ========== SHOW TOOLTIP ==========
function showTooltip(label, value) {
  showToast(`📊 ${label}: ₱${value}`);
}

// ========== SET CHART PERIOD ==========
function setChartPeriod(period) {
  chartPeriod = period;
  document.querySelectorAll(".chart-filter").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.period === period);
  });
  loadChartData(period);
}

// ============================================================
// ========== ORDER MANAGEMENT DATE FILTER ==========
// ============================================================

let ordersDateFilter = "all";
let ordersCustomDateFrom = null;
let ordersCustomDateTo = null;

// ========== APPLY ORDERS DATE FILTER ==========
function applyOrdersDateFilter() {
  const filterSelect = document.getElementById("ordersDateFilter");
  if (!filterSelect) return;

  ordersDateFilter = filterSelect.value;

  const customRange = document.getElementById("ordersCustomDateRange");
  if (ordersDateFilter === "custom") {
    if (customRange) customRange.style.display = "flex";
    const fromInput = document.getElementById("ordersCustomDateFrom");
    const toInput = document.getElementById("ordersCustomDateTo");

    if (fromInput && fromInput.value) {
      ordersCustomDateFrom = fromInput.value;
    }
    if (toInput && toInput.value) {
      ordersCustomDateTo = toInput.value;
    }

    if (!ordersCustomDateFrom) {
      const today = new Date().toISOString().split("T")[0];
      fromInput.value = today;
      ordersCustomDateFrom = today;
    }
    if (!ordersCustomDateTo) {
      const today = new Date().toISOString().split("T")[0];
      toInput.value = today;
      ordersCustomDateTo = today;
    }
  } else {
    if (customRange) customRange.style.display = "none";
    ordersCustomDateFrom = null;
    ordersCustomDateTo = null;
  }

  const range = getOrdersDateRange(ordersDateFilter);
  const filterLabel = document.getElementById("ordersFilterDateLabel");
  if (filterLabel) filterLabel.textContent = range.label;

  renderAdminOrderCards(adminAllOrdersData, adminCurrentFilter);
  updateAdminFilterCounts(adminAllOrdersData);
}

// ========== APPLY CUSTOM DATE RANGE ==========
function applyOrdersCustomDateRange() {
  const fromInput = document.getElementById("ordersCustomDateFrom");
  const toInput = document.getElementById("ordersCustomDateTo");

  if (!fromInput || !toInput) {
    showToast("⚠️ Please select both From and To dates");
    return;
  }

  if (!fromInput.value || !toInput.value) {
    showToast("⚠️ Please select both From and To dates");
    return;
  }

  const fromDate = new Date(fromInput.value);
  const toDate = new Date(toInput.value);

  if (fromDate > toDate) {
    showToast("⚠️ 'From' date cannot be later than 'To' date");
    return;
  }

  ordersCustomDateFrom = fromInput.value;
  ordersCustomDateTo = toInput.value;

  const filterSelect = document.getElementById("ordersDateFilter");
  if (filterSelect) {
    filterSelect.value = "custom";
    ordersDateFilter = "custom";
  }

  const range = getOrdersDateRange("custom");
  const filterLabel = document.getElementById("ordersFilterDateLabel");
  if (filterLabel) filterLabel.textContent = range.label;

  renderAdminOrderCards(adminAllOrdersData, adminCurrentFilter);
  updateAdminFilterCounts(adminAllOrdersData);

  showToast(
    `✅ Showing orders from ${formatDateDisplay(fromDate)} to ${formatDateDisplay(toDate)}`,
  );
}

// ========== GET ORDERS DATE RANGE ==========
function getOrdersDateRange(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from = new Date(today);
  let to = new Date(today);
  let label = "";

  switch (filter) {
    case "all":
      from = new Date(2000, 0, 1); // Far past
      to = new Date(2100, 11, 31); // Far future
      label = "All Time";
      break;
    case "today":
      from = new Date(today);
      to = new Date(today);
      label = "Today";
      break;
    case "yesterday":
      from = new Date(today);
      from.setDate(from.getDate() - 1);
      to = new Date(from);
      label = "Yesterday";
      break;
    case "thisweek":
      from = new Date(today);
      from.setDate(from.getDate() - from.getDay());
      to = new Date(today);
      label = "This Week";
      break;
    case "thismonth":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(today);
      label = "This Month";
      break;
    case "thisyear":
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(today);
      label = "This Year";
      break;
    case "custom":
      if (ordersCustomDateFrom && ordersCustomDateTo) {
        from = new Date(ordersCustomDateFrom);
        to = new Date(ordersCustomDateTo);
        to.setHours(23, 59, 59, 999);
        label = `${formatDateDisplay(from)} - ${formatDateDisplay(to)}`;
      } else {
        from = new Date(today);
        to = new Date(today);
        label = "Custom Date";
      }
      break;
    default:
      from = new Date(2000, 0, 1);
      to = new Date(2100, 11, 31);
      label = "All Time";
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to, label };
}

// ========== FILTER ORDERS BY DATE RANGE ==========
function filterOrdersByDateRange(orders) {
  if (ordersDateFilter === "all") {
    return orders;
  }

  const range = getOrdersDateRange(ordersDateFilter);

  return orders.filter((order) => {
    const orderDate = new Date(order.orderedAt);
    return orderDate >= range.from && orderDate <= range.to;
  });
}
