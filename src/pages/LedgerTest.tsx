import React, { useState } from 'react';
import { addFarmerTransaction, subscribeFarmerTransactions, calculateFarmerBalances } from '../services/orderService';

export default function LedgerTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const farmerId = 'test-farmer-001';
  const dealerId = 'test-dealer-001';
  const dealerName = 'Test Dealer';

  const runTest = async () => {
    setLoading(true);
    await addFarmerTransaction(farmerId, dealerId, dealerName, {
      transactionType: 'debit',
      amount: 1000,
      description: 'Order for feed',
      category: 'Feed',
    });
    await addFarmerTransaction(farmerId, dealerId, dealerName, {
      transactionType: 'credit',
      amount: 400,
      description: 'Payment by farmer',
      category: 'Payment',
    });
    subscribeFarmerTransactions(farmerId, (transactions) => {
      const balances = calculateFarmerBalances(transactions);
      setResult(balances.find(b => b.dealerId === dealerId));
      setLoading(false);
    }, dealerId);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Ledger Test</h2>
      <button onClick={runTest} disabled={loading} style={{ padding: '8px 16px', fontSize: 16 }}>
        {loading ? 'Running...' : 'Run Ledger Test'}
      </button>
      {result && (
        <pre style={{ marginTop: 24, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
