import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, UserCheck, DollarSign, TrendingUp, Activity } from "lucide-react";
import { AdminService } from "@/services/adminService";

interface AnalyticsData {
  dailyRegistrations: { date: string; count: number }[];
  roleDistribution: {
    farmer: number;
    dealer: number;
    admin: number;
    other: number;
  };
  totalUsers: number;
  profileCompleteUsers: number;
}

const Reports = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getUserAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleColors = {
    farmer: 'bg-green-500',
    dealer: 'bg-blue-500', 
    admin: 'bg-red-500',
    other: 'bg-gray-500'
  };

  const completionRate = analytics ? 
    Math.round((analytics.profileCompleteUsers / analytics.totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Reports
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Complete</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.profileCompleteUsers} of {analytics.totalUsers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Farmers</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.roleDistribution.farmer}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dealers</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.roleDistribution.dealer}</div>
              </CardContent>
            </Card>
          </div>

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.roleDistribution).map(([role, count]) => {
                  const percentage = Math.round((count / analytics.totalUsers) * 100);
                  return (
                    <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${roleColors[role as keyof typeof roleColors]}`}></div>
                        <span className="font-medium capitalize">{role}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                          <div 
                            className={`h-2 rounded-full ${roleColors[role as keyof typeof roleColors]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daily Registrations */}
          <Card>
            <CardHeader>
              <CardTitle>User Registrations (Last 28 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Recent registration trends</span>
                  <span>Total: {analytics.dailyRegistrations.reduce((sum, day) => sum + day.count, 0)} users</span>
                </div>
                
                {/* Simple bar chart */}
                <div className="grid grid-cols-7 gap-1">
                  {analytics.dailyRegistrations.slice(-28).map((day, index) => {
                    const maxCount = Math.max(...analytics.dailyRegistrations.map(d => d.count));
                    const height = maxCount > 0 ? Math.max((day.count / maxCount) * 100, 5) : 5;
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })[0]}
                        </div>
                        <div 
                          className="bg-blue-500 rounded-sm w-full min-h-[4px] transition-all"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: ${day.count} users`}
                        ></div>
                        <div className="text-xs text-gray-400 mt-1">
                          {day.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Profile Completion Rate</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active User Types</span>
                  <span className="font-semibold">{Object.values(analytics.roleDistribution).filter(count => count > 0).length}/4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Farmer to Dealer Ratio</span>
                  <span className="font-semibold">
                    {analytics.roleDistribution.dealer > 0 
                      ? Math.round(analytics.roleDistribution.farmer / analytics.roleDistribution.dealer * 10) / 10
                      : analytics.roleDistribution.farmer
                    }:1
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Most Common Role:</div>
                  <div className="text-gray-600 capitalize">
                    {Object.entries(analytics.roleDistribution)
                      .sort(([,a], [,b]) => b - a)[0][0]} 
                    ({Object.entries(analytics.roleDistribution)
                      .sort(([,a], [,b]) => b - a)[0][1]} users)
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Recent Activity:</div>
                  <div className="text-gray-600">
                    {analytics.dailyRegistrations.slice(-7).reduce((sum, day) => sum + day.count, 0)} new users this week
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Growth Trend:</div>
                  <div className="text-gray-600">
                    {analytics.dailyRegistrations.slice(-7).reduce((sum, day) => sum + day.count, 0) > 
                     analytics.dailyRegistrations.slice(-14, -7).reduce((sum, day) => sum + day.count, 0) 
                      ? '📈 Increasing' : '📉 Stable/Decreasing'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
