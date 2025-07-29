import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Plus, AlertTriangle, CheckCircle } from "lucide-react";

const mockReminders = [
  {
    id: 1,
    title: "Newcastle Disease Vaccine",
    dueDate: "2023-12-20",
    status: "upcoming",
    description: "First dose for new batch of chicks",
    birdGroup: "Batch A",
  },
  {
    id: 2,
    title: "IBD Vaccine",
    dueDate: "2023-12-18",
    status: "overdue",
    description: "Infectious Bursal Disease vaccination",
    birdGroup: "Batch B",
  },
  {
    id: 3,
    title: "Marek's Disease",
    dueDate: "2023-12-25",
    status: "upcoming",
    description: "Day-old chick vaccination",
    birdGroup: "Batch C",
  },
  {
    id: 4,
    title: "Fowl Pox Vaccine",
    dueDate: "2023-12-15",
    status: "completed",
    description: "Wing web method administered",
    birdGroup: "Batch A",
  },
];

export default function Vaccines() {
  const [reminders, setReminders] = useState(mockReminders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
    description: "",
    birdGroup: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReminder = {
      id: reminders.length + 1,
      ...formData,
      status: "upcoming" as const,
    };

    setReminders([newReminder, ...reminders]);
    setFormData({
      title: "",
      dueDate: "",
      description: "",
      birdGroup: "",
    });
    setIsDialogOpen(false);
  };

  const markCompleted = (id: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, status: "completed" as const } : reminder
    ));
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (status === "completed") {
      return <Badge variant="default" className="bg-success">Completed</Badge>;
    }
    
    if (status === "overdue" || due < today) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff <= 2) {
      return <Badge variant="destructive">Due Soon</Badge>;
    }
    
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  const upcomingCount = reminders.filter(r => r.status === "upcoming").length;
  const overdueCount = reminders.filter(r => {
    const today = new Date();
    const due = new Date(r.dueDate);
    return r.status === "overdue" || (r.status !== "completed" && due < today);
  }).length;
  const completedCount = reminders.filter(r => r.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vaccine Reminders</h1>
          <p className="text-muted-foreground">
            Manage vaccination schedules for your poultry
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Vaccine Reminder</DialogTitle>
              <DialogDescription>
                Schedule a new vaccination reminder
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Vaccine Name</Label>
                <Input
                  id="title"
                  placeholder="e.g., Newcastle Disease Vaccine"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birdGroup">Bird Group/Batch</Label>
                <Input
                  id="birdGroup"
                  placeholder="e.g., Batch A, Layer House 1"
                  value={formData.birdGroup}
                  onChange={(e) => setFormData({ ...formData, birdGroup: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional notes about the vaccination"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Add Reminder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled vaccines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Schedule</CardTitle>
          <CardDescription>
            All vaccination reminders and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((reminder) => (
                <div key={reminder.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{reminder.title}</h3>
                      {getStatusBadge(reminder.status, reminder.dueDate)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <strong>Due:</strong> {new Date(reminder.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Group:</strong> {reminder.birdGroup}
                      </p>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground">
                          {reminder.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {reminder.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markCompleted(reminder.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}