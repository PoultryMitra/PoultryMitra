# Firebase Firestore Index Setup Guide

## 🔥 Required Indexes for Connection System

The farmer-dealer connection system requires composite indexes for optimal performance. Here are the required indexes:

### Method 1: Automatic (Recommended)
Click on these links to automatically create the required indexes:

1. **DealerFarmers Index**: 
   [Create Index](https://console.firebase.google.com/v1/r/project/soullink-96d4b/firestore/indexes?create_composite=ClRwcm9qZWN0cy9zb3VsbGluay05NmQ0Yi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZGVhbGVyRmFybWVycy9pbmRleGVzL18QARoMCghkZWFsZXJJZBABGg8KC2xhc3RVcGRhdGVkEAIaDAoIX19uYW1lX18QAg)

2. **FarmerDealers Index**: 
   [Create Index](https://console.firebase.google.com/v1/r/project/soullink-96d4b/firestore/indexes?create_composite=ClRwcm9qZWN0cy9zb3VsbGluay05NmQ0Yi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZmFybWVyRGVhbGVycy9pbmRleGVzL18QARoMCghmYXJtZXJJZBABGhEKDWNvbm5lY3RlZERhdGUQAhoMCghfX25hbWVfXxAC)

### Method 2: Manual Setup
Go to [Firebase Console > Firestore > Indexes](https://console.firebase.google.com/project/soullink-96d4b/firestore/indexes) and create these composite indexes:

#### Index 1: dealerFarmers
- **Collection**: `dealerFarmers`
- **Query Scope**: Collection
- **Fields**:
  - `dealerId` (Ascending)
  - `lastUpdated` (Descending)

#### Index 2: farmerDealers  
- **Collection**: `farmerDealers`
- **Query Scope**: Collection
- **Fields**:
  - `farmerId` (Ascending)
  - `connectedDate` (Descending)

#### Index 3: dealerInvitations (Optional, for better performance)
- **Collection**: `dealerInvitations`
- **Query Scope**: Collection
- **Fields**:
  - `dealerId` (Ascending)
  - `isActive` (Ascending)
  - `createdAt` (Descending)

### Method 3: Firebase CLI Deployment
If you have Firebase CLI installed:

```bash
# Deploy the indexes from firestore.indexes.json
firebase deploy --only firestore:indexes
```

## ⏰ Index Creation Time
- Indexes typically take 5-15 minutes to build
- You'll receive an email when they're ready
- The app will work without indexes but may be slower

## 🔍 Verifying Indexes
1. Go to [Firebase Console > Firestore > Indexes](https://console.firebase.google.com/project/soullink-96d4b/firestore/indexes)
2. Check that all indexes show "Enabled" status
3. Test the connection system in your app

## 🚨 Troubleshooting
- **"Failed precondition" errors**: Indexes are still building, wait a few minutes
- **Query timeout**: Check your internet connection and Firebase project settings
- **Permission denied**: Verify Firestore security rules allow reads for authenticated users

## 📊 Current Status
Based on the error logs, you need:
- ✅ dealerFarmers index (dealerId + lastUpdated)
- ✅ farmerDealers index (farmerId + connectedDate)

Once these are created, the connection system will work perfectly!
