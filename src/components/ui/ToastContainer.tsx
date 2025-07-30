import React from 'react';
import Toast from './Toast';

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
        duration?: number;
    }>;
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] space-y-2 max-w-md w-full px-4">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{
                        transform: `translateY(${index * 80}px)`,
                    }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => onRemove(toast.id)}
                        duration={toast.duration}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer; 