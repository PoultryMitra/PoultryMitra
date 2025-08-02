const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkData() {
  try {
    console.log('=== Checking dealerFarmers collection ===');
    const dealerFarmersSnapshot = await db.collection('dealerFarmers').get();
    console.log('Total dealerFarmers documents:', dealerFarmersSnapshot.size);
    
    dealerFarmersSnapshot.forEach(doc => {
      console.log('Doc ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
    
    console.log('\n=== Checking connections collection ===');
    const connectionsSnapshot = await db.collection('connections').get();
    console.log('Total connections documents:', connectionsSnapshot.size);
    
    connectionsSnapshot.forEach(doc => {
      console.log('Doc ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkData();
