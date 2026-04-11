const RestaurantCard = ({ restaurant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Restaurant Image Placeholder */}
      <div className="bg-orange-100 h-48 flex items-center justify-center">
        <span className="text-6xl">🍽️</span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800">
            {restaurant.name}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            restaurant.open
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}>
            {restaurant.open ? '● Open' : '● Closed'}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-3">
          {restaurant.cuisineType} • {restaurant.city}
        </p>

        <div className="flex justify-between text-sm text-gray-600">
          <span>⭐ {restaurant.avgRating || '4.0'}</span>
          <span>🕒 {restaurant.deliveryTime || 30} mins</span>
          <span>₹{restaurant.minOrder || 0} min</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;