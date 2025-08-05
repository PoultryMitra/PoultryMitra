import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load the service account key  
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'soullink-96d4b'
});

const db = admin.firestore();

async function fixBalanceData() {
  try {
    console.log('🔧 Fixing Balance Data - Converting to Simple Deposit Model\n');

    // Get all balances
    const balancesSnapshot = await db.collection('farmerBalances').get();
    console.log(`Found ${balancesSnapshot.size} balance records to fix\n`);

    for (const balanceDoc of balancesSnapshot.docs) {
      const balanceData = balanceDoc.data();
      const balanceId = balanceDoc.id;
      
      console.log(`📊 Current balance for ${balanceId}:`);
      console.log(`   creditBalance: ${balanceData.creditBalance}`);
      console.log(`   debitBalance: ${balanceData.debitBalance}`);
      console.log(`   netBalance: ${balanceData.netBalance}`);

      // Get all transactions for this farmer-dealer pair
      const [farmerId, dealerId] = balanceId.split('_');
      
      const transactionsSnapshot = await db.collection('farmerTransactions')
        .where('farmerId', '==', farmerId)
        .where('dealerId', '==', dealerId)
        .get();

      console.log(`   Found ${transactionsSnapshot.size} transactions`);

      // Recalculate balance using simple logic
      let newCreditBalance = 0;
      
      for (const transDoc of transactionsSnapshot.docs) {
        const transData = transDoc.data();
        
        if (transData.transactionType === 'credit') {
          // Farmer deposit - add to available balance
          newCreditBalance += transData.amount;
          console.log(`     + Deposit: ₹${transData.amount} (${transData.description})`);
        } else {
          // Order - subtract from available balance
          newCreditBalance -= transData.amount;
          console.log(`     - Order: ₹${transData.amount} (${transData.description})`);
        }
      }

      const newNetBalance = newCreditBalance;

      console.log(`   📊 New calculated balance:`);
      console.log(`      creditBalance: ${newCreditBalance} (was ${balanceData.creditBalance})`);
      console.log(`      debitBalance: 0 (was ${balanceData.debitBalance})`);  
      console.log(`      netBalance: ${newNetBalance} (was ${balanceData.netBalance})`);

      // Update the balance record
      await balanceDoc.ref.update({
        creditBalance: newCreditBalance,
        debitBalance: 0, // Reset to 0 in simple model
        netBalance: newNetBalance,
        lastUpdated: admin.firestore.Timestamp.now()
      });

      console.log(`   ✅ Balance updated successfully\n`);
    }

    console.log('🎉 All balance records have been fixed!');
    console.log('\n📋 Summary of Changes:');
    console.log('   • creditBalance now represents farmer\'s available deposit balance');
    console.log('   • debitBalance reset to 0 (not used in simple model)');
    console.log('   • netBalance = creditBalance (available funds)');
    console.log('   • Positive netBalance = farmer has money available');
    console.log('   • Negative netBalance = farmer has overspent deposits');

  } catch (error) {
    console.error('❌ Error fixing balance data:', error);
  } finally {
    admin.app().delete();
    process.exit(0);
  }
}

// Run the fix
fixBalanceData();
