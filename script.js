// ========== NOTIFICATION SYSTEM ==========
let unreadOrderUpdates =
  JSON.parse(localStorage.getItem("silentBite_unreadOrders")) || [];
let lastCheckedStatus =
  JSON.parse(localStorage.getItem("silentBite_lastOrderStatus")) || {};

// ========== FILIPINO FOOD MENU DATA ==========
const menuData = [
  // ========== RICE MEALS ==========
  {
    id: 1,
    name: "Chicken Adobo Rice",
    category: "Rice Meals",
    price: 75,
    img: "adobo.jpg",
    dietary: ["High-Protein"],
    ingredients: [
      "Chicken",
      "Soy Sauce",
      "Vinegar",
      "Garlic",
      "Black Pepper",
      "Steamed Rice",
    ],
    description:
      "Tender chicken slow-cooked in savory soy sauce, vinegar, garlic, and black pepper. Served with steaming white rice. A classic Filipino comfort dish.",
  },
  {
    id: 2,
    name: "Sinigang na Bangus",
    category: "Rice Meals",
    price: 85,
    img: "sinigangbangus.jpg",
    dietary: ["Pescatarian", "Heart-Healthy"],
    ingredients: [
      "Milkfish",
      "Tamarind",
      "Kangkong",
      "Radish",
      "Eggplant",
      "Steamed Rice",
    ],
    description:
      "Fresh milkfish simmered in a tangy tamarind broth with kangkong, radish, and eggplant. Sour, savory, and incredibly satisfying.",
  },
  {
    id: 3,
    name: "Tofu Sisig Bowl",
    category: "Rice Meals",
    price: 65,
    img: "tofu-sisig.jpg",
    dietary: ["Vegan", "High-Protein"],
    ingredients: ["Tofu", "Onions", "Chili", "Vegan Mayo", "Garlic Rice"],
    description:
      "Crispy tofu chunks sizzled with onions, chili, and vegan mayo. Served over garlic rice. A plant-based twist on the Filipino sisig classic.",
  },

  // ========== SANDWICHES ==========
  {
    id: 11,
    name: "Feta and Tomato Sandwich",
    category: "Sandwiches",
    price: 65,
    img: "feta-tomato.jpg",
    dietary: ["Vegetarian"],
    ingredients: ["Feta Cheese", "Tomato", "Basil"],
    description:
      "A Mediterranean-inspired sandwich with creamy feta cheese, fresh tomatoes, and aromatic basil.",
  },
  {
    id: 12,
    name: "Hummus and Veggie Sandwich",
    category: "Sandwiches",
    price: 60,
    img: "hummus-veggie.jpg",
    dietary: ["Vegan"],
    ingredients: ["Hummus", "Grilled Veggies", "Rucola"],
    description:
      "Creamy hummus paired with smoky grilled vegetables and peppery rucola.",
  },
  {
    id: 13,
    name: "Cottage and Cucumber Sandwich",
    category: "Sandwiches",
    price: 55,
    img: "cottage-cucumber.jpg",
    dietary: ["Vegetarian", "High-Protein"],
    ingredients: ["Cottage Cheese", "Cucumber", "Fresh Dill"],
    description:
      "Light and refreshing cottage cheese with crisp cucumber and fresh dill.",
  },
  {
    id: 14,
    name: "Avocado and Egg Sandwich",
    category: "Sandwiches",
    price: 70,
    img: "avocado-egg.jpg",
    dietary: ["Vegetarian", "High-Protein"],
    ingredients: ["Avocado", "Poached Egg", "Chili Flakes"],
    description:
      "Creamy avocado with a perfectly poached egg, finished with a sprinkle of chili flakes.",
  },
  {
    id: 15,
    name: "Yogurt and Berry Sandwich",
    category: "Sandwiches",
    price: 50,
    img: "yogurt-berry.jpg",
    dietary: ["Vegetarian"],
    ingredients: ["Greek Yogurt", "Berries", "Chia Seeds"],
    description:
      "A sweet and healthy sandwich featuring Greek yogurt, fresh berries, and chia seeds.",
  },
  {
    id: 16,
    name: "Mozzarella and Pesto Sandwich",
    category: "Sandwiches",
    price: 68,
    img: "mozzarella-pesto.jpg",
    dietary: ["Vegetarian"],
    ingredients: ["Mozzarella", "Pesto", "Cherry Tomatoes"],
    description:
      "Creamy mozzarella with aromatic pesto and sweet cherry tomatoes.",
  },
  {
    id: 17,
    name: "Turkey and Spinach Sandwich",
    category: "Sandwiches",
    price: 72,
    img: "turkey-spinach.jpg",
    dietary: ["High-Protein"],
    ingredients: ["Turkey Slices", "Spinach", "Mustard"],
    description: "Lean turkey slices with fresh spinach and tangy mustard.",
  },
  {
    id: 18,
    name: "Egg and Avocado Sandwich",
    category: "Sandwiches",
    price: 68,
    img: "egg-avocado.jpg",
    dietary: ["Vegetarian", "High-Protein"],
    ingredients: ["Egg Salad", "Avocado", "Lettuce"],
    description:
      "Creamy egg salad and fresh avocado slices with crisp lettuce.",
  },

  // ========== SALADS ==========
  {
    id: 21,
    name: "Classic Italian Sub Salad Cup",
    category: "Salads",
    price: 85,
    img: "italian-sub-salad.jpg",
    dietary: ["High-Protein"],
    ingredients: ["Lettuce", "Ham", "Salami", "Provolone", "Pickles"],
    description:
      "All the flavors of a classic Italian sub in a fresh salad bowl with ham, salami, provolone, and pickles.",
  },
  {
    id: 22,
    name: "Spicy Pepperoni Italian Cup",
    category: "Salads",
    price: 88,
    img: "spicy-pepperoni.jpg",
    dietary: ["High-Protein"],
    ingredients: [
      "Lettuce",
      "Pepperoni",
      "Banana Peppers",
      "Provolone",
      "Olives",
    ],
    description:
      "Bold and spicy pepperoni with banana peppers, provolone cheese, and olives.",
  },
  {
    id: 23,
    name: "Turkey Provolone Salad Cup",
    category: "Salads",
    price: 82,
    img: "turkey-provolone.jpg",
    dietary: ["High-Protein"],
    ingredients: [
      "Lettuce",
      "Turkey",
      "Cucumber",
      "Provolone",
      "Red Wine Vinaigrette",
    ],
    description:
      "Lean turkey and creamy provolone with fresh cucumber tossed in a light red wine vinaigrette.",
  },
  {
    id: 24,
    name: "Mediterranean Italian Cup",
    category: "Salads",
    price: 80,
    img: "mediterranean-italian.jpg",
    dietary: ["Vegetarian"],
    ingredients: ["Lettuce", "Salami", "Cucumber", "Olives", "Feta"],
    description:
      "A Mediterranean-inspired salad with salami, crisp cucumber, briny olives, and tangy feta cheese.",
  },

  // ========== SNACKS ==========
  {
    id: 4,
    name: "Grilled Chicken Wrap",
    category: "Snacks",
    price: 55,
    img: "chicken-wrap.jpg",
    dietary: ["High-Protein", "Low-Carb"],
    ingredients: [
      "Grilled Chicken",
      "Lettuce",
      "Tomatoes",
      "Cucumber",
      "Garlic Yogurt Sauce",
      "Tortilla Wrap",
    ],
    description:
      "Juicy grilled chicken breast wrapped in a soft tortilla with fresh lettuce, tomatoes, cucumber, and garlic yogurt sauce.",
  },
  {
    id: 5,
    name: "Lumpiang Sariwa",
    category: "Snacks",
    price: 40,
    img: "lumpia.jpg",
    dietary: ["Vegan"],
    ingredients: ["Vegetables", "Tofu", "Sweet Potato", "Peanut-Garlic Sauce"],
    description:
      "Fresh spring roll packed with julienned vegetables, tofu, and sweet potato. Served with a sweet and savory peanut-garlic sauce.",
  },
  {
    id: 6,
    name: "Banana Cue",
    category: "Snacks",
    price: 25,
    img: "banana-cue.jpg",
    dietary: ["Vegan"],
    ingredients: ["Saba Bananas", "Brown Sugar"],
    description:
      "Deep-fried caramelized saba bananas coated in brown sugar. Crispy on the outside, soft and sweet on the inside.",
  },

  // ========== DRINKS ==========
  {
    id: 7,
    name: "Calamansi Juice",
    category: "Drinks",
    price: 20,
    img: "calamansi.jpg",
    dietary: ["Vegan", "Low-Carb"],
    ingredients: ["Fresh Calamansi", "Honey/Sugar", "Water", "Ice"],
    description:
      "Freshly squeezed calamansi (Philippine lime) juice sweetened with honey or sugar. Refreshingly tangy and rich in Vitamin C.",
  },
  {
    id: 8,
    name: "Soy Milk",
    category: "Drinks",
    price: 25,
    img: "soymilk.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    ingredients: ["Soybeans", "Water", "Sweetener"],
    description:
      "Creamy, plant-based soy milk lightly sweetened. Perfect dairy-free alternative packed with protein.",
  },
  {
    id: 31,
    name: "Beetroot Detox",
    category: "Drinks",
    price: 45,
    img: "beetroot-detox.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Liver Detox, Glowing Skin",
  },
  {
    id: 32,
    name: "Turmeric Ginger",
    category: "Drinks",
    price: 40,
    img: "turmeric-ginger.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Anti-Inflammatory, Clear Skin",
  },
  {
    id: 33,
    name: "Amla Immunity",
    category: "Drinks",
    price: 50,
    img: "amla-immunity.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Immune Boost, Youthful Skin",
  },
  {
    id: 34,
    name: "Fennel Digest",
    category: "Drinks",
    price: 35,
    img: "fennel-digest.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Better Digestion, Clear Skin",
  },
  {
    id: 35,
    name: "Ashwagandha Restore",
    category: "Drinks",
    price: 55,
    img: "ashwagandha-restore.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Stress Relief, Glowing Skin",
  },
  {
    id: 36,
    name: "Green Detox",
    category: "Drinks",
    price: 48,
    img: "green-detox.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Liver Cleanse, Acne Control",
  },
  {
    id: 37,
    name: "Chia Seed Energy",
    category: "Drinks",
    price: 42,
    img: "chia-seed-energy.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Energy Boost, Hydrated Skin",
  },
  {
    id: 38,
    name: "Mint Lemon Cooler",
    category: "Drinks",
    price: 30,
    img: "mint-lemon-cooler.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Digestion Support, Fresh Skin",
  },
  {
    id: 39,
    name: "Pomegranate Radiance",
    category: "Drinks",
    price: 52,
    img: "pomegranate-radiance.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Heart Health, Radiant Skin",
  },
  {
    id: 40,
    name: "Cinnamon Metabolism",
    category: "Drinks",
    price: 38,
    img: "cinnamon-metabolism.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Blood Sugar Balance, Glowing Skin",
  },
  {
    id: 41,
    name: "Aloe Vera Hydration",
    category: "Drinks",
    price: 44,
    img: "aloe-vera-hydration.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Gut Health, Soothing Skin",
  },
  {
    id: 42,
    name: "Carrot Orange Vitality",
    category: "Drinks",
    price: 40,
    img: "carrot-orange-vitality.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    description: "Eye Health, Bright Skin",
  },

  // ========== DESSERTS ==========
  {
    id: 9,
    name: "Fruit Salad Cup",
    category: "Desserts",
    price: 35,
    img: "fruit-salad.jpg",
    dietary: ["Gluten-Free"],
    ingredients: ["Mango", "Pineapple", "Papaya", "Banana"],
    description:
      "Mixed fresh tropical fruits including mango, pineapple, papaya, and banana. Light, healthy, and naturally sweet.",
  },
  {
    id: 10,
    name: "Biko",
    category: "Desserts",
    price: 30,
    img: "biko.jpg",
    dietary: ["Vegan"],
    ingredients: ["Sticky Rice", "Coconut Milk", "Brown Sugar"],
    description:
      "Sweet sticky rice cake cooked with coconut milk and topped with latik (coconut curds). Rich, chewy, and deeply satisfying.",
  },
];

// ========== USER GLOBALS ==========
let userDietary = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  pescatarian: false,
  lowCarb: false,
  highProtein: false,
};
let cart = JSON.parse(localStorage.getItem("silentBite_cart")) || [];
let currentCategory = "all";

// ========== BACKEND API URL ==========
const API_URL = "https://silent-voice-food-hub-api.onrender.com/api";
console.log("🔗 API URL:", API_URL);

// ========== ORDER SLIP SYSTEM ==========
let orderSlips =
  JSON.parse(localStorage.getItem("silentBite_orderSlips")) || [];
let nextOrderNumber =
  parseInt(localStorage.getItem("silentBite_nextOrderNumber")) || 1;
let statusSyncInterval = null;

// ========== RATINGS DATA ==========
let ratingsData = JSON.parse(localStorage.getItem("silentBite_ratings")) || {};

// ============================================================
// ========== HELPER FUNCTIONS ==========
// ============================================================

function generateEstimatedTime() {
  const minutes = Math.floor(Math.random() * (45 - 15 + 1) + 15);
  return `${minutes} minutes`;
}

function getAllOrderSlips() {
  const stored = localStorage.getItem("silentBite_orderSlips");
  if (stored) {
    try {
      orderSlips = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing order slips:", e);
      orderSlips = [];
    }
  } else {
    orderSlips = [];
  }
  return orderSlips;
}

function getImagePath(imgName) {
  return `images/${imgName}`;
}

function getCustomerNumber() {
  return localStorage.getItem("silentBite_customerNumber") || null;
}

function getOrCreateCustomerNumber() {
  let customerNumber = localStorage.getItem("silentBite_customerNumber");
  if (!customerNumber) {
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
    customerNumber = `SB${randomDigits}`;
    localStorage.setItem("silentBite_customerNumber", customerNumber);
  }
  return customerNumber;
}

function clearCustomerNumber() {
  localStorage.removeItem("silentBite_customerNumber");
}

// ============================================================
// ========== STAR RATING FUNCTIONS ==========
// ============================================================

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

function getItemRating(itemId) {
  if (ratingsData[itemId]) {
    return ratingsData[itemId];
  }
  return null;
}

// ========== GET ITEM RATING DISPLAY ==========
function getItemRatingDisplay(itemId) {
  const rating = getItemRating(itemId);
  if (rating && rating.count > 0) {
    const stars = renderStars(rating.average);
    return `<div style="font-size: 0.7rem; color: #f5a623; margin-top: 2px; letter-spacing: 0.5px;">${stars} <span style="color: #999; font-size: 0.6rem;">(${rating.count})</span></div>`;
  }
  return "";
}

// ============================================================
// ========== CART FUNCTIONS ==========
// ============================================================

function saveCart() {
  localStorage.setItem("silentBite_cart", JSON.stringify(cart));
  updateCartBadge();
}

function getUniqueItemCount() {
  return cart.length;
}

function updateCartBadge() {
  const uniqueItemCount = getUniqueItemCount();
  const navCartBadge = document.getElementById("navCartBadge");
  if (navCartBadge) {
    if (uniqueItemCount > 0) {
      navCartBadge.textContent = uniqueItemCount;
      navCartBadge.style.display = "flex";
    } else {
      navCartBadge.style.display = "none";
    }
  }
}

function isItemCompatible(item) {
  if (userDietary.vegan && !item.dietary.includes("Vegan")) return false;
  if (
    userDietary.vegetarian &&
    !item.dietary.includes("Vegan") &&
    !item.dietary.includes("Vegetarian")
  )
    return false;
  if (userDietary.glutenFree && !item.dietary.includes("Gluten-Free"))
    return false;
  if (
    userDietary.pescatarian &&
    !item.dietary.includes("Pescatarian") &&
    !item.dietary.includes("Vegan")
  )
    return false;
  if (userDietary.lowCarb && !item.dietary.includes("Low-Carb")) return false;
  if (userDietary.highProtein && !item.dietary.includes("High-Protein"))
    return false;
  return true;
}

function getRecommendedItems() {
  let compatible = menuData.filter((item) => isItemCompatible(item));
  if (compatible.length === 0) compatible = menuData.slice(0, 4);
  return compatible.slice(0, 4);
}

function addToCart(itemId) {
  const item = menuData.find((m) => m.id === itemId);
  if (item) {
    getOrCreateCustomerNumber();
    const existing = cart.find((i) => i.id === itemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    saveCart();
    showToast(`Added ${item.name} to cart`);
    closeMealModal();
  }
}

function removeFromCart(itemId) {
  const index = cart.findIndex((i) => i.id === itemId);
  if (index !== -1) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    showToast(`Removed ${itemName} from cart`);
    if (document.getElementById("cartItemsContainer")) {
      renderCartPage();
    }
  }
}

function updateQuantity(itemId, delta) {
  const item = cart.find((i) => i.id === itemId);
  if (item) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(itemId);
    } else {
      item.quantity = newQty;
      saveCart();
    }
    if (document.getElementById("cartItemsContainer")) {
      renderCartPage();
    }
  }
}

function showToast(message) {
  let toast = document.getElementById("customToast");
  if (!toast) {
    toast = document.createElement("div");
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
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

// ============================================================
// ========== MEAL DETAIL MODAL ==========
// ============================================================

function showMealModal(itemId) {
  const item = menuData.find((m) => m.id === itemId);
  if (!item) {
    console.warn("Item not found:", itemId);
    return;
  }

  console.log("🍽️ Showing modal for:", item.name);

  const itemRating = getItemRating(itemId);

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "mealModalOverlay";
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.2s ease;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    max-width: 400px;
    width: 90%;
    border-radius: 32px;
    overflow-y: auto;
    max-height: 85vh;
    animation: slideUp 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
  `;

  let ratingDisplayHtml = "";
  if (itemRating && itemRating.count > 0) {
    ratingDisplayHtml = `
      <div style="display: flex; align-items: center; gap: 8px; margin: 6px 0 10px; cursor: pointer;" onclick="window.location.href='ratings.html?id=${item.id}'">
        <span style="font-size: 1rem; letter-spacing: 1px; color: #f5a623;">${renderStars(itemRating.average)}</span>
        <span style="color: #888; font-size: 0.8rem;">(${itemRating.count} ratings)</span>
        <span style="color: #dc143c; font-size: 0.7rem; font-weight: 600;">View Reviews</span>
      </div>
    `;
  } else {
    ratingDisplayHtml = `
      <div style="display: flex; align-items: center; gap: 8px; margin: 6px 0 10px; cursor: pointer;" onclick="window.location.href='ratings.html?id=${item.id}'">
        <span style="color: #ddd; font-size: 1rem; letter-spacing: 1px;">★★★★★</span>
        <span style="color: #dc143c; font-size: 0.7rem; font-weight: 600;">Be the first to rate</span>
      </div>
    `;
  }

  let ingredientsHtml = "";
  if (item.ingredients && item.ingredients.length > 0) {
    ingredientsHtml = `
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 700; font-size: 0.85rem; color: #DC143C; margin-bottom: 8px;">📋 INGREDIENTS</div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${item.ingredients
            .map(
              (ing) => `
            <span style="display: inline-block; background: #f0ede8; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; color: #555; margin: 0 4px 8px 0;">${ing}</span>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  modalContent.innerHTML = `
    <div style="position: relative;">
      <div style="width: 100%; height: 250px; background: #f9e5d1; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        <img src="${getImagePath(item.img)}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://placehold.co/400x250?text=🍽️'">
      </div>
      <button id="closeModalBtn" style="
        position: absolute;
        top: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(0,0,0,0.6);
        color: white;
        border: none;
        font-size: 1.3rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
        font-family: monospace;
      ">✕</button>
    </div>
    <div style="padding: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 2px;">${item.name}</h2>
      
      ${ratingDisplayHtml}
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
        ${item.dietary.map((tag) => `<span style="background: #f0ede8; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">${tag}</span>`).join("")}
      </div>
      ${ingredientsHtml}
      <p style="color: #555; line-height: 1.5; margin-bottom: 16px; font-size: 0.9rem;">${item.description}</p>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 1.6rem; font-weight: 800; color: #DC143C;">₱${item.price}</span>
        <button id="modalAddToCartBtn" data-id="${item.id}" style="
          background: #DC143C;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        ">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeMealModal();
    }
  });

  const closeBtn = document.getElementById("closeModalBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMealModal);
  }

  const addToCartBtn = document.getElementById("modalAddToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      addToCart(item.id);
    });
  }
}

function closeMealModal() {
  const modal = document.getElementById("mealModalOverlay");
  if (modal) {
    modal.remove();
  }
}

// ============================================================
// ========== RENDER FUNCTIONS ==========
// ============================================================

function renderRecommendations() {
  const recTagsContainer = document.getElementById("recTagsContainer");
  const recItemsList = document.getElementById("recItemsList");
  if (!recTagsContainer || !recItemsList) return;

  const activePrefs = [];
  if (userDietary.vegetarian) activePrefs.push("Vegetarian");
  if (userDietary.vegan) activePrefs.push("Vegan");
  if (userDietary.glutenFree) activePrefs.push("Gluten-Free");
  if (userDietary.pescatarian) activePrefs.push("Pescatarian");
  if (userDietary.lowCarb) activePrefs.push("Low-Carb");
  if (userDietary.highProtein) activePrefs.push("High-Protein");

  if (activePrefs.length === 0) {
    recTagsContainer.innerHTML =
      '<span class="rec-tag">🍽️ No restrictions — all items available</span>';
  } else {
    recTagsContainer.innerHTML = activePrefs
      .map((tag) => `<span class="rec-tag">✨ ${tag}</span>`)
      .join("");
  }

  const recItems = getRecommendedItems();

  if (recItems.length === 0) {
    recItemsList.innerHTML = `<p style="color: #888; font-size: 0.85rem; text-align: center; padding: 0.5rem;">No recommendations available</p>`;
    return;
  }

  recItemsList.innerHTML = recItems
    .map((item) => {
      // Get rating display
      const rating = getItemRating(item.id);
      let ratingHtml = "";
      if (rating && rating.count > 0) {
        const stars = renderStars(rating.average);
        ratingHtml = `
          <div style="font-size: 0.65rem; color: #f5a623; letter-spacing: 0.5px; margin-top: 2px;">
            ${stars} <span style="color: #999; font-size: 0.6rem;">(${rating.count})</span>
          </div>
        `;
      }

      return `
        <div class="rec-food-card" data-id="${item.id}" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); min-width: 130px; max-width: 160px; flex-shrink: 0; border: 1px solid #f0e2d2;">
          <img src="${getImagePath(item.img)}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 50%; margin-bottom: 6px; border: 2px solid #f0ede8;" onerror="this.src='https://placehold.co/70x70?text=🍽️'">
          <div style="font-weight: 700; font-size: 0.8rem; color: #2c2b28; line-height: 1.2; max-width: 100%;">${item.name}</div>
          <div style="font-weight: 700; color: #DC143C; font-size: 0.85rem; margin-top: 2px;">₱${item.price}</div>
          ${ratingHtml}
          <button class="addQuickBtn" data-id="${item.id}" style="
            margin-top: 6px;
            background: #DC143C;
            color: white;
            border: none;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s;
          " onmouseover="this.style.background='#b22222'" onmouseout="this.style.background='#DC143C'">
            + Add
          </button>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".addQuickBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      addToCart(id);
    });
  });

  document.querySelectorAll(".rec-food-card").forEach((card) => {
    const id = parseInt(card.dataset.id);
    if (id) {
      card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("addQuickBtn")) {
          showMealModal(id);
        }
      });
    }
  });
}

function renderMenu() {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) {
    console.warn("menuGrid not found");
    return;
  }

  console.log("📋 Rendering menu with", menuData.length, "items");

  let filtered = menuData.filter((item) =>
    currentCategory === "all" ? true : item.category === currentCategory,
  );

  if (filtered.length === 0) {
    menuGrid.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #888; grid-column: 1 / -1;">
        <span style="font-size: 2rem;">🍽️</span>
        <p>No menu items found in this category</p>
      </div>
    `;
    return;
  }

  menuGrid.innerHTML = filtered
    .map(
      (item) => `
    <div class="meal-card" data-id="${item.id}" style="cursor: pointer;">
      <div class="meal-img">
        <img src="${getImagePath(item.img)}" alt="${item.name}" onerror="this.parentElement.innerHTML='<span style=\'font-size:3rem;\'>🍽️</span>'">
      </div>
      <div class="meal-info">
        <div class="meal-name">${item.name}</div>
        <div class="meal-price">₱${item.price}</div>
        <div class="badge-diet">${item.dietary.join(", ")}</div>
        ${getItemRatingDisplay(item.id)}
      </div>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".meal-card").forEach((card) => {
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);

    newCard.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      console.log("🍽️ Meal card clicked:", id);
      showMealModal(id);
    });
  });

  console.log("✅ Menu rendered with", filtered.length, "items");
}

function renderCartPage() {
  const container = document.getElementById("cartItemsContainer");
  const emptyMessage = document.getElementById("emptyCartMessage");
  const checkoutBar = document.getElementById("checkoutBar");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "block";
    if (checkoutBar) checkoutBar.style.display = "none";
    return;
  }

  if (emptyMessage) emptyMessage.style.display = "none";
  if (checkoutBar) checkoutBar.style.display = "flex";

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item-card" data-id="${item.id}">
      <div class="cart-item-img">
        <img src="${getImagePath(item.img)}" alt="${item.name}" onerror="this.src='https://placehold.co/80x80?text=🍽️'">
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₱${item.price}</div>
        <div class="cart-item-controls">
          <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
          <span class="item-quantity" id="qty-${item.id}">${item.quantity}</span>
          <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
        </div>
        <button class="remove-item-btn" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      updateQuantity(id, -1);
    });
  });

  document.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      updateQuantity(id, 1);
    });
  });

  document.querySelectorAll(".remove-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(parseInt(btn.dataset.id));
    });
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const uniqueItemCount = cart.length;
  const totalAmountSpan = document.getElementById("totalAmount");
  const checkoutCountSpan = document.getElementById("checkoutCount");
  if (totalAmountSpan) totalAmountSpan.textContent = `₱${total}`;
  if (checkoutCountSpan) checkoutCountSpan.textContent = uniqueItemCount;
}

function renderPaymentPage() {
  const orderSummaryList = document.getElementById("orderSummaryList");
  const summaryTotalAmount = document.getElementById("summaryTotalAmount");
  const customerNumberDisplay = document.getElementById(
    "customerNumberDisplay",
  );
  if (!orderSummaryList) return;

  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  const customerNumber = getCustomerNumber();
  if (customerNumberDisplay) {
    customerNumberDisplay.textContent = customerNumber || "Not assigned";
  }

  orderSummaryList.innerHTML = cart
    .map(
      (item) => `
    <div class="summary-item">
      <div class="summary-item-name">
        ${item.name}
        <span class="summary-item-qty">x${item.quantity}</span>
      </div>
      <div class="summary-item-price">₱${item.price * item.quantity}</div>
    </div>
  `,
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (summaryTotalAmount) summaryTotalAmount.textContent = `₱${total}`;
}

// ============================================================
// ========== PAYMENT & ORDER FUNCTIONS ==========
// ============================================================

function confirmOrder() {
  const selectedPayment = document.querySelector(
    'input[name="paymentMethod"]:checked',
  );
  const customerNumber = getCustomerNumber();

  if (!customerNumber) {
    alert("No customer number found. Please add items to cart first.");
    window.location.href = "menu.html";
    return;
  }

  if (!selectedPayment) {
    alert("Please select a payment method");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty");
    window.location.href = "menu.html";
    return;
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemsToSave = cart.map((item) => ({ ...item }));
  cart = [];
  saveCart();

  showOrderSuccessModal(
    customerNumber,
    selectedPayment.value,
    totalAmount,
    itemsToSave,
  );
}

function showOrderSuccessModal(
  customerNumber,
  paymentMethod,
  totalAmount,
  items,
) {
  createOrderSlip(customerNumber, paymentMethod, totalAmount, items).then(
    (newOrder) => {
      if (!newOrder) return;

      const modalOverlay = document.createElement("div");
      modalOverlay.className = "success-modal-overlay";
      modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
      `;

      modalOverlay.innerHTML = `
        <div class="success-modal" style="
          background: white;
          max-width: 340px;
          width: 85%;
          border-radius: 32px;
          text-align: center;
          overflow: hidden;
          animation: slideUp 0.3s ease;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        ">
          <span style="font-size: 3rem;">📤</span>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin: 0.5rem 0; color: #dc143c;">Order Request Sent!</h3>
          <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">⏳ Please wait for staff confirmation</p>
          <p style="color: #888; font-size: 0.8rem; margin-bottom: 1rem;">Your order has been sent to the kitchen.</p>
          <p style="font-size: 1rem; color: #DC143C; font-weight: 700;">${newOrder.orderNumberFormatted}</p>
          <p style="font-size: 0.75rem; color: #888;">Customer #: ${customerNumber}</p>
          <p style="font-size: 0.75rem; color: #888;">Payment: ${paymentMethod === "cash" ? "Cash" : "GCash"}</p>
          <p style="font-weight: 700; margin: 0.8rem 0; font-size: 1rem;">Total: ₱${totalAmount}</p>
          <div style="display: flex; gap: 12px; margin-top: 12px;">
            <button id="viewOrderSlipBtn" style="background: #DC143C; color: white; border: none; padding: 10px 20px; border-radius: 40px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; flex: 1;">View Order Slip</button>
            <button id="closeSuccessModal" style="background: #ddd; border: none; padding: 10px 20px; border-radius: 40px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; flex: 1;">Continue</button>
          </div>
        </div>
      `;

      document.body.appendChild(modalOverlay);

      const viewBtn = document.getElementById("viewOrderSlipBtn");
      viewBtn.addEventListener("click", () => {
        modalOverlay.remove();
        window.location.href = "orderslip.html";
      });

      const closeBtn = document.getElementById("closeSuccessModal");
      closeBtn.addEventListener("click", () => {
        modalOverlay.remove();
        window.location.href = "menu.html";
      });
    },
  );
}

async function createOrderSlip(
  customerNumber,
  paymentMethod,
  totalAmount,
  items,
) {
  console.log("📝 Creating order slip...");

  try {
    const dietary = getCurrentDietary();

    const orderData = {
      customerNumber: customerNumber,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      orderNumber: nextOrderNumber,
      orderNumberFormatted: `#${nextOrderNumber.toString().padStart(3, "0")}`,
      dietary: dietary,
      status: "pending",
    };

    console.log("📤 Sending order to server:", orderData);

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    console.log("📥 Server response:", result);

    if (result.success) {
      const now = new Date();
      const orderSlip = {
        orderNumber: nextOrderNumber,
        orderNumberFormatted: `#${nextOrderNumber.toString().padStart(3, "0")}`,
        customerNumber: customerNumber,
        items: items.map((item) => ({ ...item })),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        timestamp: now.toISOString(),
        estimatedTime: "—",
        status: "pending",
        dietary: dietary,
        _id: result.id,
        declineReason: null,
        lastUpdated: new Date(now.getTime() + 1000).toISOString(),
      };

      orderSlips.unshift(orderSlip);
      localStorage.setItem("silentBite_orderSlips", JSON.stringify(orderSlips));
      nextOrderNumber++;
      localStorage.setItem("silentBite_nextOrderNumber", nextOrderNumber);
      return orderSlip;
    } else {
      console.warn("⚠️ Server failed, using local storage fallback");
      return createOrderSlipLocal(
        customerNumber,
        paymentMethod,
        totalAmount,
        items,
      );
    }
  } catch (error) {
    console.error("❌ Error saving order:", error);
    return createOrderSlipLocal(
      customerNumber,
      paymentMethod,
      totalAmount,
      items,
    );
  }
}

function createOrderSlipLocal(
  customerNumber,
  paymentMethod,
  totalAmount,
  items,
) {
  const orderNumber = nextOrderNumber;
  nextOrderNumber++;
  localStorage.setItem("silentBite_nextOrderNumber", nextOrderNumber);

  const now = new Date();
  const orderSlip = {
    orderNumber: orderNumber,
    orderNumberFormatted: `#${orderNumber.toString().padStart(3, "0")}`,
    customerNumber: customerNumber,
    items: items.map((item) => ({ ...item })),
    totalAmount: totalAmount,
    paymentMethod: paymentMethod,
    timestamp: now.toISOString(),
    estimatedTime: "—",
    status: "pending",
    declineReason: null,
    lastUpdated: new Date(now.getTime() + 1000).toISOString(),
  };

  orderSlips.unshift(orderSlip);
  localStorage.setItem("silentBite_orderSlips", JSON.stringify(orderSlips));
  return orderSlip;
}

// ============================================================
// ========== ORDER SLIP FUNCTIONS ==========
// ============================================================

async function renderOrderSlipPage() {
  const container = document.getElementById("orderslipContainer");
  const emptyMessage = document.getElementById("emptyOrderslipMessage");

  if (!container) return;

  markOrderUpdatesAsRead();
  await syncOrderStatusFromServer();

  const stored = localStorage.getItem("silentBite_orderSlips");
  let slips = [];
  if (stored) {
    try {
      slips = JSON.parse(stored);
      orderSlips = slips;
    } catch (e) {
      console.error("Error parsing slips:", e);
      slips = [];
    }
  }

  if (slips.length === 0) {
    container.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "block";
    return;
  }
  if (emptyMessage) emptyMessage.style.display = "none";

  const sortedSlips = sortOrdersByLastUpdated(slips);
  const unreadOrders =
    JSON.parse(localStorage.getItem("silentBite_unreadOrders")) || [];

  let html = "";
  sortedSlips.forEach((slip) => {
    const statusDisplay = getCustomerStatusDisplay(slip.status);
    const statusColor = getCustomerStatusColor(slip.status);
    const statusIcon = getCustomerStatusIcon(slip.status);
    const statusMessage = getCustomerStatusMessage(slip.status);

    const hasUpdate = unreadOrders.some(
      (u) => u.orderNumber === slip.orderNumber,
    );
    const isNewUpdate =
      slip.status === "confirmed" ||
      slip.status === "preparing" ||
      slip.status === "ready" ||
      slip.status === "declined";
    const unreadDeclined = unreadOrders.some(
      (u) => u.orderNumber === slip.orderNumber && u.newStatus === "declined",
    );

    let declineReason = slip.declineReason || null;
    if (
      declineReason === null ||
      declineReason === "null" ||
      declineReason === "undefined"
    ) {
      declineReason = "No reason provided";
    }

    html += `
      <div class="orderslip-card ${(hasUpdate && isNewUpdate) || (unreadDeclined && slip.status === "declined") ? "new-update" : ""}" 
           data-order="${slip.orderNumber}" 
           style="${(hasUpdate && isNewUpdate) || (unreadDeclined && slip.status === "declined") ? "border-left: 4px solid #dc143c; animation: slideIn 0.5s ease;" : ""}
                  ${slip.status === "declined" ? "border-left: 4px solid #dc3545; background: #fff8f8;" : ""}">
        
        ${
          (hasUpdate && isNewUpdate) ||
          (unreadDeclined && slip.status === "declined")
            ? `<div style="position: absolute; top: -8px; right: -8px; background: #dc143c; color: white; font-size: 0.6rem; padding: 2px 10px; border-radius: 20px; font-weight: 700;">NEW</div>`
            : ""
        }
        
        <div class="orderslip-status" style="background: ${statusColor.bg}; color: ${statusColor.text}; border: 1px solid ${statusColor.text}33;">
          <span>${statusIcon}</span> ${statusDisplay}
        </div>
        
        <div class="orderslip-number">
          <span class="big-number">${slip.orderNumberFormatted}</span>
          <span class="number-label">ORDER NUMBER</span>
        </div>
        
        ${
          slip.status === "declined"
            ? `
          <div style="background: #fef3f0; border: 1px solid #f5c6cb; border-radius: 12px; padding: 12px; margin: 8px 0; text-align: left;">
            <div style="font-weight: 600; color: #dc3545; font-size: 0.8rem; margin-bottom: 4px;">💬 Reason for Decline:</div>
            <div style="
              color: #721c24; 
              font-size: 0.9rem; 
              word-wrap: break-word; 
              overflow-wrap: break-word; 
              word-break: break-word;
              line-height: 1.4;
              max-height: 80px;
              overflow-y: auto;
              padding-right: 4px;
            ">${declineReason}</div>
          </div>
          `
            : ""
        }
        
        <div class="orderslip-estimated">
          <span class="clock-icon">⏱️</span>
          <span class="estimated-text">${getEstimatedTimeDisplay(slip)}</span>
        </div>
        
        <button class="view-order-btn" onclick="viewOrderDetails(${slip.orderNumber})" data-order="${slip.orderNumber}">📋 VIEW ORDER</button>
        
        <div class="orderslip-thanks">
          ${statusMessage}
        </div>
        
        ${slip.status === "completed" ? `<button class="order-again-btn" onclick="orderAgain(${slip.orderNumber})" data-order="${slip.orderNumber}">🔄 ORDER AGAIN</button>` : ""}
      </div>
    `;
  });

  container.innerHTML = html;
}

function sortOrdersByLastUpdated(orders) {
  return [...orders].sort((a, b) => {
    const aTime = a.lastUpdated || a.timestamp || 0;
    const bTime = b.lastUpdated || b.timestamp || 0;
    return new Date(bTime) - new Date(aTime);
  });
}

function getCustomerStatusDisplay(status) {
  const statusMap = {
    pending: "⏳ Pending Confirmation",
    confirmed: "✅ Order Confirmed",
    preparing: "👨‍🍳 Preparing",
    ready: "🛵 Ready for Pickup",
    completed: "📦 Order Successful",
    declined: "❌ Order Declined",
  };
  return statusMap[status] || status || "⏳ Pending Confirmation";
}

function getCustomerStatusColor(status) {
  const colorMap = {
    pending: { bg: "#fff3cd", text: "#856404" },
    confirmed: { bg: "#cce5ff", text: "#004085" },
    preparing: { bg: "#fce4ec", text: "#721c24" },
    ready: { bg: "#d4edda", text: "#155724" },
    completed: { bg: "#d1ecf1", text: "#0c5460" },
    declined: { bg: "#f8d7da", text: "#721c24" },
  };
  return colorMap[status] || colorMap.pending;
}

function getCustomerStatusIcon(status) {
  const iconMap = {
    pending: "⏳",
    confirmed: "✅",
    preparing: "👨‍🍳",
    ready: "🛵",
    completed: "🎉",
    declined: "❌",
  };
  return iconMap[status] || "⏳";
}

function getCustomerStatusMessage(status) {
  const messageMap = {
    pending: "Your order is waiting for staff confirmation 🙏",
    confirmed: "Your order has been confirmed and will be prepared soon! ✅",
    preparing: "Your order is being prepared by our chefs 👨‍🍳",
    ready: "Your order is ready for pickup! Please come to the counter 🛵",
    completed: "Thank you for ordering! We hope you enjoyed your meal! 🎉",
    declined:
      "We're sorry, your order has been declined. Please contact support. ❌",
  };
  return messageMap[status] || "Thank you for your patience 🙏";
}

function getEstimatedTimeDisplay(slip) {
  const status = slip.status || "pending";

  if (status === "completed") return "✅ Done";
  if (status === "declined") return "❌ Declined";
  if (status === "ready") return "🛵 Ready for Pickup";

  if (status === "confirmed" || status === "preparing") {
    if (slip.estimatedTime && slip.estimatedTime !== "—") {
      return `⏱️ ${slip.estimatedTime}`;
    }
    return status === "confirmed" ? "⏱️ Waiting for ETA..." : "⏱️ Preparing...";
  }

  if (status === "pending") return "⏳ Waiting for confirmation...";

  if (slip.estimatedTime && slip.estimatedTime !== "—") {
    return `⏱️ ${slip.estimatedTime}`;
  }
  return "⏳ Waiting for confirmation...";
}

function viewOrderDetails(orderNumber) {
  const slip = orderSlips.find((s) => s.orderNumber === orderNumber);
  if (!slip) {
    syncOrderStatusFromServer().then(() => {
      const updatedSlip = orderSlips.find((s) => s.orderNumber === orderNumber);
      if (updatedSlip) {
        showOrderDetailsModalContent(updatedSlip);
      } else {
        showToast("Order details not found");
      }
    });
    return;
  }
  showOrderDetailsModalContent(slip);
}

function showOrderDetailsModalContent(slip) {
  const modalOverlay = document.createElement("div");
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.2s ease;
  `;

  const itemsListHtml = slip.items
    .map(
      (item) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0e2d2; font-family: 'Inter', sans-serif; font-size: 0.9rem;">
      <span style="font-weight: 500; color: #333;">${item.name} <span style="color: #DC143C; font-weight: 600;">x${item.quantity}</span></span>
      <span style="font-weight: 600; color: #DC143C;">₱${item.price * item.quantity}</span>
    </div>
  `,
    )
    .join("");

  const statusColor = getCustomerStatusColor(slip.status);
  const statusDisplay = getCustomerStatusDisplay(slip.status);
  const statusIcon = getCustomerStatusIcon(slip.status);
  const isDeclined = slip.status === "declined";

  let declineReasonHtml = "";
  if (isDeclined && slip.declineReason) {
    declineReasonHtml = `
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 4px; background: #fef3f0; padding: 8px 12px; border-radius: 8px;">
        <span style="color: #666; font-weight: 600;">💬 Reason for Decline:</span>
        <span style="font-weight: 500; color: #dc3545; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; line-height: 1.5; max-height: 100px; overflow-y: auto; padding: 4px 0;">${slip.declineReason}</span>
      </div>
    `;
  } else if (isDeclined && !slip.declineReason) {
    declineReasonHtml = `
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 4px; background: #fef3f0; padding: 8px 12px; border-radius: 8px;">
        <span style="color: #666; font-weight: 600;">💬 Reason for Decline:</span>
        <span style="font-weight: 500; color: #dc3545;">No reason provided</span>
      </div>
    `;
  }

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    max-width: 400px;
    width: 90%;
    border-radius: 28px;
    overflow: hidden;
    animation: slideUp 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
  `;

  modalContent.innerHTML = `
    <div style="background: ${isDeclined ? "#dc3545" : "#DC143C"}; padding: 1.2rem; text-align: center;">
      <span style="font-size: 2rem;">${isDeclined ? "❌" : "📋"}</span>
      <h3 style="color: white; font-size: 1.3rem; font-weight: 700; margin-top: 6px;">Order ${slip.orderNumberFormatted}</h3>
    </div>
    <div style="padding: 1.2rem;">
      <div style="background: #f8f8f8; padding: 12px; border-radius: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
          <span style="color: #666;">Customer #:</span>
          <span style="font-weight: 600; color: #333;">${slip.customerNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
          <span style="color: #666;">Payment:</span>
          <span style="font-weight: 600; color: #333;">${slip.paymentMethod === "cash" ? "Cash" : "GCash"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
          <span style="color: #666;">Ordered:</span>
          <span style="font-weight: 600; color: #333;">${new Date(slip.timestamp).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 4px;">
          <span style="color: #666;">⏱️ Status:</span>
          <span style="font-weight: 600; color: ${statusColor.text};">${statusIcon} ${statusDisplay}</span>
        </div>
        ${declineReasonHtml}
        ${
          slip.estimatedTime && slip.estimatedTime !== "—" && !isDeclined
            ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-top: 4px;">
            <span style="color: #666;">⏱️ ETA:</span>
            <span style="font-weight: 600; color: #dc143c;">${slip.estimatedTime}</span>
          </div>
          `
            : ""
        }
      </div>
      <div style="font-weight: 700; font-size: 0.85rem; color: #DC143C; margin-bottom: 8px; letter-spacing: 0.5px;">
        ORDER ITEMS
      </div>
      <div style="max-height: 300px; overflow-y: auto; margin-bottom: 16px;">
        ${itemsListHtml}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #f0e2d2; padding-top: 12px; margin-top: 4px;">
        <span style="font-weight: 700; font-size: 1rem;">TOTAL</span>
        <span style="font-weight: 800; font-size: 1.3rem; color: #DC143C;">₱${slip.totalAmount}</span>
      </div>
      <button id="closeDetailsModal" style="
        background: ${isDeclined ? "#dc3545" : "#DC143C"};
        color: white;
        border: none;
        padding: 12px;
        border-radius: 40px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        width: 100%;
        margin-top: 16px;
        font-family: 'Inter', sans-serif;
      ">Close</button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  const closeBtn = document.getElementById("closeDetailsModal");
  closeBtn.addEventListener("click", () => {
    modalOverlay.remove();
  });
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

function orderAgain(orderNumber) {
  const slip = orderSlips.find((s) => s.orderNumber === orderNumber);
  if (!slip) return;
  cart = [];
  slip.items.forEach((item) => {
    const existingItem = cart.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push({ ...item, quantity: item.quantity });
    }
  });
  saveCart();
  showToast(`Previous order added to cart!`);
  window.location.href = "cart.html";
}

// ============================================================
// ========== SYNC FUNCTIONS ==========
// ============================================================

async function syncOrderStatusFromServer() {
  const customerNumber = getCustomerNumber();
  if (!customerNumber) return;

  try {
    const response = await fetch(
      `${API_URL}/orders/customer/${customerNumber}`,
    );
    if (!response.ok) return;

    const serverOrders = await response.json();
    let localSlips = getAllOrderSlips();
    let updated = false;

    serverOrders.forEach((serverOrder) => {
      const localSlip = localSlips.find(
        (s) => s.orderNumber === serverOrder.orderNumber,
      );

      if (localSlip) {
        const oldStatus = localSlip.status || "pending";
        const newStatus = serverOrder.status || "pending";

        if (oldStatus !== newStatus) {
          localSlip.status = newStatus;
          localSlip.estimatedTime =
            serverOrder.estimatedTime || localSlip.estimatedTime || "—";
          localSlip.lastUpdated = new Date().toISOString();

          if (newStatus === "declined") {
            localSlip.declineReason =
              serverOrder.declineReason || "No reason provided";
          } else {
            localSlip.declineReason = null;
          }
          updated = true;
        }
      }
    });

    if (updated) {
      localStorage.setItem("silentBite_orderSlips", JSON.stringify(localSlips));
      orderSlips = localSlips;
    }
  } catch (error) {
    console.error("Error syncing orders:", error);
  }
}

function markOrderUpdatesAsRead() {
  if (unreadOrderUpdates.length === 0) return;
  unreadOrderUpdates = [];
  localStorage.setItem(
    "silentBite_unreadOrders",
    JSON.stringify(unreadOrderUpdates),
  );
  updateOrderSlipBadge();
}

function updateOrderSlipBadge() {
  const badge = document.getElementById("orderSlipBadge");
  const unreadCount = unreadOrderUpdates.length;

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = "flex";
      badge.style.animation = "pulse-badge 1.5s ease-in-out infinite";
    } else {
      badge.style.display = "none";
      badge.style.animation = "none";
    }
  }
  updateNavIconBadge();
}

function updateNavIconBadge() {
  const navOrderslip = document.querySelector(
    '.nav-icon[data-nav="orderslip"]',
  );
  if (navOrderslip) {
    const existingBadge = navOrderslip.querySelector(".nav-badge");
    if (existingBadge) existingBadge.remove();

    const unreadCount = unreadOrderUpdates.length;
    if (unreadCount > 0) {
      const badge = document.createElement("span");
      badge.className = "nav-badge";
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -10px;
        background: #dc143c;
        color: white;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 50%;
        min-width: 20px;
        height: 20px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse-badge 1.5s ease-in-out infinite;
        border: 2px solid white;
        z-index: 10;
      `;
      badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
      navOrderslip.style.position = "relative";
      navOrderslip.appendChild(badge);
    }
  }
}

async function checkOrderUpdates() {
  const customerNumber = getCustomerNumber();
  if (!customerNumber) return;

  try {
    const response = await fetch(
      `${API_URL}/orders/customer/${customerNumber}`,
    );
    if (!response.ok) return;

    const serverOrders = await response.json();
    let localSlips = getAllOrderSlips();
    let hasUpdates = false;

    serverOrders.forEach((serverOrder) => {
      const localSlip = localSlips.find(
        (s) => s.orderNumber === serverOrder.orderNumber,
      );

      if (localSlip) {
        const localStatus = localSlip.status || "pending";
        const serverStatus = serverOrder.status || "pending";

        if (localStatus !== serverStatus) {
          localSlip.status = serverStatus;
          localSlip.estimatedTime =
            serverOrder.estimatedTime || localSlip.estimatedTime;
          localSlip.lastUpdated = new Date().toISOString();
          if (serverStatus === "declined" && serverOrder.declineReason) {
            localSlip.declineReason = serverOrder.declineReason;
          }
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      localStorage.setItem("silentBite_orderSlips", JSON.stringify(localSlips));
      orderSlips = localSlips;
      updateOrderSlipBadge();
      if (document.getElementById("orderslipContainer")) {
        renderOrderSlipPage();
      }
    }
  } catch (error) {
    console.log("Error checking order updates:", error.message);
  }
}

// ============================================================
// ========== DIETARY FUNCTIONS ==========
// ============================================================

function loadPrefs() {
  const stored = localStorage.getItem("silentBite_dietaryPrefs");
  if (stored) {
    try {
      const p = JSON.parse(stored);
      userDietary = { ...userDietary, ...p };
      console.log("✅ Dietary preferences loaded:", userDietary);
    } catch (e) {
      console.error("Error loading dietary prefs:", e);
    }
  }
}

function getCurrentDietary() {
  const stored = localStorage.getItem("silentBite_dietaryPrefs");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing dietary prefs:", e);
    }
  }
  return {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    pescatarian: false,
    lowCarb: false,
    highProtein: false,
  };
}

function savePrefToLocal() {
  localStorage.setItem("silentBite_dietaryPrefs", JSON.stringify(userDietary));
  const customerNumber = getCustomerNumber();
  if (customerNumber) {
    savePreferencesToMongoDB(customerNumber, userDietary);
  }
  console.log("✅ Dietary preferences saved:", userDietary);
}

async function savePreferencesToMongoDB(customerNumber, dietary) {
  try {
    const response = await fetch(`${API_URL}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerNumber: customerNumber,
        dietary: dietary,
        updatedAt: new Date().toISOString(),
      }),
    });
    const result = await response.json();
    console.log("✅ Preferences saved:", result);
    return result;
  } catch (error) {
    console.error("Error saving preferences:", error);
    return null;
  }
}

function showDietaryModal(onSaveCallback) {
  const modalDiv = document.createElement("div");
  modalDiv.className = "modal-diet-wrapper";
  modalDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  `;

  const modalCard = document.createElement("div");
  modalCard.style.cssText = `
    background: white;
    max-width: 380px;
    width: 90%;
    border-radius: 36px;
    padding: 1.5rem;
    font-family: 'Inter', sans-serif;
  `;

  modalCard.innerHTML = `
    <h3 style="margin-bottom:0.75rem; font-size: 1.3rem; color: #DC143C;">🍽️ Dietary preferences</h3>
    <div style="margin:0.6rem 0;"><label><input type="checkbox" id="dietVeg"> 🌱 Vegetarian</label></div>
    <div style="margin:0.6rem 0;"><label><input type="checkbox" id="dietVegan"> 🌿 Vegan</label></div>
    <div style="margin:0.6rem 0;"><label><input type="checkbox" id="dietGF"> 🚫 Gluten-Free</label></div>
    <div style="margin:0.6rem 0;"><label><input type="checkbox" id="dietPesc"> 🐟 Pescatarian</label></div>
    <div style="margin:0.6rem 0;"><label><input type="checkbox" id="dietLC"> 🥗 Low-Carb</label></div>
    <div style="margin:0.6rem 0;"><label><input type="checkbox" id="dietHP"> 💪 High-Protein</label></div>
    <div style="display:flex; gap:12px; margin-top:1.5rem;">
      <button id="modalSaveBtn" style="background:#DC143C; color:white; border:none; padding:8px 18px; border-radius:40px; cursor:pointer; font-family:'Inter', sans-serif;">Save</button>
      <button id="modalCancelBtn" style="background:#ddd; border:none; border-radius:40px; padding:8px 18px; cursor:pointer; font-family:'Inter', sans-serif;">Cancel</button>
    </div>
  `;

  modalDiv.appendChild(modalCard);
  document.body.appendChild(modalDiv);

  document.getElementById("dietVeg").checked = userDietary.vegetarian;
  document.getElementById("dietVegan").checked = userDietary.vegan;
  document.getElementById("dietGF").checked = userDietary.glutenFree;
  document.getElementById("dietPesc").checked = userDietary.pescatarian;
  document.getElementById("dietLC").checked = userDietary.lowCarb;
  document.getElementById("dietHP").checked = userDietary.highProtein;

  document.getElementById("modalSaveBtn").onclick = () => {
    userDietary = {
      vegetarian: document.getElementById("dietVeg").checked,
      vegan: document.getElementById("dietVegan").checked,
      glutenFree: document.getElementById("dietGF").checked,
      pescatarian: document.getElementById("dietPesc").checked,
      lowCarb: document.getElementById("dietLC").checked,
      highProtein: document.getElementById("dietHP").checked,
    };
    savePrefToLocal();
    document.body.removeChild(modalDiv);
    if (onSaveCallback) onSaveCallback();
    if (document.querySelector(".menu-page")) {
      renderRecommendations();
      renderMenu();
    }
  };

  document.getElementById("modalCancelBtn").onclick = () =>
    document.body.removeChild(modalDiv);
}

function getDietaryTags(dietary) {
  const tags = [];
  if (dietary.vegetarian) tags.push("🌱 Vegetarian");
  if (dietary.vegan) tags.push("🌿 Vegan");
  if (dietary.glutenFree) tags.push("🚫 Gluten-Free");
  if (dietary.pescatarian) tags.push("🐟 Pescatarian");
  if (dietary.lowCarb) tags.push("🥗 Low-Carb");
  if (dietary.highProtein) tags.push("💪 High-Protein");
  if (tags.length === 0) {
    return '<span style="color: #999; font-style: italic;">None selected</span>';
  }
  return tags
    .map(
      (tag) => `
    <span style="display: inline-block; background: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 500; color: #8B0000; border: 1px solid #e0c8b8;">${tag}</span>
  `,
    )
    .join("");
}

// ============================================================
// ========== EMPTY CART MODAL ==========
// ============================================================

function showEmptyCartModal() {
  const modalOverlay = document.createElement("div");
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.2s ease;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    max-width: 340px;
    width: 85%;
    border-radius: 32px;
    text-align: center;
    overflow: hidden;
    animation: slideUp 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
  `;

  modalContent.innerHTML = `
    <div style="background: #DC143C; padding: 1.5rem 1rem 1rem;">
      <span style="font-size: 4rem;">🛒</span>
    </div>
    <div style="padding: 1.5rem 1.5rem 2rem;">
      <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; color: #2c2b28;">Your cart is empty</h3>
      <p style="color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; line-height: 1.4;">
        You haven't added any meals to your cart yet.<br>
        Browse our menu and add your favorites!
      </p>
      <button id="emptyCartModalCloseBtn" style="
        background: #DC143C;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 40px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        width: 100%;
        margin-bottom: 10px;
        font-family: 'Inter', sans-serif;
      ">Browse Menu 🍽️</button>
      <button id="emptyCartModalCancelBtn" style="
        background: none;
        color: #999;
        border: none;
        padding: 8px;
        font-size: 0.8rem;
        cursor: pointer;
        width: 100%;
        font-family: 'Inter', sans-serif;
      ">Cancel</button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

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

  const closeBtn = document.getElementById("emptyCartModalCloseBtn");
  closeBtn.addEventListener("click", () => {
    modalOverlay.remove();
    window.location.href = "menu.html";
  });

  const cancelBtn = document.getElementById("emptyCartModalCancelBtn");
  cancelBtn.addEventListener("click", () => {
    modalOverlay.remove();
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

// ============================================================
// ========== BOTTOM NAVIGATION ==========
// ============================================================

function initBottomNav() {
  const navButtons = document.querySelectorAll(".nav-icon");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.nav;
      if (action === "menu") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "cart") {
        window.location.href = "cart.html";
      } else if (action === "payment") {
        if (cart.length === 0) {
          showEmptyCartModal();
        } else {
          window.location.href = "payment.html";
        }
      } else if (action === "orderslip") {
        window.location.href = "orderslip.html";
      }
    });
  });
}

// ============================================================
// ========== MIGRATE OLD ORDER SLIPS ==========
// ============================================================

function migrateOrderSlips() {
  const stored = localStorage.getItem("silentBite_orderSlips");
  if (stored) {
    try {
      const slips = JSON.parse(stored);
      let needsUpdate = false;

      slips.forEach((slip) => {
        if (!slip.hasOwnProperty("lastUpdated")) {
          slip.lastUpdated = slip.timestamp || new Date().toISOString();
          needsUpdate = true;
        }
        if (!slip.hasOwnProperty("declineReason")) {
          slip.declineReason = null;
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        localStorage.setItem("silentBite_orderSlips", JSON.stringify(slips));
        orderSlips = slips;
        console.log("✅ Migrated old order slips with lastUpdated field");
      }
    } catch (e) {
      console.error("Error migrating order slips:", e);
    }
  }
}

// ============================================================
// ========== INITIALIZE ==========
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Script loaded, initializing...");

  // Migrate old order slips first
  migrateOrderSlips();
  loadPrefs();
  saveCart();
  updateCartBadge();

  // ========== MENU PAGE ==========
  if (document.getElementById("menuGrid")) {
    console.log("📋 Menu page detected");
    renderRecommendations();
    renderMenu();
    initBottomNav();

    document.querySelectorAll(".cat-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentCategory = btn.dataset.cat;
        renderMenu();
        document
          .querySelectorAll(".cat-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Start checking for order updates
    checkOrderUpdates();
    updateOrderSlipBadge();

    setInterval(() => {
      checkOrderUpdates();
    }, 15000);
  }

  // ========== CART PAGE ==========
  if (document.getElementById("cartItemsContainer")) {
    console.log("📋 Cart page detected");
    renderCartPage();

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          showEmptyCartModal();
        } else {
          window.location.href = "payment.html";
        }
      });
    }
  }

  // ========== PAYMENT PAGE ==========
  if (document.getElementById("orderSummaryList")) {
    console.log("📋 Payment page detected");
    renderPaymentPage();

    const confirmBtn = document.getElementById("confirmOrderBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", confirmOrder);
    }
  }

  // ========== ORDER SLIP PAGE ==========
  if (document.getElementById("orderslipContainer")) {
    console.log("📋 Order slip page detected");
    renderOrderSlipPage();

    setInterval(() => {
      checkOrderUpdates();
      renderOrderSlipPage();
    }, 10000);
  }

  // ========== DIETARY PREFERENCES BUTTON ==========
  const prefBtn = document.getElementById("openPrefLanding");
  if (prefBtn) {
    prefBtn.addEventListener("click", () => showDietaryModal(() => {}));
  }

  console.log("✅ Initialization complete");
});

console.log("✅ script.js loaded successfully!");
