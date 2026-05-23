# 🍶 Madira Muse
A full-featured offline desktop management system for a liquor shop in Bhaktapur, Nepal. Built with Electron, React, Express, and MongoDB — runs entirely on a local Windows machine with no internet dependency for core features.

---

## ✨ Features

- **Point of Sale** — product grid, cart, discount, payment methods (Cash/Card/eSewa/Credit), VAT bill + estimated bill printing
- **Inventory Management** — full CRUD with SKU, category, bottle size, case/unit variant support, low stock alerts
- **Sales Dashboard** — revenue, profit, expenses, top products, bar chart, date range filters (Today/Week/Month/Year/Custom)
- **Sales History** — paginated transaction log, invoice search, AD/BS date toggle, daily/weekly/monthly closing balance report
- **Stock Movements** — restock in cases or units, credit restock linked to supplier, full movement history
- **Customer Ledger** — credit sales tracking, payment recording, running balance per customer
- **Supplier Ledger** — debt tracking, payment recording, transaction history
- **Attendance & Salary** — mark Present/Half/Absent, check-in/check-out times, hours worked, PIN-protected monthly salary report
- **Expenses Tracker** — categorized expenses, date filter, feeds into profit calculation
- **Categories** — manage product categories, linked to inventory
- **VAT Support** — 13% VAT extracted from MRP on VAT bills, estimated bill for pre-sale reference
- **AD/BS Date Toggle** — switch between English (AD) and Nepali (BS) dates across the app

---

## 🛠 Technologies

- `Electron` — desktop shell, spawns Express as child process
- `React` + `Vite` — frontend UI, inline styles, no CSS framework
- `Express` — REST API backend running on `localhost:5000`
- `MongoDB Atlas` — cloud database (free tier M0)
- `Mongoose` — data modeling
- `Recharts` — dashboard revenue chart
- `Axios` — HTTP client
- `electron-builder` — Windows `.exe` and Linux `.AppImage` packaging

---

## 🗂 Project Structure

```
madira-muse/
  assets/           → app icon
  electron/         → Electron main process + preload
  server/           → Express API
    models/         → Mongoose schemas
    routes/         → REST endpoints
  client/           → React + Vite frontend
    src/
      api/          → Axios API helpers
      components/   → Sidebar, Receipt, Forms
      pages/        → One file per screen
      utils/        → AD/BS date conversion
  package.json      → root scripts
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### Setup

1. Clone the repository
```bash
   git clone https://github.com/rizzEN007/madira-muse.git
   cd madira-muse
```

2. Install all dependencies
```bash
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
```

3. Create `server/.env`
```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
```

4. Run in development mode
```bash
   npm run electron:dev
```

### Build Installer

**Windows:**
```bash
npm run dist
```
Outputs: `dist/Madira Muse Setup 1.0.0.exe`

**Linux:**
```bash
npm run build:client && npx electron-builder --linux
```
Outputs: `dist/Madira Muse-1.0.0.AppImage`

---

## 📦 npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server + client (browser only) |
| `npm run electron:dev` | Start full desktop app in dev mode |
| `npm run build:client` | Build React frontend |
| `npm run dist` | Build Windows installer |

---

## 🗄 Data Models

`Product` · `Category` · `Sale` · `SaleItem` · `StockMovement` · `Customer` · `CustomerTransaction` · `Supplier` · `SupplierTransaction` · `Staff` · `Attendance` · `Expense` · `Settings`

---

## 📍 The Process

Built this from scratch for a real liquor shop in Bhaktapur, Nepal. The owner needed something that worked offline, handled Nepali rupees, printed receipts, tracked credit customers, and managed staff attendance — all in one place.

Started with a basic MERN stack, then wrapped it in Electron so it runs like a proper desktop app without a browser. The biggest challenge was the Electron startup race condition — the React frontend would load before Express was ready, causing network errors. Solved it with a health check polling loop and a loading screen.

Added BS (Bikram Sambat) date support because Nepali businesses run on the BS calendar. VAT bill printing was added to comply with Nepal's 13% VAT regulations, with automatic extraction from MRP prices.

Still building — supplier reports, export to Excel, and multi-device sync are next.

---

## ⚠️ Known Limitations

- Requires Node.js installed on the target machine (server runs via system `node.exe`)
- No authentication system yet — PIN protection only on salary screen
- Date picker inputs use AD format only (BS display is read-only)
- No offline mobile support

---

## 📄 License

Private project — built for Madira Muse liquor shop, Bhaktapur, Nepal.