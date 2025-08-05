// Test script to verify persistent balance storage functionality
// Run this in browser console after setting up Firebase

const testPersistentBalances = async () => {
  try {
    console.log('🧪 Testing persistent balance storage...');
    
    // Test 1: Create a test transaction
    await orderService.addFarmerTransaction(
      'test-farmer-id',
      'test-dealer-id', 
      'Test Dealer',
      {
        transactionType: 'debit',
        amount: 1000,
        description: 'Test order - 10 bags feed',
        category: 'Feed',
        orderRequestId: 'test-order-123'
      }
    );
    
    console.log('✅ Test transaction created');
    
    // Test 2: Retrieve balance
    const balance = await orderService.getFarmerDealerBalance('test-farmer-id', 'test-dealer-id');
    console.log('📊 Retrieved balance:', balance);
    
    if (balance && balance.creditBalance === 1000) {
      console.log('✅ Balance calculation correct');
    } else {
      console.log('❌ Balance calculation incorrect');
    }
    
    // Test 3: Add a payment (credit)
    await orderService.addFarmerTransaction(
      'test-farmer-id',
      'test-dealer-id',
      'Test Dealer', 
      {
        transactionType: 'credit',
        amount: 500,
        description: 'Test payment from farmer',
        category: 'Payment'
      }
    );
    
    console.log('✅ Test payment created');
    
    // Test 4: Check updated balance
    const updatedBalance = await orderService.getFarmerDealerBalance('test-farmer-id', 'test-dealer-id');
    console.log('📊 Updated balance:', updatedBalance);
    
    if (updatedBalance && updatedBalance.netBalance === 500) {
      console.log('✅ Balance update working correctly (1000 - 500 = 500)');
    } else {
      console.log('❌ Balance update not working correctly');
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run test
testPersistentBalances();
