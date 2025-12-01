# Quick Start Guide

## 1. Install Dependencies
```bash
bun install
```

## 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (especially DATABASE_URL)
```

## 3. Setup Database
```bash
# Generate Prisma client
bun run prisma:generate

# Create and migrate database
bun run prisma:migrate
```

## 4. Start Server
```bash
bun run dev
```

Server will be available at `http://localhost:3000`
API Docs at `http://localhost:3000/swagger`

## 5. Test API

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "storeId": "store-123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Product (requires token from login)
```bash
curl -X POST http://localhost:3000/api/v1/inventory/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sku": "PROD-001",
    "name": "Product Name",
    "price": 10000,
    "storeId": "store-123",
    "stock": 100
  }'
```

### Get Products
```bash
curl -X GET http://localhost:3000/api/v1/inventory/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

## Database Management

### Prisma Studio (Visual DB Explorer)
```bash
bun run prisma:studio
```

### Reset Database (Development Only!)
```bash
bun run prisma:migrate -- reset
```

### Generate Prisma Client After Schema Changes
```bash
bun run prisma:generate
```

## Common Tasks

### Update Dependencies
```bash
bun install
```

### Format Code
```bash
bunx prettier --write src/
```

### View Database
```bash
bun run prisma:studio
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change PORT in .env |
| Database connection failed | Check DATABASE_URL and PostgreSQL status |
| Migration error | Run `bun run prisma:migrate -- reset` |
| Validation error | Check request body format in API docs |

## Next Steps

1. Read [MIGRATION.md](./MIGRATION.md) for full documentation
2. Check [API endpoints](#api-endpoints) below
3. Explore `src/` directory for code structure

## API Endpoints Quick Reference

**Auth**
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get profile
- `PATCH /api/v1/auth/profile` - Update profile

**Inventory**
- `POST /api/v1/inventory/products` - Create product
- `GET /api/v1/inventory/products` - List products
- `GET /api/v1/inventory/stats` - Inventory stats
- `GET /api/v1/inventory/low-stock` - Low stock items

**Scan**
- `POST /api/v1/scan/start` - Start scan
- `GET /api/v1/scan/events` - List scans
- `POST /api/v1/scan/events/:id/complete` - Complete scan

**Insights**
- `GET /api/v1/insights/scans` - Scan insights
- `GET /api/v1/insights/trends` - Inventory trends
- `GET /api/v1/insights/products` - Product performance

## Production Deployment

### Build
```bash
bun run build
```

### Start
```bash
bun run start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Use PostgreSQL remote connection
- Configure appropriate `CORS_ORIGIN`
- Set `PORT` as needed

---

Need help? Check [MIGRATION.md](./MIGRATION.md) for detailed documentation.
