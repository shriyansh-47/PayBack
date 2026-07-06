import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { notificationService } from '../api/services';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationService.getNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifications();
  }, []);

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5 text-muted-foreground" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
      )}
    </Button>
  );
}
