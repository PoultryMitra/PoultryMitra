# Deploy to Netlify Guide

## Quick Netlify Deployment (5 minutes)

### Step 1: Prepare for Netlify
Your app is already configured for Netlify! The build process creates `netlify.toml` automatically.

### Step 2: Deploy Options

#### Option A: Drag & Drop (Fastest)
1. Run: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder to the deployment area
4. Your app will be live instantly!

#### Option B: Connect GitHub (Best for updates)
1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `fowl-front` repository
5. Build settings:
   - **Build command:** `npm run build` (Netlify runs `npm install` automatically)
   - **Publish directory:** `dist`
   - **Node version:** 18 (optional, but recommended)
6. Click "Deploy site"

**Alternative build command (if you want more control):**
- **Build command:** `npm ci && npm run build`

### Step 3: Environment Variables (Important!)
After deployment, add these in Netlify dashboard > Site settings > Environment variables:

```
VITE_FIREBASE_API_KEY=AIzaSyD3tc1EKESzh4ITdCbM3a5NSlZa4vDnVBY
VITE_FIREBASE_AUTH_DOMAIN=soullink-96d4b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=soullink-96d4b
VITE_FIREBASE_STORAGE_BUCKET=soullink-96d4b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=321937432406
VITE_FIREBASE_APP_ID=1:321937432406:web:14469a9f3f45a6315380f7
VITE_OPENWEATHER_API_KEY=e92819b2f8eef106a1c3e2277df3ea88
VITE_MAPPLS_API_KEY=21b2d60e8be47191eac3234fd147b305
VITE_MAPPLS_CLIENT_ID=96dHZVzsAuvHvv3xHM4eXxz8uydoco53D32DOVAXXj5rxiKJErndb7KM5evxFkh1hGJ_nUHNmEUnpA8tEK0wYUFJ_mjdb2J-
VITE_MAPPLS_CLIENT_SECRET=lrFxI-iSEg8UeLHzvn1HBR2QnnTMxU1Fsm72FNj7YkKgEwEx-lQJm033HoomAbO97BjgxKGp9YXLRoq0lT822NwKRCY-Ru_k6HYCgaf-JYM=
```

### Step 4: Test SPA Routing
After deployment, test these URLs by refreshing them:
- https://your-app.netlify.app/farmer-login
- https://your-app.netlify.app/dealer-login
- https://your-app.netlify.app/farmer/dashboard

## Benefits over Render.com:
✅ Better SPA routing support
✅ Faster deployments (2-3 minutes vs 5-10 minutes)
✅ More reliable builds
✅ Better error reporting
✅ Form handling built-in
✅ Analytics included
