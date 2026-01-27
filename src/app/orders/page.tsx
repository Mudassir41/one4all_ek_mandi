'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { Package, Truck, CheckCircle, Clock, AlertCircle, Eye, MessageCircle, Star, ArrowLeft } from 'lucide-react';

interface Order {
  id: string;
  productName: string;
  sellerName: string;
  buyerName: string;
  amount: number;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  deliveryAddress: string;
  trackingNumber?: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { t } = useLanguage();
  const { bids } = useBidding();

  useEffect(() => {
    loadOrders();
  }, [bids]);

  const loadOrders = () => {
    // Convert accepted bids to orders
    const mockOrders: Order[] = bids
      .filter(bid => bid.status === 'accepted')
      .map(bid => ({
        id: `ORD-${bid.id.slice(-8)}`,
        productName: bid.productName,
        sellerName: bid.sellerName,
        buyerName: bid.buyerName,
        amount: bid.amount,
        quantity: bid.quantity,
        unit: bid.unit,
        totalAmount: bid.amount * bid.quantity,
        status: Math.random() > 0.5 ? 'shipped' : 'confirmed',
        orderDate: new Date(bid.timestamp).toISOString(),
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryAddress: 'Demo Address, Delhi - 110001',
        trackingNumber: Math.random() > 0.5 ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
        paymentStatus: 'paid',
        timeline: [
          {
            status: 'confirmed',
            timestamp: new Date(bid.timestamp).toISOString(),
            description: 'Order confirmed and payment received'
          },
          {
            status: 'packed',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Order packed and ready for shipment'
          },
          ...(Math.random() > 0.5 ? [{
            status: 'shipped',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Order shipped and in transit'
          }] : [])
        ]
      }));

    // Add some completed orders
    mockOrders.push({
      id: 'ORD-12345678',
      productName: 'Organic Basmati Rice',
      sellerName: 'Punjab Farms',
      buyerName: 'Demo Buyer',
      amount: 85,
      quantity: 50,
      unit: 'kg',
      totalAmount: 4250,
      status: 'delivered',
      orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expectedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryAddress: 'Demo Address, Delhi - 110001',
      trackingNumber: 'TRK123456789',
      paymentStatus: 'paid',
      timeline: [
        {
          status: 'confirmed',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Order confirmed and payment received'
        },
        {
          status: 'packed',
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Order packed and ready for shipment'
        },
        {
          status: 'shipped',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Order shipped and in transit'
        },
        {
          status: 'delivered',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Order delivered successfully'
        }
      ]
    });

    setOrders(mockOrders);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'packed':
        return <Package className="w-5 h-5 text-orange-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'active':
        return ['confirmed', 'packed', 'shipped'].includes(order.status);
      case 'completed':
        return ['delivered', 'cancelled'].includes(order.status);
      default:
        return true;
    }
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-blue-200 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">My Orders</h1>
              <p className="text-blue-100 text-sm">Track your purchases and deliveries</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active ({orders.filter(o => ['confirmed', 'packed', 'shipped'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'completed'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${activeTab} orders found.`}
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{order.productName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Order ID: {order.id}</p>
                    <p className="text-gray-600 text-sm">Seller: {order.sellerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{order.totalAmount.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">{order.quantity} {order.unit} × ₹{order.amount}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Order Date</p>
                    <p className="text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expected Delivery</p>
                    <p className="text-gray-600">{order.expectedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Order Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Order Progress</p>
                    {order.trackingNumber && (
                      <p className="text-sm text-blue-600">Tracking: {order.trackingNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {['confirmed', 'packed', 'shipped', 'delivered'].map((status, index) => (
                      <div key={status} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          order.timeline.some(t => t.status === status)
                            ? getStatusColor(status).replace('text-', 'bg-').replace('-800', '-600').replace('bg-', 'bg-') + ' text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {getStatusIcon(status)}
                        </div>
                        {index < 3 && (
                          <div className={`w-8 h-1 ${
                            order.timeline.some(t => ['packed', 'shipped', 'delivered'][index] === t.status)
                              ? 'bg-green-400'
                              : 'bg-gray-200'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                    <MessageCircle className="w-4 h-4" />
                    Contact Seller
                  </button>
                  {order.status === 'delivered' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                      <Star className="w-4 h-4" />
                      Rate & Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Order Info */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedOrder.productName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order ID</p>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Seller</p>
                    <p className="font-medium">{selectedOrder.sellerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-medium">{selectedOrder.quantity} {selectedOrder.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium text-green-600">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                <p className="text-gray-600">{selectedOrder.deliveryAddress}</p>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Order Timeline</h4>
                <div className="space-y-4">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{event.status}</p>
                        <p className="text-gray-600 text-sm">{event.description}</p>
                        <p className="text-gray-500 text-xs">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}