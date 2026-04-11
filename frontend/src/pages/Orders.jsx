import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import OrderStatusBadge from '../components/OrderStatusBadge';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/v1/orders');
      setOrders(res.data.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Please log in to view your orders');
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📦 My Orders</h1>
        <p className="text-gray-500 mb-6">Track and manage your delivery orders</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            message="Start ordering from your favorite restaurants!"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                onClick={() => navigate(`/track/${order.id}`)}
              >
                {/* Order Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {order.orderNumber}
                      </p>
                      <p className="text-gray-500 text-sm">
                        🕐 {new Date(order.placedAt).toLocaleString()}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <p className="text-xs text-gray-500 font-semibold mb-3 uppercase">Items</p>
                  <div className="space-y-2">
                    {order.items?.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-700">
                          {item.itemName} × {item.quantity}
                        </span>
                        <span className="text-gray-700 font-semibold">
                          ₹{item.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="text-xs text-gray-500 pt-2">
                        and {order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total & Action */}
                <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total Amount</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-primary">
                      ₹{order.totalAmount?.toFixed(2)}
                    </span>
                    <span className="text-primary font-semibold text-sm">
                      →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Order More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;