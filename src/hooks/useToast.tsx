// src/hooks/useToast.tsx
// Last Updated: 2025-02-26 18:57:37
// Author: parthsharma-git

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps } from '@/components/ui/toast';

interface ToastContextType {
  showToast: (props: ToastProps) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = useCallback((props: ToastProps) => {
    setToast(props);
    setTimeout(() => setToast(null), 5000); // Auto hide after 5 seconds
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};