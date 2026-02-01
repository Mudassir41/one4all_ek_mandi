'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DemoUser {
    id: string;
    name: string;
    phone: string;
    userType: 'vendor' | 'b2b_buyer' | 'b2c_buyer';
    location: string;
    language: string;
    avatar: string;
}

interface DemoUserContextType {
    currentUser: DemoUser | null;
    availableUsers: DemoUser[];
    switchUser: (userId: string) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

const demoUsers: DemoUser[] = [
    {
        id: 'seller-1',
        name: 'Ravi Kumar',
        phone: '+91 98765 43210',
        userType: 'vendor',
        location: 'Chennai, Tamil Nadu',
        language: 'ta',
        avatar: '👨‍🌾'
    },
    {
        id: 'seller-2',
        name: 'Gurpreet Singh',
        phone: '+91 98765 43211',
        userType: 'vendor',
        location: 'Amritsar, Punjab',
        language: 'hi',
        avatar: '👳‍♂️'
    },
    {
        id: 'buyer-1',
        name: 'Amit Sharma',
        phone: '+91 98765 43212',
        userType: 'b2b_buyer',
        location: 'Delhi',
        language: 'hi',
        avatar: '🛒'
    },
    {
        id: 'buyer-2',
        name: 'Lakshmi Enterprises',
        phone: '+91 98765 43213',
        userType: 'b2b_buyer',
        location: 'Bangalore, Karnataka',
        language: 'kn',
        avatar: '🏪'
    }
];

const DemoUserContext = createContext<DemoUserContextType | undefined>(undefined);

export function DemoUserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedUserId = localStorage.getItem('demoUserId');
        if (savedUserId) {
            const user = demoUsers.find(u => u.id === savedUserId);
            if (user) setCurrentUser(user);
        }
    }, []);

    const switchUser = (userId: string) => {
        const user = demoUsers.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('demoUserId', userId);
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('demoUserId');
    };

    return (
        <DemoUserContext.Provider value={{
            currentUser,
            availableUsers: demoUsers,
            switchUser,
            logout,
            isLoggedIn: !!currentUser
        }}>
            {children}
        </DemoUserContext.Provider>
    );
}

export function useDemoUser() {
    const context = useContext(DemoUserContext);
    if (context === undefined) {
        throw new Error('useDemoUser must be used within a DemoUserProvider');
    }
    return context;
}

export { demoUsers };
