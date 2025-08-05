# Farmer-Dealer Balance System with Persistent Storage

## Overview

The system now uses **persistent balance storage** in Firestore for better performance and data integrity. Balances are automatically maintained in the `farmerBalances` collection and updated in real-time whenever transactions occur.

## Firestore Collections

### Current Collections:
- `farmerTransactions` - All individual transactions (existing)
- `farmerBalances` - **NEW** - Persistent balance summaries for each farmer-dealer pair

### Balance Document Structure:
```javascript
// Document ID: {farmerId}_{dealerId}
{
  farmerId: "farmer-123",
  dealerId: "dealer-456", 
  dealerName: "ABC Feed Store",
  creditBalance: 5000,     // Amount farmer owes to dealer
  debitBalance: 2000,      // Amount dealer owes to farmer  
  netBalance: 3000,        // creditBalance - debitBalance
  lastUpdated: Timestamp
}
```

## How It Works

### 1. Transaction Processing
- When any transaction occurs (order completion, manual payment), it:
  1. Creates a record in `farmerTransactions`
  2. **Automatically updates** the balance in `farmerBalances`
  3. Uses Firestore transactions to ensure atomicity

### 2. Real-time Updates
- Both dashboards subscribe to the `farmerBalances` collection
- Changes are reflected instantly across all connected clients
- No need to calculate balances from transaction history

### 3. Balance Calculation Logic
```javascript
// For each transaction:
if (transactionType === 'credit') {
  debitBalance += amount;  // Dealer owes farmer more
} else {
  creditBalance += amount; // Farmer owes dealer more  
}
netBalance = creditBalance - debitBalance;
```

## Setup Instructions

### 1. Migration (One-time)
Run the migration to populate balances from existing transactions:

```bash
# Option 1: Open in browser
open public/migrate-balances.html

# Option 2: Run Node.js script
node migrate-balances.js
```

### 2. Firestore Security Rules
Add these rules to your `firestore.rules`:

```javascript
// Allow farmers to read their own balances
match /farmerBalances/{balanceId} {
  allow read: if request.auth != null && 
    (resource.data.farmerId == request.auth.uid || 
     resource.data.dealerId == request.auth.uid);
}
```

### 3. Firestore Indexes
Create these composite indexes:

```javascript
// For farmer balance queries
Collection: farmerBalances
Fields: farmerId (Ascending), lastUpdated (Descending)

// For dealer balance queries  
Collection: farmerBalances
Fields: dealerId (Ascending), lastUpdated (Descending)
```

## API Usage

### Subscribe to Farmer Balances
```javascript
const unsubscribe = orderService.subscribeFarmerBalances(
  farmerId,
  (balances) => {
    console.log('Farmer balances updated:', balances);
  }
);
```

### Subscribe to Dealer Balances  
```javascript
const unsubscribe = orderService.subscribeDealerBalances(
  dealerId,
  (balances) => {
    console.log('Dealer balances updated:', balances);
  }
);
```

### Get Specific Balance
```javascript
const balance = await orderService.getFarmerDealerBalance(farmerId, dealerId);
console.log('Current balance:', balance);
```

## Testing

### Run Tests
```javascript
// In browser console:
// Copy and paste test-persistent-balances.js content
```

### Manual Testing Flow
1. **Farmer places order** → Balance increases (farmer owes more)
2. **Dealer approves/completes order** → Transaction recorded, balance updated
3. **Dealer records payment** → Balance decreases (farmer owes less)
4. **Check both dashboards** → Balances should match and update in real-time

## Benefits

### ✅ Performance
- No need to calculate balances from transaction history
- Faster dashboard loading
- Reduced Firestore read operations

### ✅ Data Integrity  
- Atomic updates using Firestore transactions
- Consistent balance state across all clients
- Automatic balance maintenance

### ✅ Real-time Updates
- Instant balance updates in both dashboards
- No manual refresh needed
- Supports multiple dealers/farmers seamlessly

### ✅ Scalability
- Efficient queries (direct balance lookup)
- Supports unlimited farmer-dealer pairs
- Historical transaction data preserved

## Troubleshooting

### Balance Mismatch
If balances don't match transaction history:
1. Run the migration script again
2. Check Firestore security rules
3. Verify all transactions have required fields

### Real-time Updates Not Working
1. Check network connection
2. Verify Firestore indexes are created
3. Check browser console for errors

### Migration Issues
1. Ensure Firebase config is correct in migration script
2. Check Firestore permissions
3. Verify transaction data format

## File Changes Made

### Modified Files:
- `src/services/orderService.ts` - Added persistent balance functions
- `src/pages/DealerOrderManagement.tsx` - Updated to use persistent balances  
- `src/pages/FarmerDashboardSimple.tsx` - Updated to use persistent balances

### New Files:
- `migrate-balances.js` - Node.js migration script
- `public/migrate-balances.html` - Browser-based migration tool
- `test-persistent-balances.js` - Test script
- `BALANCE_SYSTEM_README.md` - This documentation

The balance system is now production-ready with persistent storage!
