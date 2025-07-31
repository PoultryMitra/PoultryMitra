import { 
  collection, 
  doc, 
  getDoc,
  updateDoc,
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Function to fix connection data with real dealer information
export const fixConnectionData = async (connectionId: string): Promise<void> => {
  try {
    console.log('🔧 Fixing connection data for connectionId:', connectionId);
    
    // First, get the dealerFarmers document to find the dealerId
    const dealerFarmersQuery = query(
      collection(db, 'dealerFarmers'),
      where('connectionId', '==', connectionId)
    );
    const dealerFarmersSnapshot = await getDocs(dealerFarmersQuery);
    
    if (dealerFarmersSnapshot.empty) {
      console.error('❌ No dealerFarmers document found for connectionId:', connectionId);
      return;
    }
    
    const dealerFarmerDoc = dealerFarmersSnapshot.docs[0];
    const dealerFarmerData = dealerFarmerDoc.data();
    const dealerId = dealerFarmerData.dealerId;
    
    console.log('📋 Found dealerId:', dealerId);
    
    // Get the actual dealer profile from users collection
    const dealerDoc = await getDoc(doc(db, 'users', dealerId));
    
    if (!dealerDoc.exists()) {
      console.error('❌ No dealer profile found for dealerId:', dealerId);
      return;
    }
    
    const dealerProfile = dealerDoc.data();
    console.log('👤 Dealer profile:', {
      email: dealerProfile.email,
      displayName: dealerProfile.displayName,
      businessName: dealerProfile.businessName,
      role: dealerProfile.role
    });
    
    // Determine the best dealer name and email
    const dealerName = dealerProfile.displayName || 
                      dealerProfile.businessName || 
                      dealerProfile.email?.split('@')[0] || 
                      'Unknown Dealer';
    
    const dealerEmail = dealerProfile.email;
    
    if (!dealerEmail) {
      console.error('❌ Dealer profile missing email. Cannot fix connection.');
      return;
    }
    
    // Update the farmerDealers document
    const farmerDealersQuery = query(
      collection(db, 'farmerDealers'),
      where('connectionId', '==', connectionId)
    );
    const farmerDealersSnapshot = await getDocs(farmerDealersQuery);
    
    if (!farmerDealersSnapshot.empty) {
      const farmerDealerDoc = farmerDealersSnapshot.docs[0];
      const currentData = farmerDealerDoc.data();
      
      console.log('📝 Current farmerDealer data:', {
        dealerName: currentData.dealerName,
        dealerEmail: currentData.dealerEmail
      });
      
      console.log('✏️ Updating with correct data:', {
        dealerName,
        dealerEmail
      });
      
      await updateDoc(farmerDealerDoc.ref, {
        dealerName,
        dealerEmail,
        lastInteraction: new Date()
      });
      
      console.log('✅ Updated farmerDealers document successfully');
    } else {
      console.error('❌ No farmerDealers document found for connectionId:', connectionId);
    }
    
  } catch (error) {
    console.error('💥 Error fixing connection data:', error);
    throw error;
  }
};

// Function to fix all connections with placeholder data
export const fixAllConnectionsWithPlaceholderData = async (): Promise<void> => {
  try {
    console.log('🔧 Finding and fixing all connections with placeholder data...');
    
    // Find all farmerDealers documents with placeholder data
    const placeholderQuery = query(
      collection(db, 'farmerDealers'),
      where('dealerEmail', '==', 'dealer@example.com')
    );
    const placeholderSnapshot = await getDocs(placeholderQuery);
    
    console.log(`📊 Found ${placeholderSnapshot.size} connections with placeholder data`);
    
    for (const doc of placeholderSnapshot.docs) {
      const data = doc.data();
      console.log(`🔄 Fixing connection ${data.connectionId}...`);
      
      try {
        await fixConnectionData(data.connectionId);
        console.log(`✅ Fixed connection ${data.connectionId}`);
      } catch (error) {
        console.error(`❌ Failed to fix connection ${data.connectionId}:`, error);
      }
    }
    
    console.log('🎉 Finished fixing all placeholder connections');
    
  } catch (error) {
    console.error('💥 Error fixing placeholder connections:', error);
    throw error;
  }
};
