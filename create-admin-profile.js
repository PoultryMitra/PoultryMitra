import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Read service account key
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://soullink-96d4b-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function createAdminProfile() {
  try {
    console.log('🔧 Creating admin profile...');
    
    // You can update these details as needed
    const adminEmail = 'admin@poultrymitra.com';
    
    // First, let's check if there's already a user with this email
    const userRecord = await admin.auth().getUserByEmail(adminEmail).catch(() => null);
    
    let adminUID;
    if (userRecord) {
      adminUID = userRecord.uid;
      console.log('📧 Found existing Firebase Auth user:', adminUID);
    } else {
      console.log('📧 No existing Firebase Auth user found. You may need to create one first.');
      // Since you mentioned the user already exists, this shouldn't happen
      return;
    }
    
    const adminProfile = {
      uid: adminUID,
      email: adminEmail,
      displayName: 'Admin User',
      role: 'admin',
      phone: '1234567890',
      location: 'Admin Office',
      profileComplete: true,
      createdAt: admin.firestore.Timestamp.now(),
      lastActive: admin.firestore.Timestamp.now()
    };

    // Create/update the admin profile in users collection
    await db.collection('users').doc(adminUID).set(adminProfile, { merge: true });
    
    console.log('✅ Admin profile created successfully!');
    console.log('Admin details:', {
      UID: adminUID,
      Email: adminEmail,
      Role: 'admin',
      Profile: 'Complete'
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin profile:', error);
    process.exit(1);
  }
}

// Run the function
createAdminProfile();
