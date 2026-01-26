'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  count?: number;
  className?: string;
  onClick?: () => void;
}

export function NotificationBell({ count = 0, className, onClick }: NotificationBellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const bellRef = React.useRef<HTMLDivElement>(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'bid',
      title: 'New Bid Received',
      message: 'Delhi trader placed ₹45/kg bid on your tomatoes',
      time: '2 min ago',
      unread: true,
      icon: '💰',
    },
    {
      id: 2,
      type: 'message',
      title: 'Voice Message',
      message: 'Tourist from Kerala wants to buy spices',
      time: '5 min ago',
      unread: true,
      icon: '🎤',
    },
    {
      id: 3,
      type: 'price',
      title: 'Price Alert',
      message: 'Tomato prices increased by 15% in Mumbai',
      time: '1 hour ago',
      unread: false,
      icon: '📈',
    },
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  return (
    <div className={cn('relative', className)} ref={bellRef}>
      {/* Bell Button */}
      <button
        onClick={handleClick}
        className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ''}`}
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Notification Badge */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {count > 0 && (
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors',
                    notification.unread && 'bg-blue-50'
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0">{notification.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <span className="text-4xl mb-2 block">🔔</span>
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}