import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Package,
  AlertTriangle,
  Plus,
  Calculator,
} from "lucide-react";

// Mock data
const stats = [
  {
    title: "Total Birds",
    value: "1,250",
    change: "+12%",
    positive: true,
    icon: Package,
  },
  {
    title: "Weekly Expenses",
    value: "₹15,420",
    change: "-5%",
    positive: false,
    icon: DollarSign,
  },
  {
    title: "FCR Average",
    value: "1.68",
    change: "Optimal",
    positive: true,
    icon: TrendingUp,
  },
  {
    title: "Pending Vaccines",
    value: "3",
    change: "Due Soon",
    positive: false,
    icon: Calendar,
  },
];

const recentActivities = [
  { id: 1, type: "expense", description: "Feed purchase - Layer mash", amount: "₹2,500", time: "2 hours ago" },
  { id: 2, type: "income", description: "Egg sales - 100 trays", amount: "₹4,200", time: "5 hours ago" },
  { id: 3, type: "vaccine", description: "Newcastle vaccine administered", amount: "", time: "1 day ago" },
  { id: 4, type: "expense", description: "Electricity bill", amount: "₹850", time: "2 days ago" },
];

const upcomingReminders = [
  { id: 1, title: "Newcastle Vaccine", date: "Tomorrow", priority: "high" },
  { id: 2, title: "Feed stock check", date: "Dec 28", priority: "medium" },
  { id: 3, title: "Egg collection report", date: "Dec 30", priority: "low" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your poultry farm operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            This Week
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Quick Entry
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.positive ? "text-success" : "text-warning"}>
                  {stat.change}
                </span>
                {" "}from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Record Income
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate FCR
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Set Reminder
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest transactions and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <Badge variant={activity.type === "income" ? "default" : "secondary"}>
                      {activity.amount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
            <CardDescription>
              Important tasks and schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">{reminder.date}</p>
                  </div>
                  <Badge
                    variant={
                      reminder.priority === "high"
                        ? "destructive"
                        : reminder.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {reminder.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farm Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Health Overview</CardTitle>
          <CardDescription>
            Current status of your poultry operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Feed Stock Level</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vaccination Coverage</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Production Efficiency</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}