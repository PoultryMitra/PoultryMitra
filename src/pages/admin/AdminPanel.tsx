import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, TrendingUp, BarChart3, DollarSign, UserCheck, Wrench, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminService, type AdminStats, type SystemActivity } from "@/services/adminService";
import { fixConnectionData, fixAllConnectionsWithPlaceholderData } from "@/services/connectionFixService";

const AdminPanel = () => {
  const [isFixingConnections, setIsFixingConnections] = useState(false);
  const [realStats, setRealStats] = useState<AdminStats>({
    totalUsers: 0,
    activeFarmers: 0,
    totalDealers: 0,
    problemConnections: 0,
    totalConnections: 0,
    totalProducts: 0,
    recentRegistrations: 0
  });
  const [recentActivities, setRecentActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load admin statistics
      const stats = await AdminService.getAdminStats();
      setRealStats(stats);
      
      // Load recent activities
      const activities = await AdminService.getRecentActivities();
      setRecentActivities(activities);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFixSpecificConnection = async () => {
    setIsFixingConnections(true);
    try {
      await fixConnectionData('gLx4IutFQalTLwEPng3F');
      toast({
        title: "Success",
        description: "Connection data fixed successfully!",
      });
      // Reload stats
      loadDashboardData();
    } catch (error) {
      console.error('Error fixing connection:', error);
      toast({
        title: "Error",
        description: "Failed to fix connection data.",
        variant: "destructive",
      });
    } finally {
      setIsFixingConnections(false);
    }
  };

  const handleFixAllConnections = async () => {
    setIsFixingConnections(true);
    try {
      await fixAllConnectionsWithPlaceholderData();
      toast({
        title: "Success",
        description: "All placeholder connections fixed successfully!",
      });
      // Reload stats
      loadDashboardData();
    } catch (error) {
      console.error('Error fixing connections:', error);
      toast({
        title: "Error",
        description: "Failed to fix placeholder connections.",
        variant: "destructive",
      });
    } finally {
      setIsFixingConnections(false);
    }
  };

  const stats = [
    { title: "Total Users", value: loading ? "..." : realStats.totalUsers.toString(), icon: Users, color: "text-blue-600" },
    { title: "Active Farmers", value: loading ? "..." : realStats.activeFarmers.toString(), icon: UserCheck, color: "text-green-600" },
    { title: "Total Dealers", value: loading ? "..." : realStats.totalDealers.toString(), icon: DollarSign, color: "text-purple-600" },
    { title: "Problem Connections", value: loading ? "..." : realStats.problemConnections.toString(), icon: Wrench, color: "text-red-600" },
  ];

  const additionalStats = [
    { title: "Total Connections", value: loading ? "..." : realStats.totalConnections.toString(), icon: Users, color: "text-blue-500" },
    { title: "Total Products", value: loading ? "..." : realStats.totalProducts.toString(), icon: TrendingUp, color: "text-green-500" },
    { title: "Recent Registrations", value: loading ? "..." : realStats.recentRegistrations.toString(), icon: UserCheck, color: "text-purple-500" },
  ];

  const quickActions = [
    { title: "Connection Fix", description: "Fix farmer-dealer connections with placeholder data", action: "connection-fix", icon: Wrench, color: "bg-red-500" },
    { title: "User Management", description: "Manage user accounts, roles, and permissions", link: "/admin/users", icon: Users, color: "bg-blue-500" },
    { title: "System Settings", description: "Configure application settings and preferences", link: "/admin/settings", icon: Settings, color: "bg-gray-500" },
    { title: "Rate Management", description: "Update broiler and egg rates for the market", link: "/admin/rates", icon: TrendingUp, color: "bg-green-500" },
    { title: "Analytics & Reports", description: "View detailed reports and system analytics", link: "/admin/reports", icon: BarChart3, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your Poultry Mitra platform from this central admin panel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {additionalStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {action.action === "connection-fix" ? (
                  <div className="space-y-2">
                    <Button 
                      onClick={handleFixSpecificConnection}
                      disabled={isFixingConnections}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {isFixingConnections ? "Fixing..." : "Fix Current Connection"}
                    </Button>
                    <Button 
                      onClick={handleFixAllConnections}
                      disabled={isFixingConnections}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      {isFixingConnections ? "Fixing..." : "Fix All Problems"}
                    </Button>
                  </div>
                ) : (
                  <Link to={action.link}>
                    <Button className="w-full">Access {action.title}</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest activities and changes in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading recent activities...</p>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {activity.timestamp.toDate().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
