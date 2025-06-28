# Free Deployment Guide

## Option 1: Railway (Recommended - Completely Free)

### Steps:
1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Connect repo**: Click "Deploy from GitHub repo" and select this repository
3. **Set environment variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: production
4. **Deploy**: Railway will automatically build and deploy your app
5. **Get URL**: Railway provides a free `.railway.app` subdomain

### Cost: $0 (Uses $5 monthly credit, your app will use ~$1-2/month)

---

## Option 2: Render (Also Free)

### Steps:
1. **Sign up**: Go to [render.com](https://render.com) and sign up with GitHub
2. **Create Web Service**: Click "New" → "Web Service"
3. **Connect repo**: Select this repository
4. **Configure**:
   - Build Command: `npm run build:client`
   - Start Command: `npm start`
5. **Set environment variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: production
6. **Deploy**: Render will build and deploy your app

### Cost: $0 (Sleeps after 15min inactivity, wakes in ~30 seconds)

---

## Option 3: Netlify (Frontend) + Netlify Functions (Backend)

### More complex but also free - requires converting Express routes to serverless functions

---

## What I've Prepared:

✅ Added production build scripts to package.json
✅ Added static file serving for production
✅ Created railway.json configuration
✅ Your app is now deployment-ready!

## Next Steps:
1. Push these changes to GitHub
2. Choose Railway or Render
3. Follow the steps above
4. Your app will be live in ~5 minutes!

## Environment Variables Needed:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `NODE_ENV`: production (Railway/Render will set this automatically)
