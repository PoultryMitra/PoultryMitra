/**
 * Farmer Ordering System Browser Test Script
 * Run this in the browser console after logging in as a farmer
 * 
 * Instructions:
 * 1. Open http://localhost:8081 in browser
 * 2. Login as a farmer
 * 3. Navigate to /farmer/orders
 * 4. Open browser developer tools (F12)
 * 5. Go to Console tab
 * 6. Copy and paste this script
 * 7. Press Enter to run
 */

window.farmerOrderingTest = {
  
  // Check current state
  checkState: function() {
    console.log('🔍 Checking Farmer Ordering System State...\n');
    
    // Check if we're on the right page
    if (!window.location.pathname.includes('/farmer/orders')) {
      console.log('❌ Navigate to /farmer/orders first');
      return;
    }
    
    // Check authentication
    const user = window.firebase?.auth?.currentUser;
    if (!user) {
      console.log('❌ User not authenticated');
      return;
    }
    
    console.log('✅ User authenticated:', user.uid);
    console.log('✅ On farmer orders page');
    
    // Check React component state by looking at page elements
    const dealerCards = document.querySelectorAll('[data-testid="dealer-card"]') || 
                       document.querySelectorAll('.border:has(h3)'); // Fallback selector
    
    const productCards = document.querySelectorAll('[data-testid="product-card"]') ||
                        document.querySelectorAll('.grid > .border'); // Fallback selector
    
    console.log(`📊 Found ${dealerCards.length} dealer connection cards`);
    console.log(`📦 Found ${productCards.length} product cards`);
    
    // Check tabs
    const tabs = document.querySelectorAll('[role="tablist"] button') ||
                document.querySelectorAll('.tabs button');
    
    console.log(`📑 Found ${tabs.length} tabs`);
    tabs.forEach((tab, index) => {
      console.log(`   Tab ${index + 1}: ${tab.textContent}`);
    });
    
    return {
      userUid: user.uid,
      dealerCards: dealerCards.length,
      productCards: productCards.length,
      tabs: tabs.length
    };
  },
  
  // Check console logs for debugging
  checkLogs: function() {
    console.log('📋 Look for these debug messages in the console:');
    console.log('   🔄 FarmerOrdering - Connected dealers updated:');
    console.log('   🔄 FarmerOrdering - Dealer products updated:');
    console.log('   🔍 FarmerOrdering - Filtering products:');
    console.log('   🔄 subscribeToConnectedDealerProducts - Dealers snapshot:');
    console.log('   📊 getFarmerDealers - Retrieved dealers:');
  },
  
  // Simulate clicking tabs
  testTabs: function() {
    const tabs = document.querySelectorAll('[role="tablist"] button');
    
    if (tabs.length === 0) {
      console.log('❌ No tabs found');
      return;
    }
    
    console.log('🖱️ Testing tab navigation...');
    
    tabs.forEach((tab, index) => {
      setTimeout(() => {
        console.log(`   Clicking tab: ${tab.textContent}`);
        tab.click();
      }, index * 1000);
    });
  },
  
  // Check Firestore connection
  testFirestore: async function() {
    if (!window.firebase?.firestore) {
      console.log('❌ Firebase Firestore not available');
      return;
    }
    
    try {
      const user = window.firebase.auth.currentUser;
      if (!user) {
        console.log('❌ User not authenticated');
        return;
      }
      
      console.log('🔥 Testing Firestore queries...');
      
      const db = window.firebase.firestore();
      
      // Test connection query
      const connectionsRef = db.collection('farmerDealers').where('farmerId', '==', user.uid);
      const connectionsSnapshot = await connectionsRef.get();
      
      console.log(`📊 Found ${connectionsSnapshot.size} dealer connections`);
      
      connectionsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   Connection ${index + 1}: ${data.dealerName} (${data.dealerId})`);
      });
      
      if (connectionsSnapshot.size > 0) {
        // Test products query for first dealer
        const firstConnection = connectionsSnapshot.docs[0].data();
        const productsRef = db.collection('dealerProducts').where('dealerId', '==', firstConnection.dealerId);
        const productsSnapshot = await productsRef.get();
        
        console.log(`📦 Found ${productsSnapshot.size} products from dealer ${firstConnection.dealerName}`);
        
        productsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
          const product = doc.data();
          console.log(`   Product ${index + 1}: ${product.productName} - Stock: ${product.currentStock} ${product.unit}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Firestore test failed:', error);
    }
  },
  
  // Full diagnostic
  fullDiagnostic: async function() {
    console.log('🚀 Running Full Diagnostic...\n');
    
    const state = this.checkState();
    if (!state) return;
    
    console.log('\n--- Console Logs Check ---');
    this.checkLogs();
    
    console.log('\n--- Firestore Test ---');
    await this.testFirestore();
    
    console.log('\n--- Tab Navigation Test ---');
    this.testTabs();
    
    console.log('\n✅ Full diagnostic completed!');
    console.log('💡 Check the console above for debug messages and any errors.');
  }
};

// Auto-run basic check
window.farmerOrderingTest.checkState();

console.log(`
🔧 Farmer Ordering Test Suite Loaded!

Available commands:
• farmerOrderingTest.checkState() - Check current page state
• farmerOrderingTest.checkLogs() - Show what debug logs to look for
• farmerOrderingTest.testFirestore() - Test database queries
• farmerOrderingTest.testTabs() - Test tab navigation
• farmerOrderingTest.fullDiagnostic() - Run all tests

Quick start: farmerOrderingTest.fullDiagnostic()
`);
