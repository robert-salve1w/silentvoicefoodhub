// server.js
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

// 🔥 Add this to log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ========== MONGODB CONNECTION ==========
// 🔥 FIXED: Use SRV connection string as primary (this is the correct format for MongoDB Atlas)
const MONGODB_URI =
  "mongodb+srv://foodhub_user:foodhub26@cluster0.ooxdrhk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let db;
let client;

// ========== CONNECT TO MONGODB ==========
async function connectDB() {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    await client.connect();
    db = client.db("silent_voice_foodhub");
    console.log("✅ Connected to MongoDB Atlas");

    // 🔥 Create collections if they don't exist
    const collections = ["orders", "menu_items", "customers", "reviews"];
    for (const collName of collections) {
      const collectionsList = await db
        .listCollections({ name: collName })
        .toArray();
      if (collectionsList.length === 0) {
        await db.createCollection(collName);
        console.log(`📁 Created collection: ${collName}`);
      }
    }

    // Create indexes for better performance
    await db.collection("orders").createIndex({ customerNumber: 1 });
    await db.collection("orders").createIndex({ orderedAt: -1 });
    await db.collection("orders").createIndex({ status: 1 });
    await db
      .collection("customers")
      .createIndex({ customerNumber: 1 }, { unique: true });
    await db.collection("reviews").createIndex({ menuItemId: 1 }); // 🔥 ADD THIS
    await db.collection("reviews").createIndex({ createdAt: -1 }); // 🔥 ADD THIS

    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return false;
  }
}

// ============================================================
// ========== ROUTES ==========
// ============================================================

// ========== HEALTH CHECK ==========
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = db ? "connected" : "disconnected";
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ========== MENU ENDPOINTS ==========

// GET /api/menu - Get all menu items
app.get("/api/menu", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const menu = await db.collection("menu_items").find({}).toArray();
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/menu - Add new menu item
app.post("/api/menu", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const newItem = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection("menu_items").insertOne(newItem);
    res.json({ success: true, id: result.insertedId, item: newItem });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/menu/:id - Update menu item
app.put("/api/menu/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const { id } = req.params;
    const updatedData = req.body;

    const result = await db
      .collection("menu_items")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/menu/:id - Delete menu item
app.delete("/api/menu/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const { id } = req.params;

    const result = await db
      .collection("menu_items")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ORDER ENDPOINTS ==========

// POST /api/orders - Create new order
app.post("/api/orders", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const order = {
      ...req.body,
      status: "pending",
      orderedAt: new Date().toISOString(),
    };
    const result = await db.collection("orders").insertOne(order);
    res.json({ success: true, id: result.insertedId, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders - Get all orders (for staff)
app.get("/api/orders", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    console.log("📋 Fetching all orders...");
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ orderedAt: -1 })
      .toArray();
    console.log(`✅ Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/customer/:customerNumber - Get orders by customer
app.get("/api/orders/customer/:customerNumber", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const { customerNumber } = req.params;
    console.log(`📋 Fetching orders for customer: ${customerNumber}`);
    const orders = await db
      .collection("orders")
      .find({ customerNumber })
      .sort({ orderedAt: -1 })
      .toArray();
    console.log(`✅ Found ${orders.length} orders for customer`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const { id } = req.params;
    const { status, estimatedTime, declineReason, declinedAt } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "declined",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updateData = { status };
    if (estimatedTime) updateData.estimatedTime = estimatedTime;
    if (declineReason) updateData.declineReason = declineReason;
    if (declinedAt) updateData.declinedAt = declinedAt;

    console.log("📝 Updating order:", { id, updateData });

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== CUSTOMER ENDPOINTS ==========

// POST /api/customers - Save or update customer
app.post("/api/customers", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const customer = req.body;

    console.log("📝 Saving customer:", customer.customerNumber);

    const existing = await db.collection("customers").findOne({
      customerNumber: customer.customerNumber,
    });

    if (existing) {
      const updateData = {
        lastOrderAt: customer.lastOrderAt || new Date().toISOString(),
        lastOrderTotal: customer.lastOrderTotal || 0,
        updatedAt: new Date().toISOString(),
      };

      if (customer.dietary) {
        updateData.dietary = customer.dietary;
      }

      const result = await db.collection("customers").updateOne(
        { customerNumber: customer.customerNumber },
        {
          $set: updateData,
          $inc: { totalOrders: 1 },
          $addToSet: { itemsOrdered: { $each: customer.itemsOrdered || [] } },
        },
      );
      console.log("✅ Customer updated:", result.modifiedCount);
      res.json({ success: true, updated: result.modifiedCount });
    } else {
      const newCustomer = {
        ...customer,
        totalOrders: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = await db.collection("customers").insertOne(newCustomer);
      console.log("✅ New customer created:", result.insertedId);
      res.json({ success: true, id: result.insertedId });
    }
  } catch (error) {
    console.error("Error saving customer:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers/:customerNumber - Get customer by number
app.get("/api/customers/:customerNumber", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const { customerNumber } = req.params;
    const customer = await db
      .collection("customers")
      .findOne({ customerNumber });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers - Get all customers (for admin)
app.get("/api/customers", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const customers = await db.collection("customers").find({}).toArray();
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== PREFERENCES ENDPOINT ==========
app.post("/api/preferences", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const { customerNumber, dietary, updatedAt } = req.body;

    const result = await db.collection("customers").updateOne(
      { customerNumber: customerNumber },
      {
        $set: {
          dietary: dietary,
          preferencesUpdatedAt: updatedAt || new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
          totalOrders: 0,
        },
      },
      { upsert: true },
    );

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error("Error saving preferences:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ANALYTICS ENDPOINTS ==========
app.get("/api/analytics/dashboard", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await db
      .collection("orders")
      .find({
        orderedAt: { $gte: today.toISOString(), $lt: tomorrow.toISOString() },
      })
      .toArray();

    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    const totalOrders = await db.collection("orders").countDocuments();

    const totalRevenueResult = await db
      .collection("orders")
      .aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }])
      .toArray();
    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const totalCustomers = await db.collection("customers").countDocuments();

    const topItems = await db
      .collection("orders")
      .aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    res.json({
      success: true,
      data: {
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue,
        totalOrders: totalOrders,
        totalRevenue: totalRevenue,
        totalCustomers: totalCustomers,
        topItems: topItems,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// ========== START SERVER ==========
// ============================================================

async function startServer() {
  const isConnected = await connectDB();

  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Test: http://localhost:${PORT}/api/health`);
      console.log(`📊 Test: http://localhost:${PORT}/api/orders`);
      console.log(`📊 Test: http://localhost:${PORT}/api/menu`);
      console.log(`📊 Test: http://localhost:${PORT}/api/customers`);
    });
  } else {
    console.log("❌ Server not started - database connection failed");
    process.exit(1);
  }
}

startServer();

// ============================================================
// ========== REVIEW & RATING ENDPOINTS ==========
// ============================================================

// POST /api/reviews - Add a review
app.post("/api/reviews", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const { menuItemId, customerNumber, rating, comment, userName } = req.body;

    if (!menuItemId || !rating) {
      return res
        .status(400)
        .json({ error: "Menu item ID and rating are required" });
    }

    const review = {
      menuItemId: parseInt(menuItemId),
      customerNumber: customerNumber || "Anonymous",
      userName: userName || "Anonymous",
      rating: rating,
      comment: comment || "",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("reviews").insertOne(review);

    // Calculate and update average rating for the menu item
    await updateMenuItemAverageRating(menuItemId);

    res.json({ success: true, id: result.insertedId, review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reviews/:menuItemId - Get reviews for a menu item
app.get("/api/reviews/:menuItemId", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const menuItemId = parseInt(req.params.menuItemId);

    const reviews = await db
      .collection("reviews")
      .find({ menuItemId })
      .sort({ createdAt: -1 })
      .toArray();

    // Get rating summary
    const ratingSummary = await getMenuItemRatingSummary(menuItemId);

    res.json({
      success: true,
      reviews: reviews,
      summary: ratingSummary,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reviews/:menuItemId/summary - Get rating summary for a menu item
app.get("/api/reviews/:menuItemId/summary", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const menuItemId = parseInt(req.params.menuItemId);
    const summary = await getMenuItemRatingSummary(menuItemId);

    res.json({ success: true, summary });
  } catch (error) {
    console.error("Error fetching rating summary:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reviews/:reviewId - Delete a review (admin)
app.delete("/api/reviews/:reviewId", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const { reviewId } = req.params;
    const review = await db
      .collection("reviews")
      .findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }

    const result = await db
      .collection("reviews")
      .deleteOne({ _id: new ObjectId(reviewId) });

    // Recalculate average after deletion
    if (review.menuItemId) {
      await updateMenuItemAverageRating(review.menuItemId);
    }

    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== HELPER FUNCTIONS FOR REVIEWS ==========

// Get rating summary for a menu item
async function getMenuItemRatingSummary(menuItemId) {
  try {
    const reviews = await db
      .collection("reviews")
      .find({ menuItemId })
      .toArray();

    const count = reviews.length;

    if (count === 0) {
      return { average: 0, count: 0, reviews: [] };
    }

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = Math.round((total / count) * 10) / 10;

    return { average, count, reviews };
  } catch (error) {
    console.error("Error getting rating summary:", error);
    return { average: 0, count: 0, reviews: [] };
  }
}

// Update menu item's average rating
async function updateMenuItemAverageRating(menuItemId) {
  try {
    const summary = await getMenuItemRatingSummary(menuItemId);

    await db.collection("menu_items").updateOne(
      { id: parseInt(menuItemId) },
      {
        $set: {
          averageRating: summary.average,
          ratingCount: summary.count,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    return summary;
  } catch (error) {
    console.error("Error updating menu item rating:", error);
    return null;
  }
}
