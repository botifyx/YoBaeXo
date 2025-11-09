import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Download, CreditCard, Calendar, Hash, Play, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { razorpayService } from '../services/razorpay';

interface PaymentHistoryItem {
  id: string;
  userId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  createdAt: string;
  notes?: Record<string, any>;
}

interface PaymentHistoryProps {
  maxItems?: number;
  showDownloadButton?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  maxItems = 10,
  showDownloadButton = true,
  page = 1,
  onPageChange
}) => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const { currentUser, getAuthToken } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchPaymentHistory();
    } else {
      setIsLoading(false);
      setError('Please log in to view payment history');
    }
  }, [currentUser, page, maxItems]);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error('Authentication token not available');
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');
      
      const response = await fetch(`${baseUrl}/payment-history?page=${page}&limit=${maxItems}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to fetch payment history');
      }

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalPayments: 0,
          hasNextPage: false,
          hasPreviousPage: false
        });
      } else {
        throw new Error(data.error || 'Failed to fetch payment history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment history');
      console.error('Error fetching payment history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'initiated':
      case 'started':
        return <Clock className="h-5 w-5 text-blue-400" />;
      case 'created':
        return <Clock className="h-5 w-5 text-blue-400" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'success':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'cancelled':
      case 'canceled':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'initiated':
      case 'started':
      case 'created':
        return 'text-blue-400 bg-blue-900/20';
      case 'pending':
      case 'processing':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'success':
      case 'completed':
        return 'text-green-400 bg-green-900/20';
      case 'failed':
        return 'text-red-400 bg-red-900/20';
      case 'cancelled':
      case 'canceled':
        return 'text-gray-400 bg-gray-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'initiated':
        return 'Payment Started';
      case 'started':
        return 'Payment Started';
      case 'created':
        return 'Order Created';
      case 'pending':
        return 'Processing';
      case 'processing':
        return 'Processing';
      case 'success':
        return 'Success';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
      case 'canceled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentTimeline = (status: string) => {
    const timeline = [
      { status: 'initiated', label: 'Payment Started', completed: ['initiated', 'created', 'pending', 'processing', 'success', 'completed'].includes(status.toLowerCase()) },
      { status: 'created', label: 'Order Created', completed: ['created', 'pending', 'processing', 'success', 'completed'].includes(status.toLowerCase()) },
      { status: 'pending', label: 'Processing', completed: ['pending', 'processing', 'success', 'completed'].includes(status.toLowerCase()) },
      { status: 'processing', label: 'Verifying', completed: ['processing', 'success', 'completed'].includes(status.toLowerCase()) },
      { status: 'success', label: 'Success', completed: ['success', 'completed'].includes(status.toLowerCase()) },
      { status: 'completed', label: 'Completed', completed: ['completed'].includes(status.toLowerCase()) },
    ];

    return status.toLowerCase() === 'failed' || status.toLowerCase() === 'cancelled'
      ? [
          { status: 'initiated', label: 'Payment Started', completed: true },
          { status: 'processing', label: 'Processing', completed: true },
          { status: status.toLowerCase(), label: getStatusLabel(status), completed: false },
        ]
      : timeline;
  };

  const downloadReceipt = async (payment: PaymentHistoryItem) => {
    // Create a downloadable receipt
    const receiptData = {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: payment.amount / 100, // Convert from paise to rupees
      currency: payment.currency,
      date: payment.createdAt,
      status: payment.status,
      receipt: payment.receipt || 'N/A',
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.paymentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Payment History
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Payment History
        </h3>
        <div className="text-center py-8">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-red-300 mb-2">Unable to Load Payment History</h4>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchPaymentHistory}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
            {!currentUser && (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Login First
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayedPayments = payments.slice(0, maxItems);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Payment History
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {currentUser ?
              `Showing ${payments.length} of ${pagination.totalPayments} payments` :
              'Please log in to view your payment history'
            }
          </p>
        </div>
        <button
          onClick={fetchPaymentHistory}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors self-start"
          disabled={isLoading}
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {displayedPayments.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-300 mb-2">No Payment History</h4>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            {currentUser ?
              "You haven't made any payments yet. Support YoBaeXo by making a donation and help create more amazing music!" :
              "Please log in to view your payment history."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {currentUser ? (
              <button
                onClick={() => window.location.href = '/donate'}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Make a Donation
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Login to View History
              </button>
            )}
            {currentUser && (
              <button
                onClick={fetchPaymentHistory}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-cyan-400/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(payment.status)}
                    <h4 className="text-white font-semibold">Music License</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                  
                  {/* Payment Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      {getPaymentTimeline(payment.status).map((step, index, array) => (
                        <React.Fragment key={step.status}>
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              step.completed
                                ? (['success', 'completed'].includes(payment.status.toLowerCase())
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-500 text-white')
                                : 'bg-gray-600 text-gray-400'
                            }`}>
                              {step.completed ? (
                                step.status === 'initiated' ? <Play className="h-3 w-3" /> :
                                step.status === 'completed' ? <CheckCircle className="h-3 w-3" /> :
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              )}
                            </div>
                            <span className={`text-xs mt-1 text-center ${
                              step.completed ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          {index < array.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${
                              array[index + 1].completed ? 'bg-blue-500' : 'bg-gray-600'
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Hash className="h-4 w-4" />
                      <span>Order: {payment.orderId?.slice(-8) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{payment.createdAt ? formatDate(payment.createdAt) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white font-bold text-lg">
                    {razorpayService.formatCurrency(payment.amount / 100, payment.currency)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                  Payment ID: {payment.paymentId}
                </div>
                
                {showDownloadButton && payment.status === 'completed' && (
                  <button
                    onClick={() => downloadReceipt(payment)}
                    className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-md transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {payments.length > maxItems && (
        <div className="text-center mt-4">
          <button
            onClick={() => {
              if (onPageChange) {
                onPageChange(page + 1);
              }
            }}
            className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
          >
            Show {payments.length - maxItems} more transactions
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={!pagination.hasPreviousPage}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;