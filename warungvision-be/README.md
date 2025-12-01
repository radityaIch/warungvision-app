# Warung Vision Backend - ElysiaJS

A high-performance backend API for warehouse inventory and scan management built with ElysiaJS, Bun, and PostgreSQL.

[![ElysiaJS](https://img.shields.io/badge/ElysiaJS-latest-blue)](https://elysiajs.com)
[![Bun](https://img.shields.io/badge/Bun-latest-yellowgreen)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.15-blueviolet)](https://prisma.io)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or Bun)
- PostgreSQL
- npm or Bun

### Installation

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL

# 3. Setup database
bun run prisma:migrate

# 4. Start development server
bun run dev
```

Server runs at `http://localhost:3000`
API docs at `http://localhost:3000/swagger`

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get running in minutes
- **[Migration Complete](./MIGRATION_COMPLETE.md)** - What was migrated from NestJS
- **[Full Documentation](./MIGRATION.md)** - Complete technical documentation
- **[Development Guide](./DEVELOPMENT.md)** - Development workflow and patterns
- **[API Collection](./API_COLLECTION.json)** - Postman collection for testing

## ✨ Features

- ✅ **Authentication** - JWT-based user authentication
- ✅ **Inventory Management** - Product CRUD and stock tracking
- ✅ **Scan Management** - Warehouse scan event management
- ✅ **Analytics** - Comprehensive insights and reporting
- ✅ **Validation** - Runtime validation with Zod
- ✅ **Error Handling** - Consistent error responses
- ✅ **API Documentation** - Swagger/OpenAPI support
- ✅ **TypeScript** - Full type safety
- ✅ **Hot Reload** - Development with auto-reload
- ✅ **CORS** - Cross-origin request support

## 📁 Project Structure

```
warung-vision-sync/
├── prisma/              # Database schema
├── src/
│   ├── middleware/      # Authentication middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/        # User authentication
│   │   ├── inventory/   # Product management
│   │   ├── scan/        # Scan operations
│   │   └── insight/     # Analytics
│   ├── utils/           # Utilities
│   └── index.ts         # Main entry point
└── [docs]               # Documentation
```

## 🔌 API Endpoints

**Authentication**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile` (auth required)
- `PATCH /api/v1/auth/profile` (auth required)

**Inventory**
- `POST /api/v1/inventory/products` (auth required)
- `GET /api/v1/inventory/products` (auth required)
- `GET /api/v1/inventory/products/:id` (auth required)
- `PATCH /api/v1/inventory/products/:id` (auth required)
- `DELETE /api/v1/inventory/products/:id` (auth required)
- `POST /api/v1/inventory/products/:id/stock` (auth required)
- `GET /api/v1/inventory/stats` (auth required)

**Scan**
- `POST /api/v1/scan/start` (auth required)
- `GET /api/v1/scan/events` (auth required)
- `GET /api/v1/scan/events/:id` (auth required)
- `POST /api/v1/scan/events/:id/items` (auth required)
- `POST /api/v1/scan/events/:id/complete` (auth required)

**Insights**
- `GET /api/v1/insights/daily` (auth required)
- `GET /api/v1/insights/scans` (auth required)
- `GET /api/v1/insights/products` (auth required)
- `GET /api/v1/insights/trends` (auth required)

## 🛠️ Development

```bash
bun run dev              # Start development server
bun run build            # Build for production
bun run start            # Run production build
bun run prisma:studio    # Open database explorer
```

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- SQL injection prevention via Prisma
- Input validation with Zod
- CORS support

## 📖 See Also

- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [MIGRATION.md](./MIGRATION.md) - Full documentation
- [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) - What was migrated
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide

## 🎯 Status

✅ Production Ready

**Last Updated**: December 1, 2025

---

```bash
bun install && bun run dev
```
