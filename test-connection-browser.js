/**
 * Browser-based Test Script for Dealer-Farmer Connection System
 * 
 * How to use:
 * 1. Open the browser console in your application
 * 2. Copy and paste this entire script
 * 3. The test will run automatically and log results
 */

// Define a self-executing async function to allow top-level await
(async function() {
  console.log('Starting Dealer-Farmer Connection Test in Browser...');
  console.log('------------------------------------------------');

  // Helper function to create colorful console logs
  const log = {
    info: (msg) => console.log(`%c${msg}`, 'color: #0077cc'),
    success: (msg) => console.log(`%c✓ ${msg}`, 'color: #00cc44'),
    error: (msg) => console.error(`%c✗ ${msg}`, 'color: #cc0000'),
    warn: (msg) => console.warn(`%c! ${msg}`, 'color: #ccaa00'),
    title: (msg) => console.log(`%c${msg}`, 'color: #6600cc; font-weight: bold; font-size: 14px'),
    data: (msg, data) => {
      console.log(`%c${msg}:`, 'color: #555555; font-weight: bold');
      console.log(data);
    }
  };

  try {
    // Step 1: Check if Firebase is initialized
    log.title('1. Checking Firebase Initialization');
    
    if (typeof firebase === 'undefined') {
      log.error('Firebase is not initialized. Make sure you are on a page where Firebase is loaded.');
      return;
    }
    
    // Get current auth state
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      log.error('No user is currently signed in. Please sign in first as a dealer or farmer.');
      return;
    }

    log.success(`Authenticated as: ${currentUser.email} (${currentUser.uid})`);

    // Step 2: Determine if current user is a dealer or farmer
    log.title('2. Determining User Role');
    
    let userRole = null;
    let userProfile = null;
    
    // Check if user is a dealer
    const dealerDoc = await db.collection('dealers').doc(currentUser.uid).get();
    if (dealerDoc.exists) {
      userRole = 'dealer';
      userProfile = dealerDoc.data();
      log.success(`User is a dealer: ${userProfile.businessName}`);
    } else {
      // Check if user is a farmer
      const farmerDoc = await db.collection('farmers').doc(currentUser.uid).get();
      if (farmerDoc.exists) {
        userRole = 'farmer';
        userProfile = farmerDoc.data();
        log.success(`User is a farmer: ${userProfile.farmName || userProfile.ownerName}`);
      } else {
        log.error('User is neither a dealer nor a farmer. Cannot proceed with connection test.');
        return;
      }
    }

    // Step 3: Test functionality based on role
    if (userRole === 'dealer') {
      await testDealerFunctionality(auth, db, currentUser.uid, userProfile);
    } else {
      await testFarmerFunctionality(auth, db, currentUser.uid, userProfile);
    }

  } catch (error) {
    log.error(`Test failed with error: ${error.message}`);
    console.error(error);
  }

  /**
   * Test dealer functionality
   */
  async function testDealerFunctionality(auth, db, dealerId, dealerProfile) {
    log.title('3. Testing Dealer Functionality');
    
    // Step 3.1: Check for products
    log.info('Checking products...');
    const productsSnapshot = await db.collection('products')
      .where('dealerId', '==', dealerId)
      .get();
    
    if (productsSnapshot.empty) {
      log.warn('No products found. Consider adding products before testing connections.');
    } else {
      log.success(`Found ${productsSnapshot.size} products`);
      
      // Log a table of products
      const products = [];
      productsSnapshot.forEach(doc => {
        const product = doc.data();
        products.push({
          Name: product.productName,
          Price: `₹${product.pricePerUnit}/${product.unit}`,
          Category: product.category,
          Stock: product.currentStock
        });
      });
      
      console.table(products);
    }
    
    // Step 3.2: Check for connected farmers
    log.info('Checking connected farmers...');
    const connectionsSnapshot = await db.collection('connections')
      .where('dealerId', '==', dealerId)
      .where('status', '==', 'active')
      .get();
    
    if (connectionsSnapshot.empty) {
      log.warn('No farmers are connected to this dealer yet.');
      
      // Generate a test invite code
      log.info('Generating a test invite code...');
      
      try {
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 11);
        const inviteCode = `${dealerId}_${timestamp}_${randomPart}`;
        
        // Store the invitation code
        await db.collection('invitations').add({
          dealerId,
          inviteCode,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          isActive: true
        });
        
        const shareableLink = `${window.location.origin}/farmer-connect?code=${inviteCode}`;
        
        log.success('Test invite code generated!');
        log.data('Invite Code', inviteCode);
        log.data('Shareable Link', shareableLink);
        log.info('Share this code with a farmer to test the connection.');
      } catch (error) {
        log.error(`Failed to generate invite code: ${error.message}`);
      }
    } else {
      log.success(`Found ${connectionsSnapshot.size} connected farmers`);
      
      // Get farmer details
      const farmerIds = [];
      connectionsSnapshot.forEach(doc => {
        farmerIds.push(doc.data().farmerId);
      });
      
      const farmers = [];
      for (const farmerId of farmerIds) {
        const farmerDoc = await db.collection('farmers').doc(farmerId).get();
        if (farmerDoc.exists) {
          const farmerData = farmerDoc.data();
          farmers.push({
            Name: farmerData.farmName || farmerData.ownerName,
            Email: farmerData.email,
            Phone: farmerData.phone,
            ConnectedOn: new Date(farmerData.lastUpdated || farmerData.createdAt).toLocaleDateString()
          });
        }
      }
      
      console.table(farmers);
    }
    
    // Step 3.3: Check active invitation codes
    log.info('Checking active invitation codes...');
    const invitationsSnapshot = await db.collection('invitations')
      .where('dealerId', '==', dealerId)
      .where('isActive', '==', true)
      .get();
    
    if (!invitationsSnapshot.empty) {
      log.success(`Found ${invitationsSnapshot.size} active invitation codes`);
      
      invitationsSnapshot.forEach(doc => {
        const invitation = doc.data();
        log.data(`Code: ${invitation.inviteCode}`, {
          'Created At': new Date(invitation.createdAt).toLocaleString(),
          'Expires At': new Date(invitation.expiresAt).toLocaleString(),
          'Shareable Link': `${window.location.origin}/farmer-connect?code=${invitation.inviteCode}`
        });
      });
    } else {
      log.info('No active invitation codes found.');
    }
    
    log.title('Connection Test Complete');
    log.info('If you want to test the complete flow, please:');
    log.info('1. Generate an invite code (if none exists)');
    log.info('2. Share the code with a farmer');
    log.info('3. Have the farmer log in and enter the code');
    log.info('4. Verify the connection is established');
  }

  /**
   * Test farmer functionality
   */
  async function testFarmerFunctionality(auth, db, farmerId, farmerProfile) {
    log.title('3. Testing Farmer Functionality');
    
    // Step 3.1: Check if connected to a dealer
    const dealerId = farmerProfile.dealerId;
    
    if (!dealerId) {
      log.warn('This farmer is not connected to any dealer.');
      
      // Prompt to test connection with code
      log.info('Would you like to test connecting to a dealer?');
      log.info('If so, please obtain an invite code from a dealer and enter it here:');
      log.info("Example usage: testConnectToDealer('INVITE_CODE_HERE')");
      
      // Define the function to test connection
      window.testConnectToDealer = async function(inviteCode) {
        if (!inviteCode) {
          log.error('No invite code provided. Please provide a valid invite code.');
          return;
        }
        
        try {
          log.info(`Testing connection with invite code: ${inviteCode}`);
          
          // Validate the invite code
          const invitationsSnapshot = await db.collection('invitations')
            .where('inviteCode', '==', inviteCode)
            .where('isActive', '==', true)
            .get();
          
          if (invitationsSnapshot.empty) {
            log.error('Invalid or expired invite code.');
            return;
          }
          
          const invitation = invitationsSnapshot.docs[0].data();
          const dealerId = invitation.dealerId;
          
          // Create connection record
          await db.collection('connections').add({
            dealerId,
            farmerId,
            inviteCode,
            status: 'active',
            createdAt: new Date().toISOString()
          });
          
          // Update farmer record
          await db.collection('farmers').doc(farmerId).update({
            dealerId,
            lastUpdated: new Date().toISOString()
          });
          
          log.success('Connection successful! Refresh the page to see dealer products.');
          log.data('Connected to Dealer ID', dealerId);
          
          // Get dealer info
          const dealerDoc = await db.collection('dealers').doc(dealerId).get();
          if (dealerDoc.exists) {
            const dealerData = dealerDoc.data();
            log.data('Dealer Info', {
              'Business Name': dealerData.businessName,
              'Owner': dealerData.ownerName,
              'Contact': dealerData.phone
            });
          }
        } catch (error) {
          log.error(`Connection failed: ${error.message}`);
        }
      };
      
      return;
    }
    
    // Step 3.2: Get dealer information
    const dealerDoc = await db.collection('dealers').doc(dealerId).get();
    
    if (!dealerDoc.exists) {
      log.error('Connected to a dealer that no longer exists.');
      return;
    }
    
    const dealerData = dealerDoc.data();
    log.success(`Connected to dealer: ${dealerData.businessName}`);
    log.data('Dealer Info', {
      'Business Name': dealerData.businessName,
      'Owner': dealerData.ownerName,
      'Contact': dealerData.phone,
      'Address': dealerData.address
    });
    
    // Step 3.3: Check for available products
    log.info('Checking available products from dealer...');
    const productsSnapshot = await db.collection('products')
      .where('dealerId', '==', dealerId)
      .get();
    
    if (productsSnapshot.empty) {
      log.warn('No products available from this dealer yet.');
    } else {
      log.success(`Found ${productsSnapshot.size} products from dealer`);
      
      // Log a table of products
      const products = [];
      productsSnapshot.forEach(doc => {
        const product = doc.data();
        products.push({
          Name: product.productName,
          Price: `₹${product.pricePerUnit}/${product.unit}`,
          Category: product.category,
          Available: product.currentStock > 0 ? 'Yes' : 'No'
        });
      });
      
      console.table(products);
    }
    
    log.title('Connection Test Complete');
    log.success('Your account is properly connected to a dealer.');
    log.info('You should be able to see all products from your dealer.');
  }
})();
