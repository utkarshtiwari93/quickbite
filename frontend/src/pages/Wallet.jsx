import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balRes, transRes] = await Promise.all([
        api.get('/api/v1/wallet/balance'),
        api.get('/api/v1/wallet/transactions'),
      ]);
      setBalance(balRes.data.data?.balance || 0);
      setTransactions(transRes.data.data || []);
    } catch (err) {
      console.error('Wallet fetch error:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage('❌ Please log in again to access your wallet');
      } else if (err.response?.status === 404) {
        // Wallet might not exist yet - show zero balance
        setBalance(0);
        setTransactions([]);
      } else {
        setMessage('❌ Failed to load wallet data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupAmount || topupAmount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/api/v1/wallet/topup', {
        amount: parseFloat(topupAmount),
      });
      setBalance(res.data.data?.balance || 0);
      setMessage('✅ Wallet topped up successfully!');
      setTopupAmount('');
      setShowTopup(false);
      setTimeout(() => setMessage(''), 3000);
      fetchWalletData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to process top-up');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">💳 My Wallet</h1>

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

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary to-orange-500 text-white rounded-3xl p-8 mb-8 shadow-lg">
          <p className="text-orange-100 mb-2 text-sm font-medium uppercase tracking-wide">
            Wallet Balance
          </p>
          <h2 className="text-5xl font-bold mb-6">₹{balance.toFixed(2)}</h2>
          <button
            onClick={() => setShowTopup(true)}
            className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition"
          >
            + Add Money
          </button>
        </div>

        {/* Top-up Modal */}
        <Modal isOpen={showTopup} onClose={() => setShowTopup(false)} title="Add Money to Wallet">
          <form onSubmit={handleTopup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                required
                min="1"
                step="1"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              💡 Common amounts: ₹100, ₹500, ₹1000
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Add Money'}
              </button>
              <button
                type="button"
                onClick={() => setShowTopup(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Transactions */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
          
          {transactions.length === 0 ? (
            <EmptyState 
              icon="📊" 
              title="No transactions yet" 
              message="Your transaction history will appear here"
            />
          ) : (
            <div className="space-y-3">
              {transactions.map((trans) => (
                <div
                  key={trans.id}
                  className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`text-2xl ${
                      trans.type === 'CREDIT' ? '⬆️ text-green-600' : '⬇️ text-red-600'
                    }`}>
                      {trans.type === 'CREDIT' ? '⬆️' : '⬇️'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {trans.description || (trans.type === 'CREDIT' ? 'Top-up' : 'Order Payment')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(trans.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${
                    trans.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trans.type === 'CREDIT' ? '+' : '-'}₹{trans.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
