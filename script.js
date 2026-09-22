// ========== ORDER SLIP FILTER STATE (PERSISTENT) ==========
let orderslipDateFilter =
  localStorage.getItem("silentBite_orderslipFilter") || "all";
let orderslipCustomDateFrom =
  localStorage.getItem("silentBite_orderslipCustomFrom") || null;
let orderslipCustomDateTo =
  localStorage.getItem("silentBite_orderslipCustomTo") || null;

// ========== NOTIFICATION SYSTEM ==========
let unreadOrderUpdates =
  JSON.parse(localStorage.getItem("silentBite_unreadOrders")) || [];
let lastCheckedStatus =
  JSON.parse(localStorage.getItem("silentBite_lastOrderStatus")) || {};

// 🔥 DIETARY ACCORDION STATE (declare early to avoid TDZ error)
let dietAccordionOpen = false;

// 🔥 SEARCH STATE (declare early to avoid TDZ error)
let isSearchOverlayOpen = false;
let currentSearchQuery = "";

// ========== FILIPINO FOOD MENU DATA (WITH ALLERGENS) ==========
const menuData = [
  // ========== RICE MEALS ==========
  {
    id: 1,
    name: "Chicken Adobo Rice",
    category: "Rice Meals",
    price: 75,
    img: "adobo.jpg",
    dietary: ["High-Protein"],
    allergens: ["Soy"], // 🔥 ADD THIS
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
    allergens: ["Fish"], // 🔥 ADD THIS
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
    allergens: ["Soy"], // 🔥 ADD THIS
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
    allergens: ["Dairy", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Sesame", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Dairy", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Egg", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Dairy", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Dairy", "Nuts", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Gluten"], // 🔥 ADD THIS
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
    allergens: ["Egg", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Dairy", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Dairy", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Dairy"], // 🔥 ADD THIS
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
    allergens: ["Dairy"], // 🔥 ADD THIS
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
    allergens: ["Dairy", "Gluten"], // 🔥 ADD THIS
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
    allergens: ["Nuts", "Peanuts"], // 🔥 ADD THIS
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
    allergens: [], // 🔥 ADD THIS (no allergens)
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
    allergens: [], // 🔥 ADD THIS
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
    allergens: ["Soy"], // 🔥 ADD THIS
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
    allergens: [], // 🔥 ADD THIS
    description: "Liver Detox, Glowing Skin",
  },
  {
    id: 32,
    name: "Turmeric Ginger",
    category: "Drinks",
    price: 40,
    img: "turmeric-ginger.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Anti-Inflammatory, Clear Skin",
  },
  {
    id: 33,
    name: "Amla Immunity",
    category: "Drinks",
    price: 50,
    img: "amla-immunity.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Immune Boost, Youthful Skin",
  },
  {
    id: 34,
    name: "Fennel Digest",
    category: "Drinks",
    price: 35,
    img: "fennel-digest.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Better Digestion, Clear Skin",
  },
  {
    id: 35,
    name: "Ashwagandha Restore",
    category: "Drinks",
    price: 55,
    img: "ashwagandha-restore.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Stress Relief, Glowing Skin",
  },
  {
    id: 36,
    name: "Green Detox",
    category: "Drinks",
    price: 48,
    img: "green-detox.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Liver Cleanse, Acne Control",
  },
  {
    id: 37,
    name: "Chia Seed Energy",
    category: "Drinks",
    price: 42,
    img: "chia-seed-energy.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Energy Boost, Hydrated Skin",
  },
  {
    id: 38,
    name: "Mint Lemon Cooler",
    category: "Drinks",
    price: 30,
    img: "mint-lemon-cooler.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Digestion Support, Fresh Skin",
  },
  {
    id: 39,
    name: "Pomegranate Radiance",
    category: "Drinks",
    price: 52,
    img: "pomegranate-radiance.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Heart Health, Radiant Skin",
  },
  {
    id: 40,
    name: "Cinnamon Metabolism",
    category: "Drinks",
    price: 38,
    img: "cinnamon-metabolism.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Blood Sugar Balance, Glowing Skin",
  },
  {
    id: 41,
    name: "Aloe Vera Hydration",
    category: "Drinks",
    price: 44,
    img: "aloe-vera-hydration.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
    description: "Gut Health, Soothing Skin",
  },
  {
    id: 42,
    name: "Carrot Orange Vitality",
    category: "Drinks",
    price: 40,
    img: "carrot-orange-vitality.jpg",
    dietary: ["Vegan", "Gluten-Free"],
    allergens: [], // 🔥 ADD THIS
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
    allergens: [], // 🔥 ADD THIS
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
    allergens: ["Coconut"], // 🔥 ADD THIS
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
const API_URL = "http://localhost:3000/api";
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
  // WITH ALLERGEN DISPLAY
  let allergensHtml = "";
  if (item.allergens && item.allergens.length > 0) {
    allergensHtml = `
    <div style="margin-bottom: 16px;">
      <div style="font-weight: 700; font-size: 0.85rem; color: #dc3545; margin-bottom: 8px;">⚠️ ALLERGENS</div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
        ${item.allergens
          .map(
            (allergen) => `
          <span style="display: inline-block; background: #fff0f0; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: #dc3545; border: 1px solid #f5c6cb; margin: 0 4px 8px 0;">
            ${allergen}
          </span>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
  } else {
    allergensHtml = `
    <div style="margin-bottom: 16px;">
      <div style="font-weight: 700; font-size: 0.85rem; color: #28a745; margin-bottom: 8px;">✅ ALLERGENS</div>
      <div style="font-size: 0.8rem; color: #28a745; font-weight: 500;">
        No known allergens
      </div>
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
      ${allergensHtml}
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
// ========== RENDER RECOMMENDATIONS (WITH TICKER + LOOP) ==========
// ============================================================

function renderRecommendations() {
  stopRecommendationsTicker();
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
      '<span class="rec-tag">🍽️ No restrictions all items available</span>';
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

  // 🔥 Build the item HTML
  const buildItemHtml = (item, cloneIndex = "") => {
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
      <div class="rec-food-card" data-id="${item.id}" data-clone="${cloneIndex}" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); min-width: 130px; max-width: 160px; flex-shrink: 0; border: 1px solid #f0e2d2;">
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
  };

  // 🔥 Check if mobile view
  const isMobile = window.innerWidth <= 768;

  if (isMobile && recItems.length > 1) {
    // 🔥 MOBILE: Duplicate items 3x for seamless infinite scroll
    // We need enough clones so user can scroll forever
    const itemsHtml = recItems
      .map((item, i) => buildItemHtml(item, `a-${i}`))
      .join("");
    const itemsHtml2 = recItems
      .map((item, i) => buildItemHtml(item, `b-${i}`))
      .join("");
    const itemsHtml3 = recItems
      .map((item, i) => buildItemHtml(item, `c-${i}`))
      .join("");

    recItemsList.innerHTML = `
      <div class="rec-items-ticker auto-scrolling" id="recTicker">
        ${itemsHtml}${itemsHtml2}${itemsHtml3}
      </div>
    `;

    // 🔥 Set up the infinite loop + auto-scroll
    setTimeout(() => {
      initRecommendationsTicker();
    }, 100);
  } else {
    // 🔥 DESKTOP: Normal horizontal scroll
    recItemsList.innerHTML = `
      <div class="rec-items-ticker">
        ${recItems.map((item, i) => buildItemHtml(item, `d-${i}`)).join("")}
      </div>
    `;
  }

  // Attach event listeners
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

// ============================================================
// ========== INFINITE LOOP TICKER (FIXED) ==========
// ============================================================

let tickerAnimationId = null;
let isUserInteracting = false;
let tickerLastTimestamp = 0;

function initRecommendationsTicker() {
  const container = document.getElementById("recItemsList");
  const ticker = document.getElementById("recTicker");

  if (!container || !ticker) return;

  // 🔥 CRITICAL FIX: Cancel any existing animation before starting a new one
  if (tickerAnimationId) {
    cancelAnimationFrame(tickerAnimationId);
    tickerAnimationId = null;
  }

  // 🔥 Reset flags
  isUserInteracting = false;
  tickerLastTimestamp = 0;

  // Initialize scroll position in the middle
  const thirdWidth = ticker.scrollWidth / 3;
  container.scrollLeft = thirdWidth;

  const autoScrollSpeed = 0.4; // 🔥 SLOW & consistent speed

  function autoScroll(timestamp) {
    if (!tickerLastTimestamp) tickerLastTimestamp = timestamp;
    const delta = timestamp - tickerLastTimestamp;
    tickerLastTimestamp = timestamp;

    if (!isUserInteracting && container) {
      container.scrollLeft += autoScrollSpeed * (delta / 16);
    }

    // Seamless loop
    const totalWidth = ticker.scrollWidth;
    const third = totalWidth / 3;

    if (container.scrollLeft >= third * 2) {
      container.scrollLeft -= third;
    } else if (container.scrollLeft <= 0) {
      container.scrollLeft += third;
    }

    tickerAnimationId = requestAnimationFrame(autoScroll);
  }

  // Start the animation
  tickerAnimationId = requestAnimationFrame(autoScroll);

  // 🔥 Remove old listeners before adding new ones (prevent duplicates)
  const newContainer = container.cloneNode(false);
  // Don't actually replace - just remove old listeners via a flag
  // Instead, use a stored reference

  // Clean way: remove previous listeners if they exist
  if (container._tickerPause) {
    container.removeEventListener("touchstart", container._tickerPause);
    container.removeEventListener("touchend", container._tickerResume);
    container.removeEventListener("touchcancel", container._tickerResume);
    container.removeEventListener("mouseenter", container._tickerPause);
    container.removeEventListener("mouseleave", container._tickerResume);
    container.removeEventListener("mousedown", container._tickerPause);
    container.removeEventListener("mouseup", container._tickerResume);
    container.removeEventListener("wheel", container._tickerPause);
    container.removeEventListener("scroll", container._tickerScrollHandler);
  }

  // Define pause/resume
  const pauseScroll = () => {
    isUserInteracting = true;
  };

  const resumeScroll = () => {
    setTimeout(() => {
      isUserInteracting = false;
      tickerLastTimestamp = 0;
    }, 1500);
  };

  // Store references on the element for cleanup
  container._tickerPause = pauseScroll;
  container._tickerResume = resumeScroll;

  // Add listeners
  container.addEventListener("touchstart", pauseScroll, { passive: true });
  container.addEventListener("touchend", resumeScroll, { passive: true });
  container.addEventListener("touchcancel", resumeScroll, { passive: true });
  container.addEventListener("mouseenter", pauseScroll);
  container.addEventListener("mouseleave", resumeScroll);
  container.addEventListener("mousedown", pauseScroll);
  container.addEventListener("mouseup", resumeScroll);
  container.addEventListener("wheel", pauseScroll, { passive: true });

  // Handle seamless loop on manual scroll
  let scrollTimeout;
  const scrollHandler = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const totalWidth = ticker.scrollWidth;
      const third = totalWidth / 3;

      if (container.scrollLeft >= third * 2) {
        container.scrollLeft -= third;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += third;
      }
    }, 100);
  };

  container._tickerScrollHandler = scrollHandler;
  container.addEventListener("scroll", scrollHandler, { passive: true });

  console.log("✅ Recommendations ticker initialized");
}

// ========== STOP TICKER (call before re-render) ==========
function stopRecommendationsTicker() {
  if (tickerAnimationId) {
    cancelAnimationFrame(tickerAnimationId);
    tickerAnimationId = null;
    console.log("🛑 Ticker stopped");
  }
  isUserInteracting = false;
  tickerLastTimestamp = 0;
}

// ========== CLEANUP ON PAGE CHANGE ==========
window.addEventListener("beforeunload", function () {
  stopRecommendationsTicker();
});

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

// ========== RENDER ORDER SLIP PAGE - WITH DATE FILTER ==========
async function renderOrderSlipPage() {
  const container = document.getElementById("orderslipContainer");
  const emptyMessage = document.getElementById("emptyOrderslipMessage");
  const emptyFiltered = document.getElementById(
    "emptyFilteredOrderslipMessage",
  );

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

  // 🔥 If no slips at all
  if (slips.length === 0) {
    container.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "block";
    if (emptyFiltered) emptyFiltered.style.display = "none";
    return;
  }

  // 🔥 Apply date filter
  const filteredSlips = filterOrderslipsByDate(slips);

  // 🔥 If no slips after date filter
  if (filteredSlips.length === 0) {
    container.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "none";
    if (emptyFiltered) emptyFiltered.style.display = "block";
    return;
  }

  // Hide both empty messages
  if (emptyMessage) emptyMessage.style.display = "none";
  if (emptyFiltered) emptyFiltered.style.display = "none";

  const sortedSlips = sortOrdersByLastUpdated(filteredSlips);
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

    // Format the order date
    const orderDate = new Date(slip.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

        <div style="font-size: 0.7rem; color: #888; margin-bottom: 8px;">
          📅 ${orderDate}
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

  container.innerHTML = html;

  // 🔥 CHECK FOR RECENTLY COMPLETED ORDERS TO SHOW RATE PROMPT
  setTimeout(() => {
    // Check for completed orders in session storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("silentBite_completedOrder_")) {
        const orderData = JSON.parse(sessionStorage.getItem(key));
        const orderNum = key.replace("silentBite_completedOrder_", "");

        // Only show once per session
        const shownKey = `silentBite_ratePromptShown_${orderNum}`;
        if (!sessionStorage.getItem(shownKey)) {
          sessionStorage.setItem(shownKey, "true");
          showRatePromptModal(orderData);
          break; // Only show one prompt at a time
        }
      }
    }
  }, 1000);
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

// ========== MARK ORDER UPDATES AS READ (FILTER-AWARE) ==========
function markOrderUpdatesAsRead() {
  console.log("👁️ Marking updates as read (filtered)");

  // Get filtered order numbers
  let slips = getAllOrderSlips();
  const filteredSlips = filterOrderslipsByDate(slips);
  const filteredOrderNumbers = filteredSlips.map((s) => s.orderNumber);

  // 🔥 Only remove unread updates for the FILTERED orders
  unreadOrderUpdates = unreadOrderUpdates.filter(
    (u) => !filteredOrderNumbers.includes(u.orderNumber),
  );

  localStorage.setItem(
    "silentBite_unreadOrders",
    JSON.stringify(unreadOrderUpdates),
  );

  // Update both badges
  updateOrderSlipBadge();
  updateActiveOrdersBadge();
}
// ========== UPDATE ORDER SLIP BADGE (RED - RIGHT) ==========
function updateOrderSlipBadge() {
  const badge = document.getElementById("orderSlipBadge");
  const unreadCount = unreadOrderUpdates.length;

  console.log("🔴 Unread updates count:", unreadCount);

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
      badge.style.display = "flex";
      badge.style.animation = "pulse-badge 1.5s ease-in-out infinite";
    } else {
      badge.style.display = "none";
      badge.style.animation = "none";
    }
  }

  // Also update the nav icon red badge (dynamic)
  updateNavIconBadge();

  // 🔥 ALSO update the blue badge (active orders)
  updateActiveOrdersBadge();
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
// ========== CHECK ORDER UPDATES (WITH RATE PROMPT) ==========
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
    let newUnread = [];

    serverOrders.forEach((serverOrder) => {
      const localSlip = localSlips.find(
        (s) => s.orderNumber === serverOrder.orderNumber,
      );

      if (localSlip) {
        const localStatus = localSlip.status || "pending";
        const serverStatus = serverOrder.status || "pending";

        // ========== STATUS CHANGED ==========
        if (localStatus !== serverStatus) {
          console.log(
            `🔄 Order ${serverOrder.orderNumber}: ${localStatus} → ${serverStatus}`,
          );

          // Add notification (except initial pending)
          if (localStatus !== "pending" || serverStatus !== "pending") {
            const alreadyUnread = unreadOrderUpdates.some(
              (u) => u.orderNumber === serverOrder.orderNumber,
            );

            if (!alreadyUnread) {
              let declineReason = null;
              if (serverStatus === "declined") {
                declineReason = serverOrder.declineReason || null;
              }

              newUnread.push({
                orderNumber: serverOrder.orderNumber,
                orderNumberFormatted:
                  serverOrder.orderNumberFormatted ||
                  `#${serverOrder.orderNumber.toString().padStart(3, "0")}`,
                newStatus: serverStatus,
                declineReason: declineReason,
                timestamp: new Date().toISOString(),
              });
            }
          }

          // 🔥 UPDATE LOCAL SLIP WITH FULL DATA
          localSlip.status = serverStatus;
          localSlip.estimatedTime =
            serverOrder.estimatedTime || localSlip.estimatedTime;
          localSlip.lastUpdated = new Date().toISOString();
          localSlip.items = serverOrder.items || localSlip.items;
          localSlip.orderNumberFormatted =
            serverOrder.orderNumberFormatted || localSlip.orderNumberFormatted;

          if (serverStatus === "declined" && serverOrder.declineReason) {
            localSlip.declineReason = serverOrder.declineReason;
          } else if (serverStatus !== "declined") {
            localSlip.declineReason = null;
          }

          hasUpdates = true;

          // ============================================================
          // 🔥🔥🔥 CHECK IF ORDER WAS JUST COMPLETED - SHOW RATE PROMPT
          // ============================================================
          if (serverStatus === "completed") {
            console.log(`✅ Order ${serverOrder.orderNumber} completed!`);
            console.log(`   Will show rate prompt for:`, localSlip.items);

            // Update local slip with completed items
            const completedSlip = { ...localSlip };

            // Store for later (in case customer navigates)
            sessionStorage.setItem(
              `silentBite_completedOrder_${serverOrder.orderNumber}`,
              JSON.stringify(completedSlip),
            );

            // Add to pending ratings
            if (typeof addToPendingRatings === "function") {
              addToPendingRatings(completedSlip);
              console.log("   ⭐ Added to pending ratings");
            }

            // Update rate badge
            if (typeof updateRateBadge === "function") {
              updateRateBadge();
            }

            // 🔥 SHOW THE PROMPT MODAL IMMEDIATELY
            // (works from any page since it's an overlay)
            setTimeout(() => {
              console.log("   🎉 Showing rate prompt modal...");
              if (typeof showRatePromptModal === "function") {
                showRatePromptModal(completedSlip);
              } else {
                console.warn("⚠️ showRatePromptModal not defined!");
              }
            }, 800);
          }
          // ============================================================
        }
      }
    });

    // Save new notifications
    if (newUnread.length > 0) {
      unreadOrderUpdates = [...unreadOrderUpdates, ...newUnread];
      localStorage.setItem(
        "silentBite_unreadOrders",
        JSON.stringify(unreadOrderUpdates),
      );
    }

    // Save updated slips
    if (hasUpdates) {
      localStorage.setItem("silentBite_orderSlips", JSON.stringify(localSlips));
      orderSlips = localSlips;

      if (document.getElementById("orderslipContainer")) {
        renderOrderSlipPage();
      }
    }

    // Update badges
    if (typeof updateAllBadges === "function") {
      updateAllBadges();
    }
    if (typeof updateRateBadge === "function") {
      updateRateBadge();
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
// ========== BOTTOM NAVIGATION (FIXED) ==========
// ============================================================

function initBottomNav() {
  const navButtons = document.querySelectorAll(".nav-icon");

  navButtons.forEach((btn) => {
    // 🔥 Check if this button already has a listener
    if (btn.dataset.navListener === "true") {
      return;
    }

    btn.dataset.navListener = "true";

    btn.addEventListener("click", () => {
      const action = btn.dataset.nav;

      if (action === "menu") {
        window.location.href = "menu.html";
      } else if (action === "cart") {
        window.location.href = "cart.html";
      } else if (action === "payment") {
        if (cart.length === 0) {
          showEmptyCartModal();
        } else {
          window.location.href = "payment.html";
        }
      } else if (action === "rate" || action === "ratings") {
        // 🔥 FIX: Go to rate page
        window.location.href = "rate.html";
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

  // 🔥 INITIALIZE BOTTOM BAR AUTO-HIDE
  initScrollHideBottomBar();

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

    // 🔍 Initialize search bar state (closed by default)
    const searchBar = document.getElementById("menuSearchBar");
    if (searchBar) {
      searchBar.classList.remove("open");
      isSearchBarOpen = false;
    }

    // 🔥 INITIALIZE DIETARY ACCORDION
    initDietAccordion();

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

    // 🔥 UPDATE RATE BADGE
    updateRateBadge();

    const savedFilter =
      localStorage.getItem("silentBite_orderslipFilter") || "all";
    orderslipDateFilter = savedFilter;

    updateAllBadges();
    checkOrderUpdates();

    setInterval(() => {
      checkOrderUpdates();
    }, 10000);
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

  // ========== RATE PAGE ==========
  if (document.getElementById("rateContainer")) {
    console.log("📋 Rate page detected");
    renderRatePage();
    initBottomNav();

    // Check for pending ratings every 10 seconds
    setInterval(() => {
      renderRatePage();
    }, 10000);
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

    const orderslipFilterSelect = document.getElementById(
      "orderslipDateFilter",
    );
    if (orderslipFilterSelect) {
      orderslipFilterSelect.value = orderslipDateFilter;
    }

    const customRange = document.getElementById("orderslipCustomDateRange");
    if (orderslipDateFilter === "custom" && customRange) {
      customRange.style.display = "flex";

      const fromInput = document.getElementById("orderslipCustomDateFrom");
      const toInput = document.getElementById("orderslipCustomDateTo");

      if (fromInput && orderslipCustomDateFrom) {
        fromInput.value = orderslipCustomDateFrom;
      }
      if (toInput && orderslipCustomDateTo) {
        toInput.value = orderslipCustomDateTo;
      }
    }

    updateOrderslipFilterStatus();
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

  // 🔥 STEP 5: CHECK FOR PENDING COMPLETED ORDERS (RATE PROMPTS)
  setTimeout(() => {
    if (typeof checkForCompletedOrdersToRate === "function") {
      checkForCompletedOrdersToRate();
    }
  }, 2000);

  console.log("✅ Initialization complete");
});
// 🔥 Re-render recommendations when window resizes (mobile/desktop switch)
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (
      document.getElementById("recItemsList") &&
      typeof renderRecommendations === "function"
    ) {
      // Stop ticker before re-rendering
      stopRecommendationsTicker();
      renderRecommendations();
    }
  }, 300);
});

// ============================================================
// ========== ACTIVE ORDER SLIP BADGE (BLUE - LEFT) ==========
// ============================================================

// ========== GET ACTIVE ORDERS COUNT (FILTER-AWARE) ==========
function getActiveOrdersCount() {
  let slips = getAllOrderSlips();

  // 🔥 FILTER BY DATE FIRST
  slips = filterOrderslipsByDate(slips);

  return slips.filter(
    (slip) =>
      slip.status === "pending" ||
      slip.status === "confirmed" ||
      slip.status === "preparing" ||
      slip.status === "ready",
  ).length;
}

// ========== GET UNREAD UPDATES COUNT (FILTER-AWARE) ==========
function getUnreadUpdatesCount() {
  let slips = getAllOrderSlips();

  // 🔥 FILTER BY DATE FIRST
  slips = filterOrderslipsByDate(slips);

  // Get only the order numbers that match the filter
  const filteredOrderNumbers = slips.map((s) => s.orderNumber);

  // Filter unread updates to only include those orders
  return unreadOrderUpdates.filter((u) =>
    filteredOrderNumbers.includes(u.orderNumber),
  ).length;
}

// ========== UPDATE ACTIVE ORDERS BADGE (BLUE - LEFT) ==========
function updateActiveOrdersBadge() {
  const badge = document.getElementById("orderSlipActiveBadge");
  const activeCount = getActiveOrdersCount();

  console.log("🔵 Active orders count (filtered):", activeCount);

  if (badge) {
    if (activeCount > 0) {
      badge.textContent = activeCount > 99 ? "99+" : activeCount;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  updateNavIconActiveBadge(activeCount);
}

// Update nav icon blue badge (for dynamically created icons)
function updateNavIconActiveBadge(count) {
  const navOrderslip = document.querySelector(
    '.nav-icon[data-nav="orderslip"]',
  );
  if (navOrderslip) {
    // Remove existing active badge
    const existingBadge = navOrderslip.querySelector(".nav-badge-active");
    if (existingBadge) existingBadge.remove();

    if (count > 0) {
      const badge = document.createElement("span");
      badge.className = "nav-badge-active";
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        left: -10px;
        background: #007bff;
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
        border: 2px solid white;
        z-index: 10;
      `;
      badge.textContent = count > 99 ? "99+" : count;
      navOrderslip.style.position = "relative";
      navOrderslip.appendChild(badge);
    }
  }
}

// ============================================================
// ========== UPDATE ALL BADGES ==========
// ============================================================

function updateAllBadges() {
  updateActiveOrdersBadge();
  updateOrderSlipBadge();
}

// ========== APPLY ORDER SLIP DATE FILTER (WITH PERSISTENCE) ==========
function applyOrderslipDateFilter() {
  const filterSelect = document.getElementById("orderslipDateFilter");
  if (!filterSelect) return;

  orderslipDateFilter = filterSelect.value;

  // 🔥 SAVE FILTER TO LOCALSTORAGE
  localStorage.setItem("silentBite_orderslipFilter", orderslipDateFilter);

  const customRange = document.getElementById("orderslipCustomDateRange");
  if (orderslipDateFilter === "custom") {
    if (customRange) customRange.style.display = "flex";
    const fromInput = document.getElementById("orderslipCustomDateFrom");
    const toInput = document.getElementById("orderslipCustomDateTo");

    if (fromInput && fromInput.value) {
      orderslipCustomDateFrom = fromInput.value;
    }
    if (toInput && toInput.value) {
      orderslipCustomDateTo = toInput.value;
    }

    if (!orderslipCustomDateFrom) {
      const today = new Date().toISOString().split("T")[0];
      fromInput.value = today;
      orderslipCustomDateFrom = today;
    }
    if (!orderslipCustomDateTo) {
      const today = new Date().toISOString().split("T")[0];
      toInput.value = today;
      orderslipCustomDateTo = today;
    }

    // 🔥 SAVE CUSTOM DATES
    localStorage.setItem(
      "silentBite_orderslipCustomFrom",
      orderslipCustomDateFrom,
    );
    localStorage.setItem("silentBite_orderslipCustomTo", orderslipCustomDateTo);
  } else {
    if (customRange) customRange.style.display = "none";
    orderslipCustomDateFrom = null;
    orderslipCustomDateTo = null;
    // 🔥 CLEAR CUSTOM DATES
    localStorage.removeItem("silentBite_orderslipCustomFrom");
    localStorage.removeItem("silentBite_orderslipCustomTo");
  }

  // Update filter status display
  updateOrderslipFilterStatus();

  // Re-render the order slip page
  renderOrderSlipPage();

  // 🔥 UPDATE BADGES BASED ON NEW FILTER
  updateAllBadges();
}

// ========== APPLY CUSTOM DATE RANGE (WITH PERSISTENCE) ==========
function applyOrderslipCustomDateRange() {
  const fromInput = document.getElementById("orderslipCustomDateFrom");
  const toInput = document.getElementById("orderslipCustomDateTo");

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

  orderslipCustomDateFrom = fromInput.value;
  orderslipCustomDateTo = toInput.value;

  // 🔥 SAVE TO LOCALSTORAGE
  localStorage.setItem(
    "silentBite_orderslipCustomFrom",
    orderslipCustomDateFrom,
  );
  localStorage.setItem("silentBite_orderslipCustomTo", orderslipCustomDateTo);

  const filterSelect = document.getElementById("orderslipDateFilter");
  if (filterSelect) {
    filterSelect.value = "custom";
    orderslipDateFilter = "custom";
    localStorage.setItem("silentBite_orderslipFilter", "custom");
  }

  updateOrderslipFilterStatus();
  renderOrderSlipPage();
  updateAllBadges();

  showToast(
    `✅ Showing orders from ${formatOrderslipDate(fromDate)} to ${formatOrderslipDate(toDate)}`,
  );
}
// ========== GET ORDER SLIP DATE RANGE ==========
function getOrderslipDateRange(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from = new Date(today);
  let to = new Date(today);
  let label = "";

  switch (filter) {
    case "all":
      from = new Date(2000, 0, 1);
      to = new Date(2100, 11, 31);
      label = "All Orders";
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
      if (orderslipCustomDateFrom && orderslipCustomDateTo) {
        from = new Date(orderslipCustomDateFrom);
        to = new Date(orderslipCustomDateTo);
        to.setHours(23, 59, 59, 999);
        label = `${formatOrderslipDate(from)} - ${formatOrderslipDate(to)}`;
      } else {
        from = new Date(today);
        to = new Date(today);
        label = "Custom Date";
      }
      break;
    default:
      from = new Date(2000, 0, 1);
      to = new Date(2100, 11, 31);
      label = "All Orders";
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to, label };
}

// ========== FORMAT DATE FOR ORDER SLIP ==========
function formatOrderslipDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ========== UPDATE FILTER STATUS DISPLAY ==========
function updateOrderslipFilterStatus() {
  const statusDiv = document.getElementById("orderslipFilterStatus");
  const label = document.getElementById("orderslipFilterLabel");

  if (statusDiv && label) {
    const range = getOrderslipDateRange(orderslipDateFilter);
    label.textContent = range.label;

    if (orderslipDateFilter === "all") {
      statusDiv.style.display = "none";
    } else {
      statusDiv.style.display = "block";
    }
  }
}

// ========== FILTER ORDER SLIPS BY DATE ==========
function filterOrderslipsByDate(slips) {
  if (orderslipDateFilter === "all") {
    return slips;
  }

  const range = getOrderslipDateRange(orderslipDateFilter);

  return slips.filter((slip) => {
    const slipDate = new Date(slip.timestamp);
    return slipDate >= range.from && slipDate <= range.to;
  });
}
// ========== RESET ORDER SLIP DATE FILTER ==========
function resetOrderslipDateFilter() {
  const filterSelect = document.getElementById("orderslipDateFilter");
  if (filterSelect) {
    filterSelect.value = "all";
    orderslipDateFilter = "all";
  }

  const customRange = document.getElementById("orderslipCustomDateRange");
  if (customRange) customRange.style.display = "none";

  orderslipCustomDateFrom = null;
  orderslipCustomDateTo = null;

  // 🔥 CLEAR FROM LOCALSTORAGE
  localStorage.setItem("silentBite_orderslipFilter", "all");
  localStorage.removeItem("silentBite_orderslipCustomFrom");
  localStorage.removeItem("silentBite_orderslipCustomTo");

  updateOrderslipFilterStatus();
  renderOrderSlipPage();
  updateAllBadges();
}

// ============================================================
// ========== BOTTOM BAR AUTO-HIDE ON SCROLL ==========
// ============================================================

let lastScrollY = 0;
let scrollThreshold = 10; // Minimum scroll distance to trigger
let isBottomBarHidden = false;
let scrollTimeout = null;

function initScrollHideBottomBar() {
  // Only run on mobile (screen width <= 768px)
  const isMobile = () => window.innerWidth <= 768;

  // Find all bottom navigation bars
  const getBottomBars = () => {
    const bars = [];

    // Menu/Cart/Payment/OrderSlip bottom bar
    const bottomBar = document.querySelector(".bottom-bar");
    if (bottomBar) bars.push(bottomBar);

    // Cart checkout bar
    const checkoutBar = document.querySelector(".checkout-bar");
    if (checkoutBar) bars.push(checkoutBar);

    // Any other fixed bottom elements
    const orderslipContainer = document.querySelector(".orderslip-page");
    if (orderslipContainer) {
      const orderslipBar = orderslipContainer.querySelector(".bottom-bar");
      if (orderslipBar && !bars.includes(orderslipBar)) {
        bars.push(orderslipBar);
      }
    }

    return bars;
  };

  // Handle scroll event
  function handleScroll() {
    if (!isMobile()) {
      // Make sure bars are visible on desktop
      getBottomBars().forEach((bar) => {
        bar.classList.remove("hidden");
      });
      isBottomBarHidden = false;
      return;
    }

    const currentScrollY = window.scrollY || window.pageYOffset;
    const scrollDiff = currentScrollY - lastScrollY;

    // Scroll down - hide bar
    if (scrollDiff > scrollThreshold && currentScrollY > 100) {
      if (!isBottomBarHidden) {
        getBottomBars().forEach((bar) => {
          bar.classList.add("hidden");
        });
        isBottomBarHidden = true;
      }
    }
    // Scroll up - show bar
    else if (scrollDiff < -scrollThreshold) {
      if (isBottomBarHidden) {
        getBottomBars().forEach((bar) => {
          bar.classList.remove("hidden");
        });
        isBottomBarHidden = false;
      }
    }

    // Always show bar when at the very top
    if (currentScrollY < 50) {
      if (isBottomBarHidden) {
        getBottomBars().forEach((bar) => {
          bar.classList.remove("hidden");
        });
        isBottomBarHidden = false;
      }
    }

    // Always show bar when at the very bottom
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (currentScrollY + windowHeight >= documentHeight - 50) {
      if (isBottomBarHidden) {
        getBottomBars().forEach((bar) => {
          bar.classList.remove("hidden");
        });
        isBottomBarHidden = false;
      }
    }

    lastScrollY = currentScrollY;
  }

  // Debounced scroll handler for performance
  function debouncedScroll() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(handleScroll, 10);
  }

  // Add scroll listener
  window.addEventListener("scroll", debouncedScroll, { passive: true });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (!isMobile()) {
      getBottomBars().forEach((bar) => {
        bar.classList.remove("hidden");
      });
      isBottomBarHidden = false;
    }
  });

  // Handle orientation change
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      getBottomBars().forEach((bar) => {
        bar.classList.remove("hidden");
      });
      isBottomBarHidden = false;
      lastScrollY = window.scrollY;
    }, 100);
  });

  console.log("✅ Bottom bar auto-hide initialized");
}

// ============================================================
// ========== RATING REMINDER SYSTEM ==========
// ============================================================

// Storage key for pending ratings
const PENDING_RATINGS_KEY = "silentBite_pendingRatings";

// Get pending ratings from localStorage
function getPendingRatings() {
  return JSON.parse(localStorage.getItem(PENDING_RATINGS_KEY)) || [];
}

// Save pending ratings to localStorage
function savePendingRatings(ratings) {
  localStorage.setItem(PENDING_RATINGS_KEY, JSON.stringify(ratings));
}

// Get rated dish IDs from localStorage
function getRatedDishes() {
  return JSON.parse(localStorage.getItem("silentBite_ratedDishes")) || {};
}

// Mark a dish as rated
function markDishAsRated(itemId, orderNumber) {
  const rated = getRatedDishes();
  const key = `${itemId}-${orderNumber}`;
  rated[key] = {
    itemId: itemId,
    orderNumber: orderNumber,
    ratedAt: new Date().toISOString(),
  };
  localStorage.setItem("silentBite_ratedDishes", JSON.stringify(rated));
}

// Check if a dish has been rated
function isDishRated(itemId, orderNumber) {
  const rated = getRatedDishes();
  const key = `${itemId}-${orderNumber}`;
  return !!rated[key];
}

// ========== ADD DISH TO PENDING RATINGS ==========
function addToPendingRatings(orderSlip) {
  if (!orderSlip || !orderSlip.items) return;

  const pending = getPendingRatings();
  const orderNumber = orderSlip.orderNumber;

  orderSlip.items.forEach((item) => {
    // Skip if already rated
    if (isDishRated(item.id, orderNumber)) return;

    // Skip if already in pending
    const exists = pending.some(
      (p) => p.itemId === item.id && p.orderNumber === orderNumber,
    );
    if (exists) return;

    // Find the full item data from menuData
    const menuItem = menuData.find((m) => m.id === item.id);

    pending.push({
      itemId: item.id,
      itemName: item.name,
      itemImg: menuItem ? menuItem.img : item.img || "default.jpg",
      orderNumber: orderNumber,
      orderNumberFormatted: orderSlip.orderNumberFormatted || `#${orderNumber}`,
      quantity: item.quantity,
      addedAt: new Date().toISOString(),
    });
  });

  savePendingRatings(pending);
  updateRateBadge();

  console.log("⭐ Added to pending ratings:", pending);
}

// ========== GET PENDING RATINGS COUNT ==========
function getPendingRatingsCount() {
  return getPendingRatings().length;
}

// ========== UPDATE RATE BADGE ==========
function updateRateBadge() {
  const badge = document.getElementById("rateBadge");
  const navRate = document.querySelector('.nav-icon[data-nav="rate"]');
  const count = getPendingRatingsCount();

  console.log("⭐ Pending ratings count:", count);

  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  // Also update nav icon badge
  if (navRate) {
    const existingBadge = navRate.querySelector(".nav-badge");
    if (existingBadge && existingBadge.id !== "rateBadge") {
      existingBadge.remove();
    }

    if (count > 0 && !document.getElementById("rateBadge")) {
      const badge = document.createElement("span");
      badge.className = "nav-badge";
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -10px;
        background: #f5a623;
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
        border: 2px solid white;
        z-index: 10;
      `;
      badge.textContent = count > 99 ? "99+" : count;
      navRate.style.position = "relative";
      navRate.appendChild(badge);
    }
  }
}
// ========== SHOW RATE PROMPT MODAL (WORKS FROM ANY PAGE) ==========
function showRatePromptModal(orderSlip) {
  console.log("🎉 showRatePromptModal called with:", orderSlip);

  // Validate input
  if (!orderSlip || !orderSlip.items || orderSlip.items.length === 0) {
    console.warn("⚠️ No items to rate");
    return;
  }

  // Check if all items are already rated
  const unratedItems = orderSlip.items.filter((item) =>
    typeof isDishRated === "function"
      ? !isDishRated(item.id, orderSlip.orderNumber)
      : true,
  );

  if (unratedItems.length === 0) {
    console.log("All dishes already rated for this order");
    return;
  }

  // Check if we already showed prompt for this order in this session
  const promptedKey = `silentBite_promptedRate_${orderSlip.orderNumber}`;
  if (sessionStorage.getItem(promptedKey)) {
    console.log("⚠️ Already prompted for this order in this session");
    return;
  }

  sessionStorage.setItem(promptedKey, "true");

  // Remove any existing prompt
  const existingPrompt = document.getElementById("ratePromptOverlay");
  if (existingPrompt) {
    existingPrompt.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = "rate-prompt-overlay";
  overlay.id = "ratePromptOverlay";

  overlay.innerHTML = `
    <div class="rate-prompt-modal">
      <div class="rate-prompt-header">
        <span class="rate-prompt-title">Rate our dish!</span>
      </div>
      <div class="rate-prompt-body">
        <h3>How was your food?</h3>
        <p>Your order <strong>${orderSlip.orderNumberFormatted || "#" + orderSlip.orderNumber}</strong> has been completed!<br>Would you like to rate your dishes now?</p>
        <div class="rate-prompt-actions">
          <button class="rate-now-btn" id="rateNowBtn">
            Rate Now
          </button>
          <button class="rate-later-btn" id="rateLaterBtn">
            Rate Later
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  console.log("✅ Rate prompt modal displayed");

  // Rate Now - Go to rate page
  document.getElementById("rateNowBtn").addEventListener("click", () => {
    if (typeof addToPendingRatings === "function") {
      addToPendingRatings(orderSlip);
    }
    overlay.remove();
    window.location.href = "rate.html";
  });

  // Rate Later - Close and show toast
  document.getElementById("rateLaterBtn").addEventListener("click", () => {
    if (typeof addToPendingRatings === "function") {
      addToPendingRatings(orderSlip);
    }
    overlay.remove();
    if (typeof showToast === "function") {
      showToast("📝 You can rate your dishes later in the ⭐ Rate tab");
    }
  });

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      if (typeof addToPendingRatings === "function") {
        addToPendingRatings(orderSlip);
      }
      overlay.remove();
    }
  });
}
// Rate Now - Redirect to rate page
document.getElementById("rateNowBtn").addEventListener("click", () => {
  addToPendingRatings(orderSlip);
  overlay.remove();
  window.location.href = "rate.html";
});

// Rate Later - Add to pending and close
document.getElementById("rateLaterBtn").addEventListener("click", () => {
  addToPendingRatings(orderSlip);
  overlay.remove();
  showToast("📝 You can rate your dishes later in the Rate tab");
});

// Close on overlay click
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    addToPendingRatings(orderSlip);
    overlay.remove();
  }
});

// ========== RENDER RATE PAGE ==========
function renderRatePage() {
  const container = document.getElementById("rateContainer");
  const emptyMessage = document.getElementById("emptyRateMessage");

  if (!container) return;

  const pending = getPendingRatings();
  const unratedPending = pending.filter(
    (p) => !isDishRated(p.itemId, p.orderNumber),
  );

  // Update pending list if some were rated
  if (unratedPending.length !== pending.length) {
    savePendingRatings(unratedPending);
  }

  updateRateBadge();

  if (unratedPending.length === 0) {
    container.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "block";
    return;
  }

  if (emptyMessage) emptyMessage.style.display = "none";

  container.innerHTML = unratedPending
    .map(
      (item) => `
    <div class="rate-card" onclick="goToRating(${item.itemId}, '${item.orderNumberFormatted}')">
      <div class="rate-card-img">
        <img 
          src="${getImagePath(item.itemImg)}" 
          alt="${item.itemName}"
          onerror="this.src='https://placehold.co/70x70?text=🍽️'"
        >
      </div>
      <div class="rate-card-details">
        <div class="rate-card-name">${item.itemName}</div>
        <div class="rate-card-order">Order ${item.orderNumberFormatted}</div>
        <span class="rate-card-status">⭐ Tap to rate</span>
      </div>
      <div class="rate-card-arrow">›</div>
    </div>
  `,
    )
    .join("");
}

// ========== GO TO RATING PAGE ==========
function goToRating(itemId, orderNumberFormatted) {
  console.log(`⭐ Going to rating page for item ${itemId}`);
  window.location.href = `ratings.html?id=${itemId}`;
}

// ============================================================
// ========== DIETARY ACCORDION (MENU PAGE) ==========
// ============================================================

// ========== TOGGLE ACCORDION ==========
function toggleDietAccordion() {
  const content = document.getElementById("dietAccordionContent");
  const arrow = document.getElementById("dietAccordionArrow");

  if (!content || !arrow) return;

  dietAccordionOpen = !dietAccordionOpen;

  if (dietAccordionOpen) {
    content.classList.add("open");
    arrow.classList.add("open");
  } else {
    content.classList.remove("open");
    arrow.classList.remove("open");
  }

  // When opening, sync checkboxes with current userDietary
  if (dietAccordionOpen) {
    syncAccordionCheckboxes();
    updateAccordionActiveDisplay();
  }
}

// ========== SYNC CHECKBOXES WITH CURRENT PREFERENCES ==========
function syncAccordionCheckboxes() {
  const veg = document.getElementById("menuDietVeg");
  const vegan = document.getElementById("menuDietVegan");
  const gf = document.getElementById("menuDietGF");
  const pesc = document.getElementById("menuDietPesc");
  const lc = document.getElementById("menuDietLC");
  const hp = document.getElementById("menuDietHP");

  if (veg) veg.checked = userDietary.vegetarian;
  if (vegan) vegan.checked = userDietary.vegan;
  if (gf) gf.checked = userDietary.glutenFree;
  if (pesc) pesc.checked = userDietary.pescatarian;
  if (lc) lc.checked = userDietary.lowCarb;
  if (hp) hp.checked = userDietary.highProtein;

  // Update visual selected state
  document.querySelectorAll(".diet-filter-item").forEach((item) => {
    const diet = item.dataset.diet;
    if (userDietary[diet]) {
      item.classList.add("selected");
    } else {
      item.classList.remove("selected");
    }
  });
}

// ========== TOGGLE INDIVIDUAL DIETARY ==========
function toggleMenuDietary(diet) {
  // Toggle the preference
  userDietary[diet] = !userDietary[diet];

  // Update visual state
  const item = document.querySelector(`.diet-filter-item[data-diet="${diet}"]`);
  if (item) {
    if (userDietary[diet]) {
      item.classList.add("selected");
    } else {
      item.classList.remove("selected");
    }
  }

  // Update active display
  updateAccordionActiveDisplay();
}

// ========== UPDATE ACTIVE DISPLAY ==========
function updateAccordionActiveDisplay() {
  const tagsContainer = document.getElementById("dietActiveTags");
  const countBadge = document.getElementById("dietActiveCount");

  if (!tagsContainer) return;

  const activePrefs = [];
  if (userDietary.vegetarian)
    activePrefs.push({ emoji: "🌱", name: "Vegetarian" });
  if (userDietary.vegan) activePrefs.push({ emoji: "🌿", name: "Vegan" });
  if (userDietary.glutenFree)
    activePrefs.push({ emoji: "🚫", name: "Gluten-Free" });
  if (userDietary.pescatarian)
    activePrefs.push({ emoji: "🐟", name: "Pescatarian" });
  if (userDietary.lowCarb) activePrefs.push({ emoji: "🥗", name: "Low-Carb" });
  if (userDietary.highProtein)
    activePrefs.push({ emoji: "💪", name: "High-Protein" });

  if (activePrefs.length === 0) {
    tagsContainer.innerHTML =
      '<span class="diet-no-active">No restrictions all items available</span>';
    if (countBadge) countBadge.style.display = "none";
  } else {
    tagsContainer.innerHTML = activePrefs
      .map((p) => `<span class="diet-tag-pill">${p.emoji} ${p.name}</span>`)
      .join("");
    if (countBadge) {
      countBadge.textContent = activePrefs.length;
      countBadge.style.display = "inline-block";
    }
  }
}

// ========== CLEAR ALL DIETARY ==========
function clearMenuDietary() {
  userDietary = {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    pescatarian: false,
    lowCarb: false,
    highProtein: false,
  };

  // Uncheck all checkboxes
  const checkboxes = [
    "menuDietVeg",
    "menuDietVegan",
    "menuDietGF",
    "menuDietPesc",
    "menuDietLC",
    "menuDietHP",
  ];
  checkboxes.forEach((id) => {
    const cb = document.getElementById(id);
    if (cb) cb.checked = false;
  });

  // Clear visual selected state
  document.querySelectorAll(".diet-filter-item").forEach((item) => {
    item.classList.remove("selected");
  });

  // Update display
  updateAccordionActiveDisplay();

  // Save preferences
  savePrefToLocal();

  // Re-render
  renderRecommendations();
  renderMenu();

  if (typeof showToast === "function") {
    showToast("🍽️ Cleared all dietary filters");
  }
}

// ========== APPLY DIETARY FILTERS ==========
function applyMenuDietary() {
  // Save preferences
  savePrefToLocal();

  // Update active display
  updateAccordionActiveDisplay();

  // Re-render recommendations and menu
  renderRecommendations();
  renderMenu();

  // Count active preferences
  const activeCount = Object.values(userDietary).filter(Boolean).length;

  if (activeCount === 0) {
    if (typeof showToast === "function") {
      showToast("🍽️ Showing all items (no restrictions)");
    }
  } else {
    if (typeof showToast === "function") {
      showToast(
        `✅ Applied ${activeCount} dietary filter${activeCount > 1 ? "s" : ""}`,
      );
    }
  }

  // Close the accordion after applying
  setTimeout(() => {
    const content = document.getElementById("dietAccordionContent");
    const arrow = document.getElementById("dietAccordionArrow");
    if (content && arrow) {
      content.classList.remove("open");
      arrow.classList.remove("open");
      dietAccordionOpen = false;
    }
  }, 500);
}

// ========== INITIALIZE ACCORDION STATE ==========
function initDietAccordion() {
  // Sync checkboxes with current preferences
  syncAccordionCheckboxes();
  updateAccordionActiveDisplay();

  // Set initial state (closed by default)
  const content = document.getElementById("dietAccordionContent");
  const arrow = document.getElementById("dietAccordionArrow");
  if (content) content.classList.remove("open");
  if (arrow) arrow.classList.remove("open");
  dietAccordionOpen = false;
}
// ============================================================
// ========== YOUTUBE-STYLE MENU SEARCH ==========
// ============================================================

// ========== OPEN SEARCH OVERLAY ==========
function openSearchOverlay() {
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("menuSearchInput");

  if (!overlay) return;

  isSearchOverlayOpen = true;
  overlay.classList.add("open");

  // Prevent body scroll
  document.body.style.overflow = "hidden";

  // Focus input after animation
  setTimeout(() => {
    if (input) input.focus();
  }, 300);
}

// ========== CLOSE SEARCH OVERLAY ==========
function closeSearchOverlay() {
  const overlay = document.getElementById("searchOverlay");
  if (!overlay) return;

  isSearchOverlayOpen = false;
  overlay.classList.remove("open");

  // Restore body scroll
  document.body.style.overflow = "";

  // Reset search state
  resetSearchState();
}

// ========== RESET SEARCH STATE ==========
function resetSearchState() {
  const input = document.getElementById("menuSearchInput");
  const clearBtn = document.getElementById("searchClearBtn");
  const suggestions = document.getElementById("searchSuggestions");
  const resultsList = document.getElementById("searchResultsList");
  const noResults = document.getElementById("searchNoResults");

  if (input) input.value = "";
  currentSearchQuery = "";

  if (clearBtn) clearBtn.style.display = "none";
  if (suggestions) suggestions.style.display = "block";
  if (resultsList) resultsList.style.display = "none";
  if (noResults) noResults.style.display = "none";
}

// ========== HANDLE SEARCH KEYDOWN (Enter key) ==========
function handleSearchKeydown(event) {
  const input = event.target;
  const clearBtn = document.getElementById("searchClearBtn");

  // Show/hide clear button on typing
  if (clearBtn) {
    clearBtn.style.display = input.value.length > 0 ? "flex" : "none";
  }

  // Submit on Enter
  if (event.key === "Enter") {
    event.preventDefault();
    submitSearch();
  }
}

// ========== SUBMIT SEARCH ==========
function submitSearch() {
  const input = document.getElementById("menuSearchInput");
  if (!input) return;

  const query = input.value.trim().toLowerCase();

  if (query.length === 0) {
    // Show suggestions again
    const suggestions = document.getElementById("searchSuggestions");
    const resultsList = document.getElementById("searchResultsList");
    const noResults = document.getElementById("searchNoResults");

    if (suggestions) suggestions.style.display = "block";
    if (resultsList) resultsList.style.display = "none";
    if (noResults) noResults.style.display = "none";
    return;
  }

  currentSearchQuery = query;
  performSearch(query);
}

// ========== PERFORM SEARCH ==========
function performSearch(query) {
  const suggestions = document.getElementById("searchSuggestions");
  const resultsList = document.getElementById("searchResultsList");
  const noResults = document.getElementById("searchNoResults");
  const noResultsQuery = document.getElementById("searchNoResultsQuery");

  // Filter menu
  const filtered = menuData.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(query);
    const categoryMatch = item.category.toLowerCase().includes(query);
    const dietaryMatch = item.dietary.some((d) =>
      d.toLowerCase().includes(query),
    );
    const ingredientsMatch =
      item.ingredients &&
      item.ingredients.some((ing) => ing.toLowerCase().includes(query));
    const descriptionMatch =
      item.description && item.description.toLowerCase().includes(query);

    return (
      nameMatch ||
      categoryMatch ||
      dietaryMatch ||
      ingredientsMatch ||
      descriptionMatch
    );
  });

  // Hide suggestions
  if (suggestions) suggestions.style.display = "none";

  // No results
  if (filtered.length === 0) {
    if (resultsList) resultsList.style.display = "none";
    if (noResults) {
      noResults.style.display = "block";
      if (noResultsQuery) {
        noResultsQuery.textContent = `"${query}"`;
      }
    }
    return;
  }

  // Show results
  if (noResults) noResults.style.display = "none";
  if (resultsList) {
    resultsList.style.display = "block";

    let html = `
      <div class="search-results-header">
        Found <strong>${filtered.length}</strong> ${
          filtered.length === 1 ? "dish" : "dishes"
        } for "<strong>${query}</strong>"
      </div>
    `;

    filtered.forEach((item) => {
      const rating = getItemRating(item.id);
      const ratingHtml =
        rating && rating.count > 0
          ? `<span class="search-result-rating">${renderStars(rating.average)} (${rating.count})</span>`
          : "";

      html += `
        <div class="search-result-item" onclick="openSearchResult(${item.id})">
          <div class="search-result-thumb">
            <img 
              src="${getImagePath(item.img)}" 
              alt="${item.name}"
              onerror="this.src='https://placehold.co/110x80?text=🍽️'"
            >
          </div>
          <div class="search-result-info">
            <div class="search-result-name">${item.name}</div>
            <div class="search-result-meta">
              <span class="search-result-dietary">${item.dietary.join(", ")}</span>
              ${ratingHtml}
            </div>
            <div class="search-result-price">₱${item.price}</div>
          </div>
        </div>
      `;
    });

    resultsList.innerHTML = html;
  }
}

// ========== OPEN SEARCH RESULT (go to dish modal) ==========
function openSearchResult(itemId) {
  // Close search overlay first
  closeSearchOverlay();

  // Small delay before opening modal
  setTimeout(() => {
    if (typeof showMealModal === "function") {
      showMealModal(itemId);
    }
  }, 200);
}

// ========== QUICK SEARCH (from suggestion chips) ==========
function quickSearch(query) {
  const input = document.getElementById("menuSearchInput");
  const clearBtn = document.getElementById("searchClearBtn");

  if (input) {
    input.value = query;
    if (clearBtn) clearBtn.style.display = "flex";
  }

  currentSearchQuery = query.toLowerCase();
  performSearch(currentSearchQuery);
}

// ========== CLEAR SEARCH INPUT ==========
function clearSearchInput() {
  const input = document.getElementById("menuSearchInput");
  const clearBtn = document.getElementById("searchClearBtn");
  const suggestions = document.getElementById("searchSuggestions");
  const resultsList = document.getElementById("searchResultsList");
  const noResults = document.getElementById("searchNoResults");

  if (input) {
    input.value = "";
    input.focus();
  }

  currentSearchQuery = "";

  if (clearBtn) clearBtn.style.display = "none";
  if (suggestions) suggestions.style.display = "block";
  if (resultsList) resultsList.style.display = "none";
  if (noResults) noResults.style.display = "none";
}
