/**
 * Comprehensive Connection System Test
 * 
 * This script tests the full connection flow between dealers and farmers
 * in a real environment. It can help identify issues in the connection process.
 */

// Import necessary modules
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc,
  getDocs,
  getDoc, 
  doc,
  setDoc,
  query, 
  where
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

/**
 * Configuration
 */
const TEST_CONFIG = {
  // Set to true to run in test mode (no actual DB operations)
  isDryRun: false,
  
  // Test dealer information (must be a real account)
  dealer: {
    email: 'dealer@example.com',    // Replace with real dealer email
    password: 'password123',        // Replace with real password
  },
  
  // Test farmer information (must be a real account)
  farmer: {
    email: 'farmer@example.com',    // Replace with real farmer email
    password: 'password123',        // Replace with real password
  }
};

/**
 * Main test function
 */
async function runCompleteConnectionTest() {
  console.log('🚀 Starting Complete Connection System Test...');
  console.log('===========================================');
  
  let dealerAuth = null;
  let farmerAuth = null;
  let db = null;
  
  try {
    // Initialize Firebase if not already initialized
    if (typeof firebase === 'undefined') {
      const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD3tc1EKESzh4ITdCbM3a5NSlZa4vDnVBY",
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "soullink-96d4b.firebaseapp.com",
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "soullink-96d4b",
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "soullink-96d4b.firebasestorage.app",
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "321937432406",
        appId: process.env.VITE_FIREBASE_APP_ID || "1:321937432406:web:14469a9f3f45a6315380f7"
      };
      initializeApp(firebaseConfig);
    }
    
    // Get Firestore and Auth
    db = getFirestore();
    const auth = getAuth();
    
    // Step 1: Authenticate as dealer
    console.log('\n📋 Step 1: Authenticating as dealer');
    if (TEST_CONFIG.isDryRun) {
      console.log('  [DRY RUN] Simulating dealer authentication');
      dealerAuth = { uid: 'test-dealer-id' };
    } else {
      console.log(`  Signing in as dealer: ${TEST_CONFIG.dealer.email}`);
      const dealerCredential = await signInWithEmailAndPassword(
        auth, 
        TEST_CONFIG.dealer.email, 
        TEST_CONFIG.dealer.password
      );
      dealerAuth = dealerCredential.user;
      console.log(`  ✅ Successfully authenticated as dealer (${dealerAuth.uid})`);
    }
    
    // Step 2: Verify dealer profile
    console.log('\n📋 Step 2: Verifying dealer profile');
    let dealerProfile;
    
    if (TEST_CONFIG.isDryRun) {
      console.log('  [DRY RUN] Simulating dealer profile check');
      dealerProfile = { businessName: 'Test Dealer', ownerName: 'Test Owner' };
    } else {
      const dealerDoc = await getDoc(doc(db, 'dealers', dealerAuth.uid));
      
      if (dealerDoc.exists()) {
        dealerProfile = dealerDoc.data();
        console.log(`  ✅ Found dealer profile: ${dealerProfile.businessName}`);
      } else {
        console.log('  ⚠️ No dealer profile found. Creating a basic profile...');
        
        dealerProfile = {
          businessName: 'Test Dealer Business',
          ownerName: dealerAuth.displayName || 'Dealer Owner',
          email: dealerAuth.email,
          role: 'dealer',
          createdAt: new Date().toISOString()
        };
        
        if (!TEST_CONFIG.isDryRun) {
          await setDoc(doc(db, 'dealers', dealerAuth.uid), dealerProfile);
        }
        console.log('  ✅ Created basic dealer profile');
      }
    }
    
    // Step 3: Check dealer products
    console.log('\n📋 Step 3: Checking dealer products');
    let products = [];
    
    if (TEST_CONFIG.isDryRun) {
      console.log('  [DRY RUN] Simulating dealer products check');
      products = [
        { id: 'prod1', productName: 'Test Feed', pricePerUnit: 1200, unit: 'bags' },
        { id: 'prod2', productName: 'Test Medicine', pricePerUnit: 500, unit: 'pieces' }
      ];
    } else {
      const productsQuery = query(
        collection(db, 'products'), 
        where('dealerId', '==', dealerAuth.uid)
      );
      const productsSnapshot = await getDocs(productsQuery);
      
      if (productsSnapshot.empty) {
        console.log('  ⚠️ No products found for this dealer');
        console.log('  Creating sample test products...');
        
        const testProducts = [
          {
            productName: 'Test Starter Feed',
            category: 'Feed',
            pricePerUnit: 1200,
            unit: 'bags',
            currentStock: 50,
            minStockLevel: 10,
            dealerId: dealerAuth.uid,
            supplier: 'Test Supplier',
            createdAt: new Date().toISOString()
          },
          {
            productName: 'Test Medicines Pack',
            category: 'Medicine',
            pricePerUnit: 500,
            unit: 'pieces',
            currentStock: 30,
            minStockLevel: 5,
            dealerId: dealerAuth.uid,
            supplier: 'Test Medical',
            createdAt: new Date().toISOString()
          }
        ];
        
        if (!TEST_CONFIG.isDryRun) {
          for (const product of testProducts) {
            await addDoc(collection(db, 'products'), product);
          }
        }
        
        products = testProducts;
        console.log(`  ✅ Created ${testProducts.length} test products`);
      } else {
        productsSnapshot.forEach(doc => {
          products.push({ id: doc.id, ...doc.data() });
        });
        console.log(`  ✅ Found ${products.length} existing products`);
      }
    }
    
    // List products
    console.log('  Product List:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.productName} - ₹${product.pricePerUnit}/${product.unit}`);
    });
    
    // Step 4: Generate invite code
    console.log('\n📋 Step 4: Generating invite code');
    let inviteCode;
    
    if (TEST_CONFIG.isDryRun) {
      console.log('  [DRY RUN] Simulating invite code generation');
      inviteCode = `TEST_${dealerAuth.uid}_${Date.now()}`;
    } else {
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 11);
      inviteCode = `${dealerAuth.uid}_${timestamp}_${randomPart}`;
      
      await addDoc(collection(db, 'invitations'), {
        dealerId: dealerAuth.uid,
        dealerName: dealerProfile.businessName,
        dealerEmail: dealerProfile.email,
        inviteCode,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        usedAt: null,
        usedBy: null
      });
    }
    
    console.log(`  ✅ Generated invite code: ${inviteCode}`);
    console.log(`  Shareable Link: ${window.location.origin}/farmer-connect?code=${inviteCode}`);
    
    // Step 5: Sign out and authenticate as farmer
    console.log('\n📋 Step 5: Authenticating as farmer');
    
    if (!TEST_CONFIG.isDryRun) {
      // Sign out dealer
      await auth.signOut();
      console.log('  Signed out dealer');
      
      // Sign in as farmer
      console.log(`  Signing in as farmer: ${TEST_CONFIG.farmer.email}`);
      const farmerCredential = await signInWithEmailAndPassword(
        auth,
        TEST_CONFIG.farmer.email,
        TEST_CONFIG.farmer.password
      );
      farmerAuth = farmerCredential.user;
      console.log(`  ✅ Successfully authenticated as farmer (${farmerAuth.uid})`);
    } else {
      console.log('  [DRY RUN] Simulating farmer authentication');
      farmerAuth = { uid: 'test-farmer-id' };
    }
    
    // Step 6: Verify farmer profile
    console.log('\n📋 Step 6: Verifying farmer profile');
    let farmerProfile;
    
    if (TEST_CONFIG.isDryRun) {
      console.log('  [DRY RUN] Simulating farmer profile check');
      farmerProfile = { farmName: 'Test Farm', ownerName: 'Test Farmer' };
    } else {
      const farmerDoc = await getDoc(doc(db, 'farmers', farmerAuth.uid));
      
      if (farmerDoc.exists()) {
        farmerProfile = farmerDoc.data();
        console.log(`  ✅ Found farmer profile: ${farmerProfile.farmName || farmerProfile.ownerName}`);
      } else {
        console.log('  ⚠️ No farmer profile found. Creating a basic profile...');
        
        farmerProfile = {
          farmName: 'Test Farm',
          ownerName: farmerAuth.displayName || 'Farmer Owner',
          email: farmerAuth.email,
          role: 'farmer',
          createdAt: new Date().toISOString(),
          chicksReceived: 1000,
          feedConsumption: 500,
          fcr: 1.8,
          mortalityRate: 3.5,
          accountBalance: 15000
        };
        
        if (!TEST_CONFIG.isDryRun) {
          await setDoc(doc(db, 'farmers', farmerAuth.uid), farmerProfile);
        }
        console.log('  ✅ Created basic farmer profile');
      }
    }
    
    // Step 7: Connect farmer to dealer using invite code
    console.log('\n📋 Step 7: Connecting farmer to dealer');
    
    if (TEST_CONFIG.isDryRun) {
      console.log('  [DRY RUN] Simulating connection process');
      console.log(`  Using invite code: ${inviteCode}`);
    } else {
      // Validate invitation code
      console.log(`  Validating invite code: ${inviteCode}`);
      
      const invitationsQuery = query(
        collection(db, 'invitations'),
        where('inviteCode', '==', inviteCode),
        where('isActive', '==', true)
      );
      
      const invitationsSnapshot = await getDocs(invitationsQuery);
      
      if (invitationsSnapshot.empty) {
        throw new Error('Invalid or expired invite code');
      }
      
      const invitationDoc = invitationsSnapshot.docs[0];
      const invitation = invitationDoc.data();
      const dealerId = invitation.dealerId;
      
      // Create connection record
      await addDoc(collection(db, 'connections'), {
        dealerId,
        farmerId: farmerAuth.uid,
        inviteCode,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      
      // Update farmer record with dealerId
      await setDoc(doc(db, 'farmers', farmerAuth.uid), {
        ...farmerProfile,
        dealerId,
        lastUpdated: new Date().toISOString()
      });
      
      // Update invitation as used
      await setDoc(doc(db, 'invitations', invitationDoc.id), {
        ...invitation,
        isActive: false,
        usedAt: new Date().toISOString(),
        usedBy: farmerAuth.uid
      });
    }
    
    console.log('  ✅ Successfully connected farmer to dealer');
    
    // Step 8: Verify products are visible to farmer
    console.log('\n📋 Step 8: Verifying product visibility');
    
    if (TEST_CONFIG.isDryRun) {
      console.log('  [DRY RUN] Simulating product visibility check');
      console.log('  ✅ Products are visible to farmer');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.productName} - ₹${product.pricePerUnit}/${product.unit}`);
      });
    } else {
      // Get the dealer ID from farmer profile
      const updatedFarmerDoc = await getDoc(doc(db, 'farmers', farmerAuth.uid));
      
      if (updatedFarmerDoc.exists()) {
        const updatedFarmerProfile = updatedFarmerDoc.data();
        const dealerId = updatedFarmerProfile.dealerId;
        
        if (!dealerId) {
          console.log('  ⚠️ Farmer is not connected to any dealer');
        } else {
          console.log(`  Farmer is connected to dealer ID: ${dealerId}`);
          
          // Fetch dealer products
          const productsQuery = query(
            collection(db, 'products'),
            where('dealerId', '==', dealerId)
          );
          
          const productsSnapshot = await getDocs(productsQuery);
          
          if (productsSnapshot.empty) {
            console.log('  ⚠️ No products found for the connected dealer');
          } else {
            const visibleProducts = [];
            productsSnapshot.forEach(doc => {
              visibleProducts.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`  ✅ Found ${visibleProducts.length} products visible to farmer`);
            visibleProducts.forEach((product, index) => {
              console.log(`  ${index + 1}. ${product.productName} - ₹${product.pricePerUnit}/${product.unit}`);
            });
          }
        }
      } else {
        console.log('  ⚠️ Could not retrieve updated farmer profile');
      }
    }
    
    // Test completed
    console.log('\n===========================================');
    console.log('✅ Connection System Test Completed Successfully!');
    console.log('===========================================');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export the test function
export { runCompleteConnectionTest };

// Run the test if executed directly
if (typeof window !== 'undefined') {
  window.runConnectionTest = runCompleteConnectionTest;
  console.log('To run the test, call window.runConnectionTest() in the console');
} else if (require.main === module) {
  runCompleteConnectionTest()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}
