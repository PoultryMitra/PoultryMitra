import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCyYU5e_5aT4GX8AEQaZqhEY4b1nHF1C3k",
  authDomain: "soullink-96d4b.firebaseapp.com",
  projectId: "soullink-96d4b",
  storageBucket: "soullink-96d4b.firebasestorage.app",
  messagingSenderId: "899064302308",
  appId: "1:899064302308:web:3f38dfbbf7b2a3ab0ab74e",
  measurementId: "G-3ZTSRR95RG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAdminRole() {
  try {
    // The admin user ID you mentioned in the console
    const adminUserId = "jKSuUgcr9vhWvEp0bQ03NEsPVLR2";
    
    console.log('🔍 Checking admin user role...');
    
    // Check current user document
    const userRef = doc(db, 'users', adminUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('📋 Current user data:', userDoc.data());
      
      // Check if role is admin
      if (userDoc.data().role !== 'admin') {
        console.log('⚠️  Role is not admin, updating...');
        
        await setDoc(userRef, {
          email: 'admin@poultrymitra.com',
          displayName: 'Admin',
          role: 'admin',
          profileComplete: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log('✅ Admin role updated successfully!');
      } else {
        console.log('✅ Admin role is already correct!');
      }
    } else {
      console.log('⚠️  User document does not exist, creating...');
      
      await setDoc(userRef, {
        email: 'admin@poultrymitra.com',
        displayName: 'Admin',
        role: 'admin',
        profileComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Admin user document created successfully!');
    }
    
    // Verify the update
    const updatedDoc = await getDoc(userRef);
    console.log('🔄 Updated user data:', updatedDoc.data());
    
  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
  }
}

fixAdminRole();
