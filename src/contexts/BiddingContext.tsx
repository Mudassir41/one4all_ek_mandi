'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Bid {
  id: string;
  productId: string;
  productName: string;
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  quantity: number;
  unit: string;
  message: string;
  messageTranslated?: string;
  voiceMessage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  timestamp: Date;
  counterOffer?: {
    amount: number;
    message: string;
    timestamp: Date;
  };
}

interface BiddingContextType {
  bids: Bid[];
  addBid: (bid: Omit<Bid, 'id' | 'timestamp'>) => Promise<void>;
  acceptBid: (bidId: string) => Promise<void>;
  rejectBid: (bidId: string) => Promise<void>;
  counterBid: (bidId: string, amount: number, message: string) => Promise<void>;
  updateBidStatus: (bidId: string, status: Bid['status']) => void;
  getBidsForProduct: (productId: string) => Bid[];
  getBidsForBuyer: (buyerId: string) => Bid[];
  getBidsForSeller: (sellerId: string) => Bid[];
  getIncomingBidsForSeller: (sellerName: string) => Bid[];
}

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);

export function BiddingProvider({ children }: { children: ReactNode }) {
  const [bids, setBids] = useState<Bid[]>([
    // Mock initial bids for demo
    {
      id: '1',
      productId: 'tomatoes-1',
      productName: 'Organic Tomatoes',
      buyerId: 'buyer-1',
      buyerName: 'Demo Buyer',
      buyerLocation: 'Delhi',
      sellerId: 'seller-1',
      sellerName: 'Ravi Kumar',
      amount: 48,
      quantity: 50,
      unit: 'kg',
      message: 'मुझे 50 किलो चाहिए',
      messageTranslated: 'I need 50 kg',
      status: 'pending',
      timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    },
    {
      id: '2',
      productId: 'rice-1',
      productName: 'Basmati Rice',
      buyerId: 'buyer-2',
      buyerName: 'Restaurant Owner',
      buyerLocation: 'Mumbai',
      sellerId: 'seller-1',
      sellerName: 'Ravi Kumar',
      amount: 90,
      quantity: 100,
      unit: 'kg',
      message: 'Quality rice needed for restaurant',
      status: 'pending',
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ]);

  const addBid = async (bidData: Omit<Bid, 'id' | 'timestamp'>) => {
    const newBid: Bid = {
      ...bidData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setBids(prev => [newBid, ...prev]);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const acceptBid = async (bidId: string) => {
    setBids(prev => prev.map(bid => 
      bid.id === bidId 
        ? { ...bid, status: 'accepted' as const }
        : bid
    ));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const rejectBid = async (bidId: string) => {
    setBids(prev => prev.map(bid => 
      bid.id === bidId 
        ? { ...bid, status: 'rejected' as const }
        : bid
    ));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const counterBid = async (bidId: string, amount: number, message: string) => {
    setBids(prev => prev.map(bid => 
      bid.id === bidId 
        ? { 
            ...bid, 
            status: 'countered' as const,
            counterOffer: {
              amount,
              message,
              timestamp: new Date()
            }
          }
        : bid
    ));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const updateBidStatus = (bidId: string, status: Bid['status']) => {
    setBids(prev => prev.map(bid => 
      bid.id === bidId ? { ...bid, status } : bid
    ));
  };

  const getBidsForProduct = (productId: string) => {
    return bids.filter(bid => bid.productId === productId);
  };

  const getBidsForBuyer = (buyerId: string) => {
    return bids.filter(bid => bid.buyerId === buyerId);
  };

  const getBidsForSeller = (sellerId: string) => {
    return bids.filter(bid => bid.sellerId === sellerId);
  };

  const getIncomingBidsForSeller = (sellerName: string) => {
    return bids.filter(bid => bid.sellerName === sellerName);
  };

  return (
    <BiddingContext.Provider value={{
      bids,
      addBid,
      acceptBid,
      rejectBid,
      counterBid,
      updateBidStatus,
      getBidsForProduct,
      getBidsForBuyer,
      getBidsForSeller,
      getIncomingBidsForSeller
    }}>
      {children}
    </BiddingContext.Provider>
  );
}

export function useBidding() {
  const context = useContext(BiddingContext);
  if (context === undefined) {
    throw new Error('useBidding must be used within a BiddingProvider');
  }
  return context;
}