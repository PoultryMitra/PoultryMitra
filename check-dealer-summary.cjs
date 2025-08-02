const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDealerSummary() {
  try {
    console.log('=== Dealer Summary Report ===\n');
    
    // Get all dealerFarmers and group by dealerId
    const dealerFarmersSnapshot = await db.collection('dealerFarmers').get();
    const dealerFarmersMap = {};
    
    dealerFarmersSnapshot.forEach(doc => {
      const data = doc.data();
      if (!dealerFarmersMap[data.dealerId]) {
        dealerFarmersMap[data.dealerId] = [];
      }
      dealerFarmersMap[data.dealerId].push(data);
    });
    
    // Get all connections to map dealer names
    const connectionsSnapshot = await db.collection('connections').get();
    const dealerNames = {};
    
    connectionsSnapshot.forEach(doc => {
      const data = doc.data();
      dealerNames[data.dealerId] = data.dealerName;
    });
    
    // Display summary for each dealer
    for (const [dealerId, farmers] of Object.entries(dealerFarmersMap)) {
      const dealerName = dealerNames[dealerId] || 'Unknown Dealer';
      console.log(`DEALER: ${dealerName} (ID: ${dealerId})`);
      console.log(`Connected Farmers: ${farmers.length}`);
      
      farmers.forEach(farmer => {
        console.log(`  - ${farmer.farmerName}: ${farmer.chicksReceived} chicks, ₹${farmer.accountBalance} balance`);
      });
      
      const totalBalance = farmers.reduce((sum, f) => sum + f.accountBalance, 0);
      console.log(`  Total Account Balance: ₹${totalBalance.toLocaleString()}`);
      console.log('---');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkDealerSummary();
