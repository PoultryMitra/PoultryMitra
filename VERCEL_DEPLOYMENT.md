# Deploy to Vercel Guide

## Quick Vercel Deployment

### Step 1: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Step 2: Deploy Options

#### Option A: Web Interface (Recommended)
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub: `fowl-front`
4. Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
5. Add environment variables (same as Netlify list above)
6. Click "Deploy"

#### Option B: CLI (Advanced)
```bash
vercel --prod
```

### Step 3: Benefits
✅ Lightning fast global CDN
✅ Automatic HTTPS
✅ Preview deployments for every commit
✅ Built-in analytics
✅ Perfect SPA routing support

Your app already has `vercel.json` configured!
