# Wallet and Order System Integration Guide

## Overview

The new integrated wallet and order system provides a seamless payment flow where:

1. **Dealers can add money** to farmer wallets
2. **Farmers can place orders** using their wallet balance
3. **Order payments are automatically deducted** from farmer wallets when dealers accept orders
4. **Transactions are tracked** with detailed history and receipts

## System Components

### 1. Wallet Service (`walletService.ts`)
- Manages farmer-dealer wallet balances
- Handles money additions and deductions
- Provides transaction history
- Ensures atomic operations

### 2. Integrated Order Service (`orderServiceIntegrated.ts`)
- Places orders with wallet payment integration
- Automatically deducts payments when orders are completed
- Handles insufficient balance scenarios
- Provides order status tracking

### 3. Wallet Management UI (`WalletManagement.tsx`)
- Dealer interface for managing farmer wallets
- Add money to farmer accounts
- View transaction history
- Monitor farmer balances

## Workflow

### For Dealers:

1. **Add Money to Farmer Wallets:**
   ```typescript
   import { addMoneyToWallet } from '@/services/walletService';
   
   await addMoneyToWallet(
     farmerId, 
     dealerId, 
     amount, 
     dealerId, 
     'Money added for feed purchase'
   );
   ```

2. **Accept Orders:** When accepting an order with final cost, the payment is automatically deducted from the farmer's wallet

3. **Monitor Transactions:** View all wallet activities through the Wallet Management interface

### For Farmers:

1. **Place Orders:** Use the existing order system - payment method defaults to 'wallet'

2. **Check Balance:** View available wallet balance in dashboard

3. **Order Completion:** Orders are automatically paid from wallet when dealer completes them

## Database Schema

### Wallets Collection (`wallets`)
```typescript
{
  id: "farmerId_dealerId", // Composite key
  farmerId: string,
  dealerId: string,
  balance: number,
  lastUpdated: Timestamp,
  createdAt: Timestamp
}
```

### Transactions Collection (`transactions`)
```typescript
{
  id: string, // Auto-generated
  walletId: string, // References wallet
  farmerId: string,
  dealerId: string,
  amount: number,
  type: 'credit' | 'debit' | 'order_payment' | 'money_added',
  description: string,
  orderId?: string, // For order-related transactions
  createdAt: Timestamp,
  createdBy: string,
  status: 'completed' | 'pending' | 'failed',
  metadata?: {
    orderNumber?: string,
    productName?: string,
    quantity?: number
  }
}
```

### Orders Collection (`orderRequests`)
```typescript
{
  // ... existing fields
  paymentMethod: 'wallet' | 'cash' | 'credit',
  paymentStatus: 'pending' | 'paid' | 'failed',
  finalCost?: number // Set when dealer accepts/completes order
}
```

## Security Rules

Add these rules to `firestore.rules`:

```javascript
// Wallets - dealers can manage their farmers' wallets
match /wallets/{walletId} {
  allow read, write: if request.auth != null && 
    (resource.data.dealerId == request.auth.uid || 
     resource.data.farmerId == request.auth.uid);
}

// Transactions - users can view their own transactions
match /transactions/{transactionId} {
  allow read: if request.auth != null && 
    (resource.data.dealerId == request.auth.uid || 
     resource.data.farmerId == request.auth.uid);
  allow create: if request.auth != null && 
    request.auth.uid == resource.data.createdBy;
}

// Orders - enhanced with payment status
match /orderRequests/{orderId} {
  allow read, write: if request.auth != null && 
    (resource.data.dealerId == request.auth.uid || 
     resource.data.farmerId == request.auth.uid);
}
```

## Error Handling

### Insufficient Balance
When a farmer doesn't have enough wallet balance:
- Order status changes to `payment_required`
- Payment status becomes `failed`
- Detailed error message in order notes
- Farmer is notified to add funds

### Transaction Failures
- All wallet operations use Firestore transactions for atomicity
- Failed transactions are logged and can be retried
- Balance inconsistencies are prevented

## Testing

### Test Scenarios:

1. **Add Money Flow:**
   - Dealer adds ₹1000 to farmer wallet
   - Verify balance update
   - Check transaction history

2. **Order with Sufficient Balance:**
   - Farmer places ₹500 order
   - Dealer accepts with final cost ₹450
   - Verify ₹450 deducted from wallet
   - Check transaction created

3. **Order with Insufficient Balance:**
   - Farmer places ₹1500 order (wallet has ₹1000)
   - Dealer accepts with final cost ₹1200
   - Verify order moves to `payment_required`
   - Check error message

4. **Multiple Concurrent Transactions:**
   - Test atomic operations
   - Verify balance consistency

## Migration

If migrating from the old balance system:
1. Export existing farmer balances
2. Create corresponding wallet records
3. Migrate transaction history
4. Update references to use new system

## Performance Considerations

- Wallet operations are optimized with compound indexes
- Transaction history is paginated
- Balance calculations are cached in wallet documents
- Real-time listeners are used for live updates

## Dashboard Integration

The Wallet Management component is now integrated into the Dealer Dashboard as a new tab. Access it by:
1. Login as dealer
2. Navigate to Dealer Dashboard
3. Click the "Wallet" tab
4. Manage farmer wallets and view transactions
