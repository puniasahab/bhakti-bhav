import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import PageTitleCard from '../components/PageTitleCard';
import Loader from '../components/Loader';
import { paymentApis } from '../api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTransactions();
    fetchUserProfile();
    
    // Check if redirected from payment success
    if (location.state?.paymentSuccess) {
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Clear the state to prevent showing message on refresh
        navigate('/transactions', { replace: true });
      }, 5000);
    }
  }, [location.state, navigate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await paymentApis.getTransactions();
      console.log(response.orders, "Response Data");
      if (response) {
        // Transform the API data to match our component structure
        const transformedTransactions = response.orders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          transactionId: order.paymentResponse?.[0]?.cf_payment_id || order.paymentResponse?.cf_order_id || 'N/A',
          planName: getPlanName(order.planId, order.amount),
          duration: getPlanDuration(order.amount),
          amount: order.amount,
          status: order.status.toLowerCase(),
          paymentMethod: getPaymentMethod(order.paymentResponse),
          customerName: response.data.name || 'User',
          customerEmail: response.data.email || 'N/A',
          customerPhone: response.data.mobileNumber || 'N/A',
          createdAt: order.createdAt,
          expiryDate: getExpiryDate(order.createdAt, order.amount),
          gatewayResponse: order.paymentResponse?.[0]?.payment_message || 'Transaction processed'
        }));
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Mock data for demo purposes
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // Replace with actual API call
      const response = await paymentApis.getTransactions();
      if (response && response.data) {
        setUserProfile({
          name: response.data.name || 'User',
          email: response.data.email || 'N/A',
          phone: response.data.mobileNumber || 'N/A',
          createdAt: response.data.createdAt || new Date().toISOString(),
          hasActivePlan: response.data.hasActivePlan || false,
          currentActivePlans: response.data.currentActivePlans || []
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(mockUserProfile);
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  // Helper functions for data transformation
  const getPlanName = (planId, amount) => {
    const planMapping = {
      1: 'Basic Plan',
      499: 'Premium Monthly Plan', 
      799: 'Premium Plus Plan',
      2999: 'Premium Yearly Plan'
    };
    return planMapping[amount] || `Plan - ₹${amount}`;
  };

  const getPlanDuration = (amount) => {
    const durationMapping = {
      1: '1 Day',
      499: '1 Month',
      799: '3 Months', 
      2999: '1 Year'
    };
    return durationMapping[amount] || '1 Month';
  };

  const getPaymentMethod = (paymentResponse) => {
    if (Array.isArray(paymentResponse) && paymentResponse[0]) {
      const method = paymentResponse[0].payment_group || paymentResponse[0].payment_method;
      if (typeof method === 'object' && method.upi) return 'UPI';
      return method?.toUpperCase() || 'Online Payment';
    }
    return 'Online Payment';
  };

  const getExpiryDate = (createdAt, amount) => {
    const date = new Date(createdAt);
    switch (amount) {
      case 1:
        date.setDate(date.getDate() + 1);
        break;
      case 499:
        date.setMonth(date.getMonth() + 1);
        break;
      case 799:
        date.setMonth(date.getMonth() + 3);
        break;
      case 2999:
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString();
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  return (
    <>
      <Header pageName={{ hi: "लेन-देन", en: "Transactions" }} />
      <PageTitleCard
        titleHi={"लेन-देन"}
        titleEn={"Transaction History"} 
        customEngFontSize={"14px"}
        customFontSize={"21px"}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Payment Success Message */}
        {showSuccessMessage && location.state?.message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="text-green-500 text-2xl mr-3">🎉</div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 font-eng">{location.state.message}</h3>
                <p className="text-green-600 font-eng">Order ID: {location.state.orderId}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Summary */}
        {userProfile && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#9A283D] font-eng">Account Summary</h2>
              <div className="text-sm text-gray-500 font-eng">
                Member since {formatDate(userProfile.createdAt)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-[#9A283D] font-eng">{userProfile.name}</div>
                <div className="text-sm text-gray-600 font-eng">{userProfile.email}</div>
                <div className="text-sm text-gray-600 font-eng">+91 {userProfile.phone}</div>
                {userProfile.hasActivePlan && (
                  <div className="text-xs text-green-600 font-eng mt-1">✅ Active Plan</div>
                )}
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 font-eng">{transactions.filter(t => t.status === 'success').length}</div>
                <div className="text-sm text-gray-600 font-eng">Successful Purchases</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 font-eng">
                  ₹{transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0)}
                </div>
                <div className="text-sm text-gray-600 font-eng">Total Spent</div>
              </div>
              {userProfile?.hasActivePlan && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 font-eng">{userProfile.currentActivePlans?.length || 0}</div>
                  <div className="text-sm text-gray-600 font-eng">Active Plans</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#9A283D] text-white p-4">
            <h2 className="text-xl font-bold font-eng">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2 font-eng">No Transactions Found</h3>
              <p className="text-gray-500 mb-4 font-eng">You haven't made any purchases yet.</p>
              <button
                onClick={() => navigate('/payment')}
                className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow hover:bg-[#7A1F2D] transition font-eng"
              >
                Browse Plans
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 font-eng">{transaction.planName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="font-eng">
                          <span className="font-medium">Amount:</span> ₹{transaction.amount}
                        </div>
                        <div className="font-eng">
                          <span className="font-medium">Date:</span> {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                        <div className="font-eng">
                          <span className="font-medium">Order ID:</span> {transaction.orderId}
                        </div>
                        {transaction.expiryDate && (
                          <div className={`font-eng ${isExpired(transaction.expiryDate) ? 'text-red-600' : 'text-green-600'}`}>
                            <span className="font-medium">
                              {isExpired(transaction.expiryDate) ? 'Expired:' : 'Expires:'} 
                            </span> {formatDate(transaction.expiryDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#9A283D] text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold font-eng">Transaction Details</h2>
              <button
                onClick={closeDetails}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg font-eng">Plan Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Plan Name</label>
                      <p className="mt-1 text-sm text-gray-900 font-eng">{selectedTransaction.planName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Duration</label>
                      <p className="mt-1 text-sm text-gray-900 font-eng">{selectedTransaction.duration}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Amount</label>
                      <p className="mt-1 text-sm text-gray-900 font-eng">₹{selectedTransaction.amount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Status</label>
                      <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg font-eng">Transaction Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Order ID</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedTransaction.orderId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Transaction ID</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedTransaction.transactionId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Payment Method</label>
                      <p className="mt-1 text-sm text-gray-900 font-eng">{selectedTransaction.paymentMethod}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Purchase Date</label>
                      <p className="mt-1 text-sm text-gray-900 font-eng">{formatDate(selectedTransaction.createdAt)}</p>
                    </div>
                    {selectedTransaction.expiryDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 font-eng">Expiry Date</label>
                        <p className={`mt-1 text-sm font-eng ${isExpired(selectedTransaction.expiryDate) ? 'text-red-600' : 'text-green-600'}`}>
                          {formatDate(selectedTransaction.expiryDate)}
                        </p>
                      </div>
                    )}
                    {selectedTransaction.status === 'success' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 font-eng">Gateway Response</label>
                        <p className="mt-1 text-sm text-gray-900 font-eng">{selectedTransaction.gatewayResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-4 font-eng">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-eng">Name</label>
                    <p className="mt-1 text-sm text-gray-900 font-eng">{selectedTransaction.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-eng">Email</label>
                    <p className="mt-1 text-sm text-gray-900 font-eng">{selectedTransaction.customerEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-eng">Phone</label>
                    <p className="mt-1 text-sm text-gray-900 font-eng">+91 {selectedTransaction.customerPhone}</p>
                  </div>
                  {selectedTransaction.gatewayResponse && selectedTransaction.status !== 'success' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-eng">Gateway Response</label>
                      <p className="mt-1 text-sm text-gray-900 font-eng">{selectedTransaction.gatewayResponse}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition font-eng"
                >
                  Close
                </button>
                {selectedTransaction.status === 'success' && (
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#9A283D] text-white rounded-md hover:bg-[#7A1F2D] transition font-eng"
                  >
                    Print Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Mock data for demo purposes
const mockUserProfile = {
  name: "New User",
  email: "user@example.com",
  phone: "+91 9876543210",
  createdAt: "2024-01-15T08:30:00Z"
};

const mockTransactions = [
  {
    id: "1",
    orderId: "ORD_1759494903800_6f6de323",
    transactionId: "TXN_CF_123456789",
    planName: "Premium Monthly Plan",
    duration: "1 Month",
    amount: 499,
    status: "success",
    paymentMethod: "Credit Card",
    customerName: "New User",
    customerEmail: "user@example.com",
    customerPhone: "+91 9876543210",
    createdAt: "2024-10-01T10:30:00Z",
    expiryDate: "2024-11-01T10:30:00Z",
    gatewayResponse: "Payment Successful"
  },
  {
    id: "2",
    orderId: "ORD_1759394903800_5e5cd212",
    transactionId: "TXN_CF_987654321",
    planName: "Premium Yearly Plan",
    duration: "1 Year",
    amount: 2999,
    status: "success",
    paymentMethod: "UPI",
    customerName: "New User",
    customerEmail: "user@example.com",
    customerPhone: "+91 9876543210",
    createdAt: "2024-09-15T14:20:00Z",
    expiryDate: "2025-09-15T14:20:00Z",
    gatewayResponse: "Payment Successful"
  },
  {
    id: "3",
    orderId: "ORD_1759294903800_4d4bc101",
    transactionId: "TXN_CF_456789123",
    planName: "Basic Monthly Plan",
    duration: "1 Month",
    amount: 199,
    status: "failed",
    paymentMethod: "Debit Card",
    customerName: "New User",
    customerEmail: "user@example.com",
    customerPhone: "+91 9876543210",
    createdAt: "2024-08-20T09:15:00Z",
    expiryDate: null,
    gatewayResponse: "Insufficient Funds"
  }
];

export default Transactions;
