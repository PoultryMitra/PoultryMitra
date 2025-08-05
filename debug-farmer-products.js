import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load the service account key  
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'soullink-96d4b'
});

const db = admin.firestore();

async function debugFarmerProducts() {
  try {
    console.log('🔍 Debugging Farmer-Dealer Product Display Issue\n');

    // First, find a sample farmer
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'farmer')
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ No farmers found in database');
      return;
    }

    const farmerDoc = usersSnapshot.docs[0];
    const farmerId = farmerDoc.id;
    const farmerData = farmerDoc.data();
    
    console.log(`🌾 Testing with farmer: ${farmerData.displayName || farmerData.email}`);
    console.log(`   Farmer ID: ${farmerId}\n`);

    // Get connected dealers for this farmer
    console.log('🔗 Getting connected dealers from farmerDealers collection...');
    const farmerDealersSnapshot = await db.collection('farmerDealers')
      .where('farmerId', '==', farmerId)
      .get();

    if (farmerDealersSnapshot.empty) {
      console.log('❌ No dealer connections found for this farmer');
      return;
    }

    console.log(`✅ Found ${farmerDealersSnapshot.size} dealer connections:\n`);

    // For each connected dealer, check their products
    for (const dealerConnectionDoc of farmerDealersSnapshot.docs) {
      const connectionData = dealerConnectionDoc.data();
      const dealerId = connectionData.dealerId;
      
      console.log(`🏪 Dealer Connection: ${connectionData.dealerName || 'Unknown'}`);
      console.log(`   Connection ID: ${dealerConnectionDoc.id}`);
      console.log(`   Dealer ID in connection: ${dealerId}`);
      console.log(`   Company: ${connectionData.dealerCompany || 'N/A'}`);
      console.log(`   Phone: ${connectionData.dealerPhone || 'N/A'}`);

      // Get products for this dealer ID
      const dealerProductsSnapshot = await db.collection('dealerProducts')
        .where('dealerId', '==', dealerId)
        .get();

      console.log(`   📦 Products query result: ${dealerProductsSnapshot.size} products found`);
      
      if (dealerProductsSnapshot.empty) {
        console.log(`   ❌ No products found for dealer ID: ${dealerId}`);
        
        // Let's check if there are products with a similar dealer ID
        console.log(`   🔍 Searching for any products that might belong to this dealer...`);
        const allProductsSnapshot = await db.collection('dealerProducts').get();
        let foundSimilar = false;
        
        allProductsSnapshot.forEach((doc) => {
          const productData = doc.data();
          if (productData.dealerId.includes(dealerId.substring(0, 10)) || 
              dealerId.includes(productData.dealerId.substring(0, 10))) {
            console.log(`   🔍 Similar dealer ID found: ${productData.dealerId}`);
            console.log(`      Product: ${productData.productName}`);
            foundSimilar = true;
          }
        });
        
        if (!foundSimilar) {
          console.log(`   ❌ No similar dealer IDs found in products collection`);
        }
      } else {
        console.log(`   ✅ Products for dealer ${dealerId}:`);
        dealerProductsSnapshot.forEach((doc) => {
          const productData = doc.data();
          console.log(`      - ${productData.productName} (${productData.category})`);
          console.log(`        Stock: ${productData.currentStock} ${productData.unit}`);
          console.log(`        Price: ₹${productData.pricePerUnit}/${productData.unit}`);
        });
      }
      console.log(''); // Empty line for readability
    }

    // Summary of all dealer IDs in system
    console.log('\n📊 System Summary:');
    console.log('\n🏪 All dealer IDs in connections:');
    const allConnectionsSnapshot = await db.collection('farmerDealers').get();
    const connectionDealerIds = new Set();
    allConnectionsSnapshot.forEach((doc) => {
      connectionDealerIds.add(doc.data().dealerId);
    });
    connectionDealerIds.forEach(id => console.log(`   - ${id}`));

    console.log('\n📦 All dealer IDs in products:');
    const allProductsSnapshot = await db.collection('dealerProducts').get();
    const productDealerIds = new Set();
    allProductsSnapshot.forEach((doc) => {
      productDealerIds.add(doc.data().dealerId);
    });
    productDealerIds.forEach(id => console.log(`   - ${id}`));

    console.log('\n🔍 ID Matching Analysis:');
    const connectionIds = Array.from(connectionDealerIds);
    const productIds = Array.from(productDealerIds);
    
    connectionIds.forEach(connId => {
      const hasProducts = productIds.includes(connId);
      console.log(`   Connection ID ${connId}: ${hasProducts ? '✅ Has products' : '❌ No products'}`);
    });

  } catch (error) {
    console.error('❌ Error debugging farmer products:', error);
  } finally {
    admin.app().delete();
    process.exit(0);
  }
}

// Run the function
debugFarmerProducts();
