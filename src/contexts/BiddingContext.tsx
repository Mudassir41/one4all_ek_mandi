'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Bid {
  id: string;
  productId: number;
  productName: string;
  buyerName: string;
  buyerLocation: string;
  amount: number;
  unit: string;
  message: string;
  messageTranslated?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  timestamp: Date;
  sellerName: string;
}

interface BiddingContextType {
  bids: Bid[];
  addBid: (bid: Omit<Bid, 'id' | 'timestamp'>) => void;
  updateBidStatus: (bidId: string, status: Bid['status']) => void;
  getBidsForProduct: (productId: number) => Bid[];
  getBidsForBuyer: (buyerName: string) => Bid[];
  getIncomingBidsForSeller: (sellerName: string) => Bid[];
}

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);

export function BiddingProvider({ children }: { children: ReactNode }) {
  const [bids, setBids] = useState<Bid[]>([
    // Mock initial bids for demo
    {
      id: '1',
      productId: 1,
      productName: 'Organic Tomatoes',
      buyerName: 'Demo Buyer',
      buyerLocation: 'Delhi',
      amount: 48,
      unit: 'kg',
      message: 'मुझे 50 किलो चाहिए',
      messageTranslated: 'I need 50 kg',
      status: 'pending',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      sellerName: 'Ravi Kumar'
    },
    {
      id: '2',
      productId: 2,
      productName: 'Basmati Rice',
      buyerName: 'Restaurant Owner',
      buyerLocation: 'Mumbai',
      amount: 90,
      unit: 'kg',
      message: 'Quality rice needed for restaurant',
      status: 'pending',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      sellerName: 'Gurpreet Singh'
    }
  ]);

  const addBid = (bidData: Omit<Bid, 'id' | 'timestamp'>) => {
    const newBid: Bid = {
      ...bidData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setBids(prev => [newBid, ...prev]);
  };

  const updateBidStatus = (bidId: string, status: Bid['status']) => {
    setBids(prev => prev.map(bid => 
      bid.id === bidId ? { ...bid, status } : bid
    ));
  };

  const getBidsForProduct = (productId: number) => {
    return bids.filter(bid => bid.productId === productId);
  };

  const getBidsForBuyer = (buyerName: string) => {
    return bids.filter(bid => bid.buyerName === buyerName);
  };

  const getIncomingBidsForSeller = (sellerName: string) => {
    return bids.filter(bid => bid.sellerName === sellerName);
  };

  return (
    <BiddingContext.Provider value={{
      bids,
      addBid,
      updateBidStatus,
      getBidsForProduct,
      getBidsForBuyer,
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