'use client';

import { useDemoUser } from '@/contexts/DemoUserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

interface UserSwitcherProps {
    className?: string;
}

export function UserSwitcher({ className = '' }: UserSwitcherProps) {
    const { currentUser, availableUsers, switchUser, logout, isLoggedIn } = useDemoUser();
    const { setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const handleSwitchUser = (userId: string) => {
        const user = availableUsers.find(u => u.id === userId);
        if (user) {
            switchUser(userId);
            setLanguage(user.language); // Auto-switch language to user's preference
        }
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border-2 border-orange-200 px-4 py-2 rounded-xl hover:border-orange-400 transition text-gray-900"
            >
                {isLoggedIn ? (
                    <>
                        <span className="text-xl">{currentUser?.avatar}</span>
                        <span className="font-medium">{currentUser?.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                            {currentUser?.userType === 'vendor' ? 'Seller' : 'Buyer'}
                        </span>
                    </>
                ) : (
                    <>
                        <span>👤</span>
                        <span className="font-medium text-gray-600">Switch User</span>
                    </>
                )}
                <span className="ml-1">▼</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                        <p className="text-sm font-semibold text-gray-700">🎭 Demo Mode: Switch User</p>
                        <p className="text-xs text-gray-500">Pick a profile to see different views</p>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {/* Sellers */}
                        <div className="px-3 py-2 bg-green-50 text-xs font-semibold text-green-700 border-b">
                            👨‍🌾 Sellers
                        </div>
                        {availableUsers.filter(u => u.userType === 'vendor').map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleSwitchUser(user.id)}
                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left ${currentUser?.id === user.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                                    }`}
                            >
                                <span className="text-2xl">{user.avatar}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">📍 {user.location}</div>
                                </div>
                                {currentUser?.id === user.id && <span className="text-green-600">✓</span>}
                            </button>
                        ))}

                        {/* Buyers */}
                        <div className="px-3 py-2 bg-blue-50 text-xs font-semibold text-blue-700 border-b">
                            🛒 Buyers
                        </div>
                        {availableUsers.filter(u => u.userType !== 'vendor').map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleSwitchUser(user.id)}
                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left ${currentUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                    }`}
                            >
                                <span className="text-2xl">{user.avatar}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">📍 {user.location}</div>
                                </div>
                                {currentUser?.id === user.id && <span className="text-green-600">✓</span>}
                            </button>
                        ))}
                    </div>

                    {isLoggedIn && (
                        <div className="p-3 border-t bg-gray-50">
                            <button
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
