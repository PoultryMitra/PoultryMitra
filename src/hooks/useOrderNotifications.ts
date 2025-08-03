import { useState, useEffect } from 'react';
import { orderService, type OrderNotification } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to notifications
    const unsubscribe = orderService.subscribeToOrderNotifications(
      currentUser.uid,
      (notificationsList) => {
        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter(n => !n.read).length);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const markAsRead = async (notificationId: string) => {
    try {
      await orderService.markNotificationAsRead(notificationId);
      // The subscription will automatically update the state
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead
  };
};
