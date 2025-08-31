import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  orderService, 
  type FarmerAccountTransaction, 
  type FarmerAccountBalance 
} from '@/services/orderService';
import { getDealerFarmers, type DealerFarmerData } from '@/services/connectionService';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Users
} from 'lucide-react';

interface AccountSummaryProps {
  dealerId?: string;
}

export function AccountSummary({ dealerId }: AccountSummaryProps) {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<FarmerAccountTransaction[]>([]);
  const [balances, setBalances] = useState<FarmerAccountBalance[]>([]);
  const [connectedFarmers, setConnectedFarmers] = useState<DealerFarmerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeTransactions: (() => void) | undefined =
      orderService.subscribeFarmerTransactions(
        '',
        (allTransactions) => {
          // Filter transactions for this dealer
          const dealerTransactions = allTransactions.filter(t => t.dealerId === (dealerId || currentUser.uid));
          setTransactions(dealerTransactions);
          
          // Calculate balances
          const balanceData = orderService.calculateFarmerBalances(dealerTransactions);
          setBalances(balanceData);
          setLoading(false);
        }
      );

    const unsubscribeFarmers: (() => void) | undefined = getDealerFarmers(dealerId || currentUser.uid, (farmers) => {
      setConnectedFarmers(farmers);
    });

    return () => {
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeFarmers) unsubscribeFarmers();
    };
  }, [currentUser, dealerId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const recentTransactions = transactions
    .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
    .slice(0, 5);
    
  const totalCredits = transactions
    .filter(t => t.transactionType === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDebits = transactions
    .filter(t => t.transactionType === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netOutstanding = totalDebits - totalCredits; // Positive = farmers owe dealer
  const totalBalances = balances.reduce((sum, b) => sum + Math.abs(b.netBalance), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Outstanding */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <DollarSign className={`h-8 w-8 ${netOutstanding >= 0 ? 'text-orange-600' : 'text-green-600'}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className={`text-2xl font-bold ${netOutstanding >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                ₹{Math.abs(netOutstanding).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {netOutstanding >= 0 ? 'Farmers owe you' : 'You owe farmers'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Credits Given */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credits Given</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalDebits.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Total amount extended
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Received */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Received</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{totalCredits.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Total payments received
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Accounts */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-purple-600">
                {balances.filter(b => Math.abs(b.netBalance) > 0).length}
              </p>
              <p className="text-xs text-gray-500">
                With outstanding balances
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Transactions
            <Badge variant="outline">{transactions.length} total</Badge>
          </CardTitle>
          <CardDescription>
            Latest account activity across all farmers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600">Transaction history will appear here after order completions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.transactionType === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.transactionType === 'credit' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>{transaction.dealerName}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span className="text-xs">
                          {transaction.date.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.transactionType === 'credit' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transactionType === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {transactions.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Transactions ({transactions.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
