import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  Weight, 
  Target,
  AlertTriangle,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Batch, BATCH_STATUS_CONFIG, getFCRRating, getMortalityRating } from '@/types/batch';
import { batchService } from '@/services/batchService';

interface BatchCardProps {
  batch: Batch;
  onEdit?: (batch: Batch) => void;
  onDelete?: (batchId: string) => void;
  onStatusUpdate?: (batchId: string, status: Batch['status']) => void;
  showActions?: boolean;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  onEdit,
  onDelete,
  onStatusUpdate,
  showActions = true
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const age = batchService.calculateAge(batch.startDate);
  const mortalityRate = batchService.calculateMortalityRate(batch.mortality, batch.initialBirds);
  const fcrRating = getFCRRating(batch.fcr);
  const mortalityRating = getMortalityRating(mortalityRate);

  const statusConfig = BATCH_STATUS_CONFIG[batch.status];

  const handleStatusUpdate = async (newStatus: Batch['status']) => {
    setIsUpdatingStatus(true);
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(batch.id!, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && batch.id) {
      onDelete(batch.id);
    }
    setShowDeleteDialog(false);
  };

  const getFCRBadgeColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'acceptable': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMortalityBadgeColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'acceptable': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base sm:text-lg font-semibold">
                {batch.batchNumber}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                Started {batch.startDate.toLocaleDateString()}
                <span className="text-gray-400">•</span>
                <Clock className="h-3 w-3" />
                Age: {age} days
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(batch)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Batch
                      </DropdownMenuItem>
                    )}
                    {batch.status === 'active' && onStatusUpdate && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate('completed')}
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Completed
                      </DropdownMenuItem>
                    )}
                    {batch.status === 'completed' && onStatusUpdate && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate('sold')}
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Sold
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Batch
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-gray-600">Birds</p>
                <p className="font-semibold">{batch.currentBirds.toLocaleString()}</p>
                <p className="text-xs text-gray-500">of {batch.initialBirds.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-gray-600">Avg Weight</p>
                <p className="font-semibold">{batch.avgWeight} kg</p>
                <p className="text-xs text-gray-500">per bird</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-gray-600">FCR</p>
                <p className="font-semibold">{batch.fcr}</p>
                <Badge className={`${getFCRBadgeColor(fcrRating)} text-xs`}>
                  {fcrRating}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-gray-600">Mortality</p>
                <p className="font-semibold">{batch.mortality}</p>
                <p className="text-xs text-gray-500">({mortalityRate}%)</p>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getFCRBadgeColor(fcrRating)}>
              FCR: {fcrRating}
            </Badge>
            <Badge className={getMortalityBadgeColor(mortalityRating)}>
              Mortality: {mortalityRating}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {batch.feedUsed} kg feed used
            </Badge>
          </div>

          {/* Notes */}
          {batch.notes && (
            <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-700">{batch.notes}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span>Created: {batch.createdAt.toLocaleDateString()}</span>
              <span>Updated: {batch.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[95vw] max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete batch "{batch.batchNumber}"? 
              This action cannot be undone and will permanently remove all batch data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchCard;
