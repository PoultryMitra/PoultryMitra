import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { addVaccineReminder, getVaccineReminders, updateVaccineReminder, deleteVaccineReminder, VaccineReminder } from '@/services/farmerService';
import { Calendar, Clock, Trash2, Edit, Plus, Syringe, AlertTriangle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const VaccinesWorking: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [vaccineReminders, setVaccineReminders] = useState<VaccineReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<VaccineReminder | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    vaccineName: '',
    reminderDate: '',
    notes: '',
    flock: '',
    dosage: '',
    method: 'injection' as 'injection' | 'drinking_water' | 'spray' | 'eye_drop',
    status: 'pending' as 'pending' | 'completed'
  });

  // Common vaccines for poultry
  const commonVaccines = [
    'Newcastle Disease (ND)',
    'Infectious Bronchitis (IB)', 
    'Infectious Bursal Disease (IBD)',
    'Fowl Pox',
    'Avian Influenza (AI)',
    'Marek\'s Disease',
    'Layer/Breeder Vaccines',
    'Salmonella Vaccine'
  ];

  // Load vaccine reminders
  const loadVaccineReminders = async () => {
    if (!currentUser?.uid) return;
    
    setIsLoading(true);
    try {
      const reminders = await getVaccineReminders(currentUser.uid);
      // Filter out any invalid reminders
      const validReminders = reminders.filter(reminder => 
        reminder && reminder.reminderDate && reminder.vaccineName
      );
      setVaccineReminders(validReminders);
    } catch (error) {
      console.error('Error loading vaccine reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load vaccine reminders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVaccineReminders();
  }, [currentUser]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle add new reminder
  const handleAddReminder = async () => {
    if (!currentUser?.uid) return;
    
    if (!formData.vaccineName || !formData.reminderDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in vaccine name and reminder date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const reminderData = {
        vaccineName: formData.vaccineName,
        reminderDate: new Date(formData.reminderDate),
        notes: formData.notes,
        flock: formData.flock,
        dosage: formData.dosage,
        method: formData.method as 'injection' | 'drinking_water' | 'spray' | 'eye_drop',
        status: formData.status as 'pending' | 'completed'
      };

      await addVaccineReminder(currentUser.uid, reminderData);
      
      toast({
        title: "Reminder Added",
        description: `Vaccine reminder for ${formData.vaccineName} has been added.`,
      });
      
      // Reset form and reload data
      setFormData({
        vaccineName: '',
        reminderDate: '',
        notes: '',
        flock: '',
        dosage: '',
        method: 'injection',
        status: 'pending'
      });
      setShowAddModal(false);
      loadVaccineReminders();
    } catch (error) {
      console.error('Error adding vaccine reminder:', error);
      toast({
        title: "Error",
        description: "Failed to add vaccine reminder.",
        variant: "destructive",
      });
    }
  };

  // Handle edit reminder
  const handleEditReminder = (reminder: VaccineReminder) => {
    setEditingReminder(reminder);
    setFormData({
      vaccineName: reminder.vaccineName,
      reminderDate: reminder.reminderDate ? reminder.reminderDate.toDate().toISOString().split('T')[0] : '',
      notes: reminder.notes || '',
      flock: reminder.flock || '',
      dosage: reminder.dosage || '',
      method: reminder.method as 'injection' | 'drinking_water' | 'spray' | 'eye_drop' || 'injection',
      status: reminder.status as 'pending' | 'completed' || 'pending'
    });
    setShowAddModal(true);
  };

  // Handle update reminder
  const handleUpdateReminder = async () => {
    if (!currentUser?.uid || !editingReminder?.id) return;

    try {
      const updateData = {
        vaccineName: formData.vaccineName,
        reminderDate: Timestamp.fromDate(new Date(formData.reminderDate)),
        notes: formData.notes,
        flock: formData.flock,
        dosage: formData.dosage,
        method: formData.method as 'injection' | 'drinking_water' | 'spray' | 'eye_drop',
        status: formData.status as 'pending' | 'completed'
      };

      await updateVaccineReminder(editingReminder.id, updateData);
      
      toast({
        title: "Reminder Updated",
        description: `Vaccine reminder has been updated.`,
      });
      
      // Reset form and reload data
      setFormData({
        vaccineName: '',
        reminderDate: '',
        notes: '',
        flock: '',
        dosage: '',
        method: 'injection',
        status: 'pending'
      });
      setShowAddModal(false);
      setEditingReminder(null);
      loadVaccineReminders();
    } catch (error) {
      console.error('Error updating vaccine reminder:', error);
      toast({
        title: "Error",
        description: "Failed to update vaccine reminder.",
        variant: "destructive",
      });
    }
  };

  // Handle delete reminder
  const handleDeleteReminder = async (reminderId: string) => {
    if (!currentUser?.uid) return;

    if (!confirm('Are you sure you want to delete this vaccine reminder?')) {
      return;
    }

    try {
      await deleteVaccineReminder(reminderId);
      
      toast({
        title: "Reminder Deleted",
        description: "Vaccine reminder has been deleted.",
      });
      
      loadVaccineReminders();
    } catch (error) {
      console.error('Error deleting vaccine reminder:', error);
      toast({
        title: "Error",
        description: "Failed to delete vaccine reminder.",
        variant: "destructive",
      });
    }
  };

  // Mark reminder as completed
  const handleMarkCompleted = async (reminder: VaccineReminder) => {
    if (!currentUser?.uid || !reminder.id) return;

    try {
      await updateVaccineReminder(reminder.id, {
        status: 'completed'
      });
      
      toast({
        title: "Reminder Completed",
        description: `${reminder.vaccineName} vaccination marked as completed.`,
      });
      
      loadVaccineReminders();
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder status.",
        variant: "destructive",
      });
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  // Check if reminder is overdue
  const isOverdue = (reminderDate: Timestamp | undefined) => {
    if (!reminderDate) return false;
    return reminderDate.toDate() < new Date() && reminderDate.toDate().toDateString() !== new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading vaccine reminders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vaccine Reminders</h1>
          <p className="text-gray-600 mt-2">
            Keep track of your poultry vaccination schedule
          </p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingReminder ? 'Edit Vaccine Reminder' : 'Add Vaccine Reminder'}
              </DialogTitle>
              <DialogDescription>
                {editingReminder ? 'Update the vaccine reminder details.' : 'Create a new vaccination reminder for your flock.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="vaccineName">Vaccine Name</Label>
                <Select 
                  value={formData.vaccineName} 
                  onValueChange={(value) => handleInputChange('vaccineName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or type vaccine name" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonVaccines.map((vaccine) => (
                      <SelectItem key={vaccine} value={vaccine}>
                        {vaccine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!commonVaccines.includes(formData.vaccineName) && (
                  <Input
                    className="mt-2"
                    placeholder="Or enter custom vaccine name"
                    value={formData.vaccineName}
                    onChange={(e) => handleInputChange('vaccineName', e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="reminderDate">Reminder Date</Label>
                <Input
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) => handleInputChange('reminderDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="flock">Flock/Group</Label>
                <Input
                  placeholder="e.g., Batch A, Layer House 1"
                  value={formData.flock}
                  onChange={(e) => handleInputChange('flock', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  placeholder="e.g., 0.5ml per bird, 1 dose"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="method">Administration Method</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={(value) => handleInputChange('method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="injection">Injection</SelectItem>
                    <SelectItem value="drinking_water">Drinking Water</SelectItem>
                    <SelectItem value="spray">Spray</SelectItem>
                    <SelectItem value="eye_drop">Eye Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  placeholder="Additional notes about the vaccination..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowAddModal(false);
                  setEditingReminder(null);
                  setFormData({
                    vaccineName: '',
                    reminderDate: '',
                    notes: '',
                    flock: '',
                    dosage: '',
                    method: 'injection',
                    status: 'pending'
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={editingReminder ? handleUpdateReminder : handleAddReminder}>
                  {editingReminder ? 'Update' : 'Add'} Reminder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vaccine Reminders List */}
      {vaccineReminders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Syringe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Vaccine Reminders</h3>
            <p className="text-gray-600 mb-4">
              Create your first vaccination reminder to keep your flock healthy.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vaccineReminders.map((reminder) => {
            // Add safety checks for reminder data
            if (!reminder || !reminder.reminderDate) {
              console.warn('Invalid reminder data:', reminder);
              return null;
            }

            const overdueStatus = isOverdue(reminder.reminderDate);
            const currentStatus = overdueStatus && reminder.status !== 'completed' ? 'overdue' : reminder.status;
            
            return (
              <Card key={reminder.id} className={overdueStatus && reminder.status !== 'completed' ? 'border-red-200 bg-red-50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Syringe className="w-5 h-5 text-blue-600" />
                        {reminder.vaccineName}
                        <Badge variant={getStatusBadgeVariant(currentStatus)}>
                          {currentStatus}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {reminder.reminderDate ? reminder.reminderDate.toDate().toLocaleDateString() : 'No date set'}
                        </span>
                        {reminder.flock && (
                          <span>Flock: {reminder.flock}</span>
                        )}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
                      {reminder.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkCompleted(reminder)}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditReminder(reminder)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reminder.id && handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {overdueStatus && reminder.status !== 'completed' && (
                    <Alert className="mt-3">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        This vaccination is overdue. Please administer as soon as possible.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {reminder.dosage && (
                      <div>
                        <span className="font-medium text-gray-600">Dosage:</span>
                        <p>{reminder.dosage}</p>
                      </div>
                    )}
                    {reminder.method && (
                      <div>
                        <span className="font-medium text-gray-600">Method:</span>
                        <p className="capitalize">{reminder.method.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>
                  
                  {reminder.notes && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Notes:</span>
                      <p className="text-sm mt-1">{reminder.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VaccinesWorking;
