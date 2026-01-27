'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mic, MicOff, TrendingUp, TrendingDown, Minus, MapPin, Calendar } from 'lucide-react';

interface PriceData {
  product: string;
  location: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  date: string;
  market: string;
}

interface PriceDiscoveryProps {
  onPriceQuery?: (query: string) => void;
}

export function PriceDiscovery({ onPriceQuery }: PriceDiscoveryProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [voiceQuery, setVoiceQuery] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Mock price data for demonstration
  const mockPriceData: PriceData[] = [
    {
      product: 'Tomatoes',
      location: 'Chennai, Tamil Nadu',
      price: 45,
      unit: 'kg',
      trend: 'up',
      change: 8.5,
      date: 'Today',
      market: 'Koyambedu Market'
    },
    {
      product: 'Tomatoes',
      location: 'Delhi, NCR',
      price: 52,
      unit: 'kg',
      trend: 'up',
      change: 12.3,
      date: 'Today',
      market: 'Azadpur Mandi'
    },
    {
      product: 'Tomatoes',
      location: 'Mumbai, Maharashtra',
      price: 48,
      unit: 'kg',
      trend: 'stable',
      change: 2.1,
      date: 'Today',
      market: 'Vashi APMC'
    },
    {
      product: 'Tomatoes',
      location: 'Bangalore, Karnataka',
      price: 42,
      unit: 'kg',
      trend: 'down',
      change: -5.2,
      date: 'Today',
      market: 'Yeshwantpur Market'
    }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setVoiceQuery(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // Simulate voice-to-text processing
        await processVoiceQuery(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceQuery = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock voice-to-text result
    const mockQueries = [
      'What is the price of tomatoes in Chennai?',
      'टमाटर की कीमत क्या है दिल्ली में?',
      'தக்காளி விலை என்ன சென்னையில்?',
      'How much are onions selling for today?'
    ];
    
    const transcribedQuery = mockQueries[Math.floor(Math.random() * mockQueries.length)];
    setQuery(transcribedQuery);
    
    // Process the query
    await handleSearch(transcribedQuery);
  };

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setIsLoading(true);
    onPriceQuery?.(queryToSearch);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Filter mock data based on query
    const filteredData = mockPriceData.filter(item => 
      queryToSearch.toLowerCase().includes(item.product.toLowerCase()) ||
      queryToSearch.toLowerCase().includes('tomato') ||
      queryToSearch.toLowerCase().includes('टमाटर') ||
      queryToSearch.toLowerCase().includes('தக்காளி')
    );

    setPriceData(filteredData.length > 0 ? filteredData : mockPriceData);
    setIsLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          📊
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Price Discovery</h2>
          <p className="text-gray-600 text-sm">Ask about market prices in your language</p>
        </div>
      </div>

      {/* Search Interface */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: 'What's the price of tomatoes in Chennai?' or speak..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Voice Input */}
        <div className="flex items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Voice Search
              </>
            )}
          </button>
          
          {voiceQuery && (
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-sm">✓ Voice query processed</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing market data...</p>
        </div>
      )}

      {/* Price Results */}
      {!isLoading && priceData.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">Market Prices</h3>
          
          {priceData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{item.product}</h4>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                    <Calendar className="w-4 h-4" />
                    {item.date} • {item.market}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{item.price}
                    <span className="text-sm font-normal text-gray-600">/{item.unit}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${getTrendColor(item.trend)}`}>
                    {getTrendIcon(item.trend)}
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Market Trend:</span>
                  <span className={`font-medium ${getTrendColor(item.trend)}`}>
                    {item.trend === 'up' ? 'Rising' : item.trend === 'down' ? 'Falling' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">💡 AI Insights</h4>
            <p className="text-blue-800 text-sm">
              Tomato prices are trending upward across major markets due to seasonal demand. 
              Chennai offers competitive rates for bulk purchases. Consider timing your sales 
              during peak demand hours (6-10 AM) for better prices.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && priceData.length === 0 && query && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No price data found</h3>
          <p className="text-gray-600">
            Try searching for common products like "tomatoes", "onions", or "rice"
          </p>
        </div>
      )}
    </div>
  );
}