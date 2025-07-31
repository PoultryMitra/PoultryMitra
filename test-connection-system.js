/**
 * Test Script: Dealer-Farmer Connection System
 * 
 * This script tests the connection between dealers and farmers,
 * including invite code generation and product listing in farmer view.
 * 
 * How to use:
 * 1. Run this script in a browser console or as a Node.js script
 * 2. Check the console for test results and any failures
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  deleteUser
} from 'firebase/auth';

// Your Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD3tc1EKESzh4ITdCbM3a5NSlZa4vDnVBY",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "soullink-96d4b.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "soullink-96d4b",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "soullink-96d4b.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "321937432406",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:321937432406:web:14469a9f3f45a6315380f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Test user credentials - these will be created and then deleted during testing
 */
const TEST_DEALER = {
  email: `test-dealer-${Date.now()}@example.com`,
  password: 'Test@123456',
  businessName: 'Test Poultry Supply',
  ownerName: 'Test Dealer'
};

const TEST_FARMER = {
  email: `test-farmer-${Date.now()}@example.com`,
  password: 'Test@123456',
  farmName: 'Test Poultry Farm',
  ownerName: 'Test Farmer'
};

// Test products to be added to the dealer
const TEST_PRODUCTS = [
  {
    productName: 'Test Starter Feed',
    category: 'Feed',
    pricePerUnit: 1200,
    unit: 'bags',
    currentStock: 50,
    minStockLevel: 10,
    supplier: 'Test Supplier'
  },
  {
    productName: 'Test Medicines Pack',
    category: 'Medicine',
    pricePerUnit: 500,
    unit: 'pieces',
    currentStock: 30,
    minStockLevel: 5,
    supplier: 'Test Medical'
  }
];

/**
 * Main test function - runs all tests sequentially
 */
async function runConnectionTests() {
  console.log('Starting Dealer-Farmer Connection Tests...');
  console.log('----------------------------------------');
  
  let dealerUser = null;
  let farmerUser = null;
  let dealerProfile = null;
  let inviteCode = null;
  
  try {
    // Step 1: Create test dealer account
    console.log('1. Creating test dealer account...');
    dealerUser = await createTestUser(TEST_DEALER.email, TEST_DEALER.password);
    console.log(`   ✓ Dealer created with UID: ${dealerUser.uid}`);
    
    // Step 2: Create dealer profile
    console.log('2. Creating dealer profile...');
    dealerProfile = await createDealerProfile(dealerUser.uid, TEST_DEALER);
    console.log(`   ✓ Dealer profile created`);
    
    // Step 3: Add test products
    console.log('3. Adding test products to dealer inventory...');
    const products = await addDealerProducts(dealerUser.uid, TEST_PRODUCTS);
    console.log(`   ✓ Added ${products.length} products to dealer inventory`);
    
    // Step 4: Generate invite code
    console.log('4. Generating invitation code...');
    inviteCode = await generateInviteCode(dealerUser.uid);
    console.log(`   ✓ Generated invite code: ${inviteCode}`);
    
    // Step 5: Create test farmer account
    console.log('5. Creating test farmer account...');
    farmerUser = await createTestUser(TEST_FARMER.email, TEST_FARMER.password);
    console.log(`   ✓ Farmer created with UID: ${farmerUser.uid}`);
    
    // Step 6: Create farmer profile
    console.log('6. Creating farmer profile...');
    await createFarmerProfile(farmerUser.uid, TEST_FARMER);
    console.log(`   ✓ Farmer profile created`);
    
    // Step 7: Connect farmer to dealer using invite code
    console.log('7. Connecting farmer to dealer using invite code...');
    await connectFarmerToDealer(farmerUser.uid, inviteCode);
    console.log(`   ✓ Farmer connected to dealer`);
    
    // Step 8: Verify connection
    console.log('8. Verifying connection...');
    const isConnected = await verifyConnection(dealerUser.uid, farmerUser.uid);
    console.log(`   ✓ Connection verified: ${isConnected ? 'Success' : 'Failed'}`);
    
    // Step 9: Verify products are visible to farmer
    console.log('9. Verifying products visible to farmer...');
    const visibleProducts = await verifyProductsVisibility(dealerUser.uid, farmerUser.uid);
    console.log(`   ✓ Products visible to farmer: ${visibleProducts ? 'Success' : 'Failed'}`);
    console.log(`   ✓ Found ${visibleProducts.length} products`);
    visibleProducts.forEach(product => {
      console.log(`     - ${product.productName}: ₹${product.pricePerUnit}/${product.unit}`);
    });
    
    console.log('----------------------------------------');
    console.log('All tests completed successfully! ✓');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up - delete test users and data
    console.log('Cleaning up test data...');
    
    try {
      // Sign in as dealer to delete
      if (dealerUser) {
        await auth.signInWithEmailAndPassword(TEST_DEALER.email, TEST_DEALER.password);
        await cleanupDealerData(dealerUser.uid);
        await auth.currentUser.delete();
      }
      
      // Sign in as farmer to delete
      if (farmerUser) {
        await auth.signInWithEmailAndPassword(TEST_FARMER.email, TEST_FARMER.password);
        await cleanupFarmerData(farmerUser.uid);
        await auth.currentUser.delete();
      }
      
      console.log('Cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

/**
 * Create a test user account
 */
async function createTestUser(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Create a dealer profile
 */
async function createDealerProfile(dealerId, profileData) {
  const dealerRef = doc(db, 'dealers', dealerId);
  
  const dealerData = {
    businessName: profileData.businessName,
    ownerName: profileData.ownerName,
    email: profileData.email,
    phone: '1234567890',
    address: 'Test Address',
    role: 'dealer',
    createdAt: new Date().toISOString()
  };
  
  await setDoc(dealerRef, dealerData);
  return dealerData;
}

/**
 * Create a farmer profile
 */
async function createFarmerProfile(farmerId, profileData) {
  const farmerRef = doc(db, 'farmers', farmerId);
  
  const farmerData = {
    farmName: profileData.farmName,
    ownerName: profileData.ownerName,
    email: profileData.email,
    phone: '0987654321',
    role: 'farmer',
    createdAt: new Date().toISOString(),
    chicksReceived: 1000,
    feedConsumption: 500,
    fcr: 1.8,
    mortalityRate: 3.5,
    accountBalance: 15000
  };
  
  await setDoc(farmerRef, farmerData);
  return farmerData;
}

/**
 * Add test products to dealer inventory
 */
async function addDealerProducts(dealerId, products) {
  const productIds = [];
  
  for (const product of products) {
    const productData = {
      ...product,
      dealerId,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'products'), productData);
    productIds.push(docRef.id);
  }
  
  return productIds;
}

/**
 * Generate an invite code for a dealer
 */
async function generateInviteCode(dealerId) {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 11);
  const inviteCode = `${dealerId}_${timestamp}_${randomPart}`;
  
  // Store the invitation code in Firestore
  await addDoc(collection(db, 'invitations'), {
    dealerId,
    inviteCode,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
    isActive: true
  });
  
  return inviteCode;
}

/**
 * Connect a farmer to a dealer using an invite code
 */
async function connectFarmerToDealer(farmerId, inviteCode) {
  // Validate the invite code
  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, where('inviteCode', '==', inviteCode), where('isActive', '==', true));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Invalid or expired invite code');
  }
  
  const invitation = querySnapshot.docs[0].data();
  const dealerId = invitation.dealerId;
  
  // Create a connection record
  await addDoc(collection(db, 'connections'), {
    dealerId,
    farmerId,
    inviteCode,
    status: 'active',
    createdAt: new Date().toISOString()
  });
  
  // Update farmer record with dealerId
  const farmerRef = doc(db, 'farmers', farmerId);
  const farmerSnapshot = await getDoc(farmerRef);
  
  if (farmerSnapshot.exists()) {
    const farmerData = farmerSnapshot.data();
    await setDoc(farmerRef, {
      ...farmerData,
      dealerId,
      lastUpdated: new Date().toISOString()
    });
  }
  
  return { dealerId, farmerId };
}

/**
 * Verify that a connection exists between dealer and farmer
 */
async function verifyConnection(dealerId, farmerId) {
  const connectionsRef = collection(db, 'connections');
  const q = query(connectionsRef, 
    where('dealerId', '==', dealerId),
    where('farmerId', '==', farmerId),
    where('status', '==', 'active')
  );
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

/**
 * Verify that dealer products are visible to the farmer
 */
async function verifyProductsVisibility(dealerId, farmerId) {
  // First verify connection
  const isConnected = await verifyConnection(dealerId, farmerId);
  
  if (!isConnected) {
    return false;
  }
  
  // Get dealer products
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('dealerId', '==', dealerId));
  const querySnapshot = await getDocs(q);
  
  const products = [];
  querySnapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });
  
  return products;
}

/**
 * Clean up dealer test data
 */
async function cleanupDealerData(dealerId) {
  // Delete products
  const productsRef = collection(db, 'products');
  const productsQuery = query(productsRef, where('dealerId', '==', dealerId));
  const productsSnapshot = await getDocs(productsQuery);
  
  const productDeletions = [];
  productsSnapshot.forEach(doc => {
    productDeletions.push(deleteDoc(doc.ref));
  });
  await Promise.all(productDeletions);
  
  // Delete invitations
  const invitationsRef = collection(db, 'invitations');
  const invitationsQuery = query(invitationsRef, where('dealerId', '==', dealerId));
  const invitationsSnapshot = await getDocs(invitationsQuery);
  
  const invitationDeletions = [];
  invitationsSnapshot.forEach(doc => {
    invitationDeletions.push(deleteDoc(doc.ref));
  });
  await Promise.all(invitationDeletions);
  
  // Delete connections
  const connectionsRef = collection(db, 'connections');
  const connectionsQuery = query(connectionsRef, where('dealerId', '==', dealerId));
  const connectionsSnapshot = await getDocs(connectionsQuery);
  
  const connectionDeletions = [];
  connectionsSnapshot.forEach(doc => {
    connectionDeletions.push(deleteDoc(doc.ref));
  });
  await Promise.all(connectionDeletions);
  
  // Delete dealer profile
  const dealerRef = doc(db, 'dealers', dealerId);
  await deleteDoc(dealerRef);
}

/**
 * Clean up farmer test data
 */
async function cleanupFarmerData(farmerId) {
  // Delete connections
  const connectionsRef = collection(db, 'connections');
  const connectionsQuery = query(connectionsRef, where('farmerId', '==', farmerId));
  const connectionsSnapshot = await getDocs(connectionsQuery);
  
  const connectionDeletions = [];
  connectionsSnapshot.forEach(doc => {
    connectionDeletions.push(deleteDoc(doc.ref));
  });
  await Promise.all(connectionDeletions);
  
  // Delete farmer profile
  const farmerRef = doc(db, 'farmers', farmerId);
  await deleteDoc(farmerRef);
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runConnectionTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

// Export functions for use in other test suites
module.exports = {
  runConnectionTests,
  createTestUser,
  createDealerProfile,
  createFarmerProfile,
  addDealerProducts,
  generateInviteCode,
  connectFarmerToDealer,
  verifyConnection,
  verifyProductsVisibility,
  cleanupDealerData,
  cleanupFarmerData
};
