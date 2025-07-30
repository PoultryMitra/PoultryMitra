import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckSquare, Plus, Calendar, Clock, AlertCircle, User, CheckCircle2 } from "lucide-react";
import MapComponent from "@/components/MapComponent";

const taskCategories = [
  "Feeding",
  "Cleaning",
  "Health Check",
  "Vaccination",
  "Maintenance",
  "Harvesting",
  "Breeding",
  "Record Keeping",
  "Supply Management",
  "Other",
];

const priorities = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

const statuses = [
  "pending",
  "in-progress", 
  "completed",
  "overdue",
];

const mockTasks = [
  {
    id: 1,
    title: "Morning Feed Distribution",
    description: "Distribute morning feed to all poultry houses",
    category: "Feeding",
    priority: "high",
    status: "completed",
    dueDate: "2024-07-30",
    dueTime: "07:00",
    assignedTo: "John Smith",
    estimatedHours: 2,
    completedDate: "2024-07-30",
  },
  {
    id: 2,
    title: "Weekly Health Inspection",
    description: "Conduct comprehensive health check of all birds",
    category: "Health Check",
    priority: "medium",
    status: "in-progress",
    dueDate: "2024-07-30",
    dueTime: "10:00",
    assignedTo: "Dr. Sarah Johnson",
    estimatedHours: 3,
  },
  {
    id: 3,
    title: "Clean Water System",
    description: "Clean and sanitize all water lines and drinkers",
    category: "Cleaning",
    priority: "medium",
    status: "pending",
    dueDate: "2024-07-31",
    dueTime: "14:00",
    assignedTo: "Mike Wilson",
    estimatedHours: 4,
  },
  {
    id: 4,
    title: "Newcastle Vaccination",
    description: "Administer Newcastle disease vaccine to Batch C",
    category: "Vaccination",
    priority: "urgent",
    status: "overdue",
    dueDate: "2024-07-29",
    dueTime: "09:00",
    assignedTo: "Dr. Sarah Johnson",
    estimatedHours: 2,
  },
  {
    id: 5,
    title: "Equipment Maintenance",
    description: "Service and maintain feed dispensing equipment",
    category: "Maintenance", 
    priority: "low",
    status: "pending",
    dueDate: "2024-08-02",
    dueTime: "16:00",
    assignedTo: "Tech Team",
    estimatedHours: 5,
  },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(mockTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    dueDate: "",
    dueTime: "",
    assignedTo: "",
    estimatedHours: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingTaskId) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTaskId 
          ? { 
              ...task, 
              ...formData,
              estimatedHours: parseFloat(formData.estimatedHours) || 1,
            }
          : task
      ));
    } else {
      // Add new task
      const newTask = {
        id: tasks.length + 1,
        ...formData,
        status: "pending" as const,
        estimatedHours: parseFloat(formData.estimatedHours) || 1,
      };
      setTasks([newTask, ...tasks]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      dueDate: "",
      dueTime: "",
      assignedTo: "",
      estimatedHours: "",
    });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingTaskId(null);
  };

  const handleEdit = (task: any) => {
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      assignedTo: task.assignedTo,
      estimatedHours: task.estimatedHours.toString(),
    });
    setEditingTaskId(task.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus as any,
            completedDate: newStatus === "completed" ? new Date().toISOString().split('T')[0] : undefined
          }
        : task
    ));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "pending": "bg-gray-500",
      "in-progress": "bg-blue-500",
      "completed": "bg-green-500",
      "overdue": "bg-red-500",
    };
    
    return <Badge className={variants[status] || "bg-gray-500"}>{status.replace('-', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return <Badge className={priorityConfig?.color || "bg-gray-500"}>{priorityConfig?.label || priority}</Badge>;
  };

  const isOverdue = (dueDate: string, status: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && status !== "completed";
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">
            Organize and track daily farm operations and activities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update task information' : 'Add a new task to your farm management schedule'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Morning Feed Distribution"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    placeholder="e.g., John Smith"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Est. Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 2"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the task"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                {isEditMode ? 'Update Task' : 'Create Task'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{taskStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Finished tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{taskStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Not started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{taskStats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            All tasks sorted by due date and priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks
              .sort((a, b) => {
                // Sort by due date first, then by priority
                const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                if (dateCompare !== 0) return dateCompare;
                
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
              })
              .map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-start justify-between p-4 border rounded-lg ${
                    isOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{task.title}</h3>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                      <Badge variant="outline">{task.category}</Badge>
                      {isOverdue(task.dueDate, task.status) && (
                        <Badge className="bg-red-500">OVERDUE</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Due Date:</p>
                        <p className="font-medium">
                          {new Date(task.dueDate).toLocaleDateString()}
                          {task.dueTime && ` at ${task.dueTime}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Assigned To:</p>
                        <p className="font-medium flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Estimated Time:</p>
                        <p className="font-medium">{task.estimatedHours}h</p>
                      </div>
                      {task.completedDate && (
                        <div>
                          <p className="text-muted-foreground">Completed:</p>
                          <p className="font-medium">{new Date(task.completedDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {task.description && (
                      <div>
                        <p className="text-muted-foreground text-sm">Description:</p>
                        <p className="text-sm">{task.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {task.status !== "completed" && (
                      <>
                        {task.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, "in-progress")}
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status === "in-progress" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, "completed")}
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found matching the current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Component for Task Locations */}
      <MapComponent height="250px" />
    </div>
  );
}
