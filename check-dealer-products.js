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
    console.log('🔍 Checking Dealer Products\n');

    const dealerId = 'baEEW6JvPhYeP6LjSoTXzlKMSHs2';

    // Check dealerProducts collection
    console.log('📦 Checking dealerProducts collection...');
    const productsSnapshot = await db.collection('dealerProducts')
      .where('dealerId', '==', dealerId)
      .get();

    if (productsSnapshot.empty) {
      console.log('❌ No products found for this dealer in dealerProducts collection');
      console.log('💡 The dealer needs to add products first from their dashboard');
    } else {
      console.log(`✅ Found ${productsSnapshot.size} products:`);
      productsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${data.productName} (${data.category}) - ₹${data.pricePerUnit}/${data.unit}`);
        console.log(`     Stock: ${data.currentStock} ${data.unit}, Supplier: ${data.supplier}`);
      });
    }

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
