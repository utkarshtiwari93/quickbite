import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import api from '../api/axios';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/api/v1/users/me', formData);
      const updatedUser = res.data.data;
      dispatch(
        loginSuccess({
          user: updatedUser,
          token: localStorage.getItem('accessToken'),
        })
      );
      setMessage('✅ Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'CUSTOMER':
        return 'bg-blue-100 text-blue-700';
      case 'RESTAURANT_OWNER':
        return 'bg-green-100 text-green-700';
      case 'DELIVERY_PARTNER':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleEmoji = () => {
    switch (user?.role) {
      case 'CUSTOMER':
        return '👤';
      case 'RESTAURANT_OWNER':
        return '🏪';
      case 'DELIVERY_PARTNER':
        return '🚗';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">👤 My Profile</h1>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Role Badge */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {user?.fullName || 'User'}
              </h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor()}`}>
                {getRoleEmoji()} {
                  user?.role === 'CUSTOMER' ? 'Customer' :
                  user?.role === 'RESTAURANT_OWNER' ? 'Restaurant Owner' :
                  user?.role === 'DELIVERY_PARTNER' ? 'Delivery Partner' :
                  'User'
                }
              </span>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary font-semibold hover:text-orange-600"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {isEditing ? (
            // Edit Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: user?.fullName || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                    });
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-lg text-gray-800 font-medium">
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="text-lg text-gray-800 font-medium">
                  {user?.phone || 'Not provided'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">User ID</p>
                <p className="text-lg font-mono text-gray-800 bg-gray-50 p-3 rounded-lg break-all">
                  {user?.id}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-700">
                  💡 To change your password or manage account security, please contact support.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
