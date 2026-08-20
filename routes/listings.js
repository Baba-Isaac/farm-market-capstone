// routes/listings.js
// REST endpoints for browsing, searching, and creating produce listings.

const express = require("express");
const router = express.Router();
const db = require("../database/db");

// GET /api/listings
// Supports optional query params: ?search=&category=&location=
router.get("/", (req, res) => {
  const { search, category, location } = req.query;

  let query = "SELECT * FROM listings WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND (crop_name LIKE ? OR description LIKE ? OR farmer_name LIKE ? OR location LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (location) {
    query += " AND location LIKE ?";
    params.push(`%${location}%`);
  }

  query += " ORDER BY created_at DESC";

  try {
    const listings = db.prepare(query).all(...params);
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listings." });
  }
});

// GET /api/listings/categories
// Returns the distinct categories currently in use (for filter dropdown).
router.get("/categories", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT DISTINCT category FROM listings ORDER BY category ASC")
      .all();
    res.json(rows.map((r) => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// GET /api/listings/stats
// Lightweight marketplace totals for the homepage impact bar.
router.get("/stats", (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) AS total_listings,
        COUNT(DISTINCT location) AS total_locations,
        COALESCE(SUM(quantity_available), 0) AS total_units
      FROM listings
    `).get();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch marketplace statistics." });
  }
});

// GET /api/listings/:id
router.get("/:id", (req, res) => {
  try {
    const listing = db
      .prepare("SELECT * FROM listings WHERE id = ?")
      .get(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listing." });
  }
});

// POST /api/listings
// Creates a new produce listing.
router.post("/", (req, res) => {
  const {
    crop_name,
    category,
    price_per_unit,
    unit,
    quantity_available,
    location,
    farmer_name,
    farmer_phone,
    description
  } = req.body;

  // Basic server-side validation
  const requiredFields = {
    crop_name,
    category,
    price_per_unit,
    unit,
    quantity_available,
    location,
    farmer_name,
    farmer_phone
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === "") {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  if (Number(price_per_unit) <= 0 || Number(quantity_available) <= 0) {
    return res
      .status(400)
      .json({ error: "Price and quantity must be greater than zero." });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO listings
        (crop_name, category, price_per_unit, unit, quantity_available, location, farmer_name, farmer_phone, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      crop_name,
      category,
      Number(price_per_unit),
      unit,
      Number(quantity_available),
      location,
      farmer_name,
      farmer_phone,
      description || ""
    );

    const newListing = db
      .prepare("SELECT * FROM listings WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(newListing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create listing." });
  }
});

module.exports = router;
