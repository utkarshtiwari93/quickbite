import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for unread count
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/v1/notifications/unread-count');
      setUnreadCount(res.data.data || 0);
      setError(false);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      // Don't show error to user, just keep existing count
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnreadCount(0);
      }
    }
  };

  return (
    <Link to="/notifications" className="relative text-gray-600 hover:text-primary transition">
      🔔 Notifications
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-3 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
