import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/api/v1/restaurants');
      // Show ALL restaurants regardless of open status
      setRestaurants(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch restaurants', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return fetchRestaurants();
    try {
      const res = await api.get(`/api/v1/search/restaurants?q=${search}`);
      setRestaurants(res.data.data || []);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Hungry? We've got you! 🍕
        </h1>
        <p className="text-orange-100 mb-6">
          Order food from the best restaurants near you
        </p>
        <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants or cuisines..."
            className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-orange-50"
          >
            Search
          </button>
        </form>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {search ? `Results for "${search}"` : 'All Restaurants'}
        </h2>

        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😔</div>
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group"
              >
                {/* Restaurant Image Placeholder */}
                <div className="bg-gradient-to-br from-orange-200 to-orange-100 h-40 flex items-center justify-center group-hover:from-orange-300 transition">
                  <span className="text-5xl">🍽️</span>
                </div>

                {/* Restaurant Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {restaurant.cuisineType} • {restaurant.city}
                      </p>
                    </div>
                    {/* Open/Closed Badge */}
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ml-2 ${
                      restaurant.open
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {restaurant.open ? '● Open' : '● Closed'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-sm text-gray-600 mb-4">
                    <span>⭐ {restaurant.avgRating || '4.0'}</span>
                    <span>🕒 {restaurant.deliveryTime} mins</span>
                  </div>

                  {/* Min Order */}
                  <div className="text-sm font-semibold text-primary">
                    Min order: ₹{restaurant.minOrder || '0'}
                  </div>

                  {/* Closed Message */}
                  {!restaurant.open && (
                    <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
                      🕐 Currently closed - will reopen soon
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;