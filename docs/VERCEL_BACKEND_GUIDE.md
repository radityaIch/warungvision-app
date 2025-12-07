# Vercel Backend Deployment Guide

WarungVision backend is best deployed to **Vercel Edge Functions** or **Railway** since Vercel's serverless functions have limitations with Bun.

## Option 1: Vercel with Custom Build (Recommended for this project)

### Problem
Vercel's native Bun support is limited for long-running servers. Instead, deploy as a **Docker container** or use **Railway**.

### Solution: Use Railway or Heroku

We recommend **Railway** for best results:

1. Go to **https://railway.app**
2. Create new project
3. Connect your GitHub repo
4. Add PostgreSQL service
5. Configure backend with these settings:
   - **Root Directory**: `warungvision-be`
   - **Build Command**: `bun install && bun run prisma:generate`
   - **Start Command**: `bun src/index.ts`
   - **Add Environment Variables** (see below)

### Environment Variables for Railway
```
DATABASE_URL=postgresql://[auto-from-postgres-service]
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
KOLOSAL_API_KEY=your-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
PORT=3000
```

6. Deploy and copy the generated URL

---

## Option 2: Vercel with Serverless Functions (Not recommended for Bun servers)

If you must use Vercel for the backend:

### Limitations
- Vercel serverless functions have 10-60 second timeout limits
- Bun's full HTTP server doesn't work well in serverless
- Better to use Railway or Heroku

### Alternative: Use Vercel for Frontend Only

**Recommended approach:**
- Deploy **Frontend to Vercel** (Next.js)
- Deploy **Backend to Railway** (Bun + PostgreSQL)
- Connect them via environment variables

---

## Verified Working Setup

**Frontend:** Vercel ✅
**Backend:** Railway ✅
**Database:** Railway PostgreSQL ✅

This is the recommended stack for WarungVision.

---

## Quick Deploy Instructions

### 1. Deploy Frontend to Vercel
```bash
# Already done if you pushed to GitHub
# Frontend will auto-deploy on each push to main
```

### 2. Deploy Backend to Railway
```bash
# Go to https://railway.app
# Sign in with GitHub
# Create new project → From GitHub repo
# Select warungvision-app repo
# Click "Deploy"
# Wait for build to complete
# Copy the generated URL
```

### 3. Connect Frontend to Backend
In Vercel dashboard:
1. Go to your frontend project
2. Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL=https://your-railway-url`
4. Vercel auto-redeploys

---

## If You Still Want Vercel for Backend

Use this workaround (not recommended):

### Step 1: Create Vercel Function Wrapper
Create `api/handler.ts`:
```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/index";

export default async (req: VercelRequest, res: VercelResponse) => {
  // This won't work well with Bun servers
  // Use Railway instead
};
```

### Step 2: This Won't Work Well
Vercel serverless functions are not designed for long-running Bun servers.

**Recommendation:** Use Railway instead (it's free tier and perfect for Bun!)

---

## Summary

| Platform | Frontend | Backend | Database | Rating |
|----------|----------|---------|----------|--------|
| **Vercel** | ✅ Best | ❌ Limited | ❌ N/A | ⭐⭐⭐ |
| **Railway** | ✅ Good | ✅ Best | ✅ Included | ⭐⭐⭐⭐⭐ |
| **Heroku** | ❌ Paid | ✅ Good | ✅ Available | ⭐⭐⭐⭐ |

**Recommended:** Vercel (Frontend) + Railway (Backend + Database)

---

## Troubleshooting

### Frontend on Vercel works, but API calls fail
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend URL is correct and accessible
- Check CORS settings in backend

### Railway build fails
- Run locally: `bun install && bun run prisma:generate && bun src/index.ts`
- Commit `bun.lock` to GitHub
- Railway will auto-redeploy

### Prisma generation fails on Vercel
- Vercel doesn't have good Bun support yet
- Use Railway instead

---

## Final Recommendation

```
┌─────────────────────────┐
│    Frontend: Vercel     │
│   (Next.js on Edge)     │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│   Backend: Railway      │
│  (Bun + PostgreSQL)     │
└─────────────────────────┘
```

This setup works perfectly with WarungVision! 🚀
