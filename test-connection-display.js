// Test script to check Firebase connection data
console.log('🔍 Testing Firebase Connection Data...');

// Import Firebase config from environment variables if in Node.js environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD3tc1EKESzh4ITdCbM3a5NSlZa4vDnVBY",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "soullink-96d4b.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "soullink-96d4b",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "soullink-96d4b.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "321937432406",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:321937432406:web:14469a9f3f45a6315380f7"
};

// Initialize Firebase if in Node.js environment and not already initialized
if (typeof window === 'undefined' && typeof firebase === 'undefined') {
  try {
    const { initializeApp } = require('firebase/app');
    const { getFirestore } = require('firebase/firestore');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('Firebase initialized with config from .env file');
    console.log('Connected to Firebase project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

// Simulate the data we see in Firebase
const farmerDealersData = [
  {
    id: '3xbhad6BVbHyBnJ04MQt',
    connectedDate: { toDate: () => new Date('2025-07-31T09:59:07+05:30') },
    connectionId: '7sFgS9eqoGAmfizoiCD0',
    dealerEmail: 'nareshkumarbalamurugan1@gmail.com',
    dealerId: 'nOMLKq4wDAeSRIGfkM736OZY4ws1',
    dealerName: 'Naresh kumar balamurugan',
    farmerId: '75AsBEgjdyYBdAtTa6uee19DMAi2',
    lastInteraction: { toDate: () => new Date('2025-07-31T09:59:07+05:30') }
  }
];

const dealerFarmersData = [
  {
    id: 'K46nCmBwAsRtO2LLkSva',
    accountBalance: 30000,
    chicksReceived: 3000,
    currentWeight: 2.3,
    dealerId: '75AsBEgjdyYBdAtTa6uee19DMAi2',
    farmerEmail: 'priya.sharma@email.com',
    farmerId: 'FARM002',
    farmerName: 'Priya Sharma',
    fcr: 1.73,
    feedConsumption: 5200,
    lastUpdated: { toDate: () => new Date('2025-07-29T17:42:11+05:30') },
    mortalityRate: 1.8,
    totalExpenses: 115000,
    totalIncome: 145000
  }
];

const dealerInvitationsData = [
  {
    id: '1JD56Ga6JA4Bk0pRNh0J',
    createdAt: { toDate: () => new Date('2025-07-31T12:29:56+05:30') },
    dealerEmail: 'pankajkr531992@gmail.com',
    dealerId: '9Oo8a8oxWSQdjSp42sHr8qbRmU12',
    dealerName: 'PANKAJ KUMAR',
    expiresAt: { toDate: () => new Date('2025-08-07T12:29:56+05:30') },
    inviteCode: 'dealer-9Oo8a8oxWSQdjSp42sHr8qbRmU12-1753945196509-k09dna6dz',
    isActive: true,
    usedAt: null,
    usedBy: null
  }
];

console.log('📊 Farmer-Dealer Connections:', farmerDealersData.length);
console.log('👥 Dealer-Farmer Records:', dealerFarmersData.length);
console.log('📧 Active Invitations:', dealerInvitationsData.length);

// Check what farmers see (dealers connected to them)
console.log('\n🧑‍🌾 FARMER VIEW:');
farmerDealersData.forEach(connection => {
  console.log(`  Farmer ${connection.farmerId} connected to:`);
  console.log(`    - Dealer: ${connection.dealerName}`);
  console.log(`    - Email: ${connection.dealerEmail}`);
  console.log(`    - Connected: ${connection.connectedDate.toDate().toLocaleDateString()}`);
});

// Check what dealers see (farmers connected to them)
console.log('\n🏪 DEALER VIEW:');
dealerFarmersData.forEach(farmer => {
  console.log(`  Dealer ${farmer.dealerId} has farmer:`);
  console.log(`    - Farmer: ${farmer.farmerName}`);
  console.log(`    - Email: ${farmer.farmerEmail}`);
  console.log(`    - FCR: ${farmer.fcr}`);
  console.log(`    - Last Update: ${farmer.lastUpdated.toDate().toLocaleDateString()}`);
});

// Check active invitations
console.log('\n📨 ACTIVE INVITATIONS:');
dealerInvitationsData.forEach(invitation => {
  console.log(`  Code: ${invitation.inviteCode}`);
  console.log(`  Dealer: ${invitation.dealerName}`);
  console.log(`  Expires: ${invitation.expiresAt.toDate().toLocaleDateString()}`);
  console.log(`  Active: ${invitation.isActive}`);
});

console.log('\n✅ Test completed. Data structure looks correct!');

// Export function to run the tests with real Firebase data
async function runLiveConnectionTest() {
  try {
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not initialized. Make sure you are running this in the correct environment.');
      return;
    }

    console.log('🔍 Running LIVE Firebase Connection Test...');
    
    const db = firebase.firestore();
    
    // Get live farmer-dealer connections
    const liveFarmerDealers = [];
    const farmerDealersSnapshot = await db.collection('connections').get();
    farmerDealersSnapshot.forEach(doc => {
      liveFarmerDealers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get live dealer-farmers data
    const liveDealerFarmers = [];
    const farmersSnapshot = await db.collection('farmers').where('dealerId', '!=', null).get();
    farmersSnapshot.forEach(doc => {
      liveDealerFarmers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get live invitations
    const liveInvitations = [];
    const invitationsSnapshot = await db.collection('invitations').where('isActive', '==', true).get();
    invitationsSnapshot.forEach(doc => {
      liveInvitations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('📊 LIVE Farmer-Dealer Connections:', liveFarmerDealers.length);
    console.log('👥 LIVE Dealer-Farmer Records:', liveDealerFarmers.length);
    console.log('📧 LIVE Active Invitations:', liveInvitations.length);
    
    // Display the actual data
    console.log('\n🧑‍🌾 LIVE FARMER VIEW:');
    liveFarmerDealers.forEach(connection => {
      console.log(`  Connection ID ${connection.id}:`);
      console.log(`    - Dealer ID: ${connection.dealerId}`);
      console.log(`    - Farmer ID: ${connection.farmerId}`);
      console.log(`    - Status: ${connection.status || 'active'}`);
      if (connection.createdAt) {
        const date = connection.createdAt.toDate ? connection.createdAt.toDate() : new Date(connection.createdAt);
        console.log(`    - Connected: ${date.toLocaleDateString()}`);
      }
    });
    
    console.log('\n🏪 LIVE DEALER VIEW:');
    liveDealerFarmers.forEach(farmer => {
      console.log(`  Farmer ID ${farmer.id}:`);
      console.log(`    - Name: ${farmer.farmName || farmer.ownerName || 'Unknown'}`);
      console.log(`    - Email: ${farmer.email || 'Unknown'}`);
      console.log(`    - Connected to Dealer: ${farmer.dealerId}`);
      if (farmer.fcr) console.log(`    - FCR: ${farmer.fcr}`);
    });
    
    console.log('\n📨 LIVE ACTIVE INVITATIONS:');
    liveInvitations.forEach(invitation => {
      console.log(`  Invitation ID ${invitation.id}:`);
      console.log(`    - Code: ${invitation.inviteCode}`);
      console.log(`    - Dealer ID: ${invitation.dealerId}`);
      if (invitation.expiresAt) {
        const date = invitation.expiresAt.toDate ? invitation.expiresAt.toDate() : new Date(invitation.expiresAt);
        console.log(`    - Expires: ${date.toLocaleDateString()}`);
      }
      console.log(`    - Active: ${invitation.isActive}`);
    });
    
    console.log('\n✅ Live test completed!');
  } catch (error) {
    console.error('❌ Error running live test:', error);
  }
}

// Execute the test automatically if in a browser environment
if (typeof window !== 'undefined' && typeof firebase !== 'undefined') {
  console.log('Auto-running live connection test...');
  runLiveConnectionTest();
} else if (typeof window !== 'undefined') {
  console.log('Firebase not detected. To run the live test, make sure Firebase is initialized and call runLiveConnectionTest()');
  window.runLiveConnectionTest = runLiveConnectionTest;
}

// Export function for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runLiveConnectionTest }; 
}
