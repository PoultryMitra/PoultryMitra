import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load the service account key  
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'soullink-96d4b'
});

const db = admin.firestore();

async function checkFarmerDashboardData() {
  try {
    console.log('🔍 Checking Farmer Dashboard Data\n');

    // Get all farmers first
    const farmersSnapshot = await db.collection('users')
      .where('role', '==', 'farmer')
      .get();

    console.log(`Found ${farmersSnapshot.size} farmers\n`);

    for (const farmerDoc of farmersSnapshot.docs) {
      const farmerData = farmerDoc.data();
      const farmerId = farmerDoc.id;
      
      console.log(`🌾 Farmer: ${farmerData.displayName || farmerData.email}`);
      console.log(`   ID: ${farmerId}`);

      // Check farmer-dealer connections
      const connectionsSnapshot = await db.collection('farmerDealers')
        .where('farmerId', '==', farmerId)
        .get();

      console.log(`   Connected to ${connectionsSnapshot.size} dealers:`);

      if (connectionsSnapshot.size === 0) {
        console.log('   ❌ No dealer connections found\n');
        continue;
      }

      // For each connection, check balances and transactions
      for (const connectionDoc of connectionsSnapshot.docs) {
        const connectionData = connectionDoc.data();
        const dealerId = connectionData.dealerId;
        
        console.log(`\n   🏪 Dealer: ${connectionData.dealerName}`);
        console.log(`      Email: ${connectionData.dealerEmail || 'N/A'}`);
        console.log(`      Dealer ID: ${dealerId}`);

        // Check balance
        const balanceId = `${farmerId}_${dealerId}`;
        const balanceDoc = await db.collection('farmerBalances').doc(balanceId).get();

        if (balanceDoc.exists) {
          const balanceData = balanceDoc.data();
          console.log(`      💰 Current Balance:`);
          console.log(`         creditBalance: ₹${balanceData.creditBalance}`);
          console.log(`         debitBalance: ₹${balanceData.debitBalance}`);
          console.log(`         netBalance: ₹${balanceData.netBalance}`);
        } else {
          console.log(`      💰 No balance record found`);
        }

        // Check transactions
        const transactionsSnapshot = await db.collection('farmerTransactions')
          .where('farmerId', '==', farmerId)
          .where('dealerId', '==', dealerId)
          .get();

        console.log(`      📊 Transactions: ${transactionsSnapshot.size} found`);
        
        if (transactionsSnapshot.size > 0) {
          transactionsSnapshot.forEach((transDoc) => {
            const transData = transDoc.data();
            const date = transData.date.toDate().toLocaleDateString();
            console.log(`         ${transData.transactionType === 'credit' ? '+' : '-'}₹${transData.amount} - ${transData.description} (${date})`);
          });
        } else {
          console.log(`         No transactions found`);
        }
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }

    // Also check if there are any global issues
    console.log('📊 System Overview:');
    
    const allBalancesSnapshot = await db.collection('farmerBalances').get();
    console.log(`   Total balance records: ${allBalancesSnapshot.size}`);
    
    const allTransactionsSnapshot = await db.collection('farmerTransactions').get();
    console.log(`   Total transaction records: ${allTransactionsSnapshot.size}`);

  } catch (error) {
    console.error('❌ Error checking farmer dashboard data:', error);
  } finally {
    admin.app().delete();
    process.exit(0);
  }
}

// Run the check
checkFarmerDashboardData();
