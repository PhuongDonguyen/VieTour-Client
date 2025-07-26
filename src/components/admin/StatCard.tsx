import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = 'blue',
    className = ""
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <Card className={cn("hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <p className="text-3xl font-bold tracking-tight">{value}</p>
                    </div>
                    {icon && (
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            colorClasses[color]
                        )}>
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatCard;
