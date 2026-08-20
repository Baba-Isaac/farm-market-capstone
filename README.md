# Fam Market — Nigerian Produce Marketplace

A beginner-friendly full-stack capstone project for the **3MTT Airtel NextGen Programme (Software Development track)**.

## Problem statement

Many Nigerian farmers lack a simple way to advertise harvested produce and reach buyers directly. Buyers may also struggle to discover what is available, where it is located, and how much it costs. Fam Market provides a lightweight digital marketplace where farmers list produce and buyers search and place orders.

**Tagline:** Fresh from the farm, straight to you.

## MVP features

- Farmers create produce listings with price, quantity, location and contact details.
- Buyers browse listings and search by produce, description, farmer or location.
- Buyers filter listings by category.
- Buyers place orders and receive an order confirmation.
- Available stock decreases automatically after a successful order.
- Buyers can continue the conversation through a pre-filled WhatsApp message.
- Live statistics show listings, locations and available units.
- Sample Nigerian produce is inserted automatically on first launch.
- Responsive interface for desktop and mobile screens.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Backend | Node.js and Express |
| Database | SQLite with `better-sqlite3` |

The project intentionally avoids a frontend build system so that a beginner can run, understand and extend it easily.

## Project structure

```text
fam-market-capstone/
├── database/
│   └── db.js
├── public/
│   ├── css/style.css
│   ├── js/app.js
│   └── index.html
├── routes/
│   ├── listings.js
│   └── orders.js
├── .gitignore
├── package.json
├── README.md
└── server.js
```

The generated SQLite database files are excluded from Git. The application recreates the database and sample listings whenever it starts without an existing database.

## Run locally

### Requirements

- Node.js 20 or 22 LTS
- npm (included with Node.js)

### Steps

1. Download or clone the repository.
2. Open the project folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Visit [http://localhost:3000](http://localhost:3000) in a browser.

Stop the server by returning to the terminal and pressing `Ctrl+C`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/listings` | Return listings; supports `search`, `category` and `location` |
| GET | `/api/listings/categories` | Return available listing categories |
| GET | `/api/listings/stats` | Return marketplace totals |
| GET | `/api/listings/:id` | Return one listing |
| POST | `/api/listings` | Create a listing |
| GET | `/api/orders` | Return orders with produce information |
| POST | `/api/orders` | Place an order and reduce stock |

## Deployment

The application can be deployed as a Node.js web service connected to its GitHub repository.

Typical service settings:

- Build command: `npm install`
- Start command: `npm start`
- Runtime: Node.js
- Environment variable (recommended): `NODE_VERSION=22`

SQLite writes to a local file. Some free hosting services use temporary filesystems, so demo data may reset after a restart or redeployment. This does not prevent the runnable repository or MVP demonstration from working. A production version should use a hosted PostgreSQL database.

## Suggested demonstration flow

1. Introduce the Nigerian farmer-to-buyer problem.
2. Show the homepage statistics and sample listings.
3. Search for a crop or Nigerian location and apply a category filter.
4. Add a new farmer listing.
5. Order from that listing and show the reduced stock.
6. Show the WhatsApp handoff button.
7. Briefly mention the Node.js, Express and SQLite stack.

## Future improvements

- Farmer and buyer accounts
- Image uploads
- Farmer order management and fulfilment status
- Secure online payments
- Delivery tracking
- PostgreSQL for persistent production data

## Author

**Isaac Baba Fedoje**  
3MTT Airtel NextGen Programme — Software Development track
