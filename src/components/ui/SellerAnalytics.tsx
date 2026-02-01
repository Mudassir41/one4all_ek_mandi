'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, Users, Package, DollarSign, MapPin } from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
  products: {
    active: number;
    total: number;
  };
  topProducts: Array<{
    name: string;
    revenue: number;
    orders: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  buyerDemographics: Array<{
    type: string;
    percentage: number;
    count: number;
  }>;
  geographicReach: Array<{
    location: string;
    percentage: number;
    revenue: number;
  }>;
}

interface SellerAnalyticsProps {
  data?: AnalyticsData;
}

export function SellerAnalytics({ data }: SellerAnalyticsProps) {
  const { t } = useLanguage();

  // Mock analytics data
  const mockData: AnalyticsData = {
    revenue: {
      current: 45230,
      previous: 40350,
      change: 12.1
    },
    orders: {
      current: 127,
      previous: 98,
      change: 29.6
    },
    products: {
      active: 12,
      total: 15
    },
    topProducts: [
      { name: 'Organic Tomatoes', revenue: 15400, orders: 45, trend: 'up' },
      { name: 'Basmati Rice', revenue: 12800, orders: 32, trend: 'up' },
      { name: 'Red Onions', revenue: 8900, orders: 28, trend: 'stable' },
      { name: 'Green Chilies', revenue: 5200, orders: 18, trend: 'down' }
    ],
    buyerDemographics: [
      { type: 'B2B Wholesale', percentage: 65, count: 82 },
      { type: 'B2C Retail', percentage: 25, count: 32 },
      { type: 'Restaurants', percentage: 10, count: 13 }
    ],
    geographicReach: [
      { location: 'Delhi NCR', percentage: 35, revenue: 15830 },
      { location: 'Mumbai', percentage: 25, revenue: 11308 },
      { location: 'Bangalore', percentage: 20, revenue: 9046 },
      { location: 'Others', percentage: 20, revenue: 9046 }
    ]
  };

  const analyticsData = data || mockData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          📊
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Business Analytics</h2>
          <p className="text-gray-600 text-sm">Track your performance and growth</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(analyticsData.revenue.change)}`}>
              {getTrendIcon(analyticsData.revenue.change)}
              <span className="text-sm font-medium">
                {analyticsData.revenue.change > 0 ? '+' : ''}{analyticsData.revenue.change}%
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(analyticsData.revenue.current)}
            </h3>
            <p className="text-gray-600 text-sm">This Month Revenue</p>
            <p className="text-gray-500 text-xs mt-1">
              vs {formatCurrency(analyticsData.revenue.previous)} last month
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(analyticsData.orders.change)}`}>
              {getTrendIcon(analyticsData.orders.change)}
              <span className="text-sm font-medium">
                {analyticsData.orders.change > 0 ? '+' : ''}{analyticsData.orders.change}%
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {analyticsData.orders.current}
            </h3>
            <p className="text-gray-600 text-sm">Total Orders</p>
            <p className="text-gray-500 text-xs mt-1">
              vs {analyticsData.orders.previous} last month
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {analyticsData.products.active}
            </h3>
            <p className="text-gray-600 text-sm">Active Products</p>
            <p className="text-gray-500 text-xs mt-1">
              out of {analyticsData.products.total} total
            </p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Products</h3>
        <div className="space-y-4">
          {analyticsData.topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-gray-600 text-sm">{product.orders} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                <div className="flex items-center gap-1">
                  {product.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {product.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                  <span className={`text-xs ${
                    product.trend === 'up' ? 'text-green-600' : 
                    product.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {product.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer Demographics & Geographic Reach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Demographics */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Buyer Demographics</h3>
          </div>
          <div className="space-y-4">
            {analyticsData.buyerDemographics.map((segment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{segment.type}</span>
                  <span className="text-gray-900 font-semibold">{segment.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${segment.percentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 text-sm">{segment.count} buyers</p>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Reach */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Geographic Reach</h3>
          </div>
          <div className="space-y-4">
            {analyticsData.geographicReach.map((location, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{location.location}</span>
                  <span className="text-gray-900 font-semibold">{location.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${location.percentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 text-sm">{formatCurrency(location.revenue)} revenue</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Growth Opportunity</h4>
            <p className="text-gray-700 text-sm">
              Your tomato sales are 40% higher than average. Consider expanding your vegetable 
              inventory to capture more market share.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📈 Pricing Strategy</h4>
            <p className="text-gray-700 text-sm">
              Delhi buyers are willing to pay 15% premium for organic products. 
              Consider highlighting organic certifications.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">⏰ Best Selling Times</h4>
            <p className="text-gray-700 text-sm">
              Peak sales occur between 6-10 AM. Schedule your product listings 
              during these hours for maximum visibility.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🌍 Market Expansion</h4>
            <p className="text-gray-700 text-sm">
              Pune and Hyderabad show high demand for your product categories. 
              Consider expanding to these markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}