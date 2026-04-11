import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import api from '../api/axios';
import MenuItem from '../components/MenuItem';
import LoadingSpinner from '../components/LoadingSpinner';

const Restaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const res = await api.get(`/api/v1/restaurants/${id}`);
      setRestaurant(res.data.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load restaurant');
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await api.get(`/api/v1/restaurants/${id}/menu`);
      setMenu(res.data.data || []);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    if (!restaurant?.open) {
      setMessage('Restaurant is currently closed. Please try again later.');
      return;
    }
    dispatch(addToCart({
      menuItemId: item.id,
      itemName: item.name,
      unitPrice: item.price,
      restaurantId: Number(id),
    }));
    setAdded(item.id);
    setMessage(`✅ ${item.name} added to cart!`);
    setTimeout(() => {
      setAdded(null);
      setMessage('');
    }, 1000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white shadow-sm px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {restaurant?.name}
              </h1>
              <p className="text-gray-500 mt-1">
                {restaurant?.cuisineType} • {restaurant?.city}
              </p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              restaurant?.open
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {restaurant?.open ? '● Open' : '● Closed'}
            </span>
          </div>

          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <span>⭐ {restaurant?.avgRating || '4.0'}</span>
            <span>🕒 {restaurant?.deliveryTime} mins</span>
            <span>₹{restaurant?.minOrder} minimum</span>
          </div>

          {!restaurant?.open && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              🕐 This restaurant is currently closed. Please check back soon!
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`max-w-4xl mx-auto px-6 mt-4 p-3 rounded-lg text-sm font-medium ${
          message.includes('✅')
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Menu */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {menu.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items available</p>
          </div>
        ) : (
          menu.map((category) => {
            // Filter items that are available
            const availableItems = (category.items || []).filter(
              (item) => item.available !== false
            );

            return (
              <div key={category.id} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                  {category.name}
                </h2>
                {availableItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No items available in this category</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableItems.map((item) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        onAdd={() => handleAddToCart(item)}
                        added={added === item.id}
                        disabled={!restaurant?.open}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Cart Button */}
      {items.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30">
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary text-white px-8 py-4 rounded-full shadow-lg font-semibold text-lg hover:bg-orange-600 transition"
          >
            🛒 View Cart ({items.length} items)
          </button>
        </div>
      )}
    </div>
  );
};

export default Restaurant;