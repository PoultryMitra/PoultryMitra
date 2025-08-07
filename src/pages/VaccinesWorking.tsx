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
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { LanguageToggle, TranslationStatus } from '@/components/TranslationComponents';

const VaccinesWorking: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Translation setup
  const { t, language } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for VaccinesWorking: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content - fix the nested structure lookup
    const localContent = content[key as keyof typeof content];
    if (localContent && typeof localContent === 'object') {
      const translatedValue = localContent[language as keyof typeof localContent];
      if (translatedValue) {
        console.log(`📚 Static content used for VaccinesWorking: ${key} -> ${translatedValue}`);
        return translatedValue as string;
      }
    }
    
    const result = key;
    console.log(`⚠️ No translation found for VaccinesWorking: ${key}`);
    return result;
  };

  // Content object for translations
  const content = {
    // Page title and descriptions
    title: { en: "Vaccine Reminders", hi: "टीकाकरण अनुस्मारक" },
    subtitle: { en: "Keep track of your poultry vaccination schedule", hi: "अपने पोल्ट्री टीकाकरण कार्यक्रम का ट्रैक रखें" },
    noReminders: { en: "No Vaccine Reminders", hi: "कोई टीकाकरण अनुस्मारक नहीं" },
    addFirstReminder: { en: "Add First Reminder", hi: "पहला अनुस्मारक जोड़ें" },
    addNewReminder: { en: "Add New Reminder", hi: "नया अनुस्मारक जोड़ें" },
    
    // Form labels
    vaccineName: { en: "Vaccine Name", hi: "टीके का नाम" },
    selectVaccine: { en: "Select or enter vaccine name", hi: "टीका नाम चुनें या दर्ज करें" },
    customVaccine: { en: "Custom Vaccine", hi: "कस्टम टीका" },
    enterVaccineName: { en: "Enter vaccine name", hi: "टीके का नाम दर्ज करें" },
    reminderDate: { en: "Reminder Date", hi: "अनुस्मारक दिनांक" },
    flockBatch: { en: "Flock/Batch", hi: "झुंड/बैच" },
    flockBatchPlaceholder: { en: "e.g., Batch A, Flock 1", hi: "जैसे, बैच ए, झुंड 1" },
    dosage: { en: "Dosage", hi: "खुराक" },
    dosagePlaceholder: { en: "e.g., 0.5ml per bird", hi: "जैसे, 0.5 मिली प्रति चूजा" },
    administrationMethod: { en: "Administration Method", hi: "प्रशासन विधि" },
    notes: { en: "Notes", hi: "टिप्पणियां" },
    notesPlaceholder: { en: "Additional notes or instructions", hi: "अतिरिक्त टिप्पणियां या निर्देश" },
    
    // Administration methods
    injection: { en: "Injection", hi: "इंजेक्शन" },
    drinkingWater: { en: "Drinking Water", hi: "पेयजल" },
    spray: { en: "Spray", hi: "स्प्रे" },
    eyeDrop: { en: "Eye Drop", hi: "आंख की बूंद" },
    
    // Status labels
    pending: { en: "Pending", hi: "लंबित" },
    completed: { en: "Completed", hi: "पूर्ण" },
    overdue: { en: "Overdue", hi: "देर से" },
    upcoming: { en: "Upcoming", hi: "आगामी" },
    
    // Common vaccines
    newcastleDisease: { en: "Newcastle Disease (ND)", hi: "न्यूकैसल रोग (एनडी)" },
    infectiousBronchitis: { en: "Infectious Bronchitis (IB)", hi: "संक्रामक श्वासनली शोथ (आईबी)" },
    infectiousBursal: { en: "Infectious Bursal Disease (IBD)", hi: "संक्रामक बर्सल रोग (आईबीडी)" },
    fowlPox: { en: "Fowl Pox", hi: "फाउल पॉक्स" },
    avianInfluenza: { en: "Avian Influenza (AI)", hi: "एवियन इन्फ्लूएंजा (एआई)" },
    mareksDisease: { en: "Marek's Disease", hi: "मारेक का रोग" },
    layerBreeder: { en: "Layer/Breeder Vaccines", hi: "लेयर/ब्रीडर टीके" },
    salmonella: { en: "Salmonella Vaccine", hi: "साल्मोनेला टीका" },
    
    // Buttons
    save: { en: "Save", hi: "सेव करें" },
    cancel: { en: "Cancel", hi: "रद्द करें" },
    edit: { en: "Edit", hi: "संपादित करें" },
    delete: { en: "Delete", hi: "हटाएं" },
    markComplete: { en: "Mark Complete", hi: "पूर्ण के रूप में चिह्नित करें" },
    markPending: { en: "Mark Pending", hi: "लंबित के रूप में चिह्नित करें" },
    
    // Messages
    noRemindersMessage: { en: "You haven't added any vaccine reminders yet. Click 'Add First Reminder' to get started.", hi: "आपने अभी तक कोई टीकाकरण अनुस्मारक नहीं जोड़ा है। शुरू करने के लिए 'पहला अनुस्मारक जोड़ें' पर क्लिक करें।" },
    loadingReminders: { en: "Loading vaccine reminders...", hi: "टीकाकरण अनुस्मारक लोड हो रहे हैं..." },
    
    // Validation messages
    enterVaccineNameError: { en: "Please enter vaccine name", hi: "कृपया टीके का नाम दर्ज करें" },
    enterReminderDateError: { en: "Please enter reminder date", hi: "कृपया अनुस्मारक दिनांक दर्ज करें" },
    
    // Toast messages
    reminderAdded: { en: "Vaccine reminder added successfully", hi: "टीकाकरण अनुस्मारक सफलतापूर्वक जोड़ा गया" },
    reminderUpdated: { en: "Vaccine reminder updated successfully", hi: "टीकाकरण अनुस्मारक सफलतापूर्वक अपडेट किया गया" },
    reminderDeleted: { en: "Vaccine reminder deleted successfully", hi: "टीकाकरण अनुस्मारक सफलतापूर्वक हटाया गया" },
    errorSaving: { en: "Failed to save vaccine reminder", hi: "टीकाकरण अनुस्मारक सेव करने में असफल" },
    errorLoading: { en: "Failed to load vaccine reminders", hi: "टीकाकरण अनुस्मारक लोड करने में असफल" },
    errorDeleting: { en: "Failed to delete vaccine reminder", hi: "टीकाकरण अनुस्मारक हटाने में असफल" }
  };
  
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
    bt('newcastleDisease'),
    bt('infectiousBronchitis'),
    bt('infectiousBursal'),
    bt('fowlPox'),
    bt('avianInfluenza'),
    bt('mareksDisease'),
    bt('layerBreeder'),
    bt('salmonella')
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
        description: bt('errorLoading'),
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
        description: `${bt('enterVaccineNameError')} ${bt('enterReminderDateError')}`,
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
        title: bt('reminderAdded'),
        description: `${bt('reminderAdded')} ${formData.vaccineName}`,
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
        description: bt('errorSaving'),
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
        title: bt('reminderUpdated'),
        description: bt('reminderUpdated'),
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
        description: bt('errorSaving'),
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
        title: bt('reminderDeleted'),
        description: bt('reminderDeleted'),
      });
      
      loadVaccineReminders();
    } catch (error) {
      console.error('Error deleting vaccine reminder:', error);
      toast({
        title: "Error",
        description: bt('errorDeleting'),
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
        title: bt('completed'),
        description: `${reminder.vaccineName} ${bt('completed')}`,
      });
      
      loadVaccineReminders();
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast({
        title: "Error",
        description: bt('errorSaving'),
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
        <div className="text-center">{bt('loadingReminders')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bt('title')}</h1>
          <p className="text-gray-600 mt-2">
            {bt('subtitle')}
          </p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {bt('addNewReminder')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingReminder ? bt('edit') + ' ' + bt('title') : bt('addNewReminder')}
              </DialogTitle>
              <DialogDescription>
                {editingReminder ? bt('reminderUpdated') : bt('addNewReminder')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="vaccineName">{bt('vaccineName')}</Label>
                <Select 
                  value={formData.vaccineName} 
                  onValueChange={(value) => handleInputChange('vaccineName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={bt('selectVaccine')} />
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
                    placeholder={bt('enterVaccineName')}
                    value={formData.vaccineName}
                    onChange={(e) => handleInputChange('vaccineName', e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="reminderDate">{bt('reminderDate')}</Label>
                <Input
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) => handleInputChange('reminderDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="flock">{bt('flockBatch')}</Label>
                <Input
                  placeholder={bt('flockBatchPlaceholder')}
                  value={formData.flock}
                  onChange={(e) => handleInputChange('flock', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dosage">{bt('dosage')}</Label>
                <Input
                  placeholder={bt('dosagePlaceholder')}
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="method">{bt('administrationMethod')}</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={(value) => handleInputChange('method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="injection">{bt('injection')}</SelectItem>
                    <SelectItem value="drinking_water">{bt('drinkingWater')}</SelectItem>
                    <SelectItem value="spray">{bt('spray')}</SelectItem>
                    <SelectItem value="eye_drop">{bt('eyeDrop')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">{bt('notes')} (Optional)</Label>
                <Textarea
                  placeholder={bt('notesPlaceholder')}
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
                  {bt('cancel')}
                </Button>
                <Button onClick={editingReminder ? handleUpdateReminder : handleAddReminder}>
                  {editingReminder ? bt('edit') : bt('save')} {bt('title')}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">{bt('noReminders')}</h3>
            <p className="text-gray-600 mb-4">
              {bt('noRemindersMessage')}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {bt('addFirstReminder')}
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
                          {bt(currentStatus)}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {reminder.reminderDate ? reminder.reminderDate.toDate().toLocaleDateString() : 'No date set'}
                        </span>
                        {reminder.flock && (
                          <span>{bt('flockBatch')}: {reminder.flock}</span>
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
                          {bt('markComplete')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditReminder(reminder)}
                        title={bt('edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reminder.id && handleDeleteReminder(reminder.id)}
                        title={bt('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {overdueStatus && reminder.status !== 'completed' && (
                    <Alert className="mt-3">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        {bt('overdue')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {reminder.dosage && (
                      <div>
                        <span className="font-medium text-gray-600">{bt('dosage')}:</span>
                        <p>{reminder.dosage}</p>
                      </div>
                    )}
                    {reminder.method && (
                      <div>
                        <span className="font-medium text-gray-600">{bt('administrationMethod')}:</span>
                        <p className="capitalize">{bt(reminder.method.replace('_', ''))}</p>
                      </div>
                    )}
                  </div>
                  
                  {reminder.notes && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">{bt('notes')}:</span>
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
