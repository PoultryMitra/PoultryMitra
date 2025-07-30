import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  addVaccineReminder, 
  subscribeToVaccineReminders,
  type VaccineReminder 
} from "@/services/farmerService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Plus, AlertTriangle, CheckCircle } from "lucide-react";

export default function Vaccines() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [reminders, setReminders] = useState<VaccineReminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vaccine: "",
    date: "",
    description: "",
    birdGroup: "",
  });

  // Load vaccine reminders from Firebase
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToVaccineReminders(currentUser.uid, setReminders);
    
    return unsubscribe; // Cleanup subscription on unmount
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vaccine || !formData.date || !formData.birdGroup) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to add vaccine reminders.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addVaccineReminder(currentUser.uid, {
        vaccine: formData.vaccine,
        date: formData.date,
        description: formData.description,
        birdGroup: formData.birdGroup,
      });

      toast({
        title: "Success",
        description: `Vaccine reminder for ${formData.vaccine} added successfully.`,
      });

      // Reset form
      setFormData({
        vaccine: "",
        date: "",
        description: "",
        birdGroup: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding vaccine reminder:", error);
      toast({
        title: "Error",
        description: "Failed to add vaccine reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (due < today) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    if (daysDiff <= 2) {
      return <Badge variant="destructive">Due Soon</Badge>;
    }
    
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  const upcomingCount = reminders.filter(r => {
    const today = new Date();
    const due = new Date(r.date);
    return due >= today;
  }).length;
  
  const overdueCount = reminders.filter(r => {
    const today = new Date();
    const due = new Date(r.date);
    return due < today;
  }).length;

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
                <Label htmlFor="vaccine">Vaccine Name</Label>
                <Input
                  id="vaccine"
                  placeholder="e.g., Newcastle Disease Vaccine"
                  value={formData.vaccine}
                  onChange={(e) => setFormData({ ...formData, vaccine: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Due Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((reminder) => (
                <div key={reminder.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{reminder.vaccine}</h3>
                      {getStatusBadge("upcoming", reminder.date)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <strong>Due:</strong> {new Date(reminder.date).toLocaleDateString()}
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
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}