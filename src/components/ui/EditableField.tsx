'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';

interface EditableFieldProps {
    value: string;
    onSave: (value: string) => Promise<void>;
    onCancel: () => void;
    onStartEdit: () => void;
    isEditing: boolean;
    isLoading: boolean;
    placeholder?: string;
    className?: string;
    maxLength?: number;
    validation?: (value: string) => string | null;
}

export const EditableField: React.FC<EditableFieldProps> = ({
    value,
    onSave,
    onCancel,
    onStartEdit,
    isEditing,
    isLoading,
    placeholder = 'Digite aqui...',
    className = '',
    maxLength,
    validation
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        setInputValue(value);
        setValidationError(null);
    }, [value, isEditing]);

    const handleSave = async () => {
        if (validation) {
            const error = validation(inputValue.trim());
            if (error) {
                setValidationError(error);
                return;
            }
        }

        if (inputValue.trim() === value) {
            onCancel();
            return;
        }

        await onSave(inputValue.trim());
    };

    const handleCancel = () => {
        setInputValue(value);
        setValidationError(null);
        onCancel();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    if (!isEditing) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-white font-bold text-3xl mb-2">{value || 'N/A'}</span>
                <button
                    onClick={onStartEdit}
                    className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                    title="Editar"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                    autoFocus
                />
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        title="Salvar"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        title="Cancelar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {validationError && (
                <p className="text-red-400 text-sm">{validationError}</p>
            )}
            {maxLength && (
                <p className="text-gray-500 text-xs text-right">
                    {inputValue.length}/{maxLength}
                </p>
            )}
        </div>
    );
};
