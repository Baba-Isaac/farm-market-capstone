// public/js/app.js
// Handles: fetching + rendering listings, search/category filtering,
// submitting a new listing, and placing an order.

const listingsGrid = document.getElementById("listings-grid");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const categoryChips = document.getElementById("category-chips");
const statListings = document.getElementById("stat-listings");
const statLocations = document.getElementById("stat-locations");
const statUnits = document.getElementById("stat-units");

let activeCategory = "";
let activeSearch = "";
let listingsCache = []; // keeps current listing data so the order dialog can read unit/name

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

// ---------- Fetch + render listings ----------

async function loadListings() {
  const params = new URLSearchParams();
  if (activeSearch) params.set("search", activeSearch);
  if (activeCategory) params.set("category", activeCategory);

  listingsGrid.setAttribute("aria-busy", "true");

  try {
    const res = await fetch(`/api/listings?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load listings");

    const listings = await res.json();
    listingsCache = listings;
    renderListings(listings);
  } catch (err) {
    console.error(err);
    listingsGrid.innerHTML = "";
    resultsCount.textContent = "";
    emptyState.hidden = false;
    emptyState.textContent = "Couldn't load listings right now. Please refresh the page.";
  } finally {
    listingsGrid.removeAttribute("aria-busy");
  }
}

function renderListings(listings) {
  listingsGrid.innerHTML = "";

  resultsCount.textContent = `${listings.length} listing${listings.length === 1 ? "" : "s"}`;

  if (listings.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  listings.forEach((listing) => {
    fragment.appendChild(buildListingCard(listing));
  });

  listingsGrid.appendChild(fragment);
}

function buildListingCard(listing) {
  const card = document.createElement("article");
  card.className = "listing-card";

  const soldOut = listing.quantity_available <= 0;

  card.innerHTML = `
    <span class="price-tag">${currencyFormatter.format(listing.price_per_unit)} / ${escapeHtml(listing.unit)}</span>
    <p class="listing-category">${escapeHtml(listing.category)}</p>
    <h3>${escapeHtml(listing.crop_name)}</h3>
    <p class="listing-meta">${escapeHtml(listing.farmer_name)} · ${escapeHtml(listing.location)}</p>
    ${listing.description ? `<p class="listing-desc">${escapeHtml(listing.description)}</p>` : "<div class='listing-desc'></div>"}
    <div class="listing-footer">
      <span class="listing-stock">${soldOut ? "Sold out" : `${listing.quantity_available} ${escapeHtml(listing.unit)}(s) left`}</span>
      <button class="btn-order" data-listing-id="${listing.id}" ${soldOut ? "disabled" : ""}>
        ${soldOut ? "Unavailable" : "Order"}
      </button>
    </div>
  `;

  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------- Search + category filtering ----------

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  activeSearch = searchInput.value.trim();
  loadListings();
});

categoryChips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  categoryChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
  chip.classList.add("is-active");

  activeCategory = chip.dataset.category || "";
  loadListings();
});

// ---------- Add listing form ----------

const listingForm = document.getElementById("listing-form");
const listingFormMessage = document.getElementById("listing-form-message");

listingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(listingForm);
  const payload = Object.fromEntries(formData.entries());

  listingFormMessage.textContent = "Listing your produce...";
  listingFormMessage.className = "form-message";

  try {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Could not create listing.");
    }

    listingFormMessage.textContent = `"${data.crop_name}" is now live on the market board.`;
    listingFormMessage.className = "form-message is-success";
    listingForm.reset();

    // Reset filters so the farmer can see their new listing immediately
    activeSearch = "";
    activeCategory = "";
    searchInput.value = "";
    categoryChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    categoryChips.querySelector('[data-category=""]').classList.add("is-active");

    loadListings();
    loadStats();
    document.getElementById("listings").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    listingFormMessage.textContent = err.message;
    listingFormMessage.className = "form-message is-error";
  }
});

// ---------- Order dialog ----------

const orderDialog = document.getElementById("order-dialog");
const orderForm = document.getElementById("order-form");
const orderDialogSub = document.getElementById("order-dialog-sub");
const orderListingIdInput = document.getElementById("order_listing_id");
const orderQuantityInput = document.getElementById("order_quantity");
const orderUnitHint = document.getElementById("order_unit_hint");
const orderFormMessage = document.getElementById("order-form-message");
const orderCancelBtn = document.getElementById("order-cancel-btn");
const orderSubmitBtn = document.getElementById("order-submit-btn");
const whatsappLink = document.getElementById("whatsapp-link");

listingsGrid.addEventListener("click", (e) => {
  const button = e.target.closest(".btn-order");
  if (!button || button.disabled) return;

  const listingId = Number(button.dataset.listingId);
  const listing = listingsCache.find((l) => l.id === listingId);
  if (!listing) return;

  orderForm.reset();
  orderFormMessage.textContent = "";
  orderFormMessage.className = "form-message";
  whatsappLink.hidden = true;
  orderSubmitBtn.disabled = false;

  orderListingIdInput.value = listing.id;
  orderDialogSub.textContent = `${listing.crop_name} — ${currencyFormatter.format(listing.price_per_unit)} per ${listing.unit}, from ${listing.farmer_name} (${listing.location}).`;
  orderQuantityInput.max = listing.quantity_available;
  orderUnitHint.textContent = `(${listing.unit}s, max ${listing.quantity_available})`;

  orderDialog.showModal();
});

orderCancelBtn.addEventListener("click", () => orderDialog.close());

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(orderForm);
  const payload = Object.fromEntries(formData.entries());

  orderFormMessage.textContent = "Placing order...";
  orderFormMessage.className = "form-message";

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Could not place order.");
    }

    orderFormMessage.textContent = `Order #${data.id} placed successfully. Contact the farmer to arrange delivery or pickup.`;
    orderFormMessage.className = "form-message is-success";
    orderSubmitBtn.disabled = true;

    const whatsappNumber = toWhatsAppNumber(data.farmer_phone);
    const message = `Hello ${data.farmer_name}, I just placed order #${data.id} on Fam Market for ${data.quantity_ordered} ${data.unit}(s) of ${data.crop_name}. My name is ${data.buyer_name}. Please let us arrange delivery or pickup.`;
    whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    whatsappLink.hidden = false;
    loadListings(); // refresh stock counts
    loadStats();
  } catch (err) {
    orderFormMessage.textContent = err.message;
    orderFormMessage.className = "form-message is-error";
  }
});

function toWhatsAppNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  if (digits.startsWith("234")) return digits;
  return digits;
}

async function loadStats() {
  try {
    const res = await fetch("/api/listings/stats");
    if (!res.ok) throw new Error("Failed to load statistics");
    const stats = await res.json();
    statListings.textContent = Number(stats.total_listings).toLocaleString("en-NG");
    statLocations.textContent = Number(stats.total_locations).toLocaleString("en-NG");
    statUnits.textContent = Number(stats.total_units).toLocaleString("en-NG");
  } catch (err) {
    console.error(err);
  }
}

// ---------- Init ----------

loadListings();
loadStats();
