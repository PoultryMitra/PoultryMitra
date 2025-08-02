// Debug script to check dealer-product association using Node.js and Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin (assuming service account key exists)
try {
  const serviceAccount = require('./service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function debugDealerProducts() {
  console.log('=== Debugging Dealer Products ===');
  
  try {
    // Get all dealer products
    const productsSnapshot = await db.collection('dealerProducts').get();
    
    console.log('All dealer products:');
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Product ID: ${doc.id}, Product Name: ${data.productName}, Dealer ID: ${data.dealerId}`);
    });
    
    // Get all farmer-dealer connections
    const connectionsSnapshot = await db.collection('farmerDealers').get();
    
    console.log('\nFarmer-Dealer connections:');
    connectionsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Connection ID: ${doc.id}, Farmer ID: ${data.farmerId}, Dealer ID: ${data.dealerId}`);
    });
    
    // Get all dealers
    const dealersSnapshot = await db.collection('dealers').get();
    
    console.log('\nAll dealers:');
    dealersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Dealer ID: ${doc.id}, Business Name: ${data.businessName}, User ID: ${data.userId}`);
    });
    
  } catch (error) {
    console.error('Error debugging:', error);
  }
}

debugDealerProducts();
