import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load the service account key  
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'soullink-96d4b'
});

const db = admin.firestore();

async function checkDealerProducts() {
  try {
    console.log('🔍 Checking All Dealer Products\n');

    // First get all dealers from users collection
    console.log('� Getting all dealers...');
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'dealer')
      .get();

    console.log(`Found ${usersSnapshot.size} dealers:\n`);

    // Check products for each dealer
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const dealerId = userDoc.id;
      
      console.log(`🏪 Dealer: ${userData.displayName || userData.email || 'Unknown'}`);
      console.log(`   ID: ${dealerId}`);
      console.log(`   Business: ${userData.businessName || 'N/A'}`);
      console.log(`   Phone: ${userData.phoneNumber || 'N/A'}`);

      // Check products for this dealer
      const productsSnapshot = await db.collection('dealerProducts')
        .where('dealerId', '==', dealerId)
        .get();

      if (productsSnapshot.empty) {
        console.log(`   ❌ No products found`);
      } else {
        console.log(`   ✅ Found ${productsSnapshot.size} products:`);
        productsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`      - ${data.productName} (${data.category}) - ₹${data.pricePerUnit}/${data.unit}`);
          console.log(`        Stock: ${data.currentStock} ${data.unit}, Supplier: ${data.supplier || 'N/A'}`);
        });
      }
      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('\n📊 Summary:');
    const allProductsSnapshot = await db.collection('dealerProducts').get();
    console.log(`   - Total dealers: ${usersSnapshot.size}`);
    console.log(`   - Total products: ${allProductsSnapshot.size}`);
    
    // Group products by dealer
    const productsByDealer = {};
    allProductsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!productsByDealer[data.dealerId]) {
        productsByDealer[data.dealerId] = 0;
      }
      productsByDealer[data.dealerId]++;
    });
    
    console.log(`   - Dealers with products: ${Object.keys(productsByDealer).length}`);
    console.log(`   - Dealers without products: ${usersSnapshot.size - Object.keys(productsByDealer).length}`);

    // Check all collections to see what exists
    console.log('\n🗂️  Checking all collections:');
    const collections = ['users', 'dealerFarmers', 'farmerDealers', 'dealerProducts', 'connections', 'dealerInvitations'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      console.log(`   - ${collectionName}: ${snapshot.empty ? 'Empty' : 'Has data'}`);
    }

  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    admin.app().delete();
    process.exit(0);
  }
}

// Run the function
checkDealerProducts();
