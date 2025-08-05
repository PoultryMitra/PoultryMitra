# Account Ledger System - Complete Testing Guide

## 🎯 System Overview

The account ledger system now supports:
- **Dealer deposits** money to farmer accounts (credit)
- **Order flow**: Farmer orders → Dealer approves → Marks delivered → Amount deducted
- **Many-to-many relationships**: Multiple dealers with multiple farmers
- **Persistent balance storage** with real-time updates
- **Atomic transactions** ensuring data consistency

## 📋 Testing Prerequisites

### 1. Run Migration First
```bash
# Start dev server
bun run dev

# Open migration tool
http://localhost:5173/migrate-balances.html
```

Click "Start Migration" to populate persistent balances from existing transaction data.

### 2. Firebase Setup
- Firestore rules temporarily allow unauthenticated access for migration
- After testing, we'll secure the rules properly

## 🧪 Complete Testing Flow

### Phase 1: Setup and Deposits

#### Step 1: Login as Dealer
1. Go to: `http://localhost:5173/dealer/orders`
2. Login with dealer credentials
3. Navigate to "Farmer Account Management" tab

#### Step 2: Deposit Money to Farmer Account
1. Find a connected farmer in the list
2. Click "Add Payment" button
3. Enter deposit amount (e.g., ₹10,000)
4. Add note: "Initial deposit for orders"
5. Click "Record Payment"
6. ✅ **Expected**: Success message, balance updates immediately

#### Step 3: Verify Deposit
1. Check the farmer's balance in the dealer dashboard
2. Switch to farmer dashboard: `http://localhost:5173/farmer/dashboard`
3. Login as the farmer
4. Go to "Account Management" tab
5. ✅ **Expected**: See positive balance with the dealer

### Phase 2: Order Flow Testing

#### Step 4: Farmer Places Order
1. In farmer dashboard, go to "Order Management" tab
2. Click "Request Order" for the dealer who made the deposit
3. Fill order details:
   - Order Type: Feed
   - Quantity: 100
   - Unit: bags
   - Notes: "Monthly feed requirement"
4. Submit order
5. ✅ **Expected**: Order status shows "Pending"

#### Step 5: Dealer Approves Order
1. Switch to dealer dashboard: `http://localhost:5173/dealer/orders`
2. Go to "Order Requests" tab
3. Find the new order from the farmer
4. Click "Quick Approve" or "Respond" 
5. Set estimated cost (e.g., ₹8,000)
6. Add delivery notes
7. Submit approval
8. ✅ **Expected**: Order status changes to "Completed", farmer balance reduced

#### Step 6: Verify Balance Deduction
1. Check dealer dashboard - farmer's balance should be reduced
2. Switch to farmer dashboard
3. Check "Account Management" tab
4. ✅ **Expected**: 
   - Balance reduced by order amount
   - New transaction appears in history
   - Real-time update without page refresh

### Phase 3: Multi-Dealer Testing

#### Step 7: Test Multiple Dealer Relationships
1. Login as different dealer
2. Connect with the same farmer
3. Deposit different amount (e.g., ₹5,000)
4. Verify farmer sees balances with both dealers separately

#### Step 8: Cross-Dealer Orders
1. Farmer places orders with multiple dealers
2. Each dealer approves their respective orders
3. Verify balance tracking is separate per dealer

## 🔍 Verification Points

### Real-time Updates
- Balance changes appear immediately without page refresh
- Both farmer and dealer dashboards sync automatically
- Transaction history updates in real-time

### Data Consistency
- Open browser console and check Firestore:
```javascript
// Check farmerBalances collection
console.log('Checking farmerBalances...');
```

### Balance Calculations
- **Positive netBalance**: Farmer owes dealer
- **Negative netBalance**: Dealer owes farmer  
- **Zero netBalance**: Accounts are balanced

### Transaction Types
- **Credit**: Dealer deposits money (increases farmer's available balance)
- **Debit**: Order completion (decreases farmer's available balance)

## 🏷️ Test Scenarios

### Scenario 1: Sufficient Balance
1. Dealer deposits ₹10,000
2. Farmer orders ₹8,000 worth of feed
3. ✅ Order completes, balance becomes ₹2,000

### Scenario 2: Insufficient Balance
1. Farmer has ₹2,000 balance
2. Farmer orders ₹5,000 worth of medicine  
3. ✅ Order still completes but creates negative balance

### Scenario 3: Multiple Transactions
1. Multiple deposits and orders with same dealer
2. ✅ All transactions tracked, running balance maintained

### Scenario 4: Many-to-Many Relationships
1. Farmer A connects to Dealers X, Y, Z
2. Dealer X connects to Farmers A, B, C
3. ✅ All relationships maintained separately

## 🐛 Common Issues & Solutions

### Issue 1: Migration Fails
**Solution**: Check Firefox/Chrome console, ensure Firebase config is correct

### Issue 2: Balance Not Updating
**Solution**: Check if migration ran successfully, refresh page

### Issue 3: Permission Denied
**Solution**: Firestore rules need temporary access, already updated

### Issue 4: Real-time Updates Not Working
**Solution**: Check network connection, Firebase subscriptions

## 📊 Expected Test Results

After complete testing:

1. **Dealer Dashboard** shows:
   - List of connected farmers with current balances
   - Ability to deposit money easily
   - Real-time balance updates
   - Order management with automatic deductions

2. **Farmer Dashboard** shows:
   - Balances with each connected dealer
   - Transaction history per dealer
   - Order status and balance impacts
   - Real-time updates

3. **Database (Firestore)** contains:
   - `farmerBalances` collection with persistent balances
   - `farmerTransactions` collection with all transaction records
   - Real-time synchronization between collections

## 🔐 Security Note

After testing, remove temporary rules from `firestore.rules`:
```javascript
// Remove these temporary rules:
match /farmerTransactions/{transactionId} {
  allow read: if true; // REMOVE THIS
}
match /farmerBalances/{balanceId} {
  allow read, write: if true; // REMOVE THIS  
}
```

## 🚀 Next Steps

1. Complete all testing scenarios
2. Verify data integrity in Firestore console
3. Test with multiple users simultaneously
4. Prepare for production deployment

---

**System Status**: ✅ Ready for comprehensive testing
**Migration Status**: ⏳ Needs to be run first
**Real-time Features**: ✅ Implemented
**Many-to-Many Support**: ✅ Fully supported
