import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { 
  orderService, 
  type FarmerAccountTransaction, 
  type FarmerAccountBalance 
} from '@/services/orderService';
import { getDealerFarmers, type DealerFarmerData } from '@/services/connectionService';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Download, 
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react';

interface LedgerViewProps {
  farmerId?: string;
  dealerId?: string;
  userRole: 'farmer' | 'dealer';
}

export function LedgerView({ farmerId, dealerId, userRole }: LedgerViewProps) {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<FarmerAccountTransaction[]>([]);
  const [balances, setBalances] = useState<FarmerAccountBalance[]>([]);
  const [connectedFarmers, setConnectedFarmers] = useState<DealerFarmerData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState(farmerId || 'all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeTransactions: (() => void) | undefined;
    let unsubscribeFarmers: (() => void) | undefined;

    if (userRole === 'dealer') {
      // Dealer view - get all farmer transactions
      unsubscribeTransactions = orderService.subscribeFarmerTransactions(
        '', // Empty for all farmers
        (allTransactions) => {
          // Filter transactions for this dealer
          const dealerTransactions = allTransactions.filter(t => t.dealerId === currentUser.uid);
          setTransactions(dealerTransactions);
          
          // Calculate balances
          const balanceData = orderService.calculateFarmerBalances(dealerTransactions);
          setBalances(balanceData);
          setLoading(false);
        }
      );

      // Get connected farmers
      unsubscribeFarmers = getDealerFarmers(currentUser.uid, (farmers) => {
        setConnectedFarmers(farmers);
      });
    } else {
      // Farmer view - get transactions for this farmer
      unsubscribeTransactions = orderService.subscribeFarmerTransactions(
        currentUser.uid,
        (farmerTransactions) => {
          setTransactions(farmerTransactions);
          
          // Calculate balances
          const balanceData = orderService.calculateFarmerBalances(farmerTransactions);
          setBalances(balanceData);
          setLoading(false);
        }
      );
    }

    return () => {
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeFarmers) unsubscribeFarmers();
    };
  }, [currentUser, userRole]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Date filter
    if (dateFilter !== 'all') {
      const transactionDate = transaction.date.toDate();
      const now = new Date();
      
      switch (dateFilter) {
        case 'today': {
          if (transactionDate.toDateString() !== now.toDateString()) return false;
          break;
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (transactionDate < weekAgo) return false;
          break;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (transactionDate < monthAgo) return false;
          break;
        }
      }
    }

    // Type filter
    if (typeFilter !== 'all' && transaction.transactionType !== typeFilter) return false;

    // Farmer filter (for dealer view)
    if (userRole === 'dealer' && selectedFarmer !== 'all' && transaction.farmerId !== selectedFarmer) return false;

    // Amount range filter
    if (amountRange.min && transaction.amount < parseFloat(amountRange.min)) return false;
    if (amountRange.max && transaction.amount > parseFloat(amountRange.max)) return false;

    return true;
  });

  // Calculate summary statistics
  const totalCredits = filteredTransactions
    .filter(t => t.transactionType === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDebits = filteredTransactions
    .filter(t => t.transactionType === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalDebits - totalCredits; // Positive = farmer owes, Negative = dealer owes

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userRole === 'dealer' ? 'Farmer Ledgers' : 'My Account Ledger'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'dealer' 
              ? 'Track all farmer transactions and account balances'
              : 'View your transaction history and account balance'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{totalCredits.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{totalDebits.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className={`h-8 w-8 ${netBalance >= 0 ? 'text-orange-600' : 'text-blue-600'}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                  ₹{Math.abs(netBalance).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {netBalance >= 0 ? 'Outstanding' : 'Credit Balance'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="balances">Account Balances</TabsTrigger>
          {userRole === 'dealer' && <TabsTrigger value="summary">Summary Report</TabsTrigger>}
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dateFilter">Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="typeFilter">Transaction Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credits Only</SelectItem>
                      <SelectItem value="debit">Debits Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userRole === 'dealer' && (
                  <div>
                    <Label htmlFor="farmerFilter">Farmer</Label>
                    <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Farmers</SelectItem>
                        {connectedFarmers.map((farmer) => (
                          <SelectItem key={farmer.farmerId} value={farmer.farmerId}>
                            {farmer.farmerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Amount Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-600">No transactions match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions
                    .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
                    .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
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
                              {transaction.date.toDate().toLocaleDateString()} at{' '}
                              {transaction.date.toDate().toLocaleTimeString()}
                            </span>
                          </div>
                          {transaction.orderRequestId && (
                            <div className="text-xs text-blue-600">
                              Order: {transaction.orderRequestId.slice(-8)}
                            </div>
                          )}
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Balances</CardTitle>
              <CardDescription>
                {userRole === 'dealer' 
                  ? 'Outstanding balances with each farmer'
                  : 'Your balance with each connected dealer'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {balances.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No balances to show</h3>
                  <p className="text-gray-600">Account balances will appear here after transactions.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balances.map((balance) => {
                    const farmer = connectedFarmers.find(f => f.farmerId === balance.farmerId);
                    const displayName = userRole === 'dealer' 
                      ? farmer?.farmerName || 'Unknown Farmer'
                      : balance.dealerName;
                      
                    return (
                      <Card key={`${balance.farmerId}-${balance.dealerId}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="font-medium">{displayName}</div>
                            <Badge variant={balance.netBalance >= 0 ? 'destructive' : 'default'}>
                              {balance.netBalance >= 0 ? 'Outstanding' : 'Credit'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Credits:</span>
                              <span className="text-green-600">₹{balance.creditBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Debits:</span>
                              <span className="text-red-600">₹{balance.debitBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-medium">Net Balance:</span>
                              <span className={`font-bold ${
                                balance.netBalance >= 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ₹{Math.abs(balance.netBalance).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-3">
                            Last updated: {balance.lastUpdated.toDate().toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === 'dealer' && (
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Amount Given:</span>
                    <span className="font-bold">₹{totalDebits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Recovered:</span>
                    <span className="font-bold">₹{totalCredits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Outstanding Amount:</span>
                    <span className={`font-bold ${netBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{Math.abs(netBalance).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {['Feed', 'Medicine', 'Chicks', 'Payment', 'Other'].map(category => {
                    const categoryAmount = filteredTransactions
                      .filter(t => t.category === category)
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    if (categoryAmount === 0) return null;
                    
                    return (
                      <div key={category} className="flex justify-between py-2">
                        <span>{category}:</span>
                        <span className="font-medium">₹{categoryAmount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
