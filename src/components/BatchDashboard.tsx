import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Batch, BatchMetrics, BatchFilters } from '@/types/batch';
import { batchService } from '@/services/batchService';
import BatchMetricsComponent from '@/components/BatchMetrics';
import BatchCard from '@/components/BatchCard';
import BatchForm from '@/components/BatchForm';

interface BatchDashboardProps {
  farmerId: string;
  farmerName: string;
}

export const BatchDashboard: React.FC<BatchDashboardProps> = ({
  farmerId,
  farmerName
}) => {
  const { toast } = useToast();
  
  // State management
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [metrics, setMetrics] = useState<BatchMetrics>({
    totalBatches: 0,
    totalBirds: 0,
    averageFCR: 0,
    mortalityRate: 0,
    activeBatches: 0,
    completedBatches: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | undefined>(undefined);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BatchFilters>({
    status: 'all',
    dateRange: 'all',
    sortBy: 'startDate',
    sortOrder: 'desc'
  });

  // Load batches and metrics
  const loadBatchData = async () => {
    try {
      setLoading(true);
      const { batches: fetchedBatches, metrics: fetchedMetrics } = await batchService.getBatchSummary(farmerId);
      setBatches(fetchedBatches);
      setMetrics(fetchedMetrics);
    } catch (error) {
      console.error('Error loading batch data:', error);
      toast({
        title: "Error",
        description: "Failed to load batch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBatchData();
  }, [farmerId]);

  // Filter and sort batches
  useEffect(() => {
    let filtered = [...batches];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(batch => batch.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'thisWeek':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'thisMonth':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'last3Months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(batch => batch.startDate >= filterDate);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'startDate':
            aValue = a.startDate.getTime();
            bValue = b.startDate.getTime();
            break;
          case 'batchNumber':
            aValue = a.batchNumber.toLowerCase();
            bValue = b.batchNumber.toLowerCase();
            break;
          case 'fcr':
            aValue = a.fcr;
            bValue = b.fcr;
            break;
          case 'mortality':
            aValue = batchService.calculateMortalityRate(a.mortality, a.initialBirds);
            bValue = batchService.calculateMortalityRate(b.mortality, b.initialBirds);
            break;
          default:
            aValue = a.startDate.getTime();
            bValue = b.startDate.getTime();
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredBatches(filtered);
  }, [batches, searchTerm, filters]);

  // Handle batch creation/update
  const handleBatchSubmit = async (batchData: any) => {
    try {
      setSubmitting(true);
      
      if (editingBatch) {
        // Update existing batch
        await batchService.updateBatch(editingBatch.id!, batchData);
        toast({
          title: "Success",
          description: "Batch updated successfully!",
        });
      } else {
        // Create new batch
        await batchService.createBatch({
          ...batchData,
          farmerId,
          farmerName
        });
        toast({
          title: "Success",
          description: "New batch created successfully!",
        });
      }
      
      // Refresh data and close form
      await loadBatchData();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving batch:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingBatch ? 'update' : 'create'} batch. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle batch deletion
  const handleBatchDelete = async (batchId: string) => {
    try {
      await batchService.deleteBatch(batchId);
      toast({
        title: "Success",
        description: "Batch deleted successfully!",
      });
      await loadBatchData();
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({
        title: "Error",
        description: "Failed to delete batch. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle status update
  const handleStatusUpdate = async (batchId: string, status: Batch['status']) => {
    try {
      await batchService.updateBatchStatus(batchId, status);
      toast({
        title: "Success",
        description: `Batch status updated to ${status}!`,
      });
      await loadBatchData();
    } catch (error) {
      console.error('Error updating batch status:', error);
      toast({
        title: "Error",
        description: "Failed to update batch status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Form management
  const handleAddBatch = () => {
    setEditingBatch(undefined);
    setShowBatchForm(true);
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setShowBatchForm(true);
  };

  const handleCloseForm = () => {
    setShowBatchForm(false);
    setEditingBatch(undefined);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      dateRange: 'all',
      sortBy: 'startDate',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome {farmerName}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage your poultry batches, track performance, and monitor growth. All tools are free - only saving and downloading reports requires login.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleAddBatch} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Batch
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Save Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <BatchMetricsComponent metrics={metrics} loading={loading} />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="last3Months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="batchNumber">Batch Number</SelectItem>
                  <SelectItem value="fcr">FCR</SelectItem>
                  <SelectItem value="mortality">Mortality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{filteredBatches.length} batches</Badge>
              {(searchTerm || filters.status !== 'all' || filters.dateRange !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadBatchData}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batches List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Your Batches
          </CardTitle>
          <CardDescription>
            {filteredBatches.length === 0 && batches.length > 0 
              ? 'No batches match your current filters'
              : `Showing ${filteredBatches.length} of ${batches.length} batches`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {batches.length === 0 ? 'No batches yet' : 'No batches match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {batches.length === 0 
                  ? 'Get started by creating your first poultry batch'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {batches.length === 0 && (
                <Button onClick={handleAddBatch}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Batch
                </Button>
              )}
            </div>
          ) : (
            // Batches grid
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredBatches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onEdit={handleEditBatch}
                  onDelete={handleBatchDelete}
                  onStatusUpdate={handleStatusUpdate}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Form Modal */}
      <BatchForm
        batch={editingBatch}
        farmerId={farmerId}
        farmerName={farmerName}
        onSubmit={handleBatchSubmit}
        onCancel={handleCloseForm}
        loading={submitting}
        open={showBatchForm}
      />
    </div>
  );
};

export default BatchDashboard;
