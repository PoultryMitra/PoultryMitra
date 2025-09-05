import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wallet, 
  Plus, 
  History, 
  User, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  CreditCard,
  DollarSign,
  Receipt
} from 'lucide-react';
import { 
  addMoneyToWallet, 
  getWalletBalance,
  subscribeToDealerWallets,
  subscribeToTransactions,
  type WalletBalance,
  type Transaction
} from '../services/walletService';
import { getDealerFarmers, type FarmerData } from '../services/dealerService';

interface FarmerWithBalance extends FarmerData {
  balance: number;
  lastTransactionDate?: Date;
}

export function WalletManagement() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [farmersWithBalance, setFarmersWithBalance] = useState<FarmerWithBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [addMoneyModal, setAddMoneyModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [selectedFarmerName, setSelectedFarmerName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Statistics
  const [totalWalletValue, setTotalWalletValue] = useState(0);
  const [totalFarmers, setTotalFarmers] = useState(0);

  useEffect(() => {
    if (currentUser?.uid) {
      loadInitialData();
      setupSubscriptions();
    }
  }, [currentUser]);

  const loadInitialData = async () => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    try {
      // Load farmers
      const farmerCallback = (farmersData: FarmerData[]) => {
        setFarmers(farmersData);
        setTotalFarmers(farmersData.length);
        loadFarmersWithBalances(farmersData);
      };
      
      getDealerFarmers(currentUser.uid, farmerCallback);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load wallet information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFarmersWithBalances = async (farmersData: FarmerData[]) => {
    if (!currentUser?.uid) return;

    const farmersWithBalanceData: FarmerWithBalance[] = [];
    
    for (const farmer of farmersData) {
      try {
        const balance = await getWalletBalance(farmer.farmerId, currentUser.uid);
        farmersWithBalanceData.push({
          ...farmer,
          balance
        });
      } catch (error) {
        console.error(`Failed to get balance for farmer ${farmer.farmerId}:`, error);
        farmersWithBalanceData.push({
          ...farmer,
          balance: 0
        });
      }
    }
    
    setFarmersWithBalance(farmersWithBalanceData);
    
    // Calculate total wallet value
    const total = farmersWithBalanceData.reduce((sum, farmer) => sum + farmer.balance, 0);
    setTotalWalletValue(total);
  };

  const setupSubscriptions = () => {
    if (!currentUser?.uid) return;

    // Subscribe to wallet changes
    const unsubscribeWallets = subscribeToDealerWallets(currentUser.uid, (walletsData) => {
      setWallets(walletsData);
      
      // Update farmers with balance when wallets change
      if (farmers.length > 0) {
        const updatedFarmers = farmers.map(farmer => {
          const wallet = walletsData.find(w => w.farmerId === farmer.farmerId);
          return {
            ...farmer,
            balance: wallet?.balance || 0
          } as FarmerWithBalance;
        });
        setFarmersWithBalance(updatedFarmers);
        
        const total = updatedFarmers.reduce((sum, farmer) => sum + farmer.balance, 0);
        setTotalWalletValue(total);
      }
    });

    return () => {
      unsubscribeWallets();
    };
  };

  const handleAddMoney = async () => {
    if (!selectedFarmerId || !amount || !currentUser?.uid) {
      toast({
        title: "Missing Information",
        description: "Please select farmer and enter amount",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addMoneyToWallet(
        selectedFarmerId,
        currentUser.uid,
        amountValue,
        currentUser.uid,
        description || `Money added by dealer`
      );

      toast({
        title: "Money Added Successfully",
        description: `₹${amountValue.toLocaleString()} added to ${selectedFarmerName}'s wallet`
      });

      // Reset form and close modal
      setSelectedFarmerId('');
      setSelectedFarmerName('');
      setAmount('');
      setDescription('');
      setAddMoneyModal(false);
      
      // Refresh data
      await refreshWalletData();
    } catch (error) {
      toast({
        title: "Failed to Add Money",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    if (!currentUser?.uid) return;
    
    setRefreshing(true);
    try {
      if (farmers.length > 0) {
        await loadFarmersWithBalances(farmers);
      }
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const viewTransactionHistory = (farmerId: string, farmerName: string) => {
    if (!currentUser?.uid) return;
    
    setSelectedFarmerId(farmerId);
    setSelectedFarmerName(farmerName);
    
    // Subscribe to transactions for this farmer
    const unsubscribe = subscribeToTransactions(farmerId, currentUser.uid, (transactionsData) => {
      setTransactions(transactionsData);
    });
    
    setHistoryModal(true);
    
    // Clean up subscription when modal closes
    return () => unsubscribe();
  };

  const formatTransactionType = (type: Transaction['type']) => {
    switch (type) {
      case 'credit':
      case 'money_added':
        return 'Money Added';
      case 'debit':
      case 'order_payment':
        return 'Order Payment';
      case 'refund':
        return 'Refund';
      default:
        return type;
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'credit':
      case 'money_added':
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'debit':
      case 'order_payment':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Farmer Wallets
          </h2>
          <p className="text-gray-600 mt-1">
            Manage farmer payments and view transaction history
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshWalletData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={addMoneyModal} onOpenChange={setAddMoneyModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Money
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Money to Farmer Wallet</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Select Farmer</Label>
                  <Select 
                    value={selectedFarmerId} 
                    onValueChange={(value) => {
                      setSelectedFarmerId(value);
                      const farmer = farmers.find(f => f.farmerId === value);
                      setSelectedFarmerName(farmer?.farmerName || '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.farmerId} value={farmer.farmerId}>
                          {farmer.farmerName} - {farmer.farmerEmail}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Purpose of payment (e.g., Cash received from farmer)"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleAddMoney} 
                  disabled={loading || !selectedFarmerId || !amount} 
                  className="w-full"
                >
                  {loading ? 'Adding...' : 'Add Money'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Wallet Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{totalWalletValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Connected Farmers</p>
                <p className="text-2xl font-bold">{totalFarmers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Wallets</p>
                <p className="text-2xl font-bold">
                  {farmersWithBalance.filter(f => f.balance > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farmers Wallet List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500">Loading farmer wallets...</p>
              </div>
            </CardContent>
          </Card>
        ) : farmersWithBalance.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Farmers</h3>
                <p className="text-gray-500 mb-4">
                  Start by connecting with farmers and managing their wallet balances
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          farmersWithBalance.map((farmer) => (
            <Card key={farmer.farmerId} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{farmer.farmerName}</h3>
                      <p className="text-sm text-gray-500">{farmer.farmerEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          FCR: {farmer.fcr}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {farmer.chicksReceived} chicks
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${farmer.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      ₹{farmer.balance.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">
                      Updated {farmer.lastUpdated?.toDate().toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFarmerId(farmer.farmerId);
                          setSelectedFarmerName(farmer.farmerName);
                          setAddMoneyModal(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Money
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => viewTransactionHistory(farmer.farmerId, farmer.farmerName)}
                        className="flex items-center gap-1"
                      >
                        <History className="h-3 w-3" />
                        History
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transaction History Modal */}
      <Dialog open={historyModal} onOpenChange={setHistoryModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Transaction History - {selectedFarmerName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{formatTransactionType(transaction.type)}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                        <p className="text-xs text-gray-400">
                          {transaction.createdAt.toDate().toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
