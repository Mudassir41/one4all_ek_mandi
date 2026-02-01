'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { useNotifications } from '@/components/ui/NotificationToast';
import { ArrowLeft, Shield, CreditCard, Smartphone, Building, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingFee: number;
  estimatedTime: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [bid, setBid] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'success'>('details');
  const [orderDetails, setOrderDetails] = useState({
    deliveryAddress: '',
    deliveryDate: '',
    specialInstructions: ''
  });
  
  const { t } = useLanguage();
  const { bids } = useBidding();
  const { addNotification } = useNotifications();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app',
      processingFee: 0,
      estimatedTime: 'Instant'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building className="w-6 h-6" />,
      description: 'Pay directly from your bank account',
      processingFee: 0,
      estimatedTime: '2-5 minutes'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Pay using Visa, Mastercard, RuPay cards',
      processingFee: 2.5,
      estimatedTime: 'Instant'
    }
  ];

  useEffect(() => {
    const foundBid = bids.find(b => b.id === params.bidId && b.status === 'accepted');
    if (foundBid) {
      setBid(foundBid);
    }
  }, [params.bidId, bids]);

  const calculateTotals = () => {
    if (!bid) return { subtotal: 0, processingFee: 0, total: 0 };
    
    const subtotal = bid.amount * bid.quantity;
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    const processingFee = selectedMethod ? (subtotal * selectedMethod.processingFee) / 100 : 0;
    const total = subtotal + processingFee;

    return { subtotal, processingFee, total };
  };

  const handleProceedToPayment = () => {
    if (!orderDetails.deliveryAddress || !orderDetails.deliveryDate) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in delivery address and date.'
      });
      return;
    }
    setPaymentStep('payment');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('success');
      
      addNotification({
        type: 'success',
        title: 'Payment Successful!',
        message: 'Your order has been confirmed. The seller will be notified.'
      });
    }, 3000);
  };

  const handleBackToDashboard = () => {
    router.push('/buyer');
  };

  if (!bid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're trying to pay for doesn't exist or hasn't been accepted yet.</p>
          <Link
            href="/products"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
          >
            ← Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const { subtotal, processingFee, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/buyer" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {paymentStep === 'details' ? 'Order Details' :
                 paymentStep === 'payment' ? 'Payment' : 'Order Confirmed'}
              </h1>
              <p className="text-gray-600 text-sm">Complete your purchase</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              paymentStep === 'details' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {paymentStep === 'details' ? '1' : <CheckCircle className="w-5 h-5" />}
            </div>
            <div className={`w-16 h-1 ${paymentStep !== 'details' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              paymentStep === 'payment' ? 'bg-blue-600 text-white' :
              paymentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {paymentStep === 'success' ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <div className={`w-16 h-1 ${paymentStep === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              paymentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {paymentStep === 'success' ? <CheckCircle className="w-5 h-5" /> : '3'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Order Details Step */}
            {paymentStep === 'details' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Delivery Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      value={orderDetails.deliveryAddress}
                      onChange={(e) => setOrderDetails({...orderDetails, deliveryAddress: e.target.value})}
                      placeholder="Enter your complete delivery address..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={orderDetails.deliveryDate}
                      onChange={(e) => setOrderDetails({...orderDetails, deliveryDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={orderDetails.specialInstructions}
                      onChange={(e) => setOrderDetails({...orderDetails, specialInstructions: e.target.value})}
                      placeholder="Any special handling instructions..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {paymentStep === 'payment' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Select Payment Method</h2>
                
                <div className="space-y-4 mb-6">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedPaymentMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {method.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Fee: {method.processingFee}%</p>
                          <p className="text-xs text-gray-500">{method.estimatedTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Secure Escrow Payment</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your payment is held securely until you confirm delivery. 
                        The seller will only receive payment after successful delivery.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Pay Securely ₹{total.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success Step */}
            {paymentStep === 'success' && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your order has been confirmed and the seller has been notified. 
                  You will receive updates on your order status.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono font-medium">ORD-{Date.now().toString().slice(-8)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Expected Delivery:</span>
                    <span className="font-medium">{orderDetails.deliveryDate}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBackToDashboard}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    View Orders
                  </button>
                  <Link
                    href="/products"
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Product Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-medium text-gray-900">{bid.productName}</h4>
                <p className="text-sm text-gray-600">Seller: {bid.sellerName}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">
                    {bid.quantity} {bid.unit} × ₹{bid.amount}
                  </span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Info */}
              {paymentStep !== 'details' && orderDetails.deliveryAddress && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Details</h4>
                  <p className="text-sm text-gray-600">{orderDetails.deliveryAddress}</p>
                  <p className="text-sm text-gray-600 mt-1">Date: {orderDetails.deliveryDate}</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {processingFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee</span>
                    <span>₹{processingFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Secure Payment</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Your payment is protected by escrow until delivery confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}