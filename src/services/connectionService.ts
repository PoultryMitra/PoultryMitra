import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Interface for farmer-dealer connections
export interface Connection {
  id?: string;
  farmerId: string;
  dealerId: string;
  farmerName: string;
  farmerEmail: string;
  dealerName?: string;
  dealerEmail?: string;
  connectionDate: Timestamp;
  status: 'active' | 'inactive' | 'pending';
  inviteCode?: string;
}

// Interface for farmer data in dealer's system
export interface DealerFarmerData {
  id?: string;
  connectionId: string;
  dealerId: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  chicksReceived: number;
  feedConsumption: number;
  mortalityRate: number;
  currentWeight: number;
  fcr: number;
  totalExpenses: number;
  totalIncome: number;
  accountBalance: number;
  lastUpdated: Timestamp;
}

// Interface for dealer data in farmer's system  
export interface FarmerDealerData {
  id?: string;
  connectionId: string;
  farmerId: string;
  dealerId: string;
  dealerName: string;
  dealerEmail: string;
  dealerCompany?: string;
  dealerPhone?: string;
  dealerAddress?: string;
  connectedDate: Timestamp;
  lastInteraction: Timestamp;
}

// Create invitation code and store in database
export const createInvitationCode = async (dealerId: string, dealerName: string, dealerEmail: string): Promise<string> => {
  try {
    // Generate a simpler, more user-friendly code
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
    const inviteCode = `DEAL${timestamp}${randomPart}`;
    
    // Store invitation in Firebase
    await addDoc(collection(db, 'dealerInvitations'), {
      inviteCode,
      dealerId,
      dealerName,
      dealerEmail,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      usedBy: null,
      usedAt: null
    });
    
    console.log('Invitation code created and stored:', inviteCode);
    return inviteCode;
  } catch (error) {
    console.error('Error creating invitation code:', error);
    throw error;
  }
};

// Get dealer's active invitation codes
export const getDealerInvitationCodes = async (dealerId: string) => {
  try {
    const q = query(
      collection(db, 'dealerInvitations'),
      where('dealerId', '==', dealerId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching dealer invitation codes:', error);
    return [];
  }
};

// Validate invitation code
export const validateInvitationCode = async (inviteCode: string): Promise<{valid: boolean, data?: any}> => {
  try {
    console.log(`Validating invitation code: ${inviteCode}`);
    
    // First try active invitations
    let q = query(
      collection(db, 'dealerInvitations'),
      where('inviteCode', '==', inviteCode),
      where('isActive', '==', true)
    );
    
    let snapshot = await getDocs(q);
    let invitationData = null;
    let isExpiredOrUsed = false;
    
    if (snapshot.empty) {
      console.log(`No active invitation found for code: ${inviteCode}, checking inactive invitations...`);
      
      // Try all invitations (including inactive ones) to provide better feedback
      q = query(
        collection(db, 'dealerInvitations'),
        where('inviteCode', '==', inviteCode)
      );
      
      snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`No invitation found at all for code: ${inviteCode}`);
        
        // As a fallback for demo codes, check if this is a dealer ID
        // This helps connect farmers directly with dealers during demos
        if (inviteCode.startsWith('demo-') || inviteCode.length > 10) {
          try {
            // Extract potential dealer ID (take the part before any underscore if present)
            const potentialDealerId = inviteCode.includes('_') ? inviteCode.split('_')[0] : inviteCode;
            console.log(`Extracted potential dealer ID: ${potentialDealerId} from code: ${inviteCode}`);
            
            // Try to get dealer profile directly using the extracted ID
            const dealerProfilesQuery = query(
              collection(db, 'dealerProfiles'),
              where('dealerId', '==', potentialDealerId)
            );
            
            const dealerProfileSnapshot = await getDocs(dealerProfilesQuery);
            
            if (!dealerProfileSnapshot.empty) {
              const dealerData = dealerProfileSnapshot.docs[0].data();
              console.log(`Found dealer via dealerProfiles lookup: ${potentialDealerId}`);
              
              return { 
                valid: true, 
                data: {
                  dealerId: potentialDealerId,
                  dealerName: dealerData.businessName || dealerData.displayName || dealerData.email?.split('@')[0] || 'Dealer',
                  dealerEmail: dealerData.email,
                  invitationId: 'direct-connect'
                }
              };
            }
            
            // Try users collection with extracted ID
            const dealerUserQuery = query(
              collection(db, 'users'),
              where('uid', '==', potentialDealerId)
            );
            
            const dealerUserSnapshot = await getDocs(dealerUserQuery);
            
            if (!dealerUserSnapshot.empty) {
              const dealerUserData = dealerUserSnapshot.docs[0].data();
              if (dealerUserData.role === 'dealer') {
                console.log(`Found dealer in users collection: ${potentialDealerId}`);
                
                return { 
                  valid: true, 
                  data: {
                    dealerId: potentialDealerId,
                    dealerName: dealerUserData.displayName || dealerUserData.businessName || dealerUserData.email?.split('@')[0] || 'Dealer',
                    dealerEmail: dealerUserData.email,
                    invitationId: 'user-direct-connect'
                  }
                };
              }
            }
          } catch (err) {
            console.error('Error in dealer ID extraction and lookup:', err);
          }
        }

        return { valid: false };
      } else {
        // Found inactive invitation
        isExpiredOrUsed = true;
        invitationData = snapshot.docs[0].data();
        console.log(`Found inactive invitation for code: ${inviteCode}`);
      }
    } else {
      invitationData = snapshot.docs[0].data();
    }
    
    const invitation = snapshot.docs[0];
    const data = invitationData;
    console.log(`Found invitation data:`, data);
    
    // Check if expired (for active invitations)
    if (!isExpiredOrUsed) {
      const now = new Date();
      const expiresAt = data.expiresAt.toDate();
      
      if (now > expiresAt) {
        console.log(`Invitation expired: ${inviteCode}`);
        // Mark as inactive
        await updateDoc(doc(db, 'dealerInvitations', invitation.id), {
          isActive: false
        });
        isExpiredOrUsed = true;
      }
    }
    
    console.log(`Invitation processing: ${inviteCode} for dealer ${data.dealerId}, expired/used: ${isExpiredOrUsed}`);
    
    // Get current dealer profile to ensure we have the latest information
    let dealerName = data.dealerName || data.displayName || 'Unknown Dealer';
    let dealerEmail = data.dealerEmail || data.email;
    
    try {
      // Try to get updated dealer profile from dealers collection
      const dealerProfileDoc = await getDoc(doc(db, 'dealers', data.dealerId));
      if (dealerProfileDoc.exists()) {
        const dealerProfile = dealerProfileDoc.data();
        dealerName = dealerProfile.businessName || dealerProfile.ownerName || dealerName;
        dealerEmail = dealerProfile.email || dealerEmail;
        console.log(`Updated dealer name from dealers collection: ${dealerName}`);
      } else {
        // Fallback to users collection
        const userDoc = await getDoc(doc(db, 'users', data.dealerId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          dealerName = userData.displayName || userData.businessName || userData.email?.split('@')[0] || dealerName;
          dealerEmail = userData.email || dealerEmail;
          console.log(`Updated dealer name from users collection: ${dealerName}`);
        }
      }
    } catch (error) {
      console.warn('Could not fetch updated dealer profile, using invitation data:', error);
    }
    
    // Return result with dealer info even if invitation is expired/used for display purposes
    return { 
      valid: !isExpiredOrUsed, // Only valid if not expired or used
      data: {
        dealerId: data.dealerId,
        dealerName,
        dealerEmail,
        invitationId: invitation.id,
        isExpiredOrUsed,
        usedBy: data.usedBy,
        usedAt: data.usedAt
      }
    };
  } catch (error) {
    console.error('Error validating invitation code:', error);
    return { valid: false };
  }
};

// Connect farmer to dealer network
export const connectFarmerToDealer = async (
  farmerId: string,
  farmerName: string,
  farmerEmail: string,
  dealerId: string,
  dealerName: string,
  dealerEmail: string,
  inviteCode: string
): Promise<void> => {
  try {
    console.log('🔗 Creating connection with data:', {
      farmerId,
      farmerName,
      farmerEmail,
      dealerId,
      dealerName,
      dealerEmail,
      inviteCode
    });

    // Validate that we have real dealer data, not placeholders
    if (dealerEmail === 'dealer@example.com' || 
        dealerEmail === 'test@example.com' || 
        (dealerName === 'Dealer' && dealerEmail.includes('example.com'))) {
      console.error('❌ Placeholder dealer data detected! Cannot create connection.');
      throw new Error('Invalid dealer information. Please try again or contact support.');
    }

    if (!dealerEmail || !dealerName) {
      console.error('❌ Missing dealer information:', { dealerEmail, dealerName });
      throw new Error('Incomplete dealer information. Please try again.');
    }

    // Fetch full dealer profile to get complete contact information
    let dealerPhone = '';
    let dealerAddress = '';
    let dealerCompany = '';
    
    try {
      // Try to get updated dealer profile
      const dealerProfileDoc = await getDoc(doc(db, 'dealers', dealerId));
      if (dealerProfileDoc.exists()) {
        const dealerProfile = dealerProfileDoc.data();
        dealerPhone = dealerProfile.phone || '';
        dealerAddress = dealerProfile.address || '';
        dealerCompany = dealerProfile.businessName || '';
        console.log('📞 Fetched dealer contact info:', { dealerPhone, dealerAddress, dealerCompany });
      } else {
        // Fallback to users collection
        const userDoc = await getDoc(doc(db, 'users', dealerId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          dealerPhone = userData.phone || '';
          dealerAddress = userData.address || '';
          dealerCompany = userData.businessName || userData.displayName || '';
          console.log('📞 Fetched dealer info from users:', { dealerPhone, dealerAddress, dealerCompany });
        }
      }
    } catch (error) {
      console.warn('Could not fetch dealer profile for contact info:', error);
    }

    const batch = writeBatch(db);
    
    // 1. Create connection record
    const connectionRef = doc(collection(db, 'connections'));
    const connectionData: Omit<Connection, 'id'> = {
      farmerId,
      dealerId,
      farmerName,
      farmerEmail,
      dealerName,
      dealerEmail,
      connectionDate: Timestamp.now(),
      status: 'active',
      inviteCode
    };
    batch.set(connectionRef, connectionData);
    
    // 2. Add farmer to dealer's farmer list
    const dealerFarmerRef = doc(collection(db, 'dealerFarmers'));
    const dealerFarmerData: Omit<DealerFarmerData, 'id'> = {
      connectionId: connectionRef.id,
      dealerId,
      farmerId,
      farmerName,
      farmerEmail,
      chicksReceived: 0,
      feedConsumption: 0,
      mortalityRate: 0,
      currentWeight: 0,
      fcr: 0,
      totalExpenses: 0,
      totalIncome: 0,
      accountBalance: 0,
      lastUpdated: Timestamp.now()
    };
    batch.set(dealerFarmerRef, dealerFarmerData);
    
    // 3. Add dealer to farmer's dealer list
    const farmerDealerRef = doc(collection(db, 'farmerDealers'));
    const farmerDealerData: Omit<FarmerDealerData, 'id'> = {
      connectionId: connectionRef.id,
      farmerId,
      dealerId,
      dealerName,
      dealerEmail,
      dealerPhone,
      dealerAddress,
      dealerCompany,
      connectedDate: Timestamp.now(),
      lastInteraction: Timestamp.now()
    };
    batch.set(farmerDealerRef, farmerDealerData);
    
    // 4. Mark invitation as used
    const invitationQuery = query(
      collection(db, 'dealerInvitations'),
      where('inviteCode', '==', inviteCode)
    );
    const invitationSnapshot = await getDocs(invitationQuery);
    
    if (!invitationSnapshot.empty) {
      const invitationRef = doc(db, 'dealerInvitations', invitationSnapshot.docs[0].id);
      batch.update(invitationRef, {
        isActive: false,
        usedBy: farmerId,
        usedAt: serverTimestamp()
      });
    }
    
    // Commit all operations
    await batch.commit();
    
    console.log('Farmer-dealer connection established successfully');
  } catch (error) {
    console.error('Error connecting farmer to dealer:', error);
    throw error;
  }
};

// Get farmer's connected dealers
export const getFarmerDealers = (
  farmerId: string,
  callback: (dealers: FarmerDealerData[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, 'farmerDealers'),
      where('farmerId', '==', farmerId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('connectedDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealers: FarmerDealerData[] = [];
      snapshot.forEach((doc) => {
        dealers.push({ id: doc.id, ...doc.data() } as FarmerDealerData);
      });
      
      // Sort manually to avoid Firebase index requirement
      dealers.sort((a, b) => {
        const aDate = a.connectedDate?.toDate?.() || new Date(0);
        const bDate = b.connectedDate?.toDate?.() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
      
      console.log('📊 getFarmerDealers - Retrieved dealers:', dealers.length);
      callback(dealers);
    }, (error) => {
      console.error('❌ Error in getFarmerDealers:', error);
      callback([]); // Return empty array on error
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up getFarmerDealers:', error);
    return () => {}; // Return empty cleanup function
  }
};

// Get dealer's connected farmers
export const getDealerFarmers = (
  dealerId: string,
  callback: (farmers: DealerFarmerData[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, 'dealerFarmers'),
      where('dealerId', '==', dealerId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const farmers: DealerFarmerData[] = [];
      snapshot.forEach((doc) => {
        farmers.push({ id: doc.id, ...doc.data() } as DealerFarmerData);
      });
      
      // Sort manually to avoid Firebase index requirement
      farmers.sort((a, b) => {
        const aDate = a.lastUpdated?.toDate?.() || new Date(0);
        const bDate = b.lastUpdated?.toDate?.() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
      
      console.log('📊 getDealerFarmers - Retrieved farmers:', farmers.length);
      callback(farmers);
    }, (error) => {
      console.error('❌ Error in getDealerFarmers:', error);
      callback([]); // Return empty array on error
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up getDealerFarmers:', error);
    return () => {}; // Return empty cleanup function
  }
};

// Update farmer data in dealer's system
export const updateFarmerInDealerSystem = async (
  dealerFarmerId: string,
  updates: Partial<Omit<DealerFarmerData, 'id' | 'connectionId' | 'dealerId' | 'farmerId'>>
): Promise<void> => {
  try {
    const farmerRef = doc(db, 'dealerFarmers', dealerFarmerId);
    await updateDoc(farmerRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating farmer data:', error);
    throw error;
  }
};

// Update dealer data in farmer's system
export const updateDealerInFarmerSystem = async (
  farmerDealerId: string,
  updates: Partial<Omit<FarmerDealerData, 'id' | 'connectionId' | 'farmerId' | 'dealerId'>>
): Promise<void> => {
  try {
    const dealerRef = doc(db, 'farmerDealers', farmerDealerId);
    await updateDoc(dealerRef, {
      ...updates,
      lastInteraction: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating dealer data:', error);
    throw error;
  }
};

// Get all connections (for admin purposes)
export const getAllConnections = (
  callback: (connections: Connection[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'connections'),
    orderBy('connectionDate', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const connections: Connection[] = [];
    snapshot.forEach((doc) => {
      connections.push({ id: doc.id, ...doc.data() } as Connection);
    });
    callback(connections);
  });

  return unsubscribe;
};

// Check if a connection already exists between a farmer and dealer
export const checkConnectionExists = async (
  farmerId: string, 
  dealerId: string
): Promise<boolean> => {
  try {
    console.log(`Checking if connection exists: farmer=${farmerId}, dealer=${dealerId}`);
    
    const q = query(
      collection(db, 'connections'),
      where('farmerId', '==', farmerId),
      where('dealerId', '==', dealerId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    const exists = !snapshot.empty;
    
    console.log(`Connection exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};

// Disconnect farmer and dealer
export const disconnectFarmerFromDealer = async (
  connectionId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // 1. Update connection status
    const connectionRef = doc(db, 'connections', connectionId);
    batch.update(connectionRef, {
      status: 'inactive',
      disconnectedAt: serverTimestamp()
    });
    
    // 2. Find and remove dealer-farmer record
    const dealerFarmerQuery = query(
      collection(db, 'dealerFarmers'),
      where('connectionId', '==', connectionId)
    );
    const dealerFarmerSnapshot = await getDocs(dealerFarmerQuery);
    dealerFarmerSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 3. Find and remove farmer-dealer record
    const farmerDealerQuery = query(
      collection(db, 'farmerDealers'),
      where('connectionId', '==', connectionId)
    );
    const farmerDealerSnapshot = await getDocs(farmerDealerQuery);
    farmerDealerSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Farmer-dealer disconnection completed');
  } catch (error) {
    console.error('Error disconnecting farmer from dealer:', error);
    throw error;
  }
};
