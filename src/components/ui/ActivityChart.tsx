import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DailyStat {
    date: string;
    downloads: number;
    likes: number;
}

interface ActivityChartProps {
    data: DailyStat[];
    title: string;
    type: 'downloads' | 'likes';
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data, title, type }) => {
    const maxValue = Math.max(...data.map(d => type === 'downloads' ? d.downloads : d.likes));
    const minValue = Math.min(...data.map(d => type === 'downloads' ? d.downloads : d.likes));

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) return <TrendingUp className="h-4 w-4 text-green-400" />;
        if (current < previous) return <TrendingDown className="h-4 w-4 text-red-400" />;
        return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getTrendColor = (current: number, previous: number) => {
        if (current > previous) return 'text-green-400';
        if (current < previous) return 'text-red-400';
        return 'text-gray-400';
    };

    return (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">{title}</h4>
                <div className="flex items-center gap-2">
                    {data.length > 1 && (
                        <>
                            {getTrendIcon(
                                type === 'downloads' ? data[data.length - 1].downloads : data[data.length - 1].likes,
                                type === 'downloads' ? data[data.length - 2].downloads : data[data.length - 2].likes
                            )}
                            <span className={`text-xs ${getTrendColor(
                                type === 'downloads' ? data[data.length - 1].downloads : data[data.length - 1].likes,
                                type === 'downloads' ? data[data.length - 2].downloads : data[data.length - 2].likes
                            )}`}>
                                {data.length > 1 && (
                                    type === 'downloads'
                                        ? data[data.length - 1].downloads - data[data.length - 2].downloads
                                        : data[data.length - 1].likes - data[data.length - 2].likes
                                )}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Gráfico de barras */}
            <div className="flex items-end justify-between h-32 gap-1">
                {data.map((stat, index) => {
                    const value = type === 'downloads' ? stat.downloads : stat.likes;
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    const isToday = index === data.length - 1;

                    return (
                        <div key={stat.date} className="flex-1 flex flex-col items-center">
                            <div className="relative w-full">
                                <div
                                    className={`w-full rounded-t transition-all duration-300 ${isToday
                                            ? 'bg-gradient-to-t from-cyan-500 to-cyan-400'
                                            : 'bg-gradient-to-t from-gray-600 to-gray-500'
                                        }`}
                                    style={{ height: `${Math.max(height, 4)}px` }}
                                />
                                {value > 0 && (
                                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300">
                                        {value}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 mt-2 text-center">
                                {stat.date}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Estatísticas resumidas */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700/50">
                <div className="text-center">
                    <p className="text-gray-400 text-xs">Hoje</p>
                    <p className="text-white font-semibold">
                        {type === 'downloads' ? data[data.length - 1]?.downloads : data[data.length - 1]?.likes || 0}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-gray-400 text-xs">Média</p>
                    <p className="text-white font-semibold">
                        {Math.round(
                            data.reduce((sum, stat) => sum + (type === 'downloads' ? stat.downloads : stat.likes), 0) / data.length
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ActivityChart;
