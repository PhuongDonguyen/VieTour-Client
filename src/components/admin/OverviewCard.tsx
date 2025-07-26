import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OverviewCardProps {
    title?: string;
    children?: React.ReactNode;
    className?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
    title = "Overview",
    children,
    className = ""
}) => {
    return (
        <Card className={cn("hover:shadow-md transition-shadow", className)}>
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground">
                    {children || (
                        <p>This is your admin dashboard. Add charts, tables, and more here.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default OverviewCard;
