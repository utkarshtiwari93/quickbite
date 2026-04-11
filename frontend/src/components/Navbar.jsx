import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      <Link to="/" className="text-2xl font-bold text-primary">
        🍔 QuickBite
      </Link>

      <div className="flex items-center gap-6">

        {/* CUSTOMER links */}
        {user?.role === 'CUSTOMER' && (
          <>
            <Link to="/" className="text-gray-600 hover:text-primary transition">
              🏠 Home
            </Link>
            <Link to="/orders" className="text-gray-600 hover:text-primary transition">
              📦 Orders
            </Link>
            <Link to="/wallet" className="text-gray-600 hover:text-primary transition">
              💳 Wallet
            </Link>
            <NotificationBell />
            <Link to="/cart" className="relative text-gray-600 hover:text-primary transition">
              🛒 Cart
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </Link>
          </>
        )}

        {/* RESTAURANT OWNER links */}
        {user?.role === 'RESTAURANT_OWNER' && (
          <>
            <Link to="/" className="text-gray-600 hover:text-primary transition">
              🏪 Dashboard
            </Link>
          </>
        )}

        {/* DELIVERY PARTNER links */}
        {user?.role === 'DELIVERY_PARTNER' && (
          <>
            <Link to="/" className="text-gray-600 hover:text-primary transition">
              🚗 My Deliveries
            </Link>
          </>
        )}

        <span className="text-gray-600 font-medium">
          Hi, {user?.fullName || 'User'}!
        </span>

        {/* Profile & Role Badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="text-primary font-semibold hover:text-orange-600 transition text-sm"
          >
            👤 Profile
          </Link>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            user?.role === 'CUSTOMER' ? 'bg-blue-100 text-blue-600' :
            user?.role === 'RESTAURANT_OWNER' ? 'bg-green-100 text-green-600' :
            'bg-orange-100 text-orange-600'
          }`}>
            {user?.role === 'CUSTOMER' ? '👤 Customer' :
             user?.role === 'RESTAURANT_OWNER' ? '🏪 Owner' :
             '🚗 Driver'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;