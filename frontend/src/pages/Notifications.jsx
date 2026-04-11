import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const notificationTypes = {
  ORDER: { emoji: '📦', bg: 'bg-blue-50', icon: '🎯' },
  PAYMENT: { emoji: '💳', bg: 'bg-green-50', icon: '✅' },
  DELIVERY: { emoji: '🚗', bg: 'bg-orange-50', icon: '📍' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
    // Poll every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/v1/notifications');
      // Handle both empty array and null response
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setNotifications([]);
      } else {
        // On other errors, just show empty list to avoid breaking UI
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.patch(`/api/v1/notifications/${notifId}/read`);
      setMessage('✅ Marked as read');
      setTimeout(() => setMessage(''), 2000);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/api/v1/notifications/read-all');
      setMessage('✅ All marked as read');
      setTimeout(() => setMessage(''), 2000);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🔔 Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-500">
                You have <span className="font-bold text-primary">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-primary font-semibold hover:text-orange-600 text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications yet"
            message="You're all caught up!"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const typeConfig = notificationTypes[notif.type] || notificationTypes.ORDER;
              return (
                <div
                  key={notif.id}
                  className={`${typeConfig.bg} rounded-xl p-4 flex justify-between items-start border-l-4 ${
                    notif.type === 'ORDER' ? 'border-blue-400' :
                    notif.type === 'PAYMENT' ? 'border-green-400' :
                    'border-orange-400'
                  } ${!notif.isRead ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{typeConfig.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-xs bg-white text-primary px-3 py-1 rounded-full font-semibold hover:bg-primary hover:text-white transition whitespace-nowrap ml-2"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
