import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import NotificationService, { TransactionDetails } from '@/services/notificationService';

interface NotificationDemoProps {
  farmerName?: string;
  farmerPhone?: string;
  dealerName?: string;
}

const NotificationDemo: React.FC<NotificationDemoProps> = ({
  farmerName = "Raj Patel",
  farmerPhone = "9876543210", 
  dealerName = "ABC Feeds & Poultry"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: 'Pre Starter Feed',
    companyName: 'Godrej Agrovet',
    quantity: 10,
    unit: 'Bags',
    totalAmount: 22000,
    farmerPhone: farmerPhone
  });

  const handleSendNotification = async () => {
    const transaction: TransactionDetails = {
      farmerName,
      farmerPhone: formData.farmerPhone,
      dealerName,
      productName: formData.productName,
      companyName: formData.companyName,
      quantity: formData.quantity,
      unit: formData.unit,
      totalAmount: formData.totalAmount,
      transactionId: `TXN${Date.now().toString().slice(-6)}`
    };

    const success = await NotificationService.sendTransactionNotification(transaction);
    
    if (success) {
      setIsOpen(false);
      alert('WhatsApp opened! Send the message to notify the farmer.');
    } else {
      alert('Failed to open WhatsApp. Please try again.');
    }
  };

  const handleOrderInquiry = async () => {
    const productDetails = `${formData.quantity} ${formData.unit} ${formData.productName}${formData.companyName ? ` (${formData.companyName})` : ''}`;
    
    await NotificationService.sendOrderInquiry(
      formData.farmerPhone,
      dealerName,
      farmerName,
      productDetails
    );
    
    alert('WhatsApp opened for order inquiry!');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          SMS/WhatsApp Demo
        </CardTitle>
        <CardDescription>
          Demo of transaction notifications and order inquiries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Notification */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Send Transaction SMS
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Transaction Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="farmerPhone">Farmer Phone</Label>
                <Input
                  id="farmerPhone"
                  value={formData.farmerPhone}
                  onChange={(e) => setFormData({...formData, farmerPhone: e.target.value})}
                  placeholder="10-digit mobile number"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <strong>Message Preview:</strong>
                <p className="mt-1 text-gray-700">
                  {formData.quantity} {formData.unit} {formData.productName}
                  {formData.companyName ? ` (${formData.companyName})` : ''} worth ₹{formData.totalAmount.toLocaleString()} debited.
                  <br />Transaction ID: TXN######
                  <br />- {dealerName}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendNotification} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send via WhatsApp
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Order Inquiry */}
        <Button 
          onClick={handleOrderInquiry}
          variant="outline" 
          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Order Inquiry
        </Button>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Messages open in WhatsApp Web</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Works on mobile and desktop</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Logged in Firebase for tracking</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDemo;
