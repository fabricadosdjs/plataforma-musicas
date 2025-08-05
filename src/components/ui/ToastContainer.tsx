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
        <div className="fixed top-24 right-4 z-[99999] space-y-3 max-w-sm w-full">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="transform transition-all duration-500 ease-out"
                    style={{
                        transform: `translateX(${index * 20}px)`,
                        zIndex: 99999 - index,
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