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
      const response = await paymentApis.getTransactions();
      console.log(response, "Response Data");
      if (response && response.orders) {
        // Transform the API data to match our component structure
        const transformedTransactions = response.orders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          transactionId: Array.isArray(order.paymentResponse) 
            ? order.paymentResponse[0]?.cf_payment_id || 'N/A'
            : order.paymentResponse?.cf_order_id || 'N/A',
          planName: order.planName || getPlanName(order.planId, order.amount),
          duration: getPlanDuration(order.amount),
          amount: order.amount,
          status: order.status.toLowerCase(),
          paymentMethod: getPaymentMethod(order.paymentResponse),
          customerName: response.name || 'User',
          customerEmail: response.email || 'N/A',
          customerPhone: response.mobileNumber || 'N/A',
          createdAt: order.createdAt,
          expiryDate: Array.isArray(order.paymentResponse) 
            ? order.paymentResponse[0]?.order_expiry_time || null
            : order.paymentResponse?.order_expiry_time || null,
          gatewayResponse: Array.isArray(order.paymentResponse) 
            ? order.paymentResponse[0]?.payment_message || 'Transaction processed'
            : 'Order created'
        }));
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to empty array on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await paymentApis.getTransactions();
      if (response) {
        setUserProfile({
          name: response.name || 'User',
          email: response.email || 'N/A',
          phone: response.mobileNumber || 'N/A',
          createdAt: response.createdAt || new Date().toISOString(),
          hasActivePlan: response.hasActivePlan || false,
          currentActivePlans: response.currentActivePlans || []
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile({
        name: "User",
        email: "N/A",
        phone: "N/A",
        createdAt: new Date().toISOString(),
        hasActivePlan: false,
        currentActivePlans: []
      });
    }
  };

  const handleTransactionClick = (transaction) => {
    console.log("Transactions Details", transaction);
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

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Helper functions for data transformation
  const getPlanName = (planId, amount) => {
    // Use planName from API if available, otherwise fallback to amount mapping
    const planMapping = {
      1: 'Single Day Plan',
      499: 'Platinum Plan', 
      799: 'Silver Plan',
      2999: 'Premium Yearly Plan'
    };
    return planMapping[amount] || `Plan - ₹${amount}`;
  };

  const getPlanDuration = (amount) => {
    const durationMapping = {
      1: '1 Day',
      499: '5 Years',  // Based on your API data showing long expiry dates
      799: '3 Months', 
      2999: '1 Year'
    };
    return durationMapping[amount] || '1 Month';
  };

  const getPaymentMethod = (paymentResponse) => {
    if (Array.isArray(paymentResponse) && paymentResponse[0]) {
      const method = paymentResponse[0].payment_group || paymentResponse[0].payment_method;
      if (typeof method === 'object' && method.upi) return 'UPI';
      if (method === 'upi') return 'UPI';
      return method?.toUpperCase() || 'Online Payment';
    }
    return 'Online Payment';
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  return (
    <>
      <Header profileText={"My Transactions"} showProfileHeader={true} showEnglishText={true} hideEditIcon={true}/>
      <PageTitleCard
        titleHi={""}
        titleEn={"Transaction History"} 
        customEngFontSize={"14px"}
        customFontSize={"21px"}
        
        // fontEnglish={true}
        
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
        {/* {userProfile && (
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
        )} */}

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
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-gray-200 mt-2 mb-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 font-eng">Txn Id :</span>
                          <span className="text-sm font-medium text-blue-600 font-eng">{transaction.transactionId}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.planName === 'Platinum Plan' || transaction.planName === 'Platinum' 
                            ? 'bg-gray-200 text-gray-800' 
                            : 'bg-yellow-200 text-yellow-800'
                        } font-eng`}>
                          {transaction.planName === 'Platinum Plan' || transaction.planName === 'Platinum' ? 'Platinum' : 'Gold'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="font-eng">
                          <span className="font-medium">Valid till:</span> 
                          <span className={`ml-1 ${isExpired(transaction.expiryDate) ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatDateOnly(transaction.expiryDate)}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-[#9A283D] font-eng">
                          ₹{transaction.amount}
                        </div>
                      </div>
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
                      <span className={`mt-1 inline-block px-3 py-1 rounded-full font-eng text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
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
                    {selectedTransaction.status === 'SUCCESS' && (
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
                {selectedTransaction.status === 'SUCCESS' && (
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

export default Transactions;
