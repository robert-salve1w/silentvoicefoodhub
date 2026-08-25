// ========== STAFF LOGIN SCRIPT ==========

// Default credentials (for demo purposes)
const USERS = {
  staff: {
    username: "staff",
    password: "staff123",
    role: "staff",
    displayName: "Service Crew",
  },
  admin: {
    username: "admin",
    password: "admin123",
    role: "admin",
    displayName: "Administrator",
  },
};

let selectedRole = "staff";

// Role selection
function selectRole(role) {
  selectedRole = role;

  document.querySelectorAll(".role-option").forEach((el) => {
    el.classList.toggle("selected", el.dataset.role === role);
  });

  const btn = document.getElementById("loginBtn");
  const roleName = role === "staff" ? "Service Crew" : "Administrator";
  btn.textContent = `🔐 Login as ${roleName}`;

  hideError();
}

// Toggle password visibility
function togglePassword() {
  const input = document.getElementById("password");
  const btn = event.target;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
}

function showError(message) {
  const errorDiv = document.getElementById("loginError");
  const errorMsg = document.getElementById("errorMessage");
  errorMsg.textContent = message;
  errorDiv.classList.add("show");
}

function hideError() {
  document.getElementById("loginError").classList.remove("show");
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");

  if (!username || !password) {
    showError("Please enter both username and password.");
    return;
  }

  const user = USERS[selectedRole];

  if (user && user.username === username && user.password === password) {
    hideError();
    loginBtn.disabled = true;
    loginBtn.textContent = "⏳ Logging in...";

    // Save session info
    sessionStorage.setItem("staffLoggedIn", "true");
    sessionStorage.setItem("staffRole", selectedRole);
    sessionStorage.setItem("staffName", user.displayName);
    sessionStorage.setItem("staffUsername", username);

    // Redirect based on role
    setTimeout(() => {
      if (selectedRole === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "staff.html";
      }
    }, 800);
  } else {
    const isStaff = selectedRole === "staff";
    const defaultUser = isStaff ? "staff" : "admin";
    const defaultPass = isStaff ? "staff123" : "admin123";
    showError(
      `Invalid credentials for ${isStaff ? "Service Crew" : "Admin"}. Try ${defaultUser}/${defaultPass}`,
    );
    loginBtn.disabled = false;
    loginBtn.textContent = isStaff
      ? "🔐 Login as Service Crew"
      : "🔐 Login as Administrator";
  }
}

// Check if already logged in
function checkSession() {
  const loggedIn = sessionStorage.getItem("staffLoggedIn");
  const role = sessionStorage.getItem("staffRole");

  if (loggedIn === "true") {
    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "staff.html";
    }
    return true;
  }
  return false;
}

function getRoleFromURL() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");
  if (role === "admin" || role === "staff") {
    selectRole(role);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (checkSession()) return;
  getRoleFromURL();
  document.getElementById("username").focus();
});
