// ========== STAFF DASHBOARD SCRIPT ==========

// Changed this line
// From: const API_URL = "/api";
// To:   const API_URL = "http://localhost:3000/api";

const API_URL = "https://your-backend-url.onrender.com/api";

console.log("🔗 API URL:", API_URL);
// ========== GLOBAL VARIABLES ==========
let allOrders = [];
let allOrdersData = [];
let currentFilter = "all";

// ========== DATE FILTER VARIABLES ==========
let currentDateFilter = "today";
let customDateFrom = null;
let customDateTo = null;
let filteredOrdersData = [];

// ============================================================
// ========== SESSION & AUTHENTICATION ==========
// ============================================================

// ========== SESSION CHECK ==========
function checkStaffSession() {
  const loggedIn = sessionStorage.getItem("staffLoggedIn");
  const role = sessionStorage.getItem("staffRole");
  const name = sessionStorage.getItem("staffName") || "Staff";

  if (loggedIn !== "true" || role !== "staff") {
    window.location.href = "staff-login.html";
    return false;
  }

  updateRoleDisplay();
  return true;
}

// ========== LOGOUT ==========
function staffLogout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("staffLoggedIn");
    sessionStorage.removeItem("staffRole");
    sessionStorage.removeItem("staffName");
    sessionStorage.removeItem("staffUsername");
    window.location.href = "staff-login.html";
  }
}

// ============================================================
// ========== ORDER LOADING & STATS ==========
// ============================================================

// ========== LOAD ORDERS ==========
async function loadStaffOrders() {
  const loading = document.getElementById("staffLoading");
  const emptyState = document.getElementById("staffEmptyState");
  const tableBody = document.getElementById("staffTableBody");
  const ordersContainer = document.getElementById("staffOrdersContainer");
  const ordersEmpty = document.getElementById("staffOrdersEmpty");
  const ordersLoading = document.getElementById("staffOrdersLoading");

  if (loading) loading.style.display = "block";
  if (emptyState) emptyState.style.display = "none";
  if (ordersEmpty) ordersEmpty.style.display = "none";
  if (ordersLoading) ordersLoading.style.display = "block";

  try {
    const url = `${API_URL}/orders`;
    console.log("🔄 Fetching orders from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response statusText:", response.statusText);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("📦 Orders received:", data.length);

    allOrdersData = data;
    allOrders = data;

    if (loading) loading.style.display = "none";
    if (ordersLoading) ordersLoading.style.display = "none";

    if (!allOrdersData || allOrdersData.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      if (ordersEmpty) ordersEmpty.style.display = "block";
      if (tableBody) tableBody.innerHTML = "";
      if (ordersContainer) ordersContainer.innerHTML = "";
      updateStats([]);
      updateFilterCounts([]);
      return;
    }

    // Apply dashboard filter (default: today)
    const range = getDateRange(currentDateFilter);
    const filterLabel = document.getElementById("filterDateLabel");
    if (filterLabel) filterLabel.textContent = range.label;
    filterDashboardOrders(range.from, range.to);

    // Update order management
    renderOrderRequests(allOrdersData, currentFilter);
    updateFilterCounts(allOrdersData);
  } catch (error) {
    console.error("❌ Error loading orders:", error);
    if (loading) loading.style.display = "none";
    if (ordersLoading) ordersLoading.style.display = "none";

    // Show detailed error
    if (ordersContainer) {
      ordersContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: #fff5f5; border-radius: 12px; border: 1px solid #f5c6cb;">
          <span style="font-size: 2rem;">⚠️</span>
          <p style="color: #dc3545; font-weight: 600; margin: 0.5rem 0;">Failed to load orders from server</p>
          <p style="font-size: 0.85rem; color: #888; max-width: 500px; margin: 0 auto;">
            ${error.message}
          </p>
          <p style="font-size: 0.8rem; color: #666; margin-top: 8px;">
            API URL: ${API_URL}/orders
          </p>
          <div style="margin-top: 1rem; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="loadStaffOrders()" style="padding: 8px 24px; background: #dc143c; color: white; border: none; border-radius: 30px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600;">Retry</button>
            <button onclick="testServerConnection()" style="padding: 8px 24px; background: #17a2b8; color: white; border: none; border-radius: 30px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600;">Test Connection</button>
          </div>
        </div>
      `;
    }
  }
}

// ========== TEST SERVER CONNECTION ==========
async function testServerConnection() {
  try {
    console.log("🔍 Testing server connection...");
    showToast("⏳ Testing connection to server...");

    // Test health endpoint
    const healthResponse = await fetch(`${API_URL}/health`);
    console.log("📡 Health response:", healthResponse.status);
    const healthData = await healthResponse.json();
    console.log("✅ Server health:", healthData);

    // Test orders endpoint
    const ordersResponse = await fetch(`${API_URL}/orders`);
    console.log("📡 Orders response:", ordersResponse.status);
    const ordersData = await ordersResponse.json();
    console.log("✅ Orders:", ordersData.length);

    showToast(`✅ Server is running! (Orders: ${ordersData.length})`);

    // Try loading orders again
    setTimeout(() => loadStaffOrders(), 500);
  } catch (error) {
    console.error("❌ Server connection failed:", error);
    showToast(`❌ Cannot connect to server: ${error.message}`);

    alert(
      `Server Connection Failed!\n\nError: ${error.message}\n\nMake sure:\n1. Server is running (node server.js)\n2. Server is on port 3000\n3. API URL is correct: ${API_URL}\n4. No firewall blocking the connection`,
    );
  }
}

// ========== UPDATE STATS ==========
function updateStats(orders) {
  const pending = orders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "confirmed" ||
      o.status === "preparing" ||
      o.status === "ready",
  ).length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const statPending = document.getElementById("statPending");
  const statCompleted = document.getElementById("statCompleted");
  const statRevenue = document.getElementById("statRevenue");

  if (statPending) statPending.textContent = pending;
  if (statCompleted) statCompleted.textContent = completed;
  if (statRevenue) statRevenue.textContent = `₱${totalRevenue}`;
}

// ============================================================
// ========== TABLE RENDERING ==========
// ============================================================

// ========== RENDER TABLE ==========
function renderTable(orders) {
  const tableBody = document.getElementById("staffTableBody");
  const emptyState = document.getElementById("staffEmptyState");
  if (!tableBody) return;

  const statusOrder = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
  };
  const sortedOrders = [...orders].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
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

// ========== RENDER FILTERED TABLE ==========
function renderFilteredTable(orders) {
  const tableBody = document.getElementById("staffTableBody");
  if (!tableBody) return;

  if (!orders || orders.length === 0) {
    tableBody.innerHTML = "";
    return;
  }

  const statusOrder = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
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

// ============================================================
// ========== DATE FORMATTING HELPERS ==========
// ============================================================

function formatDateOnly(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateDisplay(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================
// ========== STATUS HELPERS ==========
// ============================================================

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

function updateCustomDates() {
  const fromInput = document.getElementById("customDateFrom");
  const toInput = document.getElementById("customDateTo");

  if (fromInput && fromInput.value) {
    customDateFrom = fromInput.value;
  }
  if (toInput && toInput.value) {
    customDateTo = toInput.value;
  }
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

function filterDashboardOrders(fromDate, toDate) {
  const tableBody = document.getElementById("staffTableBody");
  const emptyState = document.getElementById("staffEmptyState");

  if (!allOrdersData || allOrdersData.length === 0) {
    if (tableBody) tableBody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  const filteredOrders = allOrdersData.filter((order) => {
    const orderDate = new Date(order.orderedAt);
    return orderDate >= fromDate && orderDate <= toDate;
  });

  filteredOrdersData = filteredOrders;

  updateStats(filteredOrders);
  renderFilteredTable(filteredOrders);
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

function initDashboardFilter() {
  const filterSelect = document.getElementById("dashboardDateFilter");
  if (filterSelect) {
    filterSelect.value = "today";
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
  filterDashboardOrders(range.from, range.to);

  updateDashboardDateRangeDisplay(range.from, range.to);
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
// ========== ORDER DETAILS MODAL ==========
// ============================================================

function openOrderDetailsModal(orderId) {
  console.log("🔍 Opening order details for ID:", orderId);

  if (!allOrdersData || allOrdersData.length === 0) {
    showToast("⚠️ No orders loaded. Please refresh the page.");
    return;
  }

  const order = allOrdersData.find((o) => o._id === orderId);
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
  overlay.id = "orderDetailsModal";
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
      <button onclick="acceptOrder('${order._id}')" style="flex: 1; background: #28a745; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">✅ Accept Order</button>
      <button onclick="showDeclineReasonModal('${order._id}')" style="flex: 1; background: #dc3545; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">❌ Decline</button>
    `;
  } else if (currentStatus === "confirmed") {
    statusActions = `
      <button onclick="updateStatusAction('${order._id}', 'preparing')" style="flex: 1; background: #ffc107; color: #212529; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">👨‍🍳 Start Preparing</button>
    `;
  } else if (currentStatus === "preparing") {
    statusActions = `
      <button onclick="updateStatusAction('${order._id}', 'ready')" style="flex: 1; background: #17a2b8; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">🛵 Mark Ready</button>
    `;
  } else if (currentStatus === "ready") {
    statusActions = `
      <button onclick="updateStatusAction('${order._id}', 'completed')" style="flex: 1; background: #28a745; color: white; border: none; padding: 0.8rem; border-radius: 40px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">📦 Complete Order</button>
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
      <button onclick="closeOrderDetailsModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">✕</button>
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
        <input type="number" id="etaModalInput" value="${order.estimatedTime ? parseInt(order.estimatedTime) : 20}" 
               style="flex: 1; padding: 0.7rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;" 
               min="5" max="120">
        <button onclick="updateETAModal('${order._id}')" style="padding: 0.7rem 1.2rem; background: #17a2b8; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">Set</button>
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

function closeOrderDetailsModal() {
  const modal = document.getElementById("orderDetailsModal");
  if (modal) modal.remove();
}

// ============================================================
// ========== ORDER ACTIONS ==========
// ============================================================

async function updateETAModal(orderId) {
  const input = document.getElementById("etaModalInput");
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
      closeOrderDetailsModal();
      loadStaffOrders();
    } else {
      showToast("Failed to update ETA");
    }
  } catch (error) {
    console.error("Error updating ETA:", error);
    showToast("Error updating ETA");
  }
}

async function acceptOrder(orderId) {
  if (
    !confirm(
      "✅ Accept this order?\n\nThe order will be confirmed and preparation will begin.",
    )
  )
    return;

  try {
    const etaInput = document.getElementById("etaModalInput");
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
      closeOrderDetailsModal();
      loadStaffOrders();
    } else {
      showToast("Failed to accept order");
    }
  } catch (error) {
    console.error("Error accepting order:", error);
    showToast("Error accepting order");
  }
}

async function updateStatusAction(orderId, newStatus) {
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

  const etaInput = document.getElementById("etaModalInput");
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
      closeOrderDetailsModal();
      loadStaffOrders();
    } else {
      showToast("Failed to update order status");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    showToast("Error updating order status");
  }
}

async function updateOrderStatus(orderId, newStatus) {
  const statusDisplay = {
    confirmed: "✅ Confirm this order?",
    preparing: "👨‍🍳 Start preparing this order?",
    ready: "🛵 Mark this order as ready for pickup?",
    completed: "📦 Complete this order?",
  };

  const confirmDisplay = {
    confirmed: "✅ Order will be confirmed",
    preparing: "✅ Order will be moved to PREPARING",
    ready: "✅ Order will be marked READY for pickup",
    completed: "✅ Order will be COMPLETED",
  };

  if (!confirm(statusDisplay[newStatus] + "\n\n" + confirmDisplay[newStatus])) {
    return;
  }

  try {
    const etaInput = document.getElementById(`etaInput_${orderId}`);
    const estimatedTime = etaInput
      ? `${parseInt(etaInput.value)} minutes`
      : null;

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
        confirmed: "✅ Order confirmed!",
        preparing: "👨‍🍳 Order is now being prepared!",
        ready: "🛵 Order is ready for pickup!",
        completed: "📦 Order completed!",
      };
      showToast(
        successMessages[newStatus] ||
          `✅ Order status updated to: ${newStatus}`,
      );
      loadStaffOrders();
    } else {
      showToast("Failed to update order status");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    showToast("Error updating order status");
  }
}

async function updateETA(orderId) {
  const input = document.getElementById(`etaInput_${orderId}`);
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
      loadStaffOrders();
    } else {
      showToast("Failed to update ETA");
    }
  } catch (error) {
    console.error("Error updating ETA:", error);
    showToast("Error updating ETA");
  }
}

function getOrderActionButton(order) {
  const status = order.status || "pending";
  switch (status) {
    case "pending":
      return `<button class="action-btn confirm" onclick="updateOrderStatus('${order._id}', 'confirmed')">Confirm</button>`;
    case "confirmed":
      return `<button class="action-btn preparing" onclick="updateOrderStatus('${order._id}', 'preparing')">Prepare</button>`;
    case "preparing":
      return `<button class="action-btn ready" onclick="updateOrderStatus('${order._id}', 'ready')">Ready</button>`;
    case "ready":
      return `<button class="action-btn complete" onclick="updateOrderStatus('${order._id}', 'completed')">Complete</button>`;
    case "completed":
      return `<span class="action-btn done">✅ Done</span>`;
    default:
      return "";
  }
}

function showStaffOrderDetails(orderId) {
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

// ============================================================
// ========== DECLINE ORDER WITH REASON ==========
// ============================================================

function showDeclineReasonModal(orderId) {
  console.log("🔍 showDeclineReasonModal called with ID:", orderId);

  if (!allOrdersData || allOrdersData.length === 0) {
    showToast("⚠️ No orders loaded. Please refresh the page.");
    return;
  }

  const order = allOrdersData.find((o) => o._id === orderId);
  if (!order) {
    console.error("❌ Order not found with ID:", orderId);
    showToast("Order not found");
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "declineReasonModal";
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
      <button onclick="closeDeclineReasonModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">✕</button>
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
          <input type="radio" name="declineReason" value="Item is out of stock" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">📦 Item is out of stock</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="declineReason" value="Ingredient unavailable" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">🥬 Ingredient unavailable</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="declineReason" value="Kitchen cannot prepare this item" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">👨‍🍳 Kitchen cannot prepare this item</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="declineReason" value="Time invalid (9am - 5pm only)" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">⏰ Time invalid (9am - 5pm only)</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa;" 
               onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
               onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';">
          <input type="radio" name="declineReason" value="Other" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
          <span style="font-size: 0.9rem;">📝 Other</span>
        </label>
      </div>
    </div>

    <div id="otherReasonContainer" style="display: none; margin-bottom: 1.2rem;">
      <label style="display: block; font-weight: 600; font-size: 0.85rem; color: #333; margin-bottom: 6px;">
        Please specify:
      </label>
      <textarea id="otherReasonInput" rows="3" placeholder="Type your reason here..." style="
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
      <button onclick="closeDeclineReasonModal()" style="
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
      
      <button onclick="confirmDeclineOrder('${order._id}')" style="
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

  document.querySelectorAll('input[name="declineReason"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const otherContainer = document.getElementById("otherReasonContainer");
      if (this.value === "Other") {
        otherContainer.style.display = "block";
        document.getElementById("otherReasonInput").focus();
      } else {
        otherContainer.style.display = "none";
      }
    });
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeDeclineReasonModal();
    }
  });
}

function closeDeclineReasonModal() {
  const modal = document.getElementById("declineReasonModal");
  if (modal) modal.remove();
}

async function confirmDeclineOrder(orderId) {
  const selectedRadio = document.querySelector(
    'input[name="declineReason"]:checked',
  );

  if (!selectedRadio) {
    showToast("⚠️ Please select a reason for declining the order");
    return;
  }

  let reason = selectedRadio.value;

  if (reason === "Other") {
    const otherInput = document.getElementById("otherReasonInput");
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
      closeDeclineReasonModal();
      const orderModal = document.getElementById("orderDetailsModal");
      if (orderModal) orderModal.remove();
      loadStaffOrders();
    } else {
      showToast("Failed to decline order");
    }
  } catch (error) {
    console.error("Error declining order:", error);
    showToast("Error declining order");
  }
}

// ============================================================
// ========== ORDER FILTERING ==========
// ============================================================

function updateFilterCounts(orders) {
  const total = orders.length;
  const pending = orders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "confirmed" ||
      o.status === "preparing" ||
      o.status === "ready",
  ).length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const declined = orders.filter((o) => o.status === "declined").length;

  const countAll = document.getElementById("countAll");
  const countPending = document.getElementById("countPending");
  const countCompleted = document.getElementById("countCompleted");
  const countDeclined = document.getElementById("countDeclined");

  if (countAll) countAll.textContent = total;
  if (countPending) countPending.textContent = pending;
  if (countCompleted) countCompleted.textContent = completed;
  if (countDeclined) countDeclined.textContent = declined;
}

function filterOrders(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filter-tab").forEach((tab) => {
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

  renderOrderRequests(allOrdersData, filter);
}

function renderOrderRequests(orders, filter = "all") {
  const container = document.getElementById("staffOrdersContainer");
  const emptyState = document.getElementById("staffOrdersEmpty");

  if (!container) return;

  let filteredOrders = [];

  if (filter === "all") {
    filteredOrders = orders;
  } else if (filter === "pending") {
    filteredOrders = orders.filter(
      (o) =>
        o.status === "pending" ||
        o.status === "confirmed" ||
        o.status === "preparing" ||
        o.status === "ready",
    );
  } else if (filter === "completed") {
    filteredOrders = orders.filter((o) => o.status === "completed");
  } else if (filter === "declined") {
    filteredOrders = orders.filter((o) => o.status === "declined");
  }

  const statusOrder = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
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
      if (p) p.textContent = `No ${filter} orders found`;
    }
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  let html = "";
  if (filter === "declined") {
    html = sortedOrders
      .map((order) => generateDeclinedOrderCard(order))
      .join("");
  } else {
    html = sortedOrders.map((order) => generateOrderCard(order)).join("");
  }

  container.innerHTML = html;
}

// ============================================================
// ========== ORDER CARD GENERATORS ==========
// ============================================================

function generateOrderCard(order) {
  return `
    <div class="order-request-card ${order.status === "pending" ? "new" : ""}" data-order-id="${order._id}">
      <div class="order-request-header">
        <div class="order-status-indicator">
          <span class="status-dot ${order.status === "pending" ? "new" : order.status}"></span>
          <span class="order-status-text" style="font-size: 0.95rem; font-weight: 700;">${getStatusDisplay(order.status)}</span>
        </div>
        <div class="order-request-time" style="font-size: 0.85rem; color: #666;">${formatDateTime(order.orderedAt)}</div>
      </div>

      <div class="order-request-body">
        <div class="order-request-info">
          <div class="info-item">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">📋 ORDER #</span>
            <span class="info-value" style="font-size: 1.1rem; font-weight: 700; color: #2c2b28;">${order.orderNumberFormatted || "#" + order.orderNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">👤 CUSTOMER #</span>
            <span class="info-value" style="font-size: 1rem; font-weight: 600; color: #2c2b28;">${order.customerNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">⏱️ ETA</span>
            <span class="info-value" style="font-size: 1rem; font-weight: 600; color: #dc143c;">${order.estimatedTime || "—"}</span>
          </div>
          <div class="info-item">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">💰 TOTAL</span>
            <span class="info-value price" style="font-size: 1.2rem; font-weight: 800; color: #dc143c;">₱${order.totalAmount.toFixed(2)}</span>
          </div>
          <div class="info-item" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; grid-column: 1 / -1; margin-top: 8px; padding-top: 12px; border-top: 1px solid #f0e2d2; width: 100%;">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">⚡ ACTIONS</span>
            <span class="info-value" style="display: flex; justify-content: flex-end;">
              <button class="action-btn large view" onclick="openOrderDetailsModal('${order._id}')" 
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

function generateDeclinedOrderCard(order) {
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
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">📋 ORDER #</span>
            <span class="info-value" style="font-size: 1.1rem; font-weight: 700; color: #2c2b28;">${order.orderNumberFormatted || "#" + order.orderNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">👤 CUSTOMER #</span>
            <span class="info-value" style="font-size: 1rem; font-weight: 600; color: #2c2b28;">${order.customerNumber}</span>
          </div>
          <div class="info-item" style="grid-column: span 1;">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">💰 TOTAL</span>
            <span class="info-value price" style="font-size: 1.2rem; font-weight: 800; color: #dc143c;">₱${order.totalAmount.toFixed(2)}</span>
          </div>
          <div class="info-item" style="grid-column: span 2;">
            <span class="info-label" style="font-size: 0.85rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">💬 DECLINE REASON</span>
            <span class="info-value" style="font-size: 0.95rem; font-weight: 600; color: #dc3545; background: #fff0f0; padding: 6px 14px; border-radius: 8px; display: inline-block; border: 1px solid #f5c6cb;">
              ${order.declineReason || "No reason provided"}
            </span>
          </div>
          <div class="info-item" style="display: flex; flex-direction: row; align-items: center; justify-content: flex-end; grid-column: 1 / -1; margin-top: 8px; padding-top: 12px; border-top: 1px solid #f0e2d2; width: 100%;">
            <span class="info-value" style="display: flex; justify-content: flex-end;">
              <button class="action-btn view" onclick="openOrderDetailsModal('${order._id}')" 
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

// ============================================================
// ========== DIETARY TAGS ==========
// ============================================================

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
// ========== TOAST ==========
// ============================================================

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
    max-width: 90%;
    text-align: center;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================================
// ========== SIDEBAR FUNCTIONS ==========
// ============================================================

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

function updateRoleDisplay() {
  const role = sessionStorage.getItem("staffRole") || "staff";
  const name = sessionStorage.getItem("staffName") || "Service Crew";
  const roleDisplay = document.getElementById("roleNameDisplay");
  const nameDisplay = document.getElementById("staffNameDisplay");

  if (roleDisplay) {
    roleDisplay.textContent =
      role === "admin" ? "Administrator" : "Service Crew";
  }

  if (nameDisplay) {
    nameDisplay.textContent = `👋 Hello, ${name}`;
  }
}

function initSidebarNavigation() {
  const sidebarBtns = document.querySelectorAll(".sidebar-btn");
  const pages = {
    dashboard: "pageDashboard",
    orders: "pageOrders",
    menu: "pageMenu",
  };
  const titles = {
    dashboard: "📊 Dashboard",
    orders: "📦 Order Management",
    menu: "🍽️ Menu Management",
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
// ========== MENU MANAGEMENT FUNCTIONS ==========
// ============================================================

async function loadMenuItems() {
  const tableBody = document.getElementById("staffMenuBody");
  const emptyState = document.getElementById("staffMenuEmpty");
  const loading = document.getElementById("staffMenuLoading");

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
          <button class="action-btn view" onclick="editMenuItem('${item._id}')">Edit</button>
          <button class="action-btn complete" onclick="deleteMenuItem('${item._id}')" style="background: #dc3545;">Delete</button>
        </td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading menu:", error);
    if (loading) loading.style.display = "none";
    showToast("Failed to load menu items");
  }
}

function editMenuItem(itemId) {
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
        <form id="editMenuItemForm">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px;">Menu Name *</label>
            <input type="text" id="editMenuNameInput" value="${item.name}" required style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px;">Category *</label>
            <select id="editMenuCategoryInput" style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
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
            <input type="number" id="editMenuPriceInput" value="${item.price}" required min="1" step="1" style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px;">Availability</label>
            <select id="editMenuAvailabilityInput" style="width: 100%; padding: 0.8rem; border: 1.5px solid #e0e0e0; border-radius: 12px; font-size: 1rem; font-family: inherit;">
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
        .getElementById("editMenuItemForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          await updateMenuItem(itemId);
        });
    })
    .catch((error) => {
      console.error("Error fetching item:", error);
      showToast("Error loading item details");
    });
}

async function updateMenuItem(itemId) {
  const name = document.getElementById("editMenuNameInput").value.trim();
  const category = document.getElementById("editMenuCategoryInput").value;
  const price = parseInt(document.getElementById("editMenuPriceInput").value);
  const available =
    document.getElementById("editMenuAvailabilityInput").value === "true";

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
      loadMenuItems();
    } else {
      showToast("Failed to update menu item");
    }
  } catch (error) {
    console.error("Error updating menu item:", error);
    showToast("Error updating menu item");
  }
}

async function deleteMenuItem(itemId) {
  if (!confirm("Are you sure you want to delete this menu item?")) return;

  try {
    const response = await fetch(`${API_URL}/menu/${itemId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showToast("✅ Menu item deleted successfully!");
      loadMenuItems();
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
// ========== INITIALIZE ==========
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");

  if (!checkStaffSession()) return;

  // Initialize dashboard date filter
  initDashboardFilter();

  loadStaffOrders();
  initSidebarNavigation();
  updateRoleDisplay();

  if (document.getElementById("pageMenu")) {
    loadMenuItems();
  }

  // Auto-refresh orders every 30 seconds
  setInterval(() => {
    console.log("🔄 Auto-refreshing orders...");
    loadStaffOrders();
  }, 30000);

  setTimeout(function () {
    const btn = document.getElementById("hamburgerBtn");
    if (btn) {
      console.log("Second attempt: Hamburger button found");
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("Hamburger button clicked (second listener)!");
        toggleSidebar();
      });
    }
  }, 100);
});
