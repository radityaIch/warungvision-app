# ElysiaJS Migration Documentation

This document outlines the successful migration from NestJS backend (warung-vision-sync-db) to ElysiaJS backend (warung-vision-sync).

## Migration Summary

### What Was Migrated
- ✅ **Authentication Module**: Register, Login, Profile management with JWT
- ✅ **Inventory Module**: Product management, stock tracking, stock history
- ✅ **Scan Module**: Scan event management, item tracking
- ✅ **Insight Module**: Analytics and reporting endpoints
- ✅ **Database**: Full Prisma schema with PostgreSQL
- ✅ **Middleware**: JWT authentication, error handling
- ✅ **Validation**: Zod-based DTO validation

### Project Structure

```
warung-vision-sync/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controller.ts
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── dto.ts
│   │   ├── inventory/
│   │   │   ├── controller.ts
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── dto.ts
│   │   ├── scan/
│   │   │   ├── controller.ts
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── dto.ts
│   │   └── insight/
│   │       ├── controller.ts
│   │       └── service.ts
│   ├── utils/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── jwt.ts             # JWT utilities
│   │   └── errors.ts          # Error handling
│   └── index.ts               # Main entry point
├── .env                        # Environment variables
├── .env.example               # Example environment file
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (requires auth)
- `PATCH /profile` - Update user profile (requires auth)

### Inventory (`/api/v1/inventory`)
- `POST /products` - Create product
- `GET /products` - Get all products for store
- `GET /products/:id` - Get product by ID
- `GET /products/sku/:sku` - Get product by SKU
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:id/stock` - Update stock
- `GET /stock-history` - Get stock history
- `GET /stats` - Get inventory statistics
- `GET /low-stock` - Get low stock products

### Scan (`/api/v1/scan`)
- `POST /start` - Start new scan event
- `GET /events` - Get user's scan events
- `GET /events/:id` - Get specific scan event
- `POST /events/:id/items` - Add item to scan
- `DELETE /items/:id` - Remove item from scan
- `POST /events/:id/complete` - Complete scan
- `DELETE /events/:id` - Cancel scan
- `GET /admin/queued` - Get queued scans
- `GET /admin/processing` - Get processing scans

### Insights (`/api/v1/insights`)
- `GET /daily?days=7` - Daily insights
- `GET /scans?days=30` - Scan insights
- `GET /products?limit=10` - Product performance
- `GET /trends?days=30` - Inventory trends
- `GET /user-activity?days=7` - User activity

### Health Check
- `GET /api/v1/health` - Server health status

## Key Changes from NestJS

### 1. **Framework Differences**
| Aspect | NestJS | ElysiaJS |
|--------|--------|----------|
| Framework Style | Dependency Injection, Decorators | Functional, Plugin-based |
| Routing | @Controller, @Get decorators | Elysia plugin system |
| Middleware | @UseGuards, pipes | Elysia derives |
| Validation | class-validator | Zod schemas |
| Error Handling | Exception filters | onError handler |

### 2. **Authentication**
- **NestJS**: JWT Strategy, Guards
- **ElysiaJS**: Middleware with `requireAuth` and `optionalAuth` plugins

### 3. **Database**
- Both use Prisma ORM
- Schema is identical
- PostgreSQL as primary database

### 4. **Dependency Injection**
- **NestJS**: Constructor-based DI with @Injectable()
- **ElysiaJS**: Manual service instantiation (simpler, more functional)

## Setup Instructions

### Prerequisites
- Node.js 18+ and Bun
- PostgreSQL database
- npm or bun package manager

### Installation

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   bun run prisma:generate

   # Run migrations
   bun run prisma:migrate

   # Or reset database (development only)
   bunx prisma migrate reset
   ```

4. **Start development server**
   ```bash
   bun run dev
   ```

5. **Build for production**
   ```bash
   bun run build
   ```

## Running the Application

### Development
```bash
bun run dev
```
Server runs on `http://localhost:3000` with hot reload

### Production
```bash
bun run start
```

### Database Management
```bash
# Prisma Studio (visual database explorer)
bun run prisma:studio

# Create new migration
bun run prisma:migrate -- --name "migration_name"

# Generate Prisma client
bun run prisma:generate
```

## Environment Variables

```env
# App Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/warung_vision

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# Redis Configuration (for future queue implementation)
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Authentication Flow

1. **Register**: POST `/api/v1/auth/register` with email, password, name, storeId
2. **Login**: POST `/api/v1/auth/login` with email, password → returns access_token
3. **Protected Routes**: Include token in header: `Authorization: Bearer {access_token}`
4. **Profile Access**: GET `/api/v1/auth/profile` with valid token

## Error Handling

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

Common status codes:
- 200: Success
- 400: Bad request / Validation error
- 401: Unauthorized
- 404: Not found
- 500: Server error

## Validation

DTOs use Zod schemas for runtime validation:

```typescript
// Example: CreateProductDto
{
  sku: "unique-sku",
  name: "Product Name",
  price: 10000,
  storeId: "store-id",
  description: "Optional description",
  stock: 100,
  image: "https://example.com/image.jpg"
}
```

## Next Steps

### Recommended Enhancements
1. Add Bull queue integration for async jobs
2. Implement Cloudinary image upload
3. Add request logging and monitoring
4. Add rate limiting
5. Add API key authentication for mobile clients
6. Add batch operations endpoints
7. Add real-time updates with WebSockets
8. Add unit and integration tests

### Database Improvements
1. Add database indexing optimization
2. Add connection pooling
3. Consider read replicas for scaling

### Security
1. Add request validation middleware
2. Add SQL injection prevention (Prisma already handles this)
3. Add CORS origin whitelist configuration
4. Add helmet middleware for security headers
5. Add rate limiting by IP/user

## Troubleshooting

### Common Issues

**Database connection error**
```
Solution: Check DATABASE_URL in .env and ensure PostgreSQL is running
```

**JWT verification failed**
```
Solution: Ensure JWT_SECRET is set and consistent across app restart
```

**Port already in use**
```
Solution: Change PORT in .env or kill process on that port
```

**Prisma schema out of sync**
```
Solution: Run `bun run prisma:migrate`
```

## Migration Checklist

- [x] All NestJS modules migrated to ElysiaJS
- [x] Authentication working with JWT
- [x] Inventory management endpoints functional
- [x] Scan management endpoints functional
- [x] Insight/analytics endpoints functional
- [x] Error handling implemented
- [x] Validation implemented
- [x] Database schema copied
- [x] Environment configuration setup
- [x] TypeScript configuration setup
- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit

## Support

For issues or questions about the migration, refer to:
- [ElysiaJS Documentation](https://elysiajs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Bun Documentation](https://bun.sh)
