"use client";

import React, { useState, useEffect } from 'react';
import {
    Crown, Star, Gift, Zap, Shield, Music, Download, Heart, Users, TrendingUp, Settings
} from 'lucide-react';

interface CustomItem {
    id: number;
    name: string;
    description?: string;
    type: string;
    isActive: boolean;
    icon?: string;
    color?: string;
    order: number;
}

interface CustomItemsDisplayProps {
    type?: string; // Filter by type
    limit?: number; // Limit number of items to display
    className?: string;
}

export default function CustomItemsDisplay({ type, limit, className = "" }: CustomItemsDisplayProps) {
    const [customItems, setCustomItems] = useState<CustomItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomItems = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/custom-items');
                if (response.ok) {
                    const data = await response.json();
                    let items = data.customItems || [];

                    // Filter by type if specified
                    if (type) {
                        items = items.filter((item: CustomItem) => item.type === type);
                    }

                    // Filter only active items
                    items = items.filter((item: CustomItem) => item.isActive);

                    // Sort by order
                    items.sort((a: CustomItem, b: CustomItem) => a.order - b.order);

                    // Apply limit if specified
                    if (limit) {
                        items = items.slice(0, limit);
                    }

                    setCustomItems(items);
                }
            } catch (error) {
                console.error('Error fetching custom items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomItems();
    }, [type, limit]);

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            'crown': <Crown className="h-5 w-5" />,
            'star': <Star className="h-5 w-5" />,
            'gift': <Gift className="h-5 w-5" />,
            'zap': <Zap className="h-5 w-5" />,
            'shield': <Shield className="h-5 w-5" />,
            'music': <Music className="h-5 w-5" />,
            'download': <Download className="h-5 w-5" />,
            'heart': <Heart className="h-5 w-5" />,
            'users': <Users className="h-5 w-5" />,
            'trending': <TrendingUp className="h-5 w-5" />,
            'settings': <Settings className="h-5 w-5" />
        };
        return icons[iconName] || <Settings className="h-5 w-5" />;
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center py-8 ${className}`}>
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (customItems.length === 0) {
        return null; // Don't render anything if no items
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
            {customItems.map((item) => (
                <div
                    key={item.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: (item.color || '#3B82F6') + '20',
                                color: item.color || '#3B82F6'
                            }}
                        >
                            {getIconComponent(item.icon || 'settings')}
                        </div>
                        <div>
                            <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                            {item.description && (
                                <p className="text-gray-400 text-xs">{item.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 