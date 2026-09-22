// ========== RATINGS PAGE - ENHANCED MODAL WITH FIXED STARS ==========

// Get the item ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const itemId = parseInt(urlParams.get("id"));

// Store current item ID globally
window.currentReviewItemId = itemId;
window.currentReviewFilter = "top";
window.selectedReviewRating = 0;
window.selectedNameOption = "customer"; // 'customer' or 'custom'
// Load ratings when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("📋 Ratings page loaded, itemId:", itemId);

  // 🔥 INITIALIZE BOTTOM BAR AUTO-HIDE
  if (typeof initScrollHideBottomBar === "function") {
    initScrollHideBottomBar();
  }

  // 🔥 INITIALIZE BOTTOM NAV
  if (typeof initBottomNav === "function") {
    initBottomNav();
  }

  // 🔥 RESTORE ORDER SLIP BADGES
  // Load the saved filter state from localStorage
  const savedFilter =
    localStorage.getItem("silentBite_orderslipFilter") || "all";
  if (typeof orderslipDateFilter !== "undefined") {
    orderslipDateFilter = savedFilter;
  }

  // Update all badges (active orders + unread updates)
  if (typeof updateAllBadges === "function") {
    updateAllBadges();
  }

  // Update rate badge
  if (typeof updateRateBadge === "function") {
    updateRateBadge();
  }

  // Update cart badge
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  // 🔥 Initialize star rating FIRST
  setTimeout(() => {
    initStarRating();
  }, 100);

  if (itemId) {
    loadRatingsPage(itemId);
  } else {
    document.getElementById("ratingSummary").innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #888;">
        <span style="font-size: 3rem;">⚠️</span>
        <p>No item selected. Please go back to the menu.</p>
        <a href="menu.html" style="color: #dc143c; text-decoration: underline;">Go to Menu</a>
      </div>
    `;
  }

  // Bottom navigation (re-attach to ensure it works)
  document.querySelectorAll(".nav-icon").forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.dataset.nav;
      if (action === "menu") {
        window.location.href = "menu.html";
      } else if (action === "cart") {
        window.location.href = "cart.html";
      } else if (action === "rate" || action === "ratings") {
        window.location.href = "rate.html";
      } else if (action === "orderslip") {
        window.location.href = "orderslip.html";
      }
    });
  });

  // Attach submit button event
  setTimeout(() => {
    attachSubmitButtonEvent();
  }, 500);

  // 🔥 CHECK FOR ORDER UPDATES EVERY 10 SECONDS
  if (typeof checkOrderUpdates === "function") {
    checkOrderUpdates();
    setInterval(() => {
      checkOrderUpdates();
    }, 10000);
  }
});

// ========== LOAD RATINGS PAGE ==========
async function loadRatingsPage(itemId) {
  const item = menuData.find((m) => m.id === itemId);

  // 🔥 Update dish name (now in the ratings-dish-name element)
  const titleEl = document.getElementById("ratingsPageTitle");
  if (titleEl) {
    titleEl.textContent = item ? `${item.name}` : "Reviews and Ratings";
  }

  // Load from MongoDB first
  const itemRating = await loadReviewsFromMongoDB(itemId);

  // If no data from MongoDB, check local
  const localRating = getItemRating(itemId);
  const ratingData = itemRating ||
    localRating || { average: 0, count: 0, reviews: [] };

  // Render rating summary
  renderRatingSummary(ratingData);

  // Render reviews
  renderReviews(ratingData, "top");

  // 🔥 Re-initialize star rating after rendering
  setTimeout(() => {
    initStarRating();
  }, 300);

  // Re-attach submit button after rendering
  setTimeout(() => {
    attachSubmitButtonEvent();
  }, 400);
}

// ========== RENDER RATING SUMMARY ==========
function renderRatingSummary(itemRating) {
  const container = document.getElementById("ratingSummary");
  if (!container) return;

  if (!itemRating || itemRating.count === 0) {
    container.innerHTML = `
      <div class="rating-summary-split" style="justify-content: center; text-align: center; padding: 1rem;">
        <div>
          <div style="font-size: 2rem; font-weight: 700; color: #2c2b28;">0.0</div>
          <div class="rating-stars-large" style="font-size: 1.2rem;">☆☆☆☆☆</div>
          <div class="rating-count-large" style="color: #888; font-size: 0.85rem;">No ratings yet</div>
        </div>
      </div>
    `;
    return;
  }

  // Calculate distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  itemRating.reviews.forEach((review) => {
    const rating = Math.round(review.rating);
    if (distribution[rating] !== undefined) {
      distribution[rating]++;
    }
  });

  let barsHtml = "";
  for (let i = 5; i >= 1; i--) {
    const count = distribution[i] || 0;
    const barWidth =
      count > 0 ? Math.max((count / itemRating.count) * 100, 5) : 0;

    barsHtml += `
      <div class="graph-row-compact">
        <span class="graph-label-compact">${i} ★</span>
        <div class="graph-bar-container-compact">
          <div class="graph-bar-compact" style="width: ${barWidth}%;"></div>
        </div>
        <span class="graph-count-compact">${count}</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="rating-summary-split">
      <div class="rating-summary-left">
        <div class="rating-number-large">${itemRating.average.toFixed(1)}</div>
        <div class="rating-stars-large">${renderStars(itemRating.average)}</div>
        <div class="rating-count-large">${itemRating.count} ratings</div>
      </div>
      <div class="rating-summary-right">
        ${barsHtml}
      </div>
    </div>
  `;
}

// ========== RENDER REVIEWS ==========
function renderReviews(itemRating, filter) {
  const container = document.getElementById("reviewsList");
  if (!container) return;

  if (!itemRating || !itemRating.reviews || itemRating.reviews.length === 0) {
    container.innerHTML = `
      <div class="empty-reviews">
        <span>📝</span>
        <p>No reviews yet. Be the first to review!</p>
      </div>
    `;
    return;
  }

  let sortedReviews = [...itemRating.reviews];
  switch (filter) {
    case "newest":
      sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "highest":
      sortedReviews.sort((a, b) => b.rating - a.rating);
      break;
    case "lowest":
      sortedReviews.sort((a, b) => a.rating - b.rating);
      break;
    case "top":
    default:
      sortedReviews.sort((a, b) => b.rating - a.rating);
      break;
  }

  let html = "";
  sortedReviews.forEach((review) => {
    html += `
      <div class="review-item">
        <div class="review-header">
          <span class="review-user">${review.user || review.userName || "Anonymous"}</span>
          <span class="review-stars">${renderStars(review.rating)}</span>
          <span class="review-date">${review.date}</span>
        </div>
        ${review.comment ? `<div class="review-comment">${review.comment}</div>` : ""}
      </div>
    `;
  });

  container.innerHTML = html;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

// ========== FILTER REVIEWS ==========
function filterReviews(filter) {
  window.currentReviewFilter = filter;
  const itemId = window.currentReviewItemId;
  const itemRating = getItemRating(itemId);
  renderReviews(itemRating, filter);
}

// ============================================================
// ========== FIXED STAR RATING FUNCTIONS ==========
// ============================================================

// ========== INITIALIZE STAR RATING ==========
function initStarRating() {
  console.log("⭐ Initializing star rating...");

  // Reset any previous state
  window.selectedReviewRating = 0;

  const stars = document.querySelectorAll("#starSelector span");
  if (stars.length === 0) {
    console.log("⚠️ No star elements found, will retry...");
    setTimeout(initStarRating, 300);
    return;
  }

  stars.forEach((star) => {
    // Reset all stars to default
    star.style.color = "#ddd";
    star.style.transform = "scale(1)";
    star.style.textShadow = "none";
    star.style.transition = "color 0.2s ease, transform 0.15s ease";

    // Remove any existing listeners by cloning
    const newStar = star.cloneNode(true);
    star.parentNode.replaceChild(newStar, star);

    // Attach new events
    newStar.onmouseover = function () {
      const rating = parseInt(this.dataset.star);
      previewStar(rating);
    };
    newStar.onmouseout = function () {
      resetStarPreview();
    };
    newStar.onclick = function () {
      const rating = parseInt(this.dataset.star);
      selectStar(rating);
    };
  });

  // Reset submit button
  const submitBtn = document.getElementById("submitReviewBtn");
  if (submitBtn) {
    submitBtn.style.opacity = "0.5";
    submitBtn.style.pointerEvents = "none";
    submitBtn.disabled = true;
  }

  console.log("✅ Star rating initialized with", stars.length, "stars");
}

// ========== SELECT STAR RATING ==========
function selectStar(rating) {
  console.log("⭐ Star selected:", rating);
  window.selectedReviewRating = rating;
  updateStarDisplay(rating);

  // Enable submit button
  const submitBtn = document.getElementById("submitReviewBtn");
  const msg = document.getElementById("ratingMessage");
  if (submitBtn) {
    submitBtn.style.opacity = "1";
    submitBtn.style.pointerEvents = "auto";
    submitBtn.disabled = false;
    submitBtn.style.background = "#dc143c";
    submitBtn.style.color = "white";
    if (msg) msg.style.display = "none";
  }
}

// ========== UPDATE STAR DISPLAY ==========
function updateStarDisplay(rating) {
  const stars = document.querySelectorAll("#starSelector span");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.style.color = "#f5a623";
      star.style.textShadow = "0 0 8px rgba(245, 166, 35, 0.3)";
    } else {
      star.style.color = "#ddd";
      star.style.textShadow = "none";
    }
  });
}

// ========== PREVIEW STAR (Hover) ==========
function previewStar(rating) {
  const stars = document.querySelectorAll("#starSelector span");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.style.color = "#f5a623";
      star.style.transform = "scale(1.15)";
      star.style.transition = "transform 0.15s ease";
    } else {
      star.style.color = "#ddd";
      star.style.transform = "scale(1)";
    }
  });
}

// ========== RESET STAR PREVIEW (Hover Out) ==========
function resetStarPreview() {
  // 🔥 IMPORTANT: Use the SELECTED rating, not 0
  const selectedRating = window.selectedReviewRating || 0;

  const stars = document.querySelectorAll("#starSelector span");
  stars.forEach((star, index) => {
    // Reset transform
    star.style.transform = "scale(1)";

    // Use selected rating to determine color
    if (index < selectedRating) {
      star.style.color = "#f5a623";
      star.style.textShadow = "0 0 8px rgba(245, 166, 35, 0.3)";
    } else {
      star.style.color = "#ddd";
      star.style.textShadow = "none";
    }
  });
}

// ========== RESET STAR RATING (After submit) ==========
function resetStarRating() {
  window.selectedReviewRating = 0;
  const stars = document.querySelectorAll("#starSelector span");
  stars.forEach((star) => {
    star.style.color = "#ddd";
    star.style.transform = "scale(1)";
    star.style.textShadow = "none";
  });

  // Disable submit button
  const submitBtn = document.getElementById("submitReviewBtn");
  if (submitBtn) {
    submitBtn.style.opacity = "0.5";
    submitBtn.style.pointerEvents = "none";
    submitBtn.disabled = true;
    submitBtn.style.background = "#dc143c";
    submitBtn.style.color = "white";
  }
}

// ========== RENDER STARS AS TEXT ==========
function renderStarsText(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += "★";
  }
  if (halfStar) {
    stars += "½";
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += "☆";
  }
  return stars;
}

// ========== ATTACH SUBMIT BUTTON EVENT ==========
function attachSubmitButtonEvent() {
  const submitBtn = document.getElementById("submitReviewBtn");
  if (submitBtn) {
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);

    newBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🔘 Submit button clicked!");
      openReviewModal();
    });

    console.log("✅ Submit button event attached");
  } else {
    console.log("⚠️ Submit button not found, will retry...");
    setTimeout(attachSubmitButtonEvent, 500);
  }
}

// ========== OPEN REVIEW MODAL ==========
function openReviewModal() {
  console.log("📝 Opening review modal...");

  const rating = window.selectedReviewRating;
  const comment = document.getElementById("reviewCommentInput").value.trim();
  const itemId = window.currentReviewItemId;

  if (!rating || rating === 0) {
    const msg = document.getElementById("ratingMessage");
    if (msg) {
      msg.style.display = "block";
      msg.textContent = "⭐ Please select a rating (1-5 stars)";
    }
    return;
  }

  if (!comment) {
    if (typeof showToast === "function") {
      showToast("✏️ Please write a review comment");
    } else {
      alert("Please write a review comment");
    }
    return;
  }

  const customerNumber =
    typeof getCustomerNumber === "function" ? getCustomerNumber() : "";

  console.log("📝 Modal data:", { rating, comment, itemId, customerNumber });

  window.pendingReview = {
    rating: rating,
    comment: comment,
    itemId: itemId,
    customerNumber: customerNumber,
  };

  const modal = document.getElementById("reviewSubmitModal");

  if (!modal) {
    console.error("❌ Modal not found! Creating one...");
    createReviewModal();
    setTimeout(() => openReviewModal(), 200);
    return;
  }

  // Update modal content (with safety checks)
  const ratingDisplay = document.getElementById("modalRatingDisplay");
  const commentDisplay = document.getElementById("modalCommentDisplay");

  if (ratingDisplay) {
    ratingDisplay.textContent = renderStarsText(rating);
  }

  if (commentDisplay) {
    commentDisplay.textContent = comment || "No comment";
  }

  // Reset name selection to "Use Customer #"
  window.selectedNameOption = "customer";
  const nameRadios = document.querySelectorAll('input[name="nameOption"]');
  nameRadios.forEach((radio) => {
    if (radio.value === "customer") {
      radio.checked = true;
    }
  });

  // Hide custom name input
  const customNameContainer = document.getElementById("customNameContainer");
  if (customNameContainer) {
    customNameContainer.style.display = "none";
  }

  // Set customer number as default
  const customNameInput = document.getElementById("reviewerNameInput");
  if (customNameInput) {
    customNameInput.value = customerNumber || "";
    customNameInput.placeholder = "Enter your name";
  }

  modal.style.display = "flex";
  console.log("✅ Modal displayed");
}

// ========== CREATE REVIEW MODAL ==========
function createReviewModal() {
  console.log("🔧 Creating review modal...");

  if (document.getElementById("reviewSubmitModal")) {
    return;
  }

  const modal = document.createElement("div");
  modal.id = "reviewSubmitModal";
  modal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    align-items: center;
    justify-content: center;
    z-index: 3000;
    backdrop-filter: blur(5px);
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      max-width: 420px;
      width: 92%;
      border-radius: 24px;
      padding: 2rem 1.5rem 1.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      font-family: 'Inter', sans-serif;
      animation: slideUp 0.3s ease;
    ">
      <h3 style="font-size: 1.2rem; font-weight: 700; color: #2c2b28; margin-bottom: 0.5rem;">
        ⭐ Submit Review
      </h3>
      <p style="color: #888; font-size: 0.85rem; margin-bottom: 1rem;">
        Please confirm your review details
      </p>

      <!-- Review Summary -->
      <div style="background: #f8f5f0; border-radius: 12px; padding: 1rem; margin-bottom: 1.2rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
          <span style="color: #666;">Rating:</span>
          <span id="modalRatingDisplay" style="font-weight: 600; color: #f5a623;">★★★★★</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
          <span style="color: #666;">Comment:</span>
          <span id="modalCommentDisplay" style="font-weight: 500; color: #333; text-align: right; max-width: 60%;">Your comment here</span>
        </div>
      </div>

      <!-- Name Selection - Like Staff Decline Modal -->
      <div style="margin-bottom: 1.2rem;">
        <label style="display: block; font-weight: 600; font-size: 0.9rem; color: #333; margin-bottom: 8px;">
          👤 Choose how to display your name:
        </label>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Option 1: Use Customer # -->
          <label style="
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            background: #fafafa;
          " 
          onmouseover="this.style.borderColor='#28a745'; this.style.background='#f0fff0';" 
          onmouseout="if(!this.querySelector('input').checked){this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';}">
            <input type="radio" name="nameOption" value="customer" checked onchange="toggleNameOption('customer')" style="width: 18px; height: 18px; accent-color: #28a745; cursor: pointer;">
            <span style="font-size: 0.9rem;">🔢 Use Customer #</span>
          </label>
          
          <!-- Option 2: Your Name (optional) -->
          <label style="
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            background: #fafafa;
          " 
          onmouseover="this.style.borderColor='#dc143c'; this.style.background='#fff5f5';" 
          onmouseout="if(!this.querySelector('input').checked){this.style.borderColor='#e0e0e0'; this.style.background='#fafafa';}">
            <input type="radio" name="nameOption" value="custom" onchange="toggleNameOption('custom')" style="width: 18px; height: 18px; accent-color: #dc143c; cursor: pointer;">
            <span style="font-size: 0.9rem;">✏️ Your Name (optional)</span>
          </label>
        </div>
      </div>

      <!-- Custom Name Input (hidden by default) -->
      <div id="customNameContainer" style="display: none; margin-bottom: 1.2rem;">
        <label style="display: block; font-weight: 600; font-size: 0.85rem; color: #333; margin-bottom: 6px;">
          Enter your name:
        </label>
        <input
          type="text"
          id="reviewerNameInput"
          placeholder="Type your name here..."
          style="
            width: 100%;
            padding: 0.8rem 1rem;
            border: 1.5px solid #e0e0e0;
            border-radius: 12px;
            font-size: 0.9rem;
            font-family: 'Inter', sans-serif;
            outline: none;
            transition: border-color 0.2s;
          "
          onfocus="this.style.borderColor='#dc143c'"
          onblur="this.style.borderColor='#e0e0e0'"
        />
        <p style="font-size: 0.7rem; color: #999; margin-top: 4px;">
          💡 Leave blank to use Customer #
        </p>
      </div>

      <div style="display: flex; gap: 12px;">
        <button
          onclick="closeReviewModal()"
          style="
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
          "
          onmouseover="this.style.background='#d0d0d0'"
          onmouseout="this.style.background='#e0e0e0'"
        >
          Cancel
        </button>
        <button
          onclick="confirmSubmitReview()"
          style="
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
          "
          onmouseover="this.style.background='#b22222'"
          onmouseout="this.style.background='#dc143c'"
        >
          Confirm Submit
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  console.log("✅ Review modal created");
}

// ========== TOGGLE NAME OPTION ==========
function toggleNameOption(option) {
  window.selectedNameOption = option;
  const customContainer = document.getElementById("customNameContainer");
  const nameInput = document.getElementById("reviewerNameInput");
  const customerNumber =
    typeof getCustomerNumber === "function" ? getCustomerNumber() : "";

  if (option === "customer") {
    // Hide custom name input
    if (customContainer) {
      customContainer.style.display = "none";
    }
    // Set customer number as value
    if (nameInput) {
      nameInput.value = customerNumber || "";
    }
    // Highlight the customer option
    const labels = document.querySelectorAll('label[style*="cursor: pointer"]');
    labels.forEach((label) => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio && radio.value === "customer") {
        label.style.borderColor = "#28a745";
        label.style.background = "#f0fff0";
      } else if (radio && radio.value === "custom") {
        label.style.borderColor = "#e0e0e0";
        label.style.background = "#fafafa";
      }
    });
  } else {
    // Show custom name input
    if (customContainer) {
      customContainer.style.display = "block";
    }
    if (nameInput) {
      nameInput.value = "";
      nameInput.focus();
    }
    // Highlight the custom option
    const labels = document.querySelectorAll('label[style*="cursor: pointer"]');
    labels.forEach((label) => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio && radio.value === "custom") {
        label.style.borderColor = "#dc143c";
        label.style.background = "#fff5f5";
      } else if (radio && radio.value === "customer") {
        label.style.borderColor = "#e0e0e0";
        label.style.background = "#fafafa";
      }
    });
  }
}

// ========== CLOSE REVIEW MODAL ==========
function closeReviewModal() {
  const modal = document.getElementById("reviewSubmitModal");
  if (modal) {
    modal.style.display = "none";
  }
  window.pendingReview = null;
}
// ========== CONFIRM SUBMIT REVIEW - FIXED ==========
async function confirmSubmitReview() {
  const pendingReview = window.pendingReview;
  if (!pendingReview) {
    if (typeof showToast === "function") {
      showToast("No review pending");
    }
    return;
  }

  // Get the selected name option
  const selectedOption = document.querySelector(
    'input[name="nameOption"]:checked',
  );
  let userName = "";

  if (selectedOption) {
    if (selectedOption.value === "customer") {
      // Use Customer #
      userName = pendingReview.customerNumber || "Anonymous";
    } else {
      // Use custom name
      const nameInput = document.getElementById("reviewerNameInput");
      userName = nameInput ? nameInput.value.trim() : "";
      if (!userName) {
        userName = pendingReview.customerNumber || "Anonymous";
      }
    }
  } else {
    userName = pendingReview.customerNumber || "Anonymous";
  }

  console.log("📝 Submitting review:", { ...pendingReview, userName });

  const confirmBtn = document.querySelector(
    '#reviewSubmitModal button[onclick="confirmSubmitReview()"]',
  );
  if (confirmBtn) {
    confirmBtn.textContent = "⏳ Submitting...";
    confirmBtn.disabled = true;
  }

  // 🔥 Mark this dish as rated for pending order
  const pendingRatings =
    typeof getPendingRatings === "function" ? getPendingRatings() : [];
  const matchingPendings = pendingRatings.filter(
    (p) => p.itemId === pendingReview.itemId,
  );

  if (matchingPendings.length > 0) {
    matchingPendings.forEach((matchingPending) => {
      if (typeof markDishAsRated === "function") {
        markDishAsRated(matchingPending.itemId, matchingPending.orderNumber);
      }
    });

    // Remove all matching from pending
    const updated = pendingRatings.filter(
      (p) => p.itemId !== pendingReview.itemId,
    );

    if (typeof savePendingRatings === "function") {
      savePendingRatings(updated);
    }

    // 🔥 Update the rate badge if on rate page
    if (typeof updateRateBadge === "function") {
      updateRateBadge();
    }
  }

  try {
    // 🔥 Save to MongoDB first, then local storage
    const customerNumber =
      typeof getCustomerNumber === "function" ? getCustomerNumber() : "";

    // Save to MongoDB
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menuItemId: pendingReview.itemId,
        customerNumber: customerNumber || "Anonymous",
        userName: userName || customerNumber || "Anonymous",
        rating: pendingReview.rating,
        comment: pendingReview.comment || "",
      }),
    });

    const result = await response.json();
    console.log("✅ Review saved to MongoDB:", result);

    if (result.success) {
      // 🔥 Also update local storage
      let ratingsData =
        JSON.parse(localStorage.getItem("silentBite_ratings")) || {};

      if (!ratingsData[pendingReview.itemId]) {
        ratingsData[pendingReview.itemId] = {
          average: 0,
          count: 0,
          reviews: [],
        };
      }

      const newReview = {
        user: userName || "Anonymous",
        rating: pendingReview.rating,
        comment: pendingReview.comment || "",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        _id: result.id,
      };

      ratingsData[pendingReview.itemId].reviews.unshift(newReview);
      ratingsData[pendingReview.itemId].count =
        ratingsData[pendingReview.itemId].reviews.length;

      const total = ratingsData[pendingReview.itemId].reviews.reduce(
        (sum, r) => sum + r.rating,
        0,
      );
      ratingsData[pendingReview.itemId].average =
        Math.round((total / ratingsData[pendingReview.itemId].count) * 10) / 10;

      localStorage.setItem("silentBite_ratings", JSON.stringify(ratingsData));

      if (typeof showToast === "function") {
        showToast("✅ Review submitted successfully!");
      } else {
        alert("✅ Review submitted successfully!");
      }

      closeReviewModal();

      // 🔥 Reset star rating
      resetStarRating();

      // Clear comment input
      const commentInput = document.getElementById("reviewCommentInput");
      if (commentInput) commentInput.value = "";

      // 🔥 Reload the page with updated data
      loadRatingsPage(pendingReview.itemId);

      // 🔥 Also update the menu item rating in the background
      if (typeof updateMenuItemRatingDisplay === "function") {
        updateMenuItemRatingDisplay(pendingReview.itemId);
      }
    } else {
      if (typeof showToast === "function") {
        showToast("❌ Failed to submit review. Please try again.");
      }
    }
  } catch (error) {
    console.error("❌ Error submitting review:", error);
    if (typeof showToast === "function") {
      showToast("❌ Error submitting review. Please try again.");
    }
  }

  if (confirmBtn) {
    confirmBtn.textContent = "Confirm Submit";
    confirmBtn.disabled = false;
  }
}
// ========== ADD REVIEW FUNCTION ==========
async function addReview(itemId, rating, comment, userName) {
  try {
    let ratingsData =
      JSON.parse(localStorage.getItem("silentBite_ratings")) || {};

    if (!ratingsData[itemId]) {
      ratingsData[itemId] = { average: 0, count: 0, reviews: [] };
    }

    const newReview = {
      user: userName || "Anonymous",
      rating: rating,
      comment: comment || "",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    ratingsData[itemId].reviews.unshift(newReview);
    ratingsData[itemId].count = ratingsData[itemId].reviews.length;

    const total = ratingsData[itemId].reviews.reduce(
      (sum, r) => sum + r.rating,
      0,
    );
    ratingsData[itemId].average =
      Math.round((total / ratingsData[itemId].count) * 10) / 10;

    localStorage.setItem("silentBite_ratings", JSON.stringify(ratingsData));

    try {
      const customerNumber =
        typeof getCustomerNumber === "function" ? getCustomerNumber() : "";

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: itemId,
          customerNumber: customerNumber || "Anonymous",
          userName: userName || customerNumber || "Anonymous",
          rating: rating,
          comment: comment || "",
        }),
      });

      const result = await response.json();
      console.log("✅ Review saved to MongoDB:", result);
      return true;
    } catch (error) {
      console.warn("⚠️ MongoDB save failed, but review saved locally:", error);
      return true;
    }
  } catch (error) {
    console.error("❌ Error saving review:", error);
    return false;
  }
}

// ========== LOAD REVIEWS FROM MONGODB ==========
async function loadReviewsFromMongoDB(itemId) {
  try {
    const response = await fetch(`${API_URL}/reviews/${itemId}`);
    const result = await response.json();

    if (result.success && result.reviews) {
      let ratingsData =
        JSON.parse(localStorage.getItem("silentBite_ratings")) || {};

      if (!ratingsData[itemId]) {
        ratingsData[itemId] = { average: 0, count: 0, reviews: [] };
      }

      ratingsData[itemId].average = result.summary.average || 0;
      ratingsData[itemId].count = result.summary.count || 0;
      ratingsData[itemId].reviews = result.reviews.map((r) => ({
        user: r.userName || r.customerNumber || "Anonymous",
        rating: r.rating,
        comment: r.comment || "",
        date: r.date,
        _id: r._id,
      }));

      localStorage.setItem("silentBite_ratings", JSON.stringify(ratingsData));
      return ratingsData[itemId];
    }
    return null;
  } catch (error) {
    console.error("❌ Error loading reviews from MongoDB:", error);
    return null;
  }
}

// ========== GET ITEM RATING (local) ==========
function getItemRating(itemId) {
  const ratingsData =
    JSON.parse(localStorage.getItem("silentBite_ratings")) || {};
  return ratingsData[itemId] || null;
}

// ========== RENDER STARS (global helper) ==========
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += "★";
  }
  if (halfStar) {
    stars += "½";
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += "☆";
  }
  return stars;
}

// ========== TOAST (fallback) ==========
if (typeof showToast !== "function") {
  window.showToast = function (message) {
    const toast = document.createElement("div");
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
      z-index: 9999;
      font-family: 'Inter', sans-serif;
      max-width: 90%;
      text-align: center;
      animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
    }, 2000);
    setTimeout(() => toast.remove(), 2500);
  };
}

// ========== GET CUSTOMER NUMBER (fallback) ==========
if (typeof getCustomerNumber !== "function") {
  window.getCustomerNumber = function () {
    return localStorage.getItem("silentBite_customerNumber") || null;
  };
}

console.log("✅ ratings.js loaded successfully with fixed star rating!");
