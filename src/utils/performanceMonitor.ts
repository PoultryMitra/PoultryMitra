// Performance monitoring utilities for services
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100; // Keep last 100 metrics

  // Start timing a function
  startTimer(name: string): (success?: boolean, error?: string) => void {
    const startTime = performance.now();
    const startTimestamp = Date.now();

    return (success: boolean = true, error?: string) => {
      const duration = performance.now() - startTime;
      
      this.addMetric({
        name,
        duration,
        timestamp: startTimestamp,
        success,
        error
      });
    };
  }

  // Add a performance metric
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (metric.duration > 2000) { // More than 2 seconds
      console.warn(`🐌 Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
    }

    // Log failures
    if (!metric.success) {
      console.error(`❌ Operation failed: ${metric.name} - ${metric.error}`);
    }
  }

  // Get performance statistics
  getStats(functionName?: string): {
    totalCalls: number;
    successRate: number;
    averageDuration: number;
    slowestOperation: number;
    fastestOperation: number;
  } {
    let relevantMetrics = this.metrics;
    
    if (functionName) {
      relevantMetrics = this.metrics.filter(m => m.name === functionName);
    }

    if (relevantMetrics.length === 0) {
      return {
        totalCalls: 0,
        successRate: 0,
        averageDuration: 0,
        slowestOperation: 0,
        fastestOperation: 0
      };
    }

    const successCount = relevantMetrics.filter(m => m.success).length;
    const durations = relevantMetrics.map(m => m.duration);
    
    return {
      totalCalls: relevantMetrics.length,
      successRate: (successCount / relevantMetrics.length) * 100,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      slowestOperation: Math.max(...durations),
      fastestOperation: Math.min(...durations)
    };
  }

  // Clear all metrics
  clear(): void {
    this.metrics = [];
  }

  // Get recent errors
  getRecentErrors(count: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => !m.success)
      .slice(-count)
      .reverse();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Decorator function for monitoring async functions
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  functionName: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const endTimer = performanceMonitor.startTimer(functionName);
    
    try {
      const result = await fn(...args);
      endTimer(true);
      return result;
    } catch (error) {
      endTimer(false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }) as T;
}

// Helper function for measuring sync functions
export function measureSync<T>(functionName: string, fn: () => T): T {
  const endTimer = performanceMonitor.startTimer(functionName);
  
  try {
    const result = fn();
    endTimer(true);
    return result;
  } catch (error) {
    endTimer(false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
