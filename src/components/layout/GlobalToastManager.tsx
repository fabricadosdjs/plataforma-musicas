"use client";

import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

export const GlobalToastManager = () => {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}; 