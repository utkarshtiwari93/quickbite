import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const DeliveryDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState({
    latitude: 26.8467, longitude: 80.9462
  });

  const [registerForm, setRegisterForm] = useState({
    name: user?.fullName || '',
    phone: ''
  });

  useEffect(() => {
    checkRegistration();
  }, []);

  const checkRegistration = async () => {
    try {
      await api.get('/api/v1/delivery/agent/availability');
      setIsRegistered(true);
      fetchOrders();
    } catch (err) {
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/v1/delivery/agent/me/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/delivery/agent/register', registerForm);
      setIsRegistered(true);
      setMessage('Registered successfully! ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleUpdateLocation = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        await api.post('/api/v1/delivery/agent/location', loc);
        setLocation(loc);
        setMessage('Location updated! ✅');
        setTimeout(() => setMessage(''), 3000);
      }, async () => {
        // Fallback to default location
        await api.post('/api/v1/delivery/agent/location', location);
        setMessage('Location updated! ✅');
        setTimeout(() => setMessage(''), 3000);
      });
    } catch (err) {
      setMessage('Failed to update location');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.patch(`/api/v1/delivery/${orderId}/status`, { status });
      setMessage(`Status updated to ${status}! ✅`);
      fetchOrders();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update status');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await api.patch('/api/v1/delivery/agent/availability');
      setMessage('Availability updated! ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update availability');
    }
  };

  if (loading) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            🚗 Delivery Dashboard
          </h1>
          <p className="text-gray-500">Manage your deliveries</p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* Not Registered */}
        {!isRegistered ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Register as Delivery Partner
            </h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                placeholder="Full Name"
                required
                className="w-full border rounded-lg px-4 py-3"
                value={registerForm.name}
                onChange={e => setRegisterForm({
                  ...registerForm, name: e.target.value
                })}
              />
              <input
                placeholder="Phone Number"
                required
                className="w-full border rounded-lg px-4 py-3"
                value={registerForm.phone}
                onChange={e => setRegisterForm({
                  ...registerForm, phone: e.target.value
                })}
              />
              <button type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold">
                Register
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleUpdateLocation}
                className="bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600"
              >
                📍 Update My Location
              </button>
              <button
                onClick={handleToggleAvailability}
                className="bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600"
              >
                🟢 Toggle Availability
              </button>
            </div>

            {/* Assigned Orders */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📦 My Deliveries
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">🚗</div>
                  <p>No deliveries assigned yet</p>
                  <p className="text-sm mt-1">
                    Make sure you're marked as available!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id}
                      className="border rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800">
                            Order #{order.orderId}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Status: {order.status}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        {order.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateStatus(
                              order.orderId, 'PICKED_UP'
                            )}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold"
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {order.status === 'PICKED_UP' && (
                          <button
                            onClick={() => handleUpdateStatus(
                              order.orderId, 'DELIVERED'
                            )}
                            className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold"
                          >
                            Mark Delivered ✅
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;