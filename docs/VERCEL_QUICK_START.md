# Vercel Deployment Quick Start

## Option 1: Frontend to Vercel (Easiest - 5 minutes)

### Step 1: Push to GitHub
```bash
cd c:\Users\USER\dev\hackathon\warungvision-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/warungvision-app.git
git push -u origin main
```

### Step 2: Deploy Frontend
1. Go to **https://vercel.com/new**
2. Click **Import Git Repository**
3. Select your **warungvision-app** repo
4. Click **Import**
5. Configure settings:
   - **Framework**: Next.js
   - **Root Directory**: `warungvision-fe`
   - **Build Command**: `pnpm build` (auto-detected)
   
6. **Add Environment Variable:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:3000` (for now, update later)
   
7. Click **Deploy** ✅

**Your frontend is now live!** Copy the URL (e.g., `https://warungvision-app.vercel.app`)

---

## Option 2: Backend to Railway (Recommended)

### Step 1: Create Railway Account
1. Go to **https://railway.app**
2. Sign in with GitHub
3. Click **New Project**
4. Click **Deploy from GitHub repo**
5. Select **warungvision-app**

### Step 2: Configure Backend
In Railway dashboard:

1. **Add Service → PostgreSQL** (for database)
2. **Add Service → GitHub Repo**
   - Select branch: `main`
   - Root Directory: `warungvision-be`
   - Build Command: `bun install`
   - Start Command: `bun src/index.ts`

3. **Add Environment Variables** (click Variables):
   ```
   DATABASE_URL=postgresql://[auto-filled from PostgreSQL service]
   JWT_SECRET=generate-a-long-random-string-here
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   KOLOSAL_API_KEY=your_key
   CLOUDINARY_CLOUD_NAME=your_cloud
   CLOUDINARY_API_KEY=your_key
   PORT=3000
   ```

4. Click **Deploy**

**Copy your backend URL** (e.g., `https://warungvision-app.up.railway.app`)

### Step 3: Update Frontend URL
1. Go back to **Vercel** → Your project → **Settings → Environment Variables**
2. Update `NEXT_PUBLIC_API_URL` to your Railway backend URL
3. Vercel will **auto-redeploy** with new URL

---

## Option 3: Backend to Heroku (Alternative)

### Prerequisites
- Heroku account (free tier available at heroku.com)
- Heroku CLI installed

### Step 1: Setup Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create warungvision-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:basic

# Set environment variables
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set CORS_ORIGIN="https://your-vercel-url.vercel.app"
heroku config:set KOLOSAL_API_KEY="your-key"
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud"
heroku config:set CLOUDINARY_API_KEY="your-key"
```

### Step 2: Create Procfile
File: `warungvision-be/Procfile`
```
web: bun src/index.ts
```

### Step 3: Deploy
```bash
cd warungvision-be
git push heroku main
```

---

## Verify Everything Works

### Test Frontend
```
1. Open https://your-vercel-url.vercel.app
2. Login should work
3. Check console (F12) for API errors
```

### Test Backend
```bash
curl -X GET https://your-backend-url/api/v1/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Connection
```
1. Login in frontend
2. Try scanning or adding product
3. Should connect to your backend
```

---

## Common Issues & Solutions

### ❌ "Cannot find module" in Vercel
**Solution**: Update build command to include `pnpm install`
- Vercel → Settings → Build Command → `pnpm install && pnpm build`

### ❌ 404 when accessing API
**Solution**: Check `NEXT_PUBLIC_API_URL`
- Make sure it's the full URL including `https://`
- No trailing slash

### ❌ CORS errors
**Solution**: Update backend `CORS_ORIGIN`
```
heroku config:set CORS_ORIGIN="https://your-vercel-url.vercel.app"
# or in Railway: update CORS_ORIGIN environment variable
```

### ❌ Database connection failed
**Solution**: 
- Verify DATABASE_URL is correct format
- Check if database is running
- Run migrations: `heroku run "bun prisma migrate deploy"`

### ❌ JWT authentication fails
**Solution**: Ensure same JWT_SECRET in all environments
```bash
# Generate new secure secret
openssl rand -hex 32
```

---

## Next Steps (Optional)

### Setup Custom Domain
- Vercel: Settings → Domains → Add custom domain
- Railway/Heroku: Add custom domain in project settings

### Setup CI/CD
- GitHub Actions automatically deploys on push
- Both Vercel and Railway support this

### Setup Monitoring
- Vercel: Analytics & Monitoring tabs
- Railway: Deployments & Metrics tabs

### Setup Backup
- Enable automatic backups in PostgreSQL service settings

---

## Support

Need help?
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Heroku Docs**: https://devcenter.heroku.com
