# 🚀 Deployment Guide - Poultry Mitra

## Quick Deployment Options

### 1. Firebase Hosting (Recommended - Free Tier Available)

Firebase Hosting provides the best integration with your Firebase backend and offers excellent performance with CDN.

#### Setup Steps:
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting in your project
firebase init hosting

# When prompted:
# - Use existing project: Select your Firebase project
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No
```

#### Deploy Command:
```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

#### Custom Domain (Optional):
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Update DNS records with your domain provider

---

### 2. Netlify (Drag & Drop - Easiest)

Perfect for quick deployments without command line.

#### Setup Steps:
1. Build your project locally:
   ```bash
   npm run build
   ```

2. Go to [Netlify Drop](https://app.netlify.com/drop)

3. Drag and drop the `dist` folder

4. Configure environment variables:
   - Go to Site settings → Environment variables
   - Add all your Firebase config variables

#### Continuous Deployment:
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

---

### 3. Vercel (GitHub Integration)

Great for automatic deployments from GitHub.

#### Setup Steps:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to connect your GitHub repository

#### Automatic Deployments:
- Connect your GitHub repository on Vercel dashboard
- Every push to main branch will trigger deployment
- Add environment variables in Vercel dashboard

---

### 4. Shared Hosting (cPanel/Traditional)

For traditional web hosting providers.

#### Setup Steps:
1. Build the project:
   ```bash
   npm run build
   ```

2. Upload `dist` folder contents to your hosting public directory (usually `public_html`)

3. Create `.htaccess` file in the root directory:
   ```apache
   RewriteEngine On
   RewriteRule ^(?!.*\.).*$ /index.html [L]
   ```

4. Configure environment variables (if supported by your host)

---

## Environment Variables Setup

For any hosting platform, you'll need to configure these environment variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Getting Firebase Config:
1. Go to Firebase Console
2. Project Settings → General
3. Scroll to "Your apps" section
4. Click on config icon for your web app
5. Copy the config values

---

## Domain Configuration

### Custom Domain Setup (All Platforms):

1. **Purchase Domain**: Buy from providers like Namecheap, GoDaddy, etc.

2. **DNS Configuration**:
   - For Firebase: Add provided A records
   - For Netlify: Add CNAME record
   - For Vercel: Add CNAME record
   - For Traditional: Add A record to your server IP

3. **SSL Certificate**: Most platforms provide free SSL automatically

---

## Performance Optimization

### Before Deployment:
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/stats.html

# Optimize images
# Use tools like TinyPNG for image compression
```

### Build Optimization:
The project already includes:
- Code splitting
- Tree shaking
- Minification
- Gzip compression support

---

## Security Checklist

### Firebase Security Rules:
Ensure your Firestore rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /rates/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Environment Variables:
- Never commit `.env` files to version control
- Use platform-specific environment variable settings
- Regularly rotate API keys

---

## Monitoring & Analytics

### Set up monitoring:
1. **Firebase Analytics**: Already configured in the project
2. **Google Search Console**: Add your domain for SEO monitoring
3. **Uptime Monitoring**: Use services like UptimeRobot
4. **Error Tracking**: Consider Sentry for error monitoring

---

## Backup Strategy

### Regular Backups:
1. **Database**: Export Firestore data regularly
2. **Code**: Keep in version control (GitHub)
3. **Assets**: Backup uploaded files from Firebase Storage

### Backup Commands:
```bash
# Export Firestore data
firebase firestore:delete --all-collections --force
gcloud firestore export gs://your-bucket/backup-folder
```

---

## Troubleshooting Common Issues

### Build Errors:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Connection Issues:
- Verify all environment variables are set correctly
- Check Firebase project settings
- Ensure authentication is enabled

### Deployment Failures:
- Check build logs for errors
- Verify environment variables on hosting platform
- Ensure Firebase project permissions

---

## Cost Estimation

### Firebase (Free Tier):
- **Hosting**: 10GB storage, 10GB/month transfer
- **Firestore**: 50,000 reads, 20,000 writes, 20,000 deletes per day
- **Authentication**: Unlimited users

### Netlify (Free Tier):
- **Hosting**: 100GB bandwidth/month
- **Build minutes**: 300 minutes/month
- **Sites**: Unlimited

### Vercel (Free Tier):
- **Hosting**: 100GB bandwidth/month
- **Serverless function executions**: 100GB-hours
- **Domains**: Unlimited

---

## Production Checklist

Before going live:

- [ ] Firebase project configured and secured
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate enabled
- [ ] Analytics tracking set up
- [ ] Error monitoring configured
- [ ] Backup strategy implemented
- [ ] Performance optimized
- [ ] Security rules configured
- [ ] Test all user flows
- [ ] Mobile responsiveness verified

---

## Support

If you encounter any issues during deployment:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Contact our support team

**Happy Deploying! 🚀**
