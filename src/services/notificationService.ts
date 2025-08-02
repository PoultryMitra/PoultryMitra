import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface TransactionDetails {
  farmerName: string;
  farmerPhone: string;
  dealerName: string;
  productName: string;
  quantity: number;
  unit: string; // 'bags', 'bottles', etc.
  totalAmount: number;
  transactionId: string;
  companyName?: string;
}

export interface NotificationLog {
  type: 'transaction_sms' | 'order_whatsapp' | 'general_notification';
  recipientPhone: string;
  senderName: string;
  message: string;
  transactionId?: string;
  sentAt: Date;
  status: 'initiated' | 'sent' | 'failed';
  method: 'whatsapp' | 'sms';
}

export class NotificationService {
  
  /**
   * Send transaction notification via WhatsApp
   * Opens WhatsApp Web for dealer to send message to farmer
   */
  static async sendTransactionNotification(transaction: TransactionDetails): Promise<boolean> {
    try {
      const message = `${transaction.quantity} ${transaction.unit} ${transaction.productName}${transaction.companyName ? ` (${transaction.companyName})` : ''} worth ₹${transaction.totalAmount.toLocaleString()} debited.
Transaction ID: ${transaction.transactionId}
- ${transaction.dealerName}`;
      
      // Clean phone number (remove non-digits)
      const cleanPhone = transaction.farmerPhone.replace(/[^0-9]/g, '');
      
      // Add country code if not present
      const phoneWithCountryCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      // Log notification
      await this.logNotification({
        type: 'transaction_sms',
        recipientPhone: transaction.farmerPhone,
        senderName: transaction.dealerName,
        message: message,
        transactionId: transaction.transactionId,
        sentAt: new Date(),
        status: 'initiated',
        method: 'whatsapp'
      });
      
      return true;
    } catch (error) {
      console.error('Error sending transaction notification:', error);
      return false;
    }
  }

  /**
   * Send order inquiry via WhatsApp
   * Opens WhatsApp for farmer to send order to dealer
   */
  static async sendOrderInquiry(
    dealerPhone: string, 
    dealerName: string, 
    farmerName: string,
    productDetails: string
  ): Promise<boolean> {
    try {
      const message = `Hi ${dealerName},

I would like to inquire about: ${productDetails}

Please share availability and pricing.

Thank you!
- ${farmerName}
Via Poultry Mitra`;

      // Clean phone number
      const cleanPhone = dealerPhone.replace(/[^0-9]/g, '');
      const phoneWithCountryCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Log notification
      await this.logNotification({
        type: 'order_whatsapp',
        recipientPhone: dealerPhone,
        senderName: farmerName,
        message: message,
        sentAt: new Date(),
        status: 'initiated',
        method: 'whatsapp'
      });
      
      return true;
    } catch (error) {
      console.error('Error sending order inquiry:', error);
      return false;
    }
  }

  /**
   * Send general WhatsApp message
   */
  static sendWhatsAppMessage(phone: string, message: string): void {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const phoneWithCountryCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  }

  /**
   * Generate transaction notification message template
   */
  static createTransactionMessage(transaction: TransactionDetails): string {
    return `${transaction.quantity} ${transaction.unit} ${transaction.productName}${transaction.companyName ? ` (${transaction.companyName})` : ''} worth ₹${transaction.totalAmount.toLocaleString()} debited.
Transaction ID: ${transaction.transactionId}
Date: ${new Date().toLocaleDateString('en-IN')}
- ${transaction.dealerName}`;
  }

  /**
   * Log notification to Firebase for tracking
   */
  private static async logNotification(notification: NotificationLog): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: new Date()
      });
      console.log('Notification logged successfully');
    } catch (error) {
      console.error('Error logging notification:', error);
      // Don't throw error as this is just for logging
    }
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
      return `+91-${cleaned.substr(0, 5)}-${cleaned.substr(5)}`;
    }
    return phone;
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[^0-9]/g, '');
    // Indian mobile numbers are 10 digits
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
  }
}

export default NotificationService;
