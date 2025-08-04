import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define opções padrão para todos os toasts
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '400px',
        },

        // Configurações específicas por tipo
        success: {
          duration: 4000,
          style: {
            background: '#10B981',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10B981',
          },
        },

        error: {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#EF4444',
          },
        },

        loading: {
          duration: Infinity,
          style: {
            background: '#3B82F6',
            color: 'white',
          },
        },
      }}
    />
  );
};

export default ToastProvider;

// Utilitários personalizados para toast
export const toast = {
  success: (message: string) => {
    const { toast: hotToast } = require('react-hot-toast');
    return hotToast.success(message);
  },
  
  error: (message: string) => {
    const { toast: hotToast } = require('react-hot-toast');
    return hotToast.error(message);
  },
  
  loading: (message: string) => {
    const { toast: hotToast } = require('react-hot-toast');
    return hotToast.loading(message);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    const { toast: hotToast } = require('react-hot-toast');
    return hotToast.promise(promise, { loading, success, error });
  },

  dismiss: (toastId?: string) => {
    const { toast: hotToast } = require('react-hot-toast');
    return hotToast.dismiss(toastId);
  }
};