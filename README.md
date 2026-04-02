# 💰 Finance Dashboard Backend API

A RESTful backend for a finance dashboard system with **role-based access control**, **financial record management**, and **analytics APIs**.

> Built with Node.js, Express, Prisma ORM, SQLite, JWT authentication, and Zod validation.

---

## 🚀 Live Demo / Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/ABHINAVJINDAL26/Finance-Dashboard-Api.git
cd Finance-Dashboard-Api

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 5. Seed demo data
node prisma/seed.js

# 6. Start server
node src/app.js
```

Server runs at: **`http://localhost:3000`**

---

## 🛠 Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js (v18+) | Widely used, great ecosystem |
| Framework | Express.js | Lightweight, flexible routing |
| Database | SQLite (via Prisma ORM) | Zero-config, file-based, easy to run locally |
| Auth | JWT (JSON Web Tokens) | Stateless, simple to implement |
| Validation | Zod | Schema-based, excellent error messages |
| Password Hashing | bcrypt | Industry standard |

> **Note:** SQLite is used for simplicity. Swapping to PostgreSQL or MySQL requires only a one-line change in `prisma/schema.prisma` (the `provider` field) and a new `DATABASE_URL`.

---

## 📁 Project Structure

```
finance-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Seed script with demo users & records
├── src/
│   ├── config/
│   │   └── constants.js       # App-wide constants (roles, pagination defaults)
│   ├── middleware/
│   │   ├── auth.js            # JWT verification middleware
│   │   ├── authorize.js       # Role-based access control middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── users/
│   │   │   ├── users.routes.js
│   │   │   ├── users.controller.js
│   │   │   ├── users.service.js
│   │   │   └── users.schema.js
│   │   ├── records/
│   │   │   ├── records.routes.js
│   │   │   ├── records.controller.js
│   │   │   ├── records.service.js
│   │   │   └── records.schema.js
│   │   └── dashboard/
│   │       ├── dashboard.routes.js
│   │       ├── dashboard.controller.js
│   │       └── dashboard.service.js
│   ├── utils/
│   │   ├── prisma.js          # Prisma client singleton
│   │   └── response.js        # Standardized API response helpers
│   └── app.js                 # Express app setup & entry point
├── .env.example
├── package.json
└── README.md
```

---

## 🗄 Database Schema

```
User
  id          String   (UUID)
  name        String
  email       String   (unique)
  password    String   (hashed with bcrypt)
  role        String   VIEWER | ANALYST | ADMIN
  isActive    Boolean  (default: true)
  createdAt   DateTime
  updatedAt   DateTime

FinancialRecord
  id          String   (UUID)
  amount      Float
  type        String   INCOME | EXPENSE
  category    String   (e.g. "Salary", "Rent", "Utilities")
  date        DateTime
  notes       String?
  createdBy   String   → User.id
  isDeleted   Boolean  (default: false) — soft delete
  createdAt   DateTime
  updatedAt   DateTime
```

---

## 🔐 Role Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| Login / view own profile | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| Access analytics & trends | ❌ | ✅ | ✅ |
| Create / update / delete records | ❌ | ❌ | ✅ |
| Manage users (create, deactivate) | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user (default role: VIEWER) |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Authenticated | Get current user profile |

**POST /api/auth/login**
```json
// Request
{ "email": "admin@demo.com", "password": "password123" }

// Response 200
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "uuid", "name": "Admin User", "role": "ADMIN" }
  }
}
```

---

### Users (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user with specific role |
| PATCH | `/api/users/:id` | Update user details or role |
| PATCH | `/api/users/:id/status` | Activate or deactivate user |
| DELETE | `/api/users/:id` | Delete user |

---

### Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/records` | VIEWER+ | List records with optional filters |
| GET | `/api/records/:id` | VIEWER+ | Get single record |
| POST | `/api/records` | ADMIN | Create record |
| PATCH | `/api/records/:id` | ADMIN | Update record |
| DELETE | `/api/records/:id` | ADMIN | Soft-delete record |

**GET /api/records — Query Parameters**

| Param | Type | Example | Description |
|---|---|---|---|
| `type` | string | `INCOME` or `EXPENSE` | Filter by type |
| `category` | string | `Salary` | Filter by category |
| `from` | ISO date | `2024-01-01` | Start date filter |
| `to` | ISO date | `2024-03-31` | End date filter |
| `page` | number | `1` | Page number (default: 1) |
| `limit` | number | `20` | Records per page (default: 20, max: 100) |

```
GET /api/records?type=EXPENSE&category=Utilities&from=2024-01-01&page=1&limit=10
```

---

### Dashboard Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | VIEWER+ | Total income, expenses, net balance |
| GET | `/api/dashboard/by-category` | VIEWER+ | Totals grouped by category |
| GET | `/api/dashboard/trends` | ANALYST+ | Monthly income vs expense breakdown |
| GET | `/api/dashboard/recent` | VIEWER+ | Last 10 transactions |

**GET /api/dashboard/summary**
```json
{
  "success": true,
  "data": {
    "totalIncome": 744636,
    "totalExpenses": 348100,
    "netBalance": 396536,
    "recordCount": 41
  }
}
```

**GET /api/dashboard/trends?year=2024**
```json
{
  "success": true,
  "data": [
    { "month": "2024-01", "income": 120000, "expenses": 58000, "net": 62000 },
    { "month": "2024-02", "income": 108000, "expenses": 52000, "net": 56000 }
  ]
}
```

---

## ❌ Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "amount", "message": "Amount must be a positive number" }
    ]
  }
}
```

| HTTP Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid or missing input fields |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT token |
| 403 | `FORBIDDEN` | Authenticated but insufficient role |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource (e.g. email already registered) |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 🔑 Authentication Flow

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

1. Call `POST /api/auth/login` with email and password
2. Copy the `token` from the response
3. Include it in all subsequent request headers

---

## 🧪 Demo Credentials (After Seeding)

| Email | Password | Role |
|---|---|---|
| admin@demo.com | password123 | ADMIN |
| analyst@demo.com | password123 | ANALYST |
| viewer@demo.com | password123 | VIEWER |

Along with ~41 sample financial records across multiple categories and months.

---

## 🌐 Browser API Tester

A built-in HTML-based API tester is included. After starting the server:

```
http://localhost:3000/api-tester.html
```

No Postman needed — test all endpoints directly from the browser!

---

## ⚙️ Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

---

## 📐 Access Control Implementation

Role checks are implemented as reusable Express middleware:

```javascript
// Require authentication
router.get('/records', authenticate, recordsController.list);

// Restrict to specific roles
router.post('/records', authenticate, authorize('ADMIN'), recordsController.create);

// Allow multiple roles
router.get('/dashboard/trends', authenticate, authorize('ANALYST', 'ADMIN'), dashboardController.trends);
```

---

## 🧠 Assumptions & Design Decisions

1. **Registration defaults to VIEWER role.** Admins must explicitly elevate a user's role. This is the safer default.

2. **Soft deletes for records.** Financial records are never hard-deleted. A `isDeleted` flag is set to `true`. This preserves audit history.

3. **Only admins can create financial records.** Analysts are read-only on records to keep financial data integrity clear.

4. **No multi-tenancy.** All users share the same record pool. Adding an `organizationId` would support multi-tenancy with minimal schema changes.

5. **Pagination defaults to 20 records per page**, capped at 100. This prevents large accidental data dumps.

6. **Trend data groups by calendar month.** Switching to PostgreSQL would allow `DATE_TRUNC` for cleaner queries.

7. **JWT expiry is set to 7 days** for convenience during development. Should be shorter in production.

---

## ✅ Features Implemented

- [x] JWT Authentication
- [x] Role Based Access Control (VIEWER / ANALYST / ADMIN)
- [x] User Management (CRUD + role assignment + activate/deactivate)
- [x] Financial Records (CRUD + filtering + pagination)
- [x] Dashboard APIs (summary, by-category, trends, recent)
- [x] Soft Delete for financial records
- [x] Zod input validation with field-level error messages
- [x] Standardized API response envelope
- [x] Seed script with demo users and records
- [x] Browser-based API tester (api-tester.html)

---

## 📄 License

MIT
