// server.js
// Entry point: sets up Express, mounts API routes, and serves the frontend.

const express = require("express");
const cors = require("cors");
const path = require("path");

require("./database/db"); // ensures tables exist + seed data runs on boot

const listingsRouter = require("./routes/listings");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/listings", listingsRouter);
app.use("/api/orders", ordersRouter);

// Serve the frontend
app.use(express.static(path.join(__dirname, "public")));

// Fallback: send index.html for any non-API route (simple single-page app)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Produce Marketplace running at http://localhost:${PORT}`);
});
