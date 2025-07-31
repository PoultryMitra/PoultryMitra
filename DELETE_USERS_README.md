# Delete All Firebase Users Script

This script will help you delete all 31 users from your Firebase Authentication.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Step 2: Get Service Account Key
1. **Go to Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
2. **Select your project** (the one you were just viewing)
3. **Click the gear icon** → **Project Settings**
4. **Go to "Service Accounts" tab**
5. **Click "Generate new private key"**
6. **Download the JSON file** (save it as `service-account-key.json` in your project folder)

### Step 3: Run the Script
```bash
node delete-all-users.js
```

## 📋 What the Script Does

✅ Lists all users first (shows emails for confirmation)  
✅ 10-second countdown to cancel  
✅ Deletes users in batches  
✅ Shows progress and results  
✅ Handles errors gracefully  

## 🎯 Alternative: Firefox/Chrome Console Method

If you prefer the browser approach:

1. **Go back to your Firebase Console Users page**
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Paste this code**:

```javascript
// Select all user checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.click());

// Then manually click the delete button that appears
```

## 📱 Manual Selection Tips

If you still want to use the Firebase Console:

1. **Make browser window wider** - the select checkbox might be hidden
2. **Zoom out** (Ctrl + Mouse wheel) to see more of the interface
3. **Look for a small checkbox** in the very first column of the users table
4. **Select users in batches** - select 10-15 at a time, then delete

## ⚠️ WARNING

**This action is IRREVERSIBLE!**

Your current users to be deleted:
- pankajkr531992@gmail.com
- contactpoultrymitra@gmail.com  
- araj.dkg@gmail.com
- nareshkumarbalamurugan@gmail.com
- admin@poultrymitra.com
- And 26 more users...

## 🔄 After Deletion

- Refresh the Firebase Console to see changes
- All user authentication data will be gone
- Firestore documents may become orphaned
- You can create new users immediately if needed
