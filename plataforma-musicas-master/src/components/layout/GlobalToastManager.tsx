"use client";

import { useToastContext } from '@/context/ToastContext';
import ToastContainer from '@/components/ui/ToastContainer';

export const GlobalToastManager = () => {
  const { toasts, removeToast } = useToastContext();

  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}; 