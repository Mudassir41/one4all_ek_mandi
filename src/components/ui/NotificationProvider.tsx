'use client';

import React from 'react';
import { NotificationToast, useNotifications } from './NotificationToast';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useNotifications();

  return (
    <>
      {children}
      <NotificationToast 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </>
  );
}