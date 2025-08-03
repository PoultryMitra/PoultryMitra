import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  X, 
  Calculator,
  AlertCircle,
  Calendar,
  Users,
  Weight,
  Target
} from 'lucide-react';
import { Batch, BatchFormData, DEFAULT_BATCH_VALUES, BATCH_VALIDATION_RULES } from '@/types/batch';
import { batchService } from '@/services/batchService';

interface BatchFormProps {
  batch?: Batch;
  farmerId: string;
  farmerName: string;
  onSubmit: (batchData: BatchFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  open: boolean;
}

export const BatchForm: React.FC<BatchFormProps> = ({
  batch,
  farmerId,
  farmerName,
  onSubmit,
  onCancel,
  loading = false,
  open
}) => {
  const [formData, setFormData] = useState<BatchFormData>({
    ...DEFAULT_BATCH_VALUES,
    startDate: new Date(),
    initialBirds: 1000,
    currentBirds: 1000,
    mortality: 0,
    feedUsed: 0,
    avgWeight: 0.05
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedFCR, setCalculatedFCR] = useState<number>(0);
  const [calculatedMortalityRate, setCalculatedMortalityRate] = useState<number>(0);

  // Initialize form data when batch prop changes
  useEffect(() => {
    if (batch) {
      setFormData({
        batchNumber: batch.batchNumber,
        startDate: batch.startDate,
        initialBirds: batch.initialBirds,
        currentBirds: batch.currentBirds,
        mortality: batch.mortality,
        feedUsed: batch.feedUsed,
        avgWeight: batch.avgWeight,
        notes: batch.notes || ''
      });
    } else {
      // Generate new batch number for new batches
      const batchNumber = batchService.generateBatchNumber(farmerId);
      setFormData({
        ...DEFAULT_BATCH_VALUES,
        batchNumber,
        startDate: new Date(),
        initialBirds: 1000,
        currentBirds: 1000,
        mortality: 0,
        feedUsed: 0,
        avgWeight: 0.05
      });
    }
  }, [batch, farmerId]);

  // Calculate FCR and mortality rate whenever relevant fields change
  useEffect(() => {
    const totalWeight = formData.currentBirds * formData.avgWeight;
    const fcr = batchService.calculateFCR(formData.feedUsed, totalWeight);
    const mortalityRate = batchService.calculateMortalityRate(formData.mortality, formData.initialBirds);
    
    setCalculatedFCR(fcr);
    setCalculatedMortalityRate(mortalityRate);
  }, [formData.currentBirds, formData.avgWeight, formData.feedUsed, formData.mortality, formData.initialBirds]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Batch number validation
    if (!formData.batchNumber?.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    } else if (formData.batchNumber.length < BATCH_VALIDATION_RULES.batchNumber.minLength) {
      newErrors.batchNumber = `Batch number must be at least ${BATCH_VALIDATION_RULES.batchNumber.minLength} characters`;
    }

    // Initial birds validation
    if (formData.initialBirds < BATCH_VALIDATION_RULES.initialBirds.min) {
      newErrors.initialBirds = `Initial birds must be at least ${BATCH_VALIDATION_RULES.initialBirds.min}`;
    }
    if (formData.initialBirds > BATCH_VALIDATION_RULES.initialBirds.max) {
      newErrors.initialBirds = `Initial birds cannot exceed ${BATCH_VALIDATION_RULES.initialBirds.max}`;
    }

    // Current birds validation
    if (formData.currentBirds < 0) {
      newErrors.currentBirds = 'Current birds cannot be negative';
    }
    if (formData.currentBirds > formData.initialBirds) {
      newErrors.currentBirds = 'Current birds cannot exceed initial birds';
    }

    // Mortality validation
    if (formData.mortality < 0) {
      newErrors.mortality = 'Mortality cannot be negative';
    }
    if (formData.mortality > formData.initialBirds) {
      newErrors.mortality = 'Mortality cannot exceed initial birds';
    }

    // Check if mortality + current birds = initial birds
    const totalAccounted = formData.currentBirds + formData.mortality;
    if (totalAccounted > formData.initialBirds) {
      newErrors.currentBirds = 'Current birds + mortality cannot exceed initial birds';
    }

    // Feed used validation
    if (formData.feedUsed < 0) {
      newErrors.feedUsed = 'Feed used cannot be negative';
    }

    // Average weight validation
    if (formData.avgWeight <= 0) {
      newErrors.avgWeight = 'Average weight must be greater than 0';
    }
    if (formData.avgWeight > BATCH_VALIDATION_RULES.avgWeight.max) {
      newErrors.avgWeight = `Average weight cannot exceed ${BATCH_VALIDATION_RULES.avgWeight.max} kg`;
    }

    // Start date validation
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1); // Allow up to 1 month in future
    
    if (formData.startDate > maxDate) {
      newErrors.startDate = 'Start date cannot be more than 1 month in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof BatchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="w-[95vw] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {batch ? 'Edit Batch' : 'Add New Batch'}
          </DialogTitle>
          <DialogDescription>
            {batch ? 'Update batch information and performance data' : 'Create a new poultry batch with initial data'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNumber">Batch Number *</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber || ''}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    placeholder="Enter batch number"
                    className={errors.batchNumber ? 'border-red-500' : ''}
                  />
                  {errors.batchNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.batchNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formatDateForInput(formData.startDate)}
                    onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bird Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bird Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="initialBirds">Initial Birds *</Label>
                  <Input
                    id="initialBirds"
                    type="number"
                    min="1"
                    value={formData.initialBirds}
                    onChange={(e) => handleInputChange('initialBirds', parseInt(e.target.value) || 0)}
                    placeholder="1000"
                    className={errors.initialBirds ? 'border-red-500' : ''}
                  />
                  {errors.initialBirds && (
                    <p className="text-red-500 text-xs mt-1">{errors.initialBirds}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentBirds">Current Birds *</Label>
                  <Input
                    id="currentBirds"
                    type="number"
                    min="0"
                    value={formData.currentBirds}
                    onChange={(e) => handleInputChange('currentBirds', parseInt(e.target.value) || 0)}
                    placeholder="950"
                    className={errors.currentBirds ? 'border-red-500' : ''}
                  />
                  {errors.currentBirds && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentBirds}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mortality">Mortality *</Label>
                  <Input
                    id="mortality"
                    type="number"
                    min="0"
                    value={formData.mortality}
                    onChange={(e) => handleInputChange('mortality', parseInt(e.target.value) || 0)}
                    placeholder="50"
                    className={errors.mortality ? 'border-red-500' : ''}
                  />
                  {errors.mortality && (
                    <p className="text-red-500 text-xs mt-1">{errors.mortality}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Mortality rate: {calculatedMortalityRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Performance Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="feedUsed">Feed Used (kg) *</Label>
                  <Input
                    id="feedUsed"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.feedUsed}
                    onChange={(e) => handleInputChange('feedUsed', parseFloat(e.target.value) || 0)}
                    placeholder="1500.5"
                    className={errors.feedUsed ? 'border-red-500' : ''}
                  />
                  {errors.feedUsed && (
                    <p className="text-red-500 text-xs mt-1">{errors.feedUsed}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="avgWeight">Average Weight (kg) *</Label>
                  <Input
                    id="avgWeight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.avgWeight}
                    onChange={(e) => handleInputChange('avgWeight', parseFloat(e.target.value) || 0)}
                    placeholder="1.8"
                    className={errors.avgWeight ? 'border-red-500' : ''}
                  />
                  {errors.avgWeight && (
                    <p className="text-red-500 text-xs mt-1">{errors.avgWeight}</p>
                  )}
                </div>
              </div>

              {/* FCR Display */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Calculated FCR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-900">{calculatedFCR}</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {calculatedFCR <= 1.6 ? 'Excellent' : 
                     calculatedFCR <= 1.8 ? 'Good' : 
                     calculatedFCR <= 2.0 ? 'Acceptable' : 'Poor'}
                  </Badge>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Feed Conversion Ratio = Total Feed ÷ Total Weight
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this batch..."
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Data Validation Alert */}
          {formData.currentBirds + formData.mortality !== formData.initialBirds && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Data Check:</strong> Current birds ({formData.currentBirds}) + Mortality ({formData.mortality}) = {formData.currentBirds + formData.mortality}, 
                but initial birds is {formData.initialBirds}. 
                {formData.currentBirds + formData.mortality < formData.initialBirds && 
                  ` You may have ${formData.initialBirds - formData.currentBirds - formData.mortality} unaccounted birds.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : batch ? 'Update Batch' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchForm;
