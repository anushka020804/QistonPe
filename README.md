<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# MSME Vendor Payment Tracking API

Production-ready NestJS backend for MSME vendor payment tracking. Built with PostgreSQL on Supabase, TypeORM migrations, JWT authentication, Swagger documentation, and transaction-safe payment logic.

## Description

A comprehensive vendor payment tracking system that allows businesses to manage vendors, purchase orders, payments, and generate analytics reports. The system enforces business rules, prevents overpayments, automatically updates PO status, and provides real-time analytics on outstanding amounts and aging buckets.

---

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Database Schema](#database-schema)
3. [Implemented Features](#implemented-features)
4. [Key Design Decisions](#key-design-decisions)
5. [API Endpoints](#api-endpoints)
6. [Testing the API](#testing-the-api)
7. [Time Breakdown](#time-breakdown)

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or Supabase account)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/anushka020804/QistonPe.git
   cd vendor-payment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your `.env` file:
   ```env
   PORT=3000
   DB_HOST=your-supabase-host.pooler.supabase.com
   DB_PORT=5432
   DB_USERNAME=postgres.your-project-ref
   DB_PASSWORD=your-password
   DB_NAME=postgres
   DB_SSL=true
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=1d
   ```

### Database Setup and Migrations

1. **Create Supabase project** (if using Supabase)
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy connection pooling credentials

2. **Run migrations**
   ```bash
   npm run build
   npm run migration:run
   ```

3. **Seed the database**
   ```bash
   npm run seed
   ```
   
   This creates:
   - 1 admin user: `admin@vendorpay.io` / `password123`
   - 5 vendors
   - 15 purchase orders
   - 10 payments

### Running the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api/docs`

---

## Database Schema

### Tables and Relationships

The database consists of **5 normalized tables**:

#### 1. **vendors**
- `id` (UUID, Primary Key)
- `name` (Unique, Required)
- `contact_person` (Optional)
- `email` (Unique, Required)
- `phone_number` (Optional)
- `payment_term` (ENUM: 0, 15, 30, 45, 60 days)
- `is_active` (Boolean, Default: true)
- `created_at`, `updated_at`, `deleted_at` (Timestamps)

#### 2. **purchase_orders**
- `id` (UUID, Primary Key)
- `po_number` (Unique, Auto-generated: `PO-YYYYMMDD-XXX`)
- `vendorId` (UUID, Foreign Key → vendors.id)
- `issue_date` (Date)
- `due_date` (Date, Calculated from vendor payment_term)
- `status` (ENUM: DRAFT, APPROVED, PARTIALLY_PAID, PAID, CANCELLED)
- `total_amount` (Decimal 14,2)
- `paid_amount` (Decimal 14,2, Default: 0)
- `outstanding_amount` (Decimal 14,2, Calculated: total - paid)
- `note` (Text, Optional)
- `created_at`, `updated_at`, `deleted_at` (Timestamps)

#### 3. **purchase_order_items**
- `id` (UUID, Primary Key)
- `purchaseOrderId` (UUID, Foreign Key → purchase_orders.id, CASCADE DELETE)
- `description` (Required)
- `quantity` (Integer)
- `unit_price` (Decimal 14,2)
- `line_total` (Decimal 14,2, Calculated: quantity × unit_price)
- `created_at`, `updated_at`, `deleted_at` (Timestamps)

#### 4. **payments**
- `id` (UUID, Primary Key)
- `purchaseOrderId` (UUID, Foreign Key → purchase_orders.id, CASCADE DELETE)
- `amount` (Decimal 14,2)
- `payment_date` (Date)
- `reference` (Optional)
- `created_at`, `updated_at`, `deleted_at` (Timestamps)

#### 5. **users**
- `id` (UUID, Primary Key)
- `email` (Unique, Required)
- `password_hash` (Required, Bcrypt hashed)
- `name` (Optional)
- `created_at`, `updated_at`, `deleted_at` (Timestamps)

### Relationships

```
vendors (1) ──< (Many) purchase_orders
purchase_orders (1) ──< (Many) purchase_order_items (CASCADE DELETE)
purchase_orders (1) ──< (Many) payments (CASCADE DELETE)
```

**Foreign Key Constraints:**
- `FK_purchase_orders_vendor`: purchase_orders.vendorId → vendors.id (NO ACTION)
- `FK_purchase_order_items_po`: purchase_order_items.purchaseOrderId → purchase_orders.id (CASCADE)
- `FK_payments_po`: payments.purchaseOrderId → purchase_orders.id (CASCADE)

---

## Implemented Features

### MUST-HAVE Features ✅

#### Vendor Management
- ✅ Create, read, update, delete vendors
- ✅ Unique vendor name and email validation
- ✅ Contact person and phone number fields
- ✅ Payment terms (0, 15, 30, 45, 60 days)
- ✅ Active/Inactive status
- ✅ Payment summary in vendor details (total, paid, outstanding)

#### Purchase Order Management
- ✅ Create, read, list purchase orders
- ✅ Auto-generated PO numbers (`PO-YYYYMMDD-XXX`)
- ✅ Automatic due date calculation from vendor payment terms
- ✅ Total amount calculation from line items
- ✅ Status auto-update (APPROVED → PARTIALLY_PAID → PAID)
- ✅ Cancellation (only when unpaid)

#### Payment Processing
- ✅ Record payments against purchase orders
- ✅ Transaction-safe with pessimistic locking
- ✅ Overpayment prevention
- ✅ Automatic outstanding recalculation
- ✅ Automatic status update based on outstanding amount
- ✅ Payment reference tracking

#### Business Rules Enforcement
- ✅ Cannot create PO for inactive vendors
- ✅ Cannot pay cancelled purchase orders
- ✅ Cannot pay more than outstanding amount
- ✅ Cannot cancel paid/partially paid POs
- ✅ Status managed automatically (no manual status setting)

#### Analytics
- ✅ Vendor outstanding aggregation
- ✅ Aging buckets (0-30, 31-60, 61-90, 90+ days overdue)

### NICE-TO-HAVE Features ✅

- ✅ JWT Authentication with Bearer tokens
- ✅ Swagger/OpenAPI documentation (`/api/docs`)
- ✅ Soft delete (deleted_at timestamp)
- ✅ Custom error filter with timestamps
- ✅ Global validation pipe
- ✅ Decimal precision transformer
- ✅ CORS enabled
- ✅ Seed script for testing
- ✅ Comprehensive error handling
- ✅ Optimized SQL queries for analytics

---

## Key Design Decisions

### 1. Database Normalization
- **Decision**: Separated `purchase_order_items` into its own table
- **Why**: Allows multiple items per PO, enables proper aggregation, follows 3NF
- **Trade-off**: More complex queries, but better data integrity

### 2. Automatic Status Management
- **Decision**: PO status updates automatically based on outstanding amount
- **Why**: Prevents data inconsistency and human error
- **Implementation**: Status checked in payment service, not manually settable

### 3. Transaction with Pessimistic Locking
- **Decision**: Use database transactions with `pessimistic_write` lock for payments
- **Why**: Prevents race conditions when multiple payments happen simultaneously
- **Trade-off**: Slightly slower, but ensures data correctness

### 4. Outstanding Amount as Stored Column
- **Decision**: Store `outstanding_amount` as a column, not calculated on-the-fly
- **Why**: Better query performance for analytics, ensures consistency
- **Maintenance**: Recalculated on every payment transaction

### 5. Soft Delete Pattern
- **Decision**: Use `deleted_at` timestamps instead of hard deletes
- **Why**: Preserves data history, enables audit trails, allows recovery
- **Implementation**: Filter soft-deleted records in queries

### 6. NestJS Module Architecture
- **Decision**: Separate modules for each feature (vendors, POs, payments, analytics)
- **Why**: Better code organization, easier testing, clear separation of concerns
- **Result**: Maintainable, scalable codebase

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login and get JWT token | No |

### Vendors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/vendors` | Create new vendor | Yes |
| GET | `/api/vendors` | List all vendors | Yes |
| GET | `/api/vendors/:id` | Get vendor with payment summary | Yes |
| PUT | `/api/vendors/:id` | Update vendor | Yes |
| DELETE | `/api/vendors/:id` | Delete vendor (soft delete) | Yes |

### Purchase Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/purchase-orders` | Create new purchase order | Yes |
| GET | `/api/purchase-orders` | List all purchase orders | Yes |
| GET | `/api/purchase-orders/:id` | Get purchase order details | Yes |
| PATCH | `/api/purchase-orders/:id/status` | Update PO status (cancellation only) | Yes |

### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Record a payment | Yes |
| GET | `/api/payments` | List all payments | Yes |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/outstanding` | Get vendor outstanding amounts | Yes |
| GET | `/api/analytics/aging` | Get aging buckets (0-30/31-60/61-90/90+) | Yes |

**Base URL**: `https://vendor-payment-api.onrender.com` (Production)

---

## Testing the API

### Test Authentication

```bash
# Login
curl -X POST https://vendor-payment-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vendorpay.io","password":"password123"}'

# Response: {"access_token":"eyJhbGc..."}
# Save the token for subsequent requests
```

### Test Core Flows

#### 1. Create Vendor → Create PO → Make Partial Payment

```bash
TOKEN="your-token-here"
BASE_URL="https://vendor-payment-api.onrender.com"

# 1. Create Vendor
curl -X POST $BASE_URL/api/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "email": "test@example.com",
    "paymentTerm": 30,
    "isActive": true
  }'

# 2. Create Purchase Order
curl -X POST $BASE_URL/api/purchase-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "<vendor-id>",
    "items": [
      {"description": "Item 1", "quantity": 10, "unitPrice": 100}
    ]
  }'

# 3. Make Partial Payment
curl -X POST $BASE_URL/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseOrderId": "<po-id>",
    "amount": 500.00
  }'

# Verify: Check PO status is "PARTIALLY_PAID"
curl -X GET $BASE_URL/api/purchase-orders/<po-id> \
  -H "Authorization: Bearer $TOKEN"
```

#### 2. Complete Payment → Verify Status = "PAID"

```bash
# Make remaining payment
curl -X POST $BASE_URL/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseOrderId": "<po-id>",
    "amount": 500.00
  }'

# Verify status = "PAID", outstandingAmount = 0
```

#### 3. Test Overpayment Prevention

```bash
# Try to pay more than outstanding
curl -X POST $BASE_URL/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseOrderId": "<po-id>",
    "amount": 10000.00
  }'

# Expected: 400 Bad Request - "Payment exceeds outstanding amount"
```

#### 4. Test Inactive Vendor Check

```bash
# Deactivate vendor
curl -X PUT $BASE_URL/api/vendors/<vendor-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Try to create PO for inactive vendor
curl -X POST $BASE_URL/api/purchase-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorId": "<inactive-vendor-id>", ...}'

# Expected: 400 Bad Request - "Cannot create PO for inactive vendor"
```

#### 5. Test Analytics

```bash
# Get vendor outstanding
curl -X GET $BASE_URL/api/analytics/outstanding \
  -H "Authorization: Bearer $TOKEN"

# Get aging buckets
curl -X GET $BASE_URL/api/analytics/aging \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"bucket_0_30": X, "bucket_31_60": Y, ...}
```

### Using Swagger UI

1. Visit: https://vendor-payment-api.onrender.com/api/docs
2. Click "Authorize" → Enter `Bearer <your-token>`
3. Test all endpoints interactively

---

## Time Breakdown

| Task | Hours | Notes |
|------|-------|-------|
| **Database Design** | 4 | Schema normalization, relationships, migration files |
| **API Development** | 12 | Endpoints, business logic, authentication, validation |
| **Business Logic** | 6 | Status auto-update, outstanding calculations, transactions |
| **Testing & Debugging** | 4 | Fix 500 errors, test edge cases, verify business rules |
| **Documentation** | 2 | README, Swagger, code comments |
| **Deployment** | 2 | Render setup, environment configuration |
| **Total** | **30 hours** | |

---

## Additional Information

### Error Response Format

All errors follow this structure:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "details": {},
  "timestamp": "2024-01-18T12:00:00.000Z",
  "path": "/api/vendors"
}
```

### Swagger Documentation

Interactive API documentation available at:
- **Local**: http://localhost:3000/api/docs
- **Production**: https://vendor-payment-api.onrender.com/api/docs

### Support

For issues or questions:
- Check Swagger docs: `/api/docs`
- Review git commit history
- Database credentials in SUBMISSION.md (for testing purposes only)

---

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

Production-ready NestJS backend for MSME vendor payment tracking. Built with PostgreSQL on Supabase, TypeORM migrations, JWT auth, Swagger, and transaction-safe payment logic.

### Features
- JWT authentication with bcrypt-hashed seeded admin user
- Vendors, Purchase Orders, Payments, Analytics modules
- Business rules: unique vendors, PO auto-numbering, due-date from vendor payment terms, overpayment prevention, transaction-safe payment posting, status auto-updates
- Analytics: vendor outstanding aggregation and aging buckets (0-30/31-60/61-90/90+)
- Global validation, structured error filter, Swagger at `/api/docs`
- TypeORM migrations + seed script for Supabase PostgreSQL

### Tech Stack
NestJS 11, TypeScript, TypeORM, PostgreSQL (Supabase), Passport JWT, class-validator/transformer, Swagger UI.

---

## 1) Environment & Supabase Setup
1. Create a Supabase project (PostgreSQL 15+). In **Database > Connection pooling**, copy the pooled connection string.
2. Enable the `uuid-ossp` extension (Supabase ships it enabled; migration also ensures it).
3. Create `.env` from template:
  ```bash
  cp .env.example .env
  ```
  Fill with your pooled credentials:
  ```
  PORT=3000
  DB_HOST=aws-0-ap-south-1.pooler.supabase.com
  DB_PORT=6543
  DB_USERNAME=postgres.<project-ref>
  DB_PASSWORD=<supabase-password>
  DB_NAME=postgres
  DB_SSL=true
  JWT_SECRET=supersecretkey
  JWT_EXPIRES_IN=1d
  ```
  Paste the pooled connection values (host/port/user/password) from Supabase. Keep `DB_SSL=true` for pooled connections.

## 2) Install & Run
```bash
npm install
npm run start:dev        # local dev
npm run start:prod       # after build
```
Swagger UI: http://localhost:3000/api/docs

## 3) Database Migrations (Supabase)
Compile and run migrations against Supabase:
```bash
npm run migration:run        # applies dist/src migrations via data-source
# generate a new migration if schema changes
npm run migration:generate -- src/database/migrations/<Name>
```
Rollback last batch:
```bash
npm run migration:revert
```

## 4) Seed Data
Inserts 5 vendors, 15 POs, 10 payments, 1 admin user (email: admin@vendorpay.io, password: password123).
```bash
npm run seed
```

## 5) Authentication
- Login: `POST /api/auth/login` with `{ "email": "admin@vendorpay.io", "password": "password123" }`
- Use returned Bearer token for all other endpoints (Swagger Authorize button).

## 6) Core Business Rules
- Vendors: unique name & email, payment term enum, inactive vendors cannot receive new POs.
- POs: auto number `PO-YYYYMMDD-XXX`, total from items, due-date from vendor terms, status auto-managed (approved → partial → paid), cancel only when unpaid.
- Payments: transaction with pessimistic lock, overpayment prevention, automatic outstanding recalculation and status update.
- Analytics: vendor outstanding aggregation, aging buckets (0-30, 31-60, 61-90, 90+) via optimized SQL.

## 7) Deployment Notes (Railway/Render/Supabase)
- Use Supabase pooled connection vars in service env.
- Ensure `DB_SSL=true` and allow outgoing 6543 (Supabase pool).
- Run `npm run migration:run` then `npm run seed` once per environment.
- Start command: `npm run start:prod` (after `npm run build`).

## 8) Useful Commands
- Lint: `npm run lint`
- Tests (skeleton): `npm test`
- Build: `npm run build`

## 9) API Notes
- Base path: `/api`
- Swagger: `/api/docs`
- Error shape: `{ statusCode, message, details?, timestamp, path }`

## 10) DB Credentials Placeholder
Never commit real secrets. Use `.env` only; keep `.env.example` checked in with placeholders above.

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
