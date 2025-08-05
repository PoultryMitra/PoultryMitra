import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'soullink-96d4b'
});

const db = admin.firestore();

async function addTestTransaction() {
  try {
    const farmerId = 'xgLKOZeHKdOePtJGuLiiuD0Atq23'; // NARESH KUMAR BALAMURUGAN
    const dealerId = 'guir0IcSl0SqwQqT0Jyj1WV3FXE2'; // Naresh Kumar dealer
    const dealerName = 'Naresh Kumar';
    
    console.log('➕ Adding test deposit for current farmer account...');
    
    // Add a test deposit transaction
    const transactionRef = await db.collection('farmerTransactions').add({
      farmerId,
      dealerId,
      dealerName,
      transactionType: 'credit',
      amount: 15000,
      description: 'Test deposit - Welcome bonus',
      category: 'Payment',
      date: admin.firestore.Timestamp.now()
    });
    
    console.log('✅ Transaction added:', transactionRef.id);
    
    // Add the corresponding balance record
    const balanceId = `${farmerId}_${dealerId}`;
    await db.collection('farmerBalances').doc(balanceId).set({
      farmerId,
      dealerId,
      dealerName,
      creditBalance: 15000,
      debitBalance: 0,
      netBalance: 15000,
      lastUpdated: admin.firestore.Timestamp.now()
    });
    
    console.log('✅ Balance record created');
    console.log('\n🎉 Your dashboard should now show ₹15,000 available with Naresh Kumar dealer!');
    console.log('🔄 Refresh your farmer dashboard to see the updated balance.');
    
  } catch (error) {
    console.error('❌ Error adding test transaction:', error);
  } finally {
    admin.app().delete();
    process.exit(0);
  }
}

addTestTransaction();
