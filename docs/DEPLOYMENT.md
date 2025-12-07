# WarungVision Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with your repository pushed
- Vercel account (free at vercel.com)

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: WarungVision app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/warungvision-app.git
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your GitHub repository** (warungvision-app)
4. **Configure build settings:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `warungvision-fe`
   - **Build Command**: `npm run build` (or `pnpm build`)
   - **Start Command**: `npm start`
   - **Install Command**: `npm install` (or `pnpm install`)

5. **Add Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://your-backend.com` or keep as `http://localhost:3000` for dev)

6. **Click "Deploy"**

✅ Your frontend will be live at `https://your-project.vercel.app`

---

## Backend Deployment Options

### Option A: Railway (Recommended for Bun + PostgreSQL)

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. **Create new project**
3. **Add PostgreSQL from marketplace**
4. **Connect GitHub repository**
5. **Configure:**
   - **Root Directory**: `warungvision-be`
   - **Build Command**: `bun install && bun run build` (if you have a build script)
   - **Start Command**: `bun src/index.ts`
   - **Node Version**: 20 or higher

6. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your_secret_key
   CORS_ORIGIN=https://your-project.vercel.app
   KOLOSAL_API_KEY=your_key
   CLOUDINARY_CLOUD_NAME=your_cloud
   CLOUDINARY_API_KEY=your_key
   ```

7. **Deploy and copy the generated backend URL**

### Option B: Heroku with Buildpack

1. Create a `Procfile` in `warungvision-be/`:
   ```
   web: bun src/index.ts
   ```

2. Add Buildpack for Bun (use custom buildpack if needed)
3. Connect GitHub repo and deploy

### Option C: Docker + Any VPS (AWS, DigitalOcean, etc.)

Create `warungvision-be/Dockerfile`:

```dockerfile
FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

EXPOSE 3000
CMD ["bun", "src/index.ts"]
```

---

## Post-Deployment Steps

### 1. Update Frontend Environment Variables

After backend is deployed, update Vercel environment variables:
- Go to Vercel project settings → Environment Variables
- Set `NEXT_PUBLIC_API_URL` to your backend URL

### 2. Update CORS Settings

In backend environment variables, set:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 3. Update Database Connection

Ensure your production database credentials are set in:
```
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### 4. Generate New JWT Secret

For production, use a strong random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set in backend environment variables:
```
JWT_SECRET=your_generated_secret
```

---

## Domain Configuration

### Frontend (Vercel)
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `app.yourwarung.com`)
3. Follow DNS setup instructions

### Backend (Railway/Heroku)
1. Get your generated URL from the platform
2. Or add custom domain via platform settings
3. Update frontend `NEXT_PUBLIC_API_URL` accordingly

---

## Monitoring & Logs

### Vercel
- Dashboard shows deployment logs
- Realtime logs in Function logs tab

### Railway
- Logs tab shows real-time server output
- Monitor database connections and memory

---

## Troubleshooting

### Frontend shows 404 or API errors
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend CORS allows frontend domain
- Check browser console for exact error

### Backend won't deploy
- Verify all environment variables are set
- Check buildpack compatibility with Bun
- Ensure `package.json` build scripts exist

### Database connection fails
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check database firewall allows the deployment platform IP
- Run migrations if needed: `bun prisma migrate deploy`

### Auth token issues
- Verify `JWT_SECRET` matches between backend and local
- Check token expiration settings
- Clear browser localStorage and login again

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Heroku/Docker)
- [ ] Database provisioned and connected
- [ ] Environment variables set on both platforms
- [ ] CORS origin updated to production frontend URL
- [ ] Custom domain configured (optional)
- [ ] Tested login flow end-to-end
- [ ] Tested scan and inventory features
- [ ] Monitored logs for errors
- [ ] Set up monitoring alerts (optional)

---

## Support

For more info:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Elysia Docs: https://elysiajs.com
- Next.js Docs: https://nextjs.org/docs
