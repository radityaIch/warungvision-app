# WarungVision - Complete Setup & Deployment Guide

## 📋 Overview

WarungVision is a smart inventory management system powered by AI that helps small shop owners (warung) manage their daily operations effortlessly. Users take photos of shelves, and the Kolosal AI Object Detection API automatically identifies products, counts items, and tracks stock changes.

### Tech Stack
- **Backend**: ElysiaJS + Bun + PostgreSQL + Prisma
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **AI**: Kolosal AI Object Detection API
- **Storage**: Cloudinary CDN
- **Auth**: JWT Tokens

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- Kolosal AI API key (from https://api.kolosal.ai)
- Cloudinary account (from https://cloudinary.com)

### Installation (5 minutes)

#### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd warungvision-be
bun install

# Install frontend dependencies
cd ../warungvision-fe
npm install
```

#### 2. Configure Environment Variables

Backend (`.env`):
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/warung_vision

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Kolosal AI
KOLOSAL_API_KEY=kol__your_kolosal_api_key

# Server
PORT=3000
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
```

Frontend (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 3. Setup Database

```bash
cd warungvision-be
bun run prisma:migrate
```

#### 4. Start Development Servers

Terminal 1 (Backend):
```bash
cd warungvision-be
bun run dev
# Runs on http://localhost:3000
# API Docs: http://localhost:3000/swagger
```

Terminal 2 (Frontend):
```bash
cd warungvision-fe
npm run dev
# Runs on http://localhost:3001
```

---

## 🔑 Getting API Keys

### Kolosal AI API Key
1. Visit https://api.kolosal.ai
2. Sign up for an account
3. Create a new API key (starts with `kol__`)
4. Add to your `.env` as `KOLOSAL_API_KEY`

### Cloudinary Credentials
1. Visit https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard → Settings
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Add to your `.env`

---

## 📱 Features

### 1. Image Capture & AI Detection
- Take photos of shelves using mobile device camera
- Kolosal AI automatically detects products
- Shows detection results with confidence scores
- Images securely stored in Cloudinary

### 2. Inventory Management
- View all products and stock levels
- Create/Edit/Delete products
- Track stock history
- Low-stock alerts (configurable threshold)

### 3. AI-Powered Insights
- **Restock Recommendations**: Based on consumption trends, calculates when to restock and suggested quantities
- **Sales Insights**: Shows daily/monthly spending estimates and top-selling products
- **Low Stock Alerts**: Configurable thresholds for stock warnings
- **Inventory Trends**: Track stock movements over time
- **Scan History**: View all scans with processing times

### 4. Dashboard
- Overview with key metrics
- Inventory management interface
- Low-stock alert system
- Restock recommendations with priorities
- Sales performance analytics
- Scan history tracking

---

## 🎯 API Endpoints

### Authentication
```
POST   /api/v1/auth/register          - Register user
POST   /api/v1/auth/login             - Login (returns JWT)
GET    /api/v1/auth/profile           - Get user profile (auth required)
PATCH  /api/v1/auth/profile           - Update profile (auth required)
```

### Inventory
```
GET    /api/v1/inventory/products     - List all products
POST   /api/v1/inventory/products     - Create product
GET    /api/v1/inventory/products/:id - Get product
PATCH  /api/v1/inventory/products/:id - Update product
DELETE /api/v1/inventory/products/:id - Delete product
POST   /api/v1/inventory/products/:id/stock - Update stock
GET    /api/v1/inventory/low-stock    - Get low-stock products
GET    /api/v1/inventory/stats        - Get inventory statistics
```

### Scan (AI Detection)
```
POST   /api/v1/scan/start                      - Start new scan
GET    /api/v1/scan/events                     - List all scans
GET    /api/v1/scan/events/:id                 - Get scan details
POST   /api/v1/scan/events/:id/upload          - Upload image for detection
POST   /api/v1/scan/events/:id/complete        - Mark scan complete
DELETE /api/v1/scan/events/:id                 - Cancel scan
```

### Insights (Analytics)
```
GET    /api/v1/insights/daily                  - Daily insights
GET    /api/v1/insights/scans                  - Scan analytics
GET    /api/v1/insights/products               - Product performance
GET    /api/v1/insights/trends                 - Inventory trends
GET    /api/v1/insights/user-activity          - User activity tracking
GET    /api/v1/insights/restock-recommendations - AI restock suggestions
GET    /api/v1/insights/sales                  - Sales analytics
```

---

## 🧪 Testing the API

### Option 1: Swagger UI
Open browser: http://localhost:3000/swagger

### Option 2: Using cURL

Register:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Your Name",
    "storeId": "store-1"
  }'
```

Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 🗄️ Database Schema

### Models
- **User**: Store staff with authentication
- **Store**: Shop/warung information
- **Product**: Inventory items with SKU, price, stock
- **ScanEvent**: Scan sessions with status tracking
- **ScanItem**: Individual items in a scan
- **ScanResult**: AI detection results (objects, confidence, bboxes)
- **StockHistory**: Audit trail of stock changes

---

## 🏗️ Project Structure

```
warungvision-app/
├── warungvision-be/
│   ├── src/
│   │   ├── index.ts                    # Main entry point
│   │   ├── middleware/
│   │   │   └── auth.ts                 # JWT authentication
│   │   ├── modules/
│   │   │   ├── auth/                   # User authentication
│   │   │   ├── inventory/              # Product management
│   │   │   ├── scan/                   # Scan operations & AI
│   │   │   └── insight/                # Analytics
│   │   └── utils/
│   │       ├── kolosal.ts              # Kolosal AI integration
│   │       ├── cloudinary.ts           # Cloudinary storage
│   │       ├── jwt.ts                  # JWT utilities
│   │       ├── errors.ts               # Error handling
│   │       └── prisma.ts               # Database client
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   └── package.json
│
├── warungvision-fe/
│   ├── app/
│   │   ├── page.tsx                    # Camera/scanning page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── components/
│   │   │   ├── CameraView.tsx          # Camera + upload
│   │   │   └── Providers.tsx           # React Query provider
│   │   └── dashboard/
│   │       ├── layout.tsx              # Dashboard layout
│   │       ├── page.tsx                # Overview
│   │       ├── inventory/              # Inventory page
│   │       ├── low-stock/              # Low-stock alerts
│   │       ├── restock/                # Restock recommendations
│   │       ├── sales/                  # Sales analytics
│   │       └── scans/                  # Scan history
│   ├── lib/
│   │   ├── api.ts                      # API client
│   │   └── hooks.ts                    # React Query hooks
│   ├── public/                         # Static files
│   └── package.json
│
└── package.json                        # Workspace config
```

---

## 🚢 Production Deployment

### Backend (ElysiaJS)

#### Build for Production
```bash
cd warungvision-be
bun run build
```

#### Using Docker
```dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .
RUN bun install

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start"]
```

#### Using PM2
```bash
pm2 start "bun run src/index.ts" --name "warung-vision-api"
pm2 save
pm2 startup
```

### Frontend (Next.js)

#### Build and Start
```bash
cd warungvision-fe
npm run build
npm run start
```

#### Deploy to Vercel
```bash
npm install -g vercel
vercel deploy
```

---

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use HTTPS in production
- [ ] Set `CORS_ORIGIN` to your frontend domain
- [ ] Enable database SSL connections
- [ ] Use environment variables for all secrets
- [ ] Implement rate limiting on API
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags
- [ ] Regular security audits
- [ ] Monitor API logs

---

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Change PORT in .env
PORT=3001
```

**Database Connection Error**
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists and is accessible

**Prisma Migration Failed**
```bash
bun run prisma:migrate reset  # Reset schema (dev only!)
```

### Frontend Issues

**API Connection Failed**
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in backend

**Build Errors**
```bash
# Clear build cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 Kolosal AI Integration Details

### Detection Endpoint
```
POST /v1/segment/base64
```

### Request Body
```json
{
  "image": "base64_encoded_image",
  "prompts": ["product", "item", "package"],
  "return_annotated": true,
  "return_masks": false,
  "threshold": 0.5
}
```

### Response
```json
{
  "success": true,
  "results": [
    {
      "name": "bottle",
      "confidence": 0.95,
      "bbox": [x1, y1, x2, y2]
    }
  ],
  "processing_time_ms": 250,
  "prompts_used": ["product", "item", "package"]
}
```

---

## 🔄 Cloudinary Integration

### Features Used
- Image upload with automatic optimization
- Secure URLs with CDN
- Folder organization (warung-vision/scans)
- Automatic format conversion
- Quality optimization

### Upload Parameters
```javascript
{
  folder: "warung-vision/scans",
  resource_type: "auto",
  quality: "auto",
  fetch_format: "auto",
  overwrite: false
}
```

---

## 📈 Performance Optimization

### Backend
- Indexed database queries on frequently searched fields
- Efficient stock aggregations
- Paginated API responses
- Cloudinary CDN for images

### Frontend
- React Query for caching
- Image optimization with Next.js
- Lazy loading of components
- Tailwind CSS purging

---

## 🆘 Support

### Documentation
- Backend: `warungvision-be/README.md`
- API Collection: `warungvision-be/API_COLLECTION.json` (Postman)
- Development: `warungvision-be/DEVELOPMENT.md`

### External Resources
- [Kolosal AI Docs](https://api.kolosal.ai/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [ElysiaJS Docs](https://elysiajs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)

---

## 📝 License

WarungVision - Smart Inventory Management for Small Shops

---

## 🎉 You're Ready!

Everything is set up! Now:
1. Start the backend: `bun run dev` in `warungvision-be`
2. Start the frontend: `npm run dev` in `warungvision-fe`
3. Visit: http://localhost:3001
4. Test API: http://localhost:3000/swagger
5. Start scanning!

Happy Inventory Management! 📸📊
