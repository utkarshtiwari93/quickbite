import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import OwnerDashboard from './pages/OwnerDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const RoleBasedHome = () => {
  const { user } = useSelector((state) => state.auth);
  
  if (user?.role === 'RESTAURANT_OWNER') return <OwnerDashboard />;
  if (user?.role === 'DELIVERY_PARTNER') return <DeliveryDashboard />;
  return <Home />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Role based home */}
        <Route path="/" element={
          <ProtectedRoute><RoleBasedHome /></ProtectedRoute>
        } />

        {/* Customer only */}
        <Route path="/restaurant/:id" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Restaurant />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/track/:orderId" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <OrderTracking />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;