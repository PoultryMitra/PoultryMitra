/**
 * Test script for account ledger between dealer and farmer
 * Run with: node scripts/test-ledger.js
 */

import { addFarmerTransaction, subscribeFarmerTransactions, calculateFarmerBalances } from '../src/services/orderService';

// Mock Firebase Timestamp for test
const Timestamp = { now: () => ({ toMillis: () => Date.now() }) };

async function runLedgerTest() {
  const farmerId = 'test-farmer-001';
  const dealerId = 'test-dealer-001';
  const dealerName = 'Test Dealer';

  // 1. Add a debit transaction (farmer owes dealer)
  await addFarmerTransaction(farmerId, dealerId, dealerName, {
    transactionType: 'debit',
    amount: 1000,
    description: 'Order for feed',
    category: 'Feed',
  });
  console.log('Added debit transaction: ₹1000');

  // 2. Add a credit transaction (farmer pays dealer)
  await addFarmerTransaction(farmerId, dealerId, dealerName, {
    transactionType: 'credit',
    amount: 400,
    description: 'Payment by farmer',
    category: 'Payment',
  });
  console.log('Added credit transaction: ₹400');

  // 3. Fetch all transactions and calculate balances
  subscribeFarmerTransactions(farmerId, (transactions) => {
    const balances = calculateFarmerBalances(transactions);
    const balance = balances.find(b => b.dealerId === dealerId);
    if (balance) {
      console.log(`\nLedger between ${farmerId} and ${dealerId}:`);
      console.log(`  Credit (farmer paid): ₹${balance.creditBalance}`);
      console.log(`  Debit (farmer owes): ₹${balance.debitBalance}`);
      console.log(`  Net Balance: ₹${balance.netBalance}`);
    } else {
      console.log('No balance found for this dealer.');
    }
    process.exit(0);
  }, dealerId);
}

runLedgerTest();
