import React from 'react';
import { Bell, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { type OrderNotification } from '@/services/orderService';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { unreadCount } = useOrderNotifications();

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 px-1 py-0 text-xs min-w-[1.25rem] h-5 flex items-center justify-center"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
};

interface NotificationListProps {
  maxHeight?: string;
  showAll?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({ 
  maxHeight = 'h-96', 
  showAll = false 
}) => {
  const { notifications, loading, markAsRead } = useOrderNotifications();

  const getNotificationIcon = (type: OrderNotification['type']) => {
    switch (type) {
      case 'order_request':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'order_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'order_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'order_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: OrderNotification['type']) => {
    switch (type) {
      case 'order_request':
        return 'border-l-blue-500 bg-blue-50';
      case 'order_approved':
        return 'border-l-green-500 bg-green-50';
      case 'order_rejected':
        return 'border-l-red-500 bg-red-50';
      case 'order_completed':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: OrderNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const displayNotifications = showAll ? notifications : notifications.slice(0, 10);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <Bell className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm sm:text-base text-gray-600">No notifications yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">Notifications</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Your recent order updates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className={maxHeight}>
          <div className="space-y-1 p-2 sm:p-4">
            {displayNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 sm:p-3 border-l-4 rounded-r cursor-pointer transition-colors hover:bg-gray-100 ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? 'opacity-100' : 'opacity-70'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <h4 className={`text-xs sm:text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-xs sm:text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'} line-clamp-2`}>
                      {notification.message}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {notification.createdAt.toDate().toLocaleDateString()} {notification.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notification.orderType && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {notification.orderType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {!showAll && notifications.length > 10 && (
          <div className="p-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All Notifications ({notifications.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
