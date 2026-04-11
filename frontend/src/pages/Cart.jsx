import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart, removeFromCart } from '../store/cartSlice';
import api from '../api/axios';
import EmptyState from '../components/EmptyState';

const Cart = () => {
  const { items, total, restaurantId } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError('Please enter your delivery address');
      return;
    }
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Processing your order...');

    try {
      // Step 1: Add items to backend cart
      for (const item of items) {
        await api.post('/api/v1/cart/items', {
          menuItemId: item.menuItemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          restaurantId: restaurantId,
        });
      }

      // Step 2: Place order
      const res = await api.post('/api/v1/orders', {
        restaurantId: restaurantId,
        deliveryAddress: address,
        deliveryLat: 26.8467,
        deliveryLng: 80.9462,
        paymentMethod: 'ONLINE',
      });

      setMessage('✅ Order placed successfully!');
      dispatch(clearCart());
      
      // Redirect to orders page after 1 second
      setTimeout(() => {
        navigate('/orders');
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to place order. Please try again.';
      setError(errorMsg);
      setMessage('');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            message="Add items from a restaurant to get started"
          />
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-4 border text-sm ${
            message.includes('✅')
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Cart Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {items.map((item) => (
            <div
              key={item.menuItemId}
              className="flex justify-between items-center py-3 border-b last:border-0"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.itemName}</p>
                <p className="text-gray-500 text-sm">
                  ₹{item.unitPrice} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold">
                  ₹{(item.unitPrice * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => dispatch(removeFromCart(item.menuItemId))}
                  className="text-red-500 hover:text-red-700 font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="font-bold text-lg">Subtotal</span>
            <span className="font-bold text-xl text-primary">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <label className="block font-bold text-gray-800 mb-3">
            📍 Delivery Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your complete delivery address (street, building, landmark)..."
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary resize-none"
            rows={3}
          />
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 mb-6 border border-orange-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !address.trim()}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '⏳ Placing your order...' : `Place Order • ₹${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Cart;