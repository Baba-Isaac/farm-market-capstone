// db.js
// Sets up the SQLite database, creates tables if they don't exist,
// and seeds a few sample listings so the app isn't empty on first run.

const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "marketplace.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---- Schema ----

db.exec(`
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_per_unit REAL NOT NULL,
    unit TEXT NOT NULL,
    quantity_available REAL NOT NULL,
    location TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    quantity_ordered REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (listing_id) REFERENCES listings(id)
  );
`);

// ---- Seed data (only if the listings table is empty) ----

const countRow = db.prepare("SELECT COUNT(*) AS count FROM listings").get();

if (countRow.count === 0) {
  const insert = db.prepare(`
    INSERT INTO listings
      (crop_name, category, price_per_unit, unit, quantity_available, location, farmer_name, farmer_phone, description)
    VALUES (@crop_name, @category, @price_per_unit, @unit, @quantity_available, @location, @farmer_name, @farmer_phone, @description)
  `);

  const sampleListings = [
    {
      crop_name: "Fresh Tomatoes",
      category: "Vegetables",
      price_per_unit: 25000,
      unit: "basket",
      quantity_available: 12,
      location: "Mile 12, Lagos",
      farmer_name: "Adebayo Farms",
      farmer_phone: "08012345678",
      description: "Freshly harvested tomatoes, sorted and ready for market."
    },
    {
      crop_name: "Yellow Maize",
      category: "Grains",
      price_per_unit: 18000,
      unit: "bag",
      quantity_available: 40,
      location: "Kaduna",
      farmer_name: "Musa Agro Ventures",
      farmer_phone: "08023456789",
      description: "Dried and cleaned maize, suitable for milling or poultry feed."
    },
    {
      crop_name: "Yam Tubers",
      category: "Tubers",
      price_per_unit: 3500,
      unit: "tuber",
      quantity_available: 100,
      location: "Otukpo, Benue",
      farmer_name: "Ochanya Produce",
      farmer_phone: "08034567890",
      description: "Large, matured yam tubers, harvested this week."
    },
    {
      crop_name: "Bell Peppers (Tatashe)",
      category: "Vegetables",
      price_per_unit: 15000,
      unit: "basket",
      quantity_available: 8,
      location: "Sabo Market, Ibadan",
      farmer_name: "Bisi Green Farms",
      farmer_phone: "08045678901",
      description: "Bright red tatashe peppers, ideal for stew."
    },
    {
      crop_name: "Rice (Paddy)",
      category: "Grains",
      price_per_unit: 32000,
      unit: "bag",
      quantity_available: 25,
      location: "Abakaliki, Ebonyi",
      farmer_name: "Ebonyi Rice Cooperative",
      farmer_phone: "08056789012",
      description: "Locally grown paddy rice, ready for processing."
    },
    {
      crop_name: "Cassava Tubers",
      category: "Tubers",
      price_per_unit: 8000,
      unit: "bag",
      quantity_available: 30,
      location: "Ogbomoso, Oyo",
      farmer_name: "Kunle Farmstead",
      farmer_phone: "08067890123",
      description: "Freshly dug cassava, good for garri or flour processing."
    }
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(sampleListings);
  console.log(`Seeded ${sampleListings.length} sample listings.`);
}

module.exports = db;
