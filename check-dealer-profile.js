const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDgwUjGO_7lWoD5p_WAXE4TM9K7uKtJL5s',
  authDomain: 'fowl-feed-management.firebaseapp.com',
  projectId: 'fowl-feed-management',
  storageBucket: 'fowl-feed-management.appspot.com',
  messagingSenderId: '234567890123',
  appId: '1:234567890123:web:abcdef123456'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDealerProfile() {
  try {
    const dealerId = 'AfiKAc1AKWWB5qxrIbJQ80u6VXY2';
    console.log('Checking dealer profile for ID:', dealerId);
    
    // Check users collection
    const dealerDoc = await getDoc(doc(db, 'users', dealerId));
    
    if (dealerDoc.exists()) {
      const data = dealerDoc.data();
      console.log('\\n=== DEALER PROFILE FROM USERS COLLECTION ===');
      console.log('UID:', data.uid);
      console.log('Email:', data.email);
      console.log('DisplayName:', data.displayName);
      console.log('BusinessName:', data.businessName);
      console.log('Role:', data.role);
      console.log('ProfileComplete:', data.profileComplete);
      console.log('Full data:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ No dealer found in users collection');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDealerProfile();
