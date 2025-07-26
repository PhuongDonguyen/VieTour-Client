import React from 'react';
import StatCard from './StatCard';
import { Users, DollarSign, Calendar, Eye } from 'lucide-react';

interface DashboardStatsProps {
    className?: string;
}

interface StatData {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ className = "" }) => {
    const stats: StatData[] = [
        {
            title: 'Total Users',
            value: '1,234',
            icon: <Users className="w-6 h-6" />,
            color: 'blue',
        },
        {
            title: 'Revenue',
            value: '$12,345',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'green',
        },
        {
            title: 'Bookings',
            value: '567',
            icon: <Calendar className="w-6 h-6" />,
            color: 'purple',
        },
        {
            title: 'Page Views',
            value: '8,910',
            icon: <Eye className="w-6 h-6" />,
            color: 'orange',
        },
    ];

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {stats.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                />
            ))}
        </div>
    );
};

export default DashboardStats;
