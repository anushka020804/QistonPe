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

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
## MSME Vendor Payment Tracking API (NestJS + Supabase)

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
