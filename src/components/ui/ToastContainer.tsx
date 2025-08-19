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
        <div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999999] space-y-3 max-w-sm w-full pointer-events-none"
            style={{
                position: 'fixed',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999999,
                pointerEvents: 'none'
            }}
        >
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="transform transition-all duration-500 ease-out pointer-events-auto"
                    style={{
                        transform: `translateX(${index * 20}px)`,
                        zIndex: 999999 - index,
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