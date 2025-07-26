import React from "react";
import AdminLayout from "./AdminLayout";
import DashboardStats from "./DashboardStats";
import OverviewCard from "./OverviewCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Calendar } from "lucide-react";

const AdminDashboard: React.FC = () => {
    return (
        <AdminLayout title="Dashboard">
            {/* Stats Grid */}
            <DashboardStats />

            {/* Overview Section */}
            <OverviewCard title="Dashboard Overview">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Growth +12%
                        </Badge>
                        <Badge variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            Active Users
                        </Badge>
                        <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            This Month
                        </Badge>
                    </div>

                    <div>
                        <p className="text-muted-foreground mb-4">Welcome to your admin dashboard. Here you can:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-sm text-muted-foreground">
                            <li>Monitor user activity and engagement</li>
                            <li>Track revenue and booking statistics</li>
                            <li>Manage tours and travel packages</li>
                            <li>View system analytics and reports</li>
                        </ul>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Tour
                        </Button>
                        <Button variant="outline" size="sm">
                            View All Reports
                        </Button>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            💡 <strong className="text-foreground">Tip:</strong> Use the sidebar navigation to access different sections of the admin panel.
                        </p>
                    </div>
                </div>
            </OverviewCard>
        </AdminLayout>
    );
};

export default AdminDashboard; 