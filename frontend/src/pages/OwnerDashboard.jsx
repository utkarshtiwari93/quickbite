import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const OwnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showCreateRestaurant, setShowCreateRestaurant] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');

  const [restaurantForm, setRestaurantForm] = useState({
    name: '', description: '', cuisineType: '',
    address: '', city: '', phone: '', email: '',
    deliveryTime: 30, minOrder: 0,
    lat: 26.8467, lng: 80.9462
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', displayOrder: 1
  });

  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '',
    isVeg: true, imageUrl: ''
  });

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const fetchMyRestaurant = async () => {
    try {
      const res = await api.get('/api/v1/restaurants');
      const restaurants = res.data.data || [];
      
      if (restaurants.length === 0) {
        setLoading(false);
        return;
      }

      // Find restaurant by comparing numeric IDs (handle string/number type mismatch)
      const myRestaurant = restaurants.find(
        r => Number(r.ownerId) === Number(user?.id)
      );

      if (myRestaurant) {
        setRestaurant(myRestaurant);
        await Promise.all([
          fetchMenu(myRestaurant.id),
          fetchOrders(myRestaurant.id)
        ]);
      } else {
        console.warn(`No restaurant found for owner ID: ${user?.id}`);
      }
    } catch (err) {
      console.error('Failed to fetch restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async (restaurantId) => {
    try {
      const res = await api.get(
        `/api/v1/restaurants/${restaurantId}/menu`
      );
      setMenu(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async (restaurantId) => {
    try {
      const res = await api.get(
        `/api/v1/orders?restaurantId=${restaurantId}`
      );
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/restaurants', restaurantForm);
      setMessage('Restaurant created! ✅');
      setShowCreateRestaurant(false);
      fetchMyRestaurant();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await api.patch(
        `/api/v1/restaurants/${restaurant.id}/status`
      );
      setRestaurant(res.data.data);
      setMessage(`Restaurant is now ${res.data.data.open ? 'OPEN' : 'CLOSED'}!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/api/v1/restaurants/${restaurant.id}/categories`,
        categoryForm
      );
      setMessage('Category added! ✅');
      setShowAddCategory(false);
      fetchMenu(restaurant.id);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to add category');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/api/v1/restaurants/${restaurant.id}/categories/${selectedCategory}/items`,
        itemForm
      );
      setMessage('Item added! ✅');
      setShowAddItem(false);
      fetchMenu(restaurant.id);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to add item');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/api/v1/orders/${orderId}/status`, { status: newStatus });
      setMessage(`Order status updated to ${newStatus}! ✅`);
      fetchOrders(restaurant.id);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update order status');
    }
  };

  if (loading) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🏪 Owner Dashboard
            </h1>
            <p className="text-gray-500">
              Manage your restaurant and menu
            </p>
          </div>
          {!restaurant && (
            <button
              onClick={() => setShowCreateRestaurant(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              + Create Restaurant
            </button>
          )}
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* No Restaurant */}
        {!restaurant ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No Restaurant Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your restaurant to start accepting orders
            </p>
            <button
              onClick={() => setShowCreateRestaurant(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create Restaurant
            </button>
          </div>
        ) : (
          <>
            {/* Restaurant Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {restaurant.name}
                  </h2>
                  <p className="text-gray-500">
                    {restaurant.cuisineType} • {restaurant.city}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>⭐ {restaurant.avgRating || '4.0'}</span>
                    <span>🕒 {restaurant.deliveryTime} mins</span>
                    <span>₹{restaurant.minOrder} min order</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-4 py-2 rounded-full font-semibold ${
                    restaurant.open
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {restaurant.open ? '● Open' : '● Closed'}
                  </span>
                  <button
                    onClick={handleToggleStatus}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Management */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  📋 Menu Management
                </h2>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-semibold"
                >
                  + Add Category
                </button>
              </div>

              {menu.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No menu items yet. Add a category first!
                </div>
              ) : (
                menu.map((category) => (
                  <div key={category.id} className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-700">
                        {category.name}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowAddItem(true);
                        }}
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>
                    <div className="space-y-3">
                      {category.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${
                                item.veg ? 'text-green-500' : 'text-red-500'
                              }`}>●</span>
                              <p className="font-medium text-gray-800">
                                {item.name}
                              </p>
                            </div>
                            <p className="text-gray-500 text-sm">
                              {item.description}
                            </p>
                          </div>
                          <p className="font-bold text-primary">
                            ₹{item.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Incoming Orders Section */}
        {restaurant && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              📥 Incoming Orders
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Orders will appear here once customers place them
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusColors = {
                    PENDING: 'bg-yellow-100 text-yellow-700',
                    CONFIRMED: 'bg-blue-100 text-blue-700',
                    PREPARING: 'bg-purple-100 text-purple-700',
                    READY: 'bg-indigo-100 text-indigo-700',
                    CANCELLED: 'bg-red-100 text-red-700',
                  };

                  return (
                    <div
                      key={order.id}
                      className="border rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Customer: {order.customerName || 'Unknown'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {new Date(order.placedAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[order.status] || statusColors.PENDING
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-600 font-semibold mb-2 uppercase">
                          Items
                        </p>
                        <div className="space-y-1 text-sm">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-gray-700"
                            >
                              <span>
                                {item.itemName} × {item.quantity}
                              </span>
                              <span className="font-semibold">
                                ₹{item.totalPrice}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex justify-between items-center mb-3 py-3 border-t">
                        <span className="text-gray-600 font-semibold">
                          Total Amount
                        </span>
                        <span className="text-lg font-bold text-primary">
                          ₹{order.totalAmount}
                        </span>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="flex gap-2">
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() =>
                                handleOrderStatusUpdate(order.id, 'CONFIRMED')
                              }
                              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                            >
                              ✅ Confirm Order
                            </button>
                            <button
                              onClick={() =>
                                handleOrderStatusUpdate(order.id, 'CANCELLED')
                              }
                              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() =>
                              handleOrderStatusUpdate(order.id, 'PREPARING')
                            }
                            className="w-full bg-purple-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-600 transition"
                          >
                            👨‍🍳 Start Preparing
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() =>
                              handleOrderStatusUpdate(order.id, 'READY')
                            }
                            className="w-full bg-indigo-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition"
                          >
                            🎉 Mark as Ready
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Restaurant Modal */}
        {showCreateRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Restaurant</h2>
              <form onSubmit={handleCreateRestaurant} className="space-y-4">
                <input placeholder="Restaurant Name" required
                  className="w-full border rounded-lg px-4 py-3"
                  value={restaurantForm.name}
                  onChange={e => setRestaurantForm({
                    ...restaurantForm, name: e.target.value
                  })} />
                <input placeholder="Description"
                  className="w-full border rounded-lg px-4 py-3"
                  value={restaurantForm.description}
                  onChange={e => setRestaurantForm({
                    ...restaurantForm, description: e.target.value
                  })} />
                <input placeholder="Cuisine Type (e.g. Italian)"
                  className="w-full border rounded-lg px-4 py-3"
                  value={restaurantForm.cuisineType}
                  onChange={e => setRestaurantForm({
                    ...restaurantForm, cuisineType: e.target.value
                  })} />
                <input placeholder="Address" required
                  className="w-full border rounded-lg px-4 py-3"
                  value={restaurantForm.address}
                  onChange={e => setRestaurantForm({
                    ...restaurantForm, address: e.target.value
                  })} />
                <input placeholder="City" required
                  className="w-full border rounded-lg px-4 py-3"
                  value={restaurantForm.city}
                  onChange={e => setRestaurantForm({
                    ...restaurantForm, city: e.target.value
                  })} />
                <input placeholder="Phone"
                  className="w-full border rounded-lg px-4 py-3"
                  value={restaurantForm.phone}
                  onChange={e => setRestaurantForm({
                    ...restaurantForm, phone: e.target.value
                  })} />
                <div className="flex gap-3">
                  <input placeholder="Min Order" type="number"
                    className="w-full border rounded-lg px-4 py-3"
                    value={restaurantForm.minOrder}
                    onChange={e => setRestaurantForm({
                      ...restaurantForm, minOrder: e.target.value
                    })} />
                  <input placeholder="Delivery Time (mins)" type="number"
                    className="w-full border rounded-lg px-4 py-3"
                    value={restaurantForm.deliveryTime}
                    onChange={e => setRestaurantForm({
                      ...restaurantForm, deliveryTime: e.target.value
                    })} />
                </div>
                <div className="flex gap-3">
                  <button type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold">
                    Create
                  </button>
                  <button type="button"
                    onClick={() => setShowCreateRestaurant(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input placeholder="Category Name (e.g. Pizzas)" required
                  className="w-full border rounded-lg px-4 py-3"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({
                    ...categoryForm, name: e.target.value
                  })} />
                <input placeholder="Description"
                  className="w-full border rounded-lg px-4 py-3"
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({
                    ...categoryForm, description: e.target.value
                  })} />
                <div className="flex gap-3">
                  <button type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold">
                    Add Category
                  </button>
                  <button type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <input placeholder="Item Name" required
                  className="w-full border rounded-lg px-4 py-3"
                  value={itemForm.name}
                  onChange={e => setItemForm({
                    ...itemForm, name: e.target.value
                  })} />
                <input placeholder="Description"
                  className="w-full border rounded-lg px-4 py-3"
                  value={itemForm.description}
                  onChange={e => setItemForm({
                    ...itemForm, description: e.target.value
                  })} />
                <input placeholder="Price" type="number" required
                  className="w-full border rounded-lg px-4 py-3"
                  value={itemForm.price}
                  onChange={e => setItemForm({
                    ...itemForm, price: e.target.value
                  })} />
                <div className="flex items-center gap-3">
                  <input type="checkbox"
                    checked={itemForm.isVeg}
                    onChange={e => setItemForm({
                      ...itemForm, isVeg: e.target.checked
                    })}
                    className="w-5 h-5" />
                  <label className="text-gray-700 font-medium">
                    Vegetarian
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold">
                    Add Item
                  </button>
                  <button type="button"
                    onClick={() => setShowAddItem(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;