# Dealer-Farmer Connection System Tests

This directory contains scripts to test the connection functionality between dealers and farmers in the Fowl Front application.

## Test Scripts Overview

### 1. Basic Connection Display (`test-connection-display.js`)

This script displays all existing dealer-farmer connections and active invite codes in the system.

**Features:**
- Shows farmer-dealer connections
- Lists dealer-farmer records
- Displays active invitations

**How to run:**
```javascript
node test-connection-display.js
```

### 2. Comprehensive Connection Test (`test-connection-system.js`)

This script performs a complete test of the connection flow, creating test users, generating invite codes, and validating connections.

**Features:**
- Creates test dealer and farmer accounts
- Adds test products
- Generates and validates invite codes
- Establishes connections
- Verifies product visibility

**How to run:**
```javascript
node test-connection-system.js
```

**Note:** Before running, make sure to:
1. Have Firebase credentials properly set up
2. Install dependencies: `npm install firebase`

### 3. Browser-Based Test (`test-connection-browser.js`)

This script can be run in a browser console to test the connection system in a live environment.

**Features:**
- Works in browser console
- Tests based on currently logged-in user (dealer or farmer)
- Provides step-by-step verification
- Colorful console output for better readability

**How to run:**
1. Open the browser console in your application
2. Copy and paste the entire script
3. Run the test if it doesn't start automatically

### 4. Full Connection Test (`test-connection-full.js`)

This script provides an end-to-end test of the connection system in a live environment with real users.

**Features:**
- Authenticates as dealer and farmer
- Creates test profiles if needed
- Generates invite codes
- Establishes connections
- Verifies product visibility
- Comprehensive output with step-by-step results

**How to run:**
```javascript
// First, update the TEST_CONFIG in the file with real credentials
node test-connection-full.js
```

## Testing the Connection System

### Basic Test Flow

1. **Generate an invite code as a dealer**
   - Sign in as a dealer
   - Generate an invite code
   - Copy the code or shareable link

2. **Connect as a farmer**
   - Sign in as a farmer
   - Enter the invite code or use the link
   - Verify connection is established

3. **Check product visibility**
   - Sign in as a farmer
   - Verify dealer's products are visible
   - Check product details match what the dealer has listed

### Using These Scripts for Debugging

If you encounter issues with the connection system:

1. First run `test-connection-display.js` to see existing connections
2. If needed, run `test-connection-system.js` to test the entire flow
3. For targeted browser testing, use `test-connection-browser.js`
4. For comprehensive real-user testing, use `test-connection-full.js`

## Troubleshooting Common Issues

### Invalid Invite Code
- Check if the code has expired
- Verify the code format is correct
- Ensure the dealer account exists

### Connection Not Established
- Verify the invite code validation is working
- Check the connection record is created correctly
- Ensure the farmer record is updated with dealerId

### Products Not Visible
- Check if the farmer is properly connected to a dealer
- Verify the dealer has products in their inventory
- Ensure product queries are correctly filtering by dealerId

## Further Development

These test scripts can be extended to include:
- Testing connection deletion/removal
- Batch testing with multiple farmers and dealers
- Performance testing with large product catalogs
- Error case testing (expired codes, deleted accounts, etc.)
