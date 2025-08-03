// Batch-related type definitions
export interface Batch {
  id?: string;
  batchNumber: string;
  startDate: Date;
  status: 'active' | 'completed' | 'sold';
  initialBirds: number;
  currentBirds: number;
  mortality: number;
  feedUsed: number; // in kg
  avgWeight: number; // in kg
  fcr: number; // Feed Conversion Ratio (calculated)
  farmerId: string;
  farmerName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchMetrics {
  totalBatches: number;
  totalBirds: number;
  averageFCR: number;
  mortalityRate: number;
  activeBatches: number;
  completedBatches: number;
}

export interface BatchPerformanceData {
  age: number; // days
  weight: number; // kg
  feedConsumed: number; // kg
  mortality: number;
  fcr: number;
  recordedAt: Date;
}

export interface BatchFormData {
  batchNumber?: string;
  startDate: Date;
  initialBirds: number;
  currentBirds: number;
  mortality: number;
  feedUsed: number;
  avgWeight: number;
  notes?: string;
}

export interface BatchFilters {
  status?: 'all' | 'active' | 'completed' | 'sold';
  dateRange?: 'all' | 'thisWeek' | 'thisMonth' | 'last3Months';
  sortBy?: 'startDate' | 'batchNumber' | 'fcr' | 'mortality';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchCardProps {
  batch: Batch;
  onEdit?: (batch: Batch) => void;
  onDelete?: (batchId: string) => void;
  onStatusUpdate?: (batchId: string, status: Batch['status']) => void;
  showActions?: boolean;
}

export interface BatchMetricsProps {
  metrics: BatchMetrics;
  loading?: boolean;
}

export interface BatchFormProps {
  batch?: Batch;
  farmerId: string;
  farmerName: string;
  onSubmit: (batchData: BatchFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface BatchDashboardProps {
  farmerId: string;
  farmerName: string;
}

// Performance tracking types
export interface PerformanceRecord {
  id?: string;
  batchId: string;
  date: Date;
  weight: number;
  feedConsumed: number;
  mortality: number;
  notes?: string;
}

export interface BatchAnalytics {
  weightGrowthTrend: Array<{ date: Date; weight: number }>;
  fcrTrend: Array<{ date: Date; fcr: number }>;
  mortalityTrend: Array<{ date: Date; cumulative: number }>;
  feedConsumptionTrend: Array<{ date: Date; consumed: number }>;
}

// Batch status colors and labels
export const BATCH_STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    badgeColor: 'bg-green-500'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    badgeColor: 'bg-blue-500'
  },
  sold: {
    label: 'Sold',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    badgeColor: 'bg-gray-500'
  }
} as const;

// Default values for new batches
export const DEFAULT_BATCH_VALUES: Partial<BatchFormData> = {
  startDate: new Date(),
  initialBirds: 1000,
  currentBirds: 1000,
  mortality: 0,
  feedUsed: 0,
  avgWeight: 0.05, // 50g for day-old chicks
  notes: ''
};

// Validation rules
export const BATCH_VALIDATION_RULES = {
  batchNumber: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  initialBirds: {
    required: true,
    min: 1,
    max: 100000
  },
  currentBirds: {
    required: true,
    min: 0
  },
  mortality: {
    required: true,
    min: 0
  },
  feedUsed: {
    required: true,
    min: 0
  },
  avgWeight: {
    required: true,
    min: 0,
    max: 10 // 10kg max average weight seems reasonable
  }
};

// Performance calculation helpers
export const PERFORMANCE_BENCHMARKS = {
  excellentFCR: 1.6,
  goodFCR: 1.8,
  acceptableFCR: 2.0,
  excellentMortality: 2,
  goodMortality: 5,
  acceptableMortality: 8
};

export const getFCRRating = (fcr: number): 'excellent' | 'good' | 'acceptable' | 'poor' => {
  if (fcr <= PERFORMANCE_BENCHMARKS.excellentFCR) return 'excellent';
  if (fcr <= PERFORMANCE_BENCHMARKS.goodFCR) return 'good';
  if (fcr <= PERFORMANCE_BENCHMARKS.acceptableFCR) return 'acceptable';
  return 'poor';
};

export const getMortalityRating = (mortalityRate: number): 'excellent' | 'good' | 'acceptable' | 'poor' => {
  if (mortalityRate <= PERFORMANCE_BENCHMARKS.excellentMortality) return 'excellent';
  if (mortalityRate <= PERFORMANCE_BENCHMARKS.goodMortality) return 'good';
  if (mortalityRate <= PERFORMANCE_BENCHMARKS.acceptableMortality) return 'acceptable';
  return 'poor';
};
