const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkFarmerData() {
  try {
    console.log('=== Checking farmer-related data ===\n');
    
    // Check dealerFarmers to understand farmer data structure
    const dealerFarmersSnapshot = await db.collection('dealerFarmers').limit(3).get();
    console.log('Sample DealerFarmers data:');
    dealerFarmersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Farmer: ${data.farmerName}`);
      console.log(`- Chicks: ${data.chicksReceived}`);
      console.log(`- Feed: ${data.feedConsumption} kg`);
      console.log(`- Total Expenses: ₹${data.totalExpenses}`);
      console.log(`- Account Balance: ₹${data.accountBalance}`);
      console.log('---');
    });
    
    // Check if there are any batch or financial tracking collections
    console.log('\nChecking for farmer-specific collections...');
    const collections = ['farmerBatches', 'farmerFinancials', 'farmerStocks', 'batches'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        console.log(`${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        console.log(`${collectionName}: Collection doesn't exist or no access`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkFarmerData();
