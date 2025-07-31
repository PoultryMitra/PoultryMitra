import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  addTransaction,
  addVaccineReminder,
  subscribeToTransactions,
  subscribeToVaccineReminders,
  calculateTotals,
  type Transaction,
  type VaccineReminder,
} from "@/services/farmerService";
import { getFarmerDealers, type FarmerDealerData } from "@/services/connectionService";
import { 
  subscribeToConnectedDealerProducts,
  type Product,
  type RateUpdate 
} from "@/services/dealerService";export default function FarmerDashboard() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // FCR Calculator State
  const [fcrResult, setFcrResult] = useState<number | null>(null);
  const [feedIntake, setFeedIntake] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");

  // Transaction State
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Vaccine Reminder State
  const [vaccineName, setVaccineName] = useState("");
  const [vaccineDate, setVaccineDate] = useState("");
  const [vaccineReminders, setVaccineReminders] = useState<VaccineReminder[]>([]);
  
  // Dealer Rates State
  const [dealerProducts, setDealerProducts] = useState<Product[]>([]);
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);

  // Calculate totals from Firebase data
  const { totalIncome, totalExpenses, netProfit } = calculateTotals(transactions);

  // Debug logging
  useEffect(() => {
    console.log('Transactions updated:', transactions.length, 'Total Income:', totalIncome, 'Total Expenses:', totalExpenses);
  }, [transactions, totalIncome, totalExpenses]);

  // Subscribe to real-time Firebase data
  useEffect(() => {
    if (!currentUser?.uid) return;

    console.log('Setting up Firebase subscriptions for user:', currentUser.uid);

    const unsubscribeTransactions = subscribeToTransactions(currentUser.uid, (data) => {
      console.log('Received transactions from Firebase:', data.length);
      setTransactions(data);
    });

    const unsubscribeVaccines = subscribeToVaccineReminders(currentUser.uid, (data) => {
      console.log('Received vaccine reminders from Firebase:', data.length);
      setVaccineReminders(data);
    });

    // Create a local version to test if it's a module issue
    const unsubscribeProducts = subscribeToConnectedDealerProducts(currentUser.uid, (products) => {
      console.log('📦 Received products from connected dealers:', products.length);
      setDealerProducts(products);
    });

    // Subscribe to connected dealers
    const unsubscribeDealers = getFarmerDealers(currentUser.uid, (dealers) => {
      console.log('🏪 Received connected dealers:', dealers.length);
      console.log('👤 Current farmer user:', {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      });
      console.log('📊 Dealer details:', dealers);
      setConnectedDealers(dealers);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeVaccines();
      unsubscribeProducts();
      unsubscribeDealers();
    };
  }, [currentUser?.uid]);

  // FCR Calculator Handler
  const calculateFCR = () => {
    const feed = parseFloat(feedIntake);
    const weight = parseFloat(bodyWeight);
    
    if (!feed || !weight) {
      toast({
        title: "Error",
        description: "Please enter valid feed intake and body weight values.",
        variant: "destructive",
      });
      return;
    }
    
    const result = feed / weight;
    setFcrResult(result);
    
    toast({
      title: "FCR Calculated",
      description: `Your Feed Conversion Ratio is ${result.toFixed(2)}`,
    });
  };

  // Transaction Handler
  const handleAddTransaction = async () => {
    if (!currentUser?.uid) {
      toast({
        title: "Error",
        description: "Please log in to add transactions.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || !note.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all transaction fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      console.log('Form amount input:', amount, 'Parsed amount:', parsedAmount, 'Type:', typeof parsedAmount);
      
      await addTransaction(currentUser.uid, {
        type: transactionType,
        amount: parsedAmount,
        note: note.trim(),
        date: date,
        category: transactionType === 'income' ? 'Sales' : 'General',
      });

      // Clear form
      setAmount("");
      setNote("");
      setDate(new Date().toISOString().split('T')[0]);
      
      toast({
        title: "Transaction Added",
        description: `${transactionType === 'income' ? 'Income' : 'Expense'} of ₹${amount} added successfully.`,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Vaccine Reminder Handler
  const handleAddVaccineReminder = async () => {
    if (!currentUser?.uid) {
      toast({
        title: "Error",
        description: "Please log in to add vaccine reminders.",
        variant: "destructive",
      });
      return;
    }

    if (!vaccineName.trim() || !vaccineDate) {
      toast({
        title: "Error",
        description: "Please enter vaccine name and due date.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addVaccineReminder(currentUser.uid, {
        vaccineName: vaccineName.trim(),
        reminderDate: new Date(vaccineDate),
        notes: 'Reminder set from dashboard',
        status: 'pending',
      });

      // Clear form
      setVaccineName("");
      setVaccineDate("");
      
      toast({
        title: "Reminder Added",
        description: `Vaccine reminder for ${vaccineName} added successfully.`,
      });
    } catch (error) {
      console.error('Error adding vaccine reminder:', error);
      toast({
        title: "Error",
        description: "Failed to add vaccine reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark vaccine as completed - for now, just show toast
  const handleMarkVaccineCompleted = async (reminderId: string) => {
    if (!reminderId) return;
    
    const reminder = vaccineReminders.find(r => r.id === reminderId);
    toast({
      title: "Vaccination Completed",
      description: `${reminder?.vaccineName} marked as completed.`,
    });
    
    // Note: In a full implementation, you might want to delete the reminder
    // or move it to a "completed" collection
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Income</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-2xl font-bold text-red-600">
              ₹{transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Net Profit</div>
            <div className="text-2xl font-bold text-blue-600">
              ₹{(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                 transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Expense/Income */}
        <Card>
          <CardHeader>
            <CardTitle>Add Expense/Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={transactionType} onValueChange={(value: "income" | "expense") => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                placeholder="e.g., 5000" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea 
                id="note" 
                placeholder="e.g., Sale of crops" 
                className="resize-none"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleAddTransaction}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </CardContent>
        </Card>

        {/* FCR Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>FCR Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feedIntake">Feed Intake (kg)</Label>
              <Input 
                id="feedIntake" 
                placeholder="e.g., 100"
                value={feedIntake}
                onChange={(e) => setFeedIntake(e.target.value)}
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="bodyWeight">Body Weight (kg)</Label>
              <Input 
                id="bodyWeight" 
                placeholder="e.g., 50"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                type="number"
              />
            </div>

            <Button 
              onClick={calculateFCR}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Calculate FCR
            </Button>

            {fcrResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold">FCR: {fcrResult.toFixed(2)}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Formula: FCR = Feed Intake / Body Weight
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {fcrResult <= 1.6 ? "Excellent" : 
                   fcrResult <= 1.8 ? "Good" : 
                   fcrResult <= 2.0 ? "Average" : "Needs Improvement"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vaccine Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccine Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="vaccineName">Vaccine Name</Label>
              <Input 
                id="vaccineName" 
                placeholder="e.g., Newcastle Disease"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate" 
                type="date"
                value={vaccineDate}
                onChange={(e) => setVaccineDate(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleAddVaccineReminder}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white mb-6"
          >
            {loading ? "Adding..." : "Add Reminder"}
          </Button>

          {/* Existing Reminders */}
          <div className="space-y-3">
            {vaccineReminders.map((reminder) => (
              <div key={reminder.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{reminder.vaccineName}</span>
                <span className="text-gray-600">{new Date(reminder.reminderDate.toDate()).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dealer Products Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Products from Connected Dealers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dealerProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <div className="font-medium text-blue-900">{product.productName}</div>
                  <div className="text-sm text-blue-600">{product.category}</div>
                  <div className="text-xs text-gray-500">
                    Stock: {product.currentStock} {product.unit} | Supplier: {product.supplier || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg text-blue-800">
                    ₹{product.pricePerUnit.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">
                    per {product.unit}
                  </div>
                </div>
              </div>
            ))}
            {dealerProducts.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <div className="text-gray-400 mb-2">No Products Available</div>
                <div>No products available from connected dealers.</div>
                <div className="text-sm">Connect with a dealer to see their products and prices.</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connected Dealers */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Dealers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connectedDealers.map((dealer) => (
              <div key={dealer.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-medium text-green-900">{dealer.dealerName}</div>
                  <div className="text-sm text-green-600">{dealer.dealerEmail}</div>
                  <div className="text-xs text-gray-500">
                    Connected: {dealer.connectedDate.toDate().toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                  <div className="text-xs text-green-600">Active</div>
                </div>
              </div>
            ))}
            {connectedDealers.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <div className="text-gray-400 mb-2">No Connections</div>
                <div>No dealers connected.</div>
                <div className="text-sm">Ask your dealer for an invitation link to get connected.</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{transaction.note}</div>
                  <div className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No transactions yet. Add your first transaction above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
