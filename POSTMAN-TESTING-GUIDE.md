# 📘 Postman API Testing Guide — Finance Dashboard

> **Pehle server start karo:**
> CMD open karo → `cd "c:\Users\jabhi\Music\Finance Dashboard"` → `node src/app.js`
> 
> Server chalega: `http://localhost:3000`

---

## ⚙️ Postman Setup (Ek baar karo)

### Variable set karo:
1. Postman open karo
2. Top mein **Environments** icon click karo (⚙️)
3. **"New Environment"** → Name: `Finance Dashboard`
4. Yeh variables add karo:

| Variable | Initial Value |
|---|---|
| `baseUrl` | `http://localhost:3000` |
| `adminToken` | (khali choddo — login ke baad aayega) |

5. **Save** karo → Top right mein `Finance Dashboard` environment select karo

---

---

# 🔐 PART 1 — AUTH ENDPOINTS

---

## ✅ Test 1: Server Health Check

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/
```
**Headers:** Kuch nahi chahiye

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "message": "Finance Dashboard API is running"
}
```
**Status: `200 OK`** ✅

---

## ✅ Test 2: Admin Login (TOKEN LENA ZAROORI HAI)

**Postman mein:**
```
Method:  POST
URL:     http://localhost:3000/api/auth/login
```

**Headers tab mein:**
```
Key:    Content-Type
Value:  application/json
```

**Body tab mein → "raw" select karo → "JSON" select karo:**
```json
{
  "email": "admin@demo.com",
  "password": "password123"
}
```

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6...",
    "user": {
      "id": "uuid-here",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```
**Status: `200 OK`** ✅

> 🔑 **IMPORTANT:** `token` value ko COPY karo — aage har request mein chahiye!

---

## ✅ Test 3: Get My Profile

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/auth/me
```

**Headers tab mein:**
```
Key:    Authorization
Value:  Bearer eyJhbGci...  ← (Test 2 se copy kiya hua token)
```

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@demo.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```
**Status: `200 OK`** ✅

---

## ✅ Test 4: Register New User

**Postman mein:**
```
Method:  POST
URL:     http://localhost:3000/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "name": "Rahul Kumar",
  "email": "rahul@test.com",
  "password": "password123"
}
```

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rahul Kumar",
    "email": "rahul@test.com",
    "role": "VIEWER"
  }
}
```
**Status: `201 Created`** ✅

> 📝 Note: Role automatically `VIEWER` set hota hai

---

## ❌ Test 5: Wrong Password (Error Test)

**Postman mein:**
```
Method:  POST
URL:     http://localhost:3000/api/auth/login
```

**Body:**
```json
{
  "email": "admin@demo.com",
  "password": "wrongpassword"
}
```

**Send karo → Yeh milega:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```
**Status: `401 Unauthorized`** ✅ (Sahi hai — galat password block hona chahiye)

---

## ❌ Test 6: Bina Token ke Protected Route

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/auth/me
```
**Headers: KUCH MAT DALO (token mat dena)**

**Send karo → Yeh milega:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid Authorization header"
  }
}
```
**Status: `401 Unauthorized`** ✅

---
---

# 📊 PART 2 — DASHBOARD ENDPOINTS

> ⚠️ **Yaad raho:** Har request mein Header daalna hai:
> `Authorization: Bearer <admin-token>`

---

## ✅ Test 7: Dashboard Summary

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/dashboard/summary
```

**Headers:**
```
Authorization: Bearer eyJhbGci...
```

**Send karo → Yeh milega:**
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
**Status: `200 OK`** ✅

---

## ✅ Test 8: Category-wise Breakdown

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/dashboard/by-category
```

**Headers:** `Authorization: Bearer <admin-token>`

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": [
    { "category": "Salary", "total": 510000, "count": 6 },
    { "category": "Rent",   "total": 180000, "count": 6 },
    { "category": "Sales",  "total": 177214, "count": 6 }
  ]
}
```
**Status: `200 OK`** ✅

---

## ✅ Test 9: Monthly Trends (2024)

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/dashboard/trends?year=2024
```

**Headers:** `Authorization: Bearer <admin-token>`

> 📌 `?year=2024` — yeh `Params` tab mein bhi add kar sakte ho:
> Key: `year` | Value: `2024`

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": [
    { "month": "2024-01", "income": 120000, "expenses": 58000, "net": 62000 },
    { "month": "2024-02", "income": 108000, "expenses": 52000, "net": 56000 },
    { "month": "2024-03", "income": 115000, "expenses": 61000, "net": 54000 }
  ]
}
```
**Status: `200 OK`** ✅

---

## 🚫 Test 10: Viewer Trends (RBAC Test — 403 aana chahiye)

**Pehle Viewer login karo:**
```
Method:  POST
URL:     http://localhost:3000/api/auth/login
Body:
{
  "email": "viewer@demo.com",
  "password": "password123"
}
```
→ Viewer ka token copy karo

**Ab Trends hit karo with Viewer token:**
```
Method:  GET
URL:     http://localhost:3000/api/dashboard/trends
Headers: Authorization: Bearer <viewer-token>
```

**Send karo → Yeh milega:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```
**Status: `403 Forbidden`** ✅ (RBAC kaam kar raha hai!)

---

## ✅ Test 11: Recent Transactions

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/dashboard/recent
Headers: Authorization: Bearer <admin-token>
```

**Send karo → Last 10 transactions milenge:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 85000,
      "type": "INCOME",
      "category": "Salary",
      "date": "2024-06-01T00:00:00.000Z",
      "notes": "Monthly salary for month 6"
    }
  ]
}
```
**Status: `200 OK`** ✅

---
---

# 📁 PART 3 — FINANCIAL RECORDS

---

## ✅ Test 12: Sab Records List Karo (Pagination)

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/records?page=1&limit=5
Headers: Authorization: Bearer <admin-token>
```

> Params tab mein:
> | Key | Value |
> |---|---|
> | page | 1 |
> | limit | 5 |

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "records": [ ... 5 records ... ],
    "pagination": {
      "total": 41,
      "page": 1,
      "limit": 5,
      "totalPages": 9
    }
  }
}
```
**Status: `200 OK`** ✅

---

## ✅ Test 13: Sirf INCOME Records

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/records?type=INCOME
Headers: Authorization: Bearer <admin-token>
```

**Send karo → Sirf INCOME type records milenge** ✅

---

## ✅ Test 14: Sirf EXPENSE Records

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/records?type=EXPENSE
Headers: Authorization: Bearer <admin-token>
```

**Send karo → Sirf EXPENSE type records milenge** ✅

---

## ✅ Test 15: Category se Filter

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/records?category=Salary
Headers: Authorization: Bearer <admin-token>
```

**Send karo → Sirf Salary category ke records milenge** ✅

---

## ✅ Test 16: Date Range Filter

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/records?from=2024-01-01&to=2024-03-31
Headers: Authorization: Bearer <admin-token>
```

**Send karo → Sirf Jan-Mar 2024 ke records milenge** ✅

---

## ✅ Test 17: Naya Record Banao (Admin only)

**Postman mein:**
```
Method:  POST
URL:     http://localhost:3000/api/records
Headers: 
  Authorization: Bearer <admin-token>
  Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "amount": 85000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2024-08-01",
  "notes": "August ka salary"
}
```

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid-here",
    "amount": 85000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2024-08-01T00:00:00.000Z",
    "notes": "August ka salary",
    "isDeleted": false
  }
}
```
**Status: `201 Created`** ✅

> 📌 **Is `id` ko copy karo** — aage update/delete ke liye chahiye

---

## ✅ Test 18: Ek Record Update Karo

**Postman mein:**
```
Method:  PATCH
URL:     http://localhost:3000/api/records/<id-yahan-daalo>
         (Test 17 se mila id use karo)
Headers:
  Authorization: Bearer <admin-token>
  Content-Type: application/json
```

**Body:**
```json
{
  "amount": 90000,
  "notes": "Updated: August salary revised"
}
```

**Send karo → Updated record milega** ✅

---

## ✅ Test 19: Record Delete (Soft Delete)

**Postman mein:**
```
Method:  DELETE
URL:     http://localhost:3000/api/records/<id-yahan-daalo>
Headers: Authorization: Bearer <admin-token>
```

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "message": "Record deleted successfully"
  }
}
```
**Status: `200 OK`** ✅

> 📝 Soft delete hai — record database mein rehta hai, sirf `isDeleted: true` ho jaata hai

---

## 🚫 Test 20: Viewer Create karne ki koshish kare (403)

**Postman mein:**
```
Method:  POST
URL:     http://localhost:3000/api/records
Headers:
  Authorization: Bearer <viewer-token>  ← Viewer ka token
  Content-Type: application/json
```

**Body:**
```json
{
  "amount": 1000,
  "type": "INCOME",
  "category": "Test",
  "date": "2024-01-01"
}
```

**Send karo → Yeh milega:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```
**Status: `403 Forbidden`** ✅

---

## ❌ Test 21: Validation Error Test

**Postman mein:**
```
Method:  POST
URL:     http://localhost:3000/api/records
Headers:
  Authorization: Bearer <admin-token>
  Content-Type: application/json
```

**Body (galat data dalo):**
```json
{
  "amount": -500,
  "type": "INVALID_TYPE"
}
```

**Send karo → Yeh milega:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "amount", "message": "Number must be greater than 0" },
      { "field": "type", "message": "Invalid enum value..." },
      { "field": "category", "message": "Required" },
      { "field": "date", "message": "Required" }
    ]
  }
}
```
**Status: `400 Bad Request`** ✅

---
---

# 👥 PART 4 — USER MANAGEMENT (Admin Only)

---

## ✅ Test 22: Sab Users List Karo

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/users
Headers: Authorization: Bearer <admin-token>
```

**Send karo → Sab users milenge:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid1", "name": "Admin User",   "email": "admin@demo.com",   "role": "ADMIN",   "isActive": true },
    { "id": "uuid2", "name": "Analyst User", "email": "analyst@demo.com", "role": "ANALYST", "isActive": true },
    { "id": "uuid3", "name": "Viewer User",  "email": "viewer@demo.com",  "role": "VIEWER",  "isActive": true }
  ]
}
```
**Status: `200 OK`** ✅

---

## ✅ Test 23: Naya User Banao with Role

**Postman mein:**
```
Method:  POST
URL:     http://localhost:3000/api/users
Headers:
  Authorization: Bearer <admin-token>
  Content-Type: application/json
```

**Body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@company.com",
  "password": "password123",
  "role": "ANALYST"
}
```

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "id": "new-user-uuid",
    "name": "Priya Sharma",
    "email": "priya@company.com",
    "role": "ANALYST",
    "isActive": true
  }
}
```
**Status: `201 Created`** ✅

> 📌 **Is `id` ko copy karo**

---

## ✅ Test 24: User ka Role Change Karo

**Postman mein:**
```
Method:  PATCH
URL:     http://localhost:3000/api/users/<user-id>
Headers:
  Authorization: Bearer <admin-token>
  Content-Type: application/json
```

**Body:**
```json
{
  "role": "ADMIN"
}
```

**Send karo → Role update hoga** ✅

---

## ✅ Test 25: User ko Deactivate Karo

**Postman mein:**
```
Method:  PATCH
URL:     http://localhost:3000/api/users/<user-id>/status
Headers:
  Authorization: Bearer <admin-token>
  Content-Type: application/json
```

**Body:**
```json
{
  "isActive": false
}
```

**Send karo → Yeh milega:**
```json
{
  "success": true,
  "data": {
    "isActive": false
  }
}
```
**Status: `200 OK`** ✅

> 📝 Deactivated user login nahi kar sakta

---

## ✅ Test 26: User Delete Karo

**Postman mein:**
```
Method:  DELETE
URL:     http://localhost:3000/api/users/<user-id>
Headers: Authorization: Bearer <admin-token>
```

**Send karo → User delete hoga** ✅

---

## 🚫 Test 27: Viewer User Management karne ki koshish (403)

**Postman mein:**
```
Method:  GET
URL:     http://localhost:3000/api/users
Headers: Authorization: Bearer <viewer-token>
```

**Send karo → Yeh milega:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```
**Status: `403 Forbidden`** ✅

---
---

# 🎯 QUICK SUMMARY — Sab Results

| Test | Endpoint | Expected Status | ✅/❌ |
|---|---|---|---|
| 1  | GET / | 200 OK | ✅ |
| 2  | POST /api/auth/login (Admin) | 200 OK + token | ✅ |
| 3  | GET /api/auth/me | 200 OK | ✅ |
| 4  | POST /api/auth/register | 201 Created | ✅ |
| 5  | POST /api/auth/login (wrong password) | 401 Unauthorized | ✅ |
| 6  | GET /api/auth/me (no token) | 401 Unauthorized | ✅ |
| 7  | GET /api/dashboard/summary | 200 OK | ✅ |
| 8  | GET /api/dashboard/by-category | 200 OK | ✅ |
| 9  | GET /api/dashboard/trends?year=2024 | 200 OK | ✅ |
| 10 | GET /api/dashboard/trends (Viewer) | **403 Forbidden** | ✅ |
| 11 | GET /api/dashboard/recent | 200 OK | ✅ |
| 12 | GET /api/records?page=1&limit=5 | 200 OK | ✅ |
| 13 | GET /api/records?type=INCOME | 200 OK | ✅ |
| 14 | GET /api/records?type=EXPENSE | 200 OK | ✅ |
| 15 | GET /api/records?category=Salary | 200 OK | ✅ |
| 16 | GET /api/records?from=&to= | 200 OK | ✅ |
| 17 | POST /api/records (Admin) | 201 Created | ✅ |
| 18 | PATCH /api/records/:id | 200 OK | ✅ |
| 19 | DELETE /api/records/:id | 200 OK | ✅ |
| 20 | POST /api/records (Viewer) | **403 Forbidden** | ✅ |
| 21 | POST /api/records (bad data) | 400 Validation Error | ✅ |
| 22 | GET /api/users (Admin) | 200 OK | ✅ |
| 23 | POST /api/users | 201 Created | ✅ |
| 24 | PATCH /api/users/:id | 200 OK | ✅ |
| 25 | PATCH /api/users/:id/status | 200 OK | ✅ |
| 26 | DELETE /api/users/:id | 200 OK | ✅ |
| 27 | GET /api/users (Viewer) | **403 Forbidden** | ✅ |

---

> **Sab tests pass → API 100% working!** 🎉
