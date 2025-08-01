import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, TrendingUp, BarChart3, DollarSign, UserCheck, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fixConnectionData, fixAllConnectionsWithPlaceholderData } from "@/services/connectionFixService";

const AdminPanel = () => {
  const [isFixingConnections, setIsFixingConnections] = useState(false);
  const [realStats, setRealStats] = useState({
    totalUsers: 0,
    activeFarmers: 0,
    totalDealers: 0,
    problemConnections: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRealStats();
  }, []);

  const loadRealStats = async () => {
    try {
      // Load real user counts
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      const totalUsers = users.length;
      const activeFarmers = users.filter(user => user.role === 'farmer').length;
      const totalDealers = users.filter(user => user.role === 'dealer').length;

      // Check for problematic connections
      const problemConnectionsQuery = query(
        collection(db, 'farmerDealers'),
        where('dealerEmail', '==', 'dealer@example.com')
      );
      const problemConnectionsSnapshot = await getDocs(problemConnectionsQuery);
      const problemConnections = problemConnectionsSnapshot.size;

      setRealStats({
        totalUsers,
        activeFarmers,
        totalDealers,
        problemConnections
      });

    } catch (error) {
      console.error('Error loading real stats:', error);
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
      loadRealStats();
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
      loadRealStats();
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
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">New farmer registration</p>
                <p className="text-sm text-gray-600">John Doe registered as a farmer</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Broiler rate updated</p>
                <p className="text-sm text-gray-600">Rate changed to ₹120/kg</p>
              </div>
              <span className="text-sm text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">System backup completed</p>
                <p className="text-sm text-gray-600">Daily backup successfully created</p>
              </div>
              <span className="text-sm text-gray-500">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
