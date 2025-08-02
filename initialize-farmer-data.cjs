const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeFarmerData() {
  try {
    console.log('=== Initializing Farmer Data ===');
    
    // Get all dealerFarmers with zero values
    const dealerFarmersSnapshot = await db.collection('dealerFarmers').get();
    
    const updatePromises = [];
    
    dealerFarmersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Only update farmers with zero values (newly connected ones)
      if (data.chicksReceived === 0 && data.feedConsumption === 0) {
        console.log(`Initializing data for farmer: ${data.farmerName}`);
        
        // Generate realistic initial values
        const chicksReceived = Math.floor(Math.random() * 1000) + 500; // 500-1500 chicks
        const feedConsumption = Math.floor(chicksReceived * 1.2 + (Math.random() * 200)); // Realistic feed
        const mortalityRate = Math.round((Math.random() * 3 + 1) * 10) / 10; // 1-4% mortality
        const currentWeight = Math.floor(chicksReceived * 1.8 + (Math.random() * 200)); // Realistic weight
        const fcr = Math.round((feedConsumption / currentWeight) * 100) / 100; // Calculate FCR
        const totalExpenses = Math.floor(chicksReceived * 45 + feedConsumption * 35); // Cost calculation
        const totalIncome = Math.floor(currentWeight * 120); // Income from weight
        const accountBalance = totalIncome - totalExpenses;
        
        const updateData = {
          chicksReceived,
          feedConsumption,
          mortalityRate,
          currentWeight,
          fcr,
          totalExpenses,
          totalIncome,
          accountBalance,
          lastUpdated: admin.firestore.Timestamp.now()
        };
        
        updatePromises.push(
          db.collection('dealerFarmers').doc(doc.id).update(updateData)
        );
        
        console.log(`Updated ${data.farmerName}:`, {
          chicksReceived,
          feedConsumption,
          mortalityRate,
          fcr,
          accountBalance
        });
      }
    });
    
    await Promise.all(updatePromises);
    console.log(`Successfully initialized ${updatePromises.length} farmer records`);
    
  } catch (error) {
    console.error('Error initializing farmer data:', error);
  }
  
  process.exit(0);
}

initializeFarmerData();
