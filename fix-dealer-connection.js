import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load the service account key
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'soullink-96d4b'
});

const db = admin.firestore();

async function fixFarmerDealerConnection() {
  try {
    console.log('🔧 Fixing Farmer-Dealer Connection Data\n');

    const dealerId = 'baEEW6JvPhYeP6LjSoTXzlKMSHs2';
    const farmerId = 'phiv8YCZYFSpb0cVgJ34m5UciIs2';

    // 1. Get real dealer information from users collection
    console.log('📋 Fetching real dealer information...');
    const dealerDoc = await db.collection('users').doc(dealerId).get();
    
    if (!dealerDoc.exists) {
      console.log('❌ Dealer not found in users collection');
      return;
    }

    const dealerData = dealerDoc.data();
    console.log('✅ Found dealer:', dealerData.displayName || dealerData.email);

    // 2. Get real dealer information from Auth
    const dealerAuth = await admin.auth().getUser(dealerId);
    console.log('✅ Dealer email from Auth:', dealerAuth.email);
    console.log('✅ Dealer name from Auth:', dealerAuth.displayName);

    // 3. Update farmerDealers collection with correct information
    console.log('\n🔄 Updating farmerDealers collection...');
    const farmerDealersQuery = db.collection('farmerDealers')
      .where('farmerId', '==', farmerId)
      .where('dealerId', '==', dealerId);
    
    const farmerDealersSnapshot = await farmerDealersQuery.get();
    
    if (farmerDealersSnapshot.empty) {
      console.log('❌ No farmerDealers connection found');
      return;
    }

    // Update each document (should be only one)
    const batch = db.batch();
    farmerDealersSnapshot.forEach((doc) => {
      console.log(`📝 Updating document: ${doc.id}`);
      batch.update(doc.ref, {
        dealerName: dealerAuth.displayName || dealerData.displayName || dealerAuth.email.split('@')[0],
        dealerEmail: dealerAuth.email,
        lastInteraction: admin.firestore.Timestamp.now()
      });
    });

    await batch.commit();
    console.log('✅ Successfully updated farmerDealers collection');

    // 4. Verify the update
    console.log('\n🔎 Verifying the update...');
    const updatedSnapshot = await farmerDealersQuery.get();
    updatedSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('✅ Updated dealer info:');
      console.log(`   - Name: ${data.dealerName}`);
      console.log(`   - Email: ${data.dealerEmail}`);
    });

    console.log('\n🎉 Connection data fixed successfully!');
    console.log('🔄 Refresh your farmer feed prices page to see the correct dealer information.');

  } catch (error) {
    console.error('❌ Error fixing connection:', error);
  } finally {
    admin.app().delete();
    process.exit(0);
  }
}

// Run the function
fixFarmerDealerConnection();
