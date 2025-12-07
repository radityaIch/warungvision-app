# 🚀 WarungVision - Quick Start Guide

## Start Here! ⚡

This is the fastest way to get WarungVision running.

---

## ⏱️ 5-Minute Setup

### Step 1: Get API Keys (2 min)
1. **Kolosal AI**: Visit https://api.kolosal.ai → Sign up → Get API key (starts with `kol__`)
2. **Cloudinary**: Visit https://cloudinary.com → Sign up → Dashboard → Settings → Copy credentials

### Step 2: Setup Files (1 min)

**Backend** - Create `warungvision-be/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/warung_vision
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
KOLOSAL_API_KEY=kol__your_key_here
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

**Frontend** - Create `warungvision-fe/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 3: Install & Run (2 min)

```bash
# Terminal 1 - Backend
cd warungvision-be
bun install
bun run prisma:migrate
bun run dev

# Terminal 2 - Frontend
cd warungvision-fe
npm install
npm run dev
```

### Step 4: Open & Use
- **Frontend**: http://localhost:3001
- **API Docs**: http://localhost:3000/swagger

---

## 📸 First Scan

1. Open http://localhost:3001
2. Allow camera access when prompted
3. Click the camera button to take photo
4. Click "Start Scan" button
5. Click "Analyze" button
6. Wait for results (should show detected objects)
7. Go to Dashboard to see results

---

## 🎯 Main Dashboard Pages

| Page | URL | Purpose |
|------|-----|---------|
| Camera | http://localhost:3001 | Take shelf photos |
| Overview | http://localhost:3001/dashboard | See key metrics |
| Inventory | http://localhost:3001/dashboard/inventory | View all products |
| Low Stock | http://localhost:3001/dashboard/low-stock | Check alerts |
| Restock | http://localhost:3001/dashboard/restock | See suggestions |
| Sales | http://localhost:3001/dashboard/sales | View analytics |
| Scans | http://localhost:3001/dashboard/scans | Check history |

---

## 🧪 Test the API

### Using Swagger UI
Visit: http://localhost:3000/swagger

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"pass123",
    "name":"Test User",
    "storeId":"store-1"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

**Get Low Stock:**
```bash
curl -X GET http://localhost:3000/api/v1/inventory/low-stock?threshold=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Port Already in Use
Change PORT in backend `.env`:
```env
PORT=3001
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL is correct
# Try: psql -c "create database warung_vision;"
```

### Module Not Found Errors
```bash
# Backend
cd warungvision-be
bun install

# Frontend  
cd warungvision-fe
npm install
```

### API Not Responding
```bash
# Check backend is running on port 3000
# Check CORS_ORIGIN in backend .env
# Check NEXT_PUBLIC_API_URL in frontend .env.local
```

---

## 📱 What You Can Do

✅ Take photos of shelves
✅ Automatically detect products with AI
✅ Track inventory levels
✅ Get low-stock alerts
✅ See restock recommendations
✅ View sales analytics
✅ Check scan history

---

## 📖 Full Documentation

- **Setup Guide**: See `SETUP_GUIDE.md`
- **What's New**: See `WHATS_NEW.md`
- **Implementation**: See `IMPLEMENTATION_COMPLETE.md`
- **Backend Docs**: See `warungvision-be/README.md`

---

## 🔑 Key Features

### For Shop Owners
- 📸 Easy photo-based inventory scanning
- 🤖 AI automatically detects products
- 📊 Smart analytics and insights
- ⚠️ Low-stock alerts
- 💡 Restock recommendations
- 💰 Sales tracking

### For Developers
- 🚀 Modern tech stack (ElysiaJS, Next.js)
- 🔐 Secure JWT authentication
- 📚 Auto-generated API docs (Swagger)
- 🧪 Easy to test and debug
- 📦 Modular architecture

---

## ❓ Need Help?

1. **API Issues**: Check Swagger at /swagger
2. **Setup Issues**: See SETUP_GUIDE.md
3. **Feature Questions**: See WHATS_NEW.md
4. **Backend Issues**: Check warungvision-be/README.md

---

## 🎉 You're All Set!

Start scanning and managing your inventory with AI! 🚀

Questions? Check the full documentation files listed above.

Happy Inventory Management! 📊✨
