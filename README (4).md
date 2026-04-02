# Finance Dashboard Backend API

A RESTful backend for a finance dashboard system with role-based access control, financial record management, and analytics.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js (v18+) | Widely used, great ecosystem |
| Framework | Express.js | Lightweight, flexible routing |
| Database | SQLite (via Prisma ORM) | Zero-config, file-based, easy to run locally |
| Auth | JWT (JSON Web Tokens) | Stateless, simple to implement |
| Validation | Zod | Schema-based, excellent error messages |
| Password Hashing | bcrypt | Industry standard |

> **Assumption:** SQLite is used for simplicity. Swapping to PostgreSQL or MySQL requires only a one-line change in `prisma/schema.prisma` (the `provider` field) and a new `DATABASE_URL`.

---

## Project Structure

```
finance-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Seed script with demo users
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
│   │   │   └── users.schema.js    # Zod validation schemas
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
│   └── app.js                 # Express app setup
├── .env.example
├── package.json
└── README.md
```

---

## Database Schema

```
User
  id          String   (UUID)
  name        String
  email       String   (unique)
  password    String   (hashed)
  role        Enum     VIEWER | ANALYST | ADMIN
  isActive    Boolean  (default: true)
  createdAt   DateTime
  updatedAt   DateTime

FinancialRecord
  id          String   (UUID)
  amount      Float
  type        Enum     INCOME | EXPENSE
  category    String   (e.g. "Salary", "Rent", "Utilities")
  date        DateTime
  notes       String?
  createdBy   String   → User.id
  isDeleted   Boolean  (default: false) — soft delete
  createdAt   DateTime
  updatedAt   DateTime
```

---

## Role Permissions

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

## API Reference

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user (default role: VIEWER) |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| GET | `/api/auth/me` | Authenticated | Get current user profile |

**POST /api/auth/register**
```json
// Request
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "VIEWER"
  }
}
```

**POST /api/auth/login**
```json
// Request
{
  "email": "jane@example.com",
  "password": "securePassword123"
}

// Response 200
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "uuid", "name": "Jane Doe", "role": "VIEWER" }
  }
}
```

---

### Users (Admin only)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | ADMIN | List all users |
| GET | `/api/users/:id` | ADMIN | Get a user by ID |
| POST | `/api/users` | ADMIN | Create a new user with a specific role |
| PATCH | `/api/users/:id` | ADMIN | Update user details or role |
| PATCH | `/api/users/:id/status` | ADMIN | Activate or deactivate a user |
| DELETE | `/api/users/:id` | ADMIN | Delete a user |

**PATCH /api/users/:id**
```json
// Request (partial update)
{
  "role": "ANALYST",
  "isActive": true
}

// Response 200
{
  "success": true,
  "data": { "id": "uuid", "name": "Jane Doe", "role": "ANALYST", "isActive": true }
}
```

---

### Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/records` | VIEWER+ | List records with optional filters |
| GET | `/api/records/:id` | VIEWER+ | Get a single record |
| POST | `/api/records` | ADMIN | Create a new record |
| PATCH | `/api/records/:id` | ADMIN | Update a record |
| DELETE | `/api/records/:id` | ADMIN | Soft-delete a record |

**GET /api/records** — Query Parameters

| Param | Type | Example | Description |
|---|---|---|---|
| `type` | string | `INCOME` or `EXPENSE` | Filter by record type |
| `category` | string | `Rent` | Filter by category |
| `from` | ISO date | `2024-01-01` | Start date filter |
| `to` | ISO date | `2024-03-31` | End date filter |
| `page` | number | `1` | Page number (default: 1) |
| `limit` | number | `20` | Records per page (default: 20, max: 100) |

```
GET /api/records?type=EXPENSE&category=Utilities&from=2024-01-01&page=1&limit=10
```

```json
// Response 200
{
  "success": true,
  "data": {
    "records": [ { "id": "uuid", "amount": 5000, "type": "EXPENSE", ... } ],
    "pagination": {
      "total": 43,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**POST /api/records**
```json
// Request
{
  "amount": 85000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2024-06-01",
  "notes": "Monthly salary for June"
}
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
// Response 200
{
  "success": true,
  "data": {
    "totalIncome": 340000,
    "totalExpenses": 215000,
    "netBalance": 125000,
    "recordCount": 87
  }
}
```

**GET /api/dashboard/trends?year=2024**
```json
// Response 200 (ANALYST / ADMIN only)
{
  "success": true,
  "data": [
    { "month": "2024-01", "income": 85000, "expenses": 52000, "net": 33000 },
    { "month": "2024-02", "income": 85000, "expenses": 48000, "net": 37000 }
  ]
}
```

**GET /api/dashboard/by-category**
```json
// Response 200
{
  "success": true,
  "data": [
    { "category": "Salary", "total": 255000, "count": 3 },
    { "category": "Rent", "total": 90000, "count": 3 },
    { "category": "Utilities", "total": 15000, "count": 6 }
  ]
}
```

---

## Error Responses

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

## Setup & Running Locally

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/finance-backend.git
cd finance-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed demo data

```bash
node prisma/seed.js
```

This creates three demo users:

| Email | Password | Role |
|---|---|---|
| admin@demo.com | password123 | ADMIN |
| analyst@demo.com | password123 | ANALYST |
| viewer@demo.com | password123 | VIEWER |

Along with ~50 sample financial records across multiple categories and months.

### 5. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`

---

## Authentication Flow

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

1. Call `POST /api/auth/login` with email and password
2. Copy the `token` from the response
3. Include it in subsequent request headers

---

## Access Control Implementation

Role checks are implemented as reusable Express middleware:

```javascript
// Protect a route — require authentication
router.get('/records', authenticate, recordsController.list);

// Restrict to specific roles
router.post('/records', authenticate, authorize('ADMIN'), recordsController.create);

// Allow multiple roles
router.get('/dashboard/trends', authenticate, authorize('ANALYST', 'ADMIN'), dashboardController.trends);
```

`authenticate` verifies the JWT and attaches `req.user`.
`authorize(...roles)` checks `req.user.role` against the allowed roles and returns `403` if not permitted.

---

## Assumptions & Design Decisions

1. **Registration defaults to VIEWER role.** Admins must explicitly elevate a user's role. This is the safer default.

2. **Soft deletes for records.** Financial records are never hard-deleted. A `isDeleted` flag is set to `true`. This preserves audit history and dashboard totals remain accurate for past periods.

3. **Only admins can create financial records.** Analysts are read-only on records to keep financial data integrity clear. This can easily be adjusted.

4. **No multi-tenancy.** All users share the same record pool. Adding an `organizationId` to `User` and `FinancialRecord` would support multi-tenancy with minimal schema changes.

5. **Pagination defaults to 20 records per page**, capped at 100. This prevents large accidental data dumps.

6. **Trend data groups by calendar month** using SQLite's `strftime`. Switching to a full-featured DB like PostgreSQL would allow `DATE_TRUNC` for cleaner queries.

7. **JWT expiry is set to 7 days** for convenience during development. This should be shorter (e.g. 15 minutes with refresh tokens) in production.

---

## Optional Enhancements Included

- [x] JWT authentication
- [x] Pagination on record listing
- [x] Soft delete for financial records
- [x] Zod input validation with field-level error messages
- [x] Standardized API response envelope (`{ success, data }` / `{ success, error }`)
- [x] Seed script with demo users and records
- [ ] Search by notes/description (planned, not implemented)
- [ ] Rate limiting (can be added with `express-rate-limit`)
- [ ] Unit tests (can be added with Jest + Supertest)

---

## Running Tests (if implemented)

```bash
npm test
```

---

## License

MIT
