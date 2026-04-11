import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess, setError as setAuthError, setLoading } from '../store/authSlice';
import api from '../api/axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Step 1: Login
      const loginRes = await api.post('/api/v1/auth/login', form);
      const { accessToken, refreshToken, role, userId } = loginRes.data.data;
      
      // Step 2: Fetch complete user profile with fullName, email, phone
      // Pass token directly in this request to ensure it's sent
      const profileRes = await api.get('/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      const { fullName, email, phone, id } = profileRes.data.data;

      // Step 3: Store in Redux and localStorage
      dispatch(loginSuccess({
        token: accessToken,
        user: {
          id: id || userId,
          email,
          phone,
          fullName,
          role,
        },
      }));
      navigate('/');
    } catch (err) {
      console.error('Login error:', err.response?.status, err.response?.data);
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      dispatch(setAuthError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🍔</h1>
          <h2 className="text-2xl font-bold text-gray-800">QuickBite</h2>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;