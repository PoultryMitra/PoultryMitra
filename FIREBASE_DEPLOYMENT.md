# Deploy to Firebase Hosting Guide

## Firebase Hosting Setup (Perfect since you're using Firebase)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login and Initialize
```bash
firebase login
firebase init hosting
```

### Step 3: Configuration
When prompted:
- **What do you want to use as your public directory?** `dist`
- **Configure as a single-page app?** `Yes`
- **Set up automatic builds and deploys with GitHub?** `Yes` (optional)

### Step 4: Deploy
```bash
npm run build
firebase deploy --only hosting
```

### Step 5: Benefits
✅ Same platform as your auth/database
✅ Excellent SPA routing
✅ Free SSL certificates
✅ Global CDN
✅ Easy custom domains
✅ Perfect integration with Firebase services

### Firebase Configuration (firebase.json)
The build process should create this automatically, but here's what it should look like:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```
