# 🎟️ Coupon CSV Import API with Variant

Backend service for importing unique coupon codes from CSV files into MongoDB, where each row is stored as a single document with an associated `variantId`.

---

## 📖 Description

This service handles bulk import of coupon codes from CSV files.
Each row in the CSV is parsed and inserted into MongoDB as a single document, including a `variantId` to identify the coupon variant.

---

## 🚀 Features

-   📥 Bulk import coupon codes from CSV
-   🧩 Each CSV row → 1 MongoDB document with `variantId`
-   🔍 Validate uniqueness before insert
-   ⚡ Efficient bulk insert for large datasets
-   📝 Logging import activity

---

## 🛠️ Tech Stack

-   NestJS
-   MongoDB

---

## ⚙️ Installation

```bash id="f4p9z1"
git clone <your-repo-url>
cd coupon-csv-import-api
npm install
```

---

## ▶️ Running the App

```bash id="w8x2k4"
npm run start:dev
```

---

## 🔑 Environment Variables

```env id="y7m2k3"
# SERVICE NODE ENV
NODE_ENV=development

# SERVICE API
SERVICE_PORT=5000
SERVICE_NAME=COUPON-API
SERVICE_PREFIX=api
SERVICE_DEFAULT_VERSION=1
SERVICE_DOCS=1
SERVICE_BASE_URL=http://localhost:5000

# MONGODB
SERVICE_MONGO_DB_HOST=mongodb://127.0.0.1:27017/db_test
SERVICE_MONGO_DB_USER=admin
SERVICE_MONGO_DB_PASS=123
SERVICE_MONGO_DB_AUTH=admin
SERVICE_MONGO_DB_REPLICA=
```

---

## 🔄 Processing Flow

```text id="p3k7zr"
Upload CSV File + variantId
       ↓
Parse CSV Rows
       ↓
Validate uniqueness per code
       ↓
Insert Each Row as Document into MongoDB with variantId
       ↓
Return Import Summary (success / failed)
```

---

## 📌 Main Responsibilities

-   Receive CSV file uploads with `variantId`
-   Parse each CSV row
-   Validate uniqueness of `code`
-   Insert each row as single document with `variantId` into MongoDB
-   Log the import results for auditing

---

## 📂 Example CSV

```csv id="e61zoi"
JUDUL
ABC123
DEF456
GHI789
```

### Example MongoDB Insert (with variantId)

```json id="n9q2kx"
{ "code": "ABC123", "variantId": "VAR001", "createdAt": "2026-03-26T00:00:00Z" }
{ "code": "DEF456", "variantId": "VAR001", "createdAt": "2026-03-26T00:01:00Z" }
{ "code": "GHI789", "variantId": "VAR001", "createdAt": "2026-03-26T00:02:00Z" }
```

---

## 📂 Project Structure

```text id="v8m2pw"
src/
├── modules/
│   ├── import/
│   ├── parser/
│   ├── coupon/
├── common/
├── config/
└── main.ts
```

---

## ⚠️ Notes

-   First row in CSV is header (`JUDUL`)
-   Each upload **must include `variantId`**
-   Large CSV files should be imported in batches
-   Index `code` and `variantId` fields in MongoDB for fast lookup

---

## 📄 License

MIT License
