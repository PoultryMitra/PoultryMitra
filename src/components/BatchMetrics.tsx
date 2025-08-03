import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Target,
  AlertTriangle
} from 'lucide-react';
import { BatchMetrics, getFCRRating, getMortalityRating } from '@/types/batch';

interface BatchMetricsProps {
  metrics: BatchMetrics;
  loading?: boolean;
}

export const BatchMetricsComponent: React.FC<BatchMetricsProps> = ({ 
  metrics, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded"></div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const fcrRating = getFCRRating(metrics.averageFCR);
  const mortalityRating = getMortalityRating(metrics.mortalityRate);

  const getFCRColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'acceptable': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMortalityColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'acceptable': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRatingBadge = (rating: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      acceptable: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`${colors[rating as keyof typeof colors]} text-xs`}>
        {rating.charAt(0).toUpperCase() + rating.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Batches */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-lg sm:text-2xl font-bold">{metrics.totalBatches}</p>
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 flex items-center">
                {metrics.activeBatches} active
              </span>
              <span className="text-gray-400 mx-1">•</span>
              <span className="text-gray-600">
                {metrics.completedBatches} completed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Birds */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Birds</p>
                <p className="text-lg sm:text-2xl font-bold">{metrics.totalBirds.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average FCR */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className={`h-6 w-6 sm:h-8 sm:w-8 ${getFCRColor(fcrRating)}`} />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Average FCR</p>
                  <p className={`text-lg sm:text-2xl font-bold ${getFCRColor(fcrRating)}`}>
                    {metrics.averageFCR || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-2">
              {getRatingBadge(fcrRating)}
            </div>
          </CardContent>
        </Card>

        {/* Mortality Rate */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className={`h-6 w-6 sm:h-8 sm:w-8 ${getMortalityColor(mortalityRating)}`} />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Mortality Rate</p>
                  <p className={`text-lg sm:text-2xl font-bold ${getMortalityColor(mortalityRating)}`}>
                    {metrics.mortalityRate}%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-2">
              {getRatingBadge(mortalityRating)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Performance Summary
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Overall batch performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FCR Performance</span>
                {getRatingBadge(fcrRating)}
              </div>
              <div className="text-xs text-gray-500">
                {fcrRating === 'excellent' && 'Outstanding feed efficiency'}
                {fcrRating === 'good' && 'Good feed conversion'}
                {fcrRating === 'acceptable' && 'Acceptable performance'}
                {fcrRating === 'poor' && 'Needs improvement'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mortality Control</span>
                {getRatingBadge(mortalityRating)}
              </div>
              <div className="text-xs text-gray-500">
                {mortalityRating === 'excellent' && 'Excellent health management'}
                {mortalityRating === 'good' && 'Good health control'}
                {mortalityRating === 'acceptable' && 'Acceptable mortality'}
                {mortalityRating === 'poor' && 'High mortality - investigate'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Batches</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.activeBatches}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                Currently managing {metrics.activeBatches} active batch{metrics.activeBatches !== 1 ? 'es' : ''}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.totalBatches > 0 ? 
                    Math.round((metrics.completedBatches / metrics.totalBatches) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                Completion rate across all batches
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchMetricsComponent;
