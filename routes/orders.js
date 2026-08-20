// routes/orders.js
// REST endpoints for placing and viewing orders against listings.

const express = require("express");
const router = express.Router();
const db = require("../database/db");

// GET /api/orders
// Returns all orders, most recent first, joined with listing info.
router.get("/", (req, res) => {
  try {
    const orders = db
      .prepare(
        `SELECT orders.*, listings.crop_name, listings.unit,
                listings.farmer_name, listings.farmer_phone
         FROM orders
         JOIN listings ON listings.id = orders.listing_id
         ORDER BY orders.created_at DESC`
      )
      .all();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// POST /api/orders
// Places a new order against a listing and decrements available quantity.
router.post("/", (req, res) => {
  const { listing_id, buyer_name, buyer_phone, quantity_ordered } = req.body;

  if (!listing_id || !buyer_name || !buyer_phone || !quantity_ordered) {
    return res.status(400).json({
      error:
        "Missing required field: listing_id, buyer_name, buyer_phone, and quantity_ordered are all required."
    });
  }

  if (Number(quantity_ordered) <= 0) {
    return res.status(400).json({ error: "Quantity ordered must be greater than zero." });
  }

  // Run as a transaction so the quantity check and update stay in sync.
  const placeOrder = db.transaction(() => {
    const listing = db
      .prepare("SELECT * FROM listings WHERE id = ?")
      .get(listing_id);

    if (!listing) {
      throw { status: 404, message: "Listing not found." };
    }

    if (Number(quantity_ordered) > listing.quantity_available) {
      throw {
        status: 400,
        message: `Only ${listing.quantity_available} ${listing.unit}(s) available.`
      };
    }

    const total_price = Number(quantity_ordered) * listing.price_per_unit;

    const insertOrder = db.prepare(`
      INSERT INTO orders (listing_id, buyer_name, buyer_phone, quantity_ordered, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insertOrder.run(
      listing_id,
      buyer_name,
      buyer_phone,
      Number(quantity_ordered),
      total_price
    );

    db.prepare(
      "UPDATE listings SET quantity_available = quantity_available - ? WHERE id = ?"
    ).run(Number(quantity_ordered), listing_id);

    return db
      .prepare(
        `SELECT orders.*, listings.crop_name, listings.unit,
                listings.farmer_name, listings.farmer_phone
         FROM orders
         JOIN listings ON listings.id = orders.listing_id
         WHERE orders.id = ?`
      )
      .get(result.lastInsertRowid);
  });

  try {
    const newOrder = placeOrder();
    res.status(201).json(newOrder);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to place order." });
  }
});

module.exports = router;
