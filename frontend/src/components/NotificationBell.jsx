import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState, useRef } from 'react';
import { notificationService } from '../api/services';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getNotifications();
      // API wraps in data.data
      setNotifications(data.data || data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (_) {}
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.allSettled(unread.map(n => notificationService.markAsRead(n._id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(v => !v)}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-border bg-card shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </li>
            ) : (
              notifications.map(n => (
                <li
                  key={n._id}
                  className={`px-4 py-3 cursor-pointer hover:bg-muted transition-colors ${!n.isRead ? 'bg-muted/40' : ''}`}
                  onClick={() => markRead(n._id)}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span
                        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: '#3b82f6',
                          boxShadow: '0 0 0 2px rgba(59,130,246,0.15), 0 0 6px 2px rgba(59,130,246,0.25)',
                        }}
                      />
                    )}
                    <div className={!n.isRead ? '' : 'pl-4'}>
                      <p className="text-sm leading-snug">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
