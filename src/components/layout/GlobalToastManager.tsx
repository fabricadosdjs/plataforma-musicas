"use client";

import { useToastContext } from '@/context/ToastContext';
import ToastContainer from '@/components/ui/ToastContainer';
import { Toaster } from 'react-hot-toast';

export const GlobalToastManager = () => {
  const { toasts, removeToast } = useToastContext();

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerClassName=""
        containerStyle={{
          top: '20px',
          right: '20px',
        }}
        toastOptions={{
          // Define estilos padrão para todos os toasts
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '20px 24px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            maxWidth: '400px',
          },
          // Estilos para diferentes tipos de toast
          success: {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
              color: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 10px 10px -5px rgba(16, 185, 129, 0.1)',
              backdropFilter: 'blur(10px)',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#d1fae5',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
              color: '#fecaca',
              border: '1px solid #ef4444',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(239, 68, 68, 0.1)',
              backdropFilter: 'blur(10px)',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fecaca',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
              color: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(10px)',
            },
          },
        }}
      />
    </>
  );
}; 