import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderStatusBadge from '../components/OrderStatusBadge';

const statusSequence = ['ASSIGNED', 'PICKED_UP', 'DELIVERED'];

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderTracking();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrderTracking, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      const res = await api.get(`/api/v1/delivery/${orderId}/track`);
      setOrder(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">❌</p>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return <LoadingSpinner />;

  const currentStatusIndex = statusSequence.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📍 Order Tracking</h1>
        <p className="text-gray-500 mb-8">Order ID: {order.id}</p>

        {/* Current Status Card */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-3xl p-8 mb-8 shadow-lg">
          <p className="text-blue-100 text-sm mb-2 uppercase tracking-wide">Current Status</p>
          <h2 className="text-4xl font-bold mb-4">
            {order.status === 'ASSIGNED' && '📦 Assigned to Driver'}
            {order.status === 'PICKED_UP' && '🚗 On the way'}
            {order.status === 'DELIVERED' && '✨ Delivered'}
          </h2>
          <p className="text-blue-100 text-lg">
            {new Date(order.updatedAt).toLocaleString()}
          </p>
        </div>

        {/* Driver Info */}
        {order.deliveryAgent && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🚗 Driver Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name</span>
                <span className="font-semibold text-gray-800">{order.deliveryAgent.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phone</span>
                <span className="font-semibold text-gray-800">{order.deliveryAgent.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-semibold text-gray-800">{order.deliveryAgent.vehicleType || '🏍️ Two Wheeler'}</span>
              </div>
              {order.deliveryAgent.latitude && order.deliveryAgent.longitude && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mt-4">
                  📍 Location: {order.deliveryAgent.latitude.toFixed(4)}, {order.deliveryAgent.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-8">Timeline</h3>
          <div className="space-y-6">
            {statusSequence.map((status, index) => (
              <div key={status} className="flex gap-4">
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      index <= currentStatusIndex
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-300 border-gray-300'
                    }`}
                  ></div>
                  {index < statusSequence.length - 1 && (
                    <div
                      className={`w-1 h-8 ${
                        index < currentStatusIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                </div>

                {/* Status content */}
                <div className="pb-4 flex-1">
                  <OrderStatusBadge status={status} size="sm" />
                  <p className="text-gray-600 mt-2">
                    {status === 'ASSIGNED' && 'Driver has been assigned to your order'}
                    {status === 'PICKED_UP' && 'Driver picked up your order'}
                    {status === 'DELIVERED' && 'Order delivered successfully'}
                  </p>
                  {index <= currentStatusIndex && order[`${status.toLowerCase()}At`] && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order[`${status.toLowerCase()}At`]).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">📦 Order Details</h3>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-semibold text-gray-800">{item.itemName}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-gray-800">₹{item.totalPrice?.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t-2">
              <span className="text-gray-600 font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-primary">
                ₹{order.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏠 Delivery Address</h3>
          <p className="text-gray-700 text-lg">{order.deliveryAddress}</p>
          {order.deliveryLat && order.deliveryLng && (
            <p className="text-sm text-gray-500 mt-2">
              📍 {order.deliveryLat.toFixed(4)}, {order.deliveryLng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
