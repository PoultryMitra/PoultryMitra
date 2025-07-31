# Farmer-Dealer Connection System Guide

## 🔍 How to Get a Dealer Code

### 1. **From Your Dealer**
- Contact your local poultry dealer directly
- Ask them for their "connection code" or "dealer code"
- Dealers can generate these codes from their admin panel

### 2. **Common Places to Find Codes**
- **WhatsApp/SMS**: Dealers often share codes via messaging
- **Business Cards**: Many dealers print their codes on business cards
- **Feed Shops**: Ask at poultry feed and medicine suppliers
- **Veterinary Clinics**: Poultry vets often have dealer network codes
- **Farmer Groups**: Other farmers may share dealer codes

### 3. **Test Codes for Demo**
For testing purposes, you can use these demo codes:
- `DEAL123` - Test Dealer Network
- `TEST456` - Demo Dealer Group  
- `DEMO789` - Sample Dealer Code

## 🔐 How to Use the System

### Step 1: Access the Connection Page
- Go to `/farmer-connect` in your app
- Or click "Connect to Dealer" from the main menu

### Step 2: Login (if needed)
- If you're not logged in, use the Login/Register buttons
- You can find login options in:
  - Header navigation (Login/Register buttons)
  - Card section (Login as Farmer/Dealer buttons)
  - Debug panel (Go to Login button)

### Step 3: Enter Dealer Code
- Type or paste the dealer code in the input field
- Codes are automatically converted to uppercase
- Click "Find Dealer" to validate

### Step 4: Connect
- If dealer is found, you'll see a success message
- For logged-in users: Click "Connect Now"
- For new users: Choose "Login" or "Create Account"

## 🛠️ Troubleshooting Common Issues

### Firebase Authentication Errors
```
securetoken.googleapis.com/v1/token?key=... Failed to load resource: 400
```
**Fix:** This is usually a Firebase configuration issue. Check:
1. Firebase config in `firebase.ts`
2. API keys are correct
3. Firebase project settings

### Favicon 404 Error
```
favicon.ico:1 Failed to load resource: 404 (Not Found)
```
**Fix:** This is cosmetic and can be ignored, or add a favicon.ico file to the public folder.

### Blank Page After Shared Link
**Fix:** 
1. Use the "Recovery Reset" button
2. Try refreshing the page
3. Use direct login buttons instead of shared links

### No Login Options Visible
**Fix:**
1. Check the header for Login/Register buttons
2. Look for login options in the main card
3. Use the debug panel "Go to Login" button

## 🚨 Recovery Options

If the page becomes unresponsive:
1. **Refresh Page** - Reload the browser
2. **Go Home** - Navigate back to main page  
3. **Reset All** - Clear all stored data and refresh
4. **Manual Login** - Use direct login URLs:
   - `/login` - General login
   - `/farmer-login` - Farmer-specific login
   - `/dealer-login` - Dealer-specific login

## 🧪 Testing & Development

### Debug Features (Development Mode)
- Console logs show detailed operation information
- Debug panel displays current state
- `window.farmerConnectDebug` object for manual testing
- Test script: `node scripts/test-connection.js`

### Test Workflow
1. Open browser dev tools (F12)
2. Go to `/farmer-connect`  
3. Check console for detailed logs
4. Use test codes: DEAL123, TEST456, DEMO789
5. Monitor network tab for API calls

## 📞 Getting Help

If you still have issues:
1. Check browser console for error details
2. Use the debug panel information
3. Try the recovery options
4. Contact your dealer for a valid code
5. Reach out to technical support with console logs

---
*Last updated: July 31, 2025*
