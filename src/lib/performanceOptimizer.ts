/**
 * Performance Optimization Engine
 * Optimizes analysis performance for large repositories and high-throughput scenarios
 */

import type {
  PerformanceMetrics,
  OptimizationConfig,
  CacheEntry,
  MemoryUsage,
  AnalysisQueue,
  BatchAnalysisResult
} from '../types';

export interface PerformanceConfig {
  enableCaching?: boolean;
  cacheTtl?: number;
  maxConcurrentAnalyses?: number;
  memoryThreshold?: number;
  enableStreaming?: boolean;
  batchSize?: number;
  enableCompression?: boolean;
  priorityQueue?: boolean;
}

export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private analysisQueue: AnalysisQueue = {
    high: [],
    medium: [],
    low: []
  };
  private activeAnalyses = new Set<string>();
  private memoryMonitor: NodeJS.Timeout | null = null;
  private performanceMetrics: PerformanceMetrics = {
    totalAnalyses: 0,
    averageAnalysisTime: 0,
    cacheHitRate: 0,
    memoryUsage: { used: 0, total: 0, percentage: 0 },
    errorRate: 0,
    throughput: 0
  };

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      enableCaching: true,
      cacheTtl: 30 * 60 * 1000, // 30 minutes
      maxConcurrentAnalyses: 3,
      memoryThreshold: 0.8, // 80% memory usage threshold
      enableStreaming: true,
      batchSize: 10,
      enableCompression: true,
      priorityQueue: true,
      ...config
    };

    this.startMemoryMonitoring();
  }

  /**
   * Optimize analysis execution with caching and batching
   */
  async optimizeAnalysis<T>(
    key: string,
    analysisFn: () => Promise<T>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.getFromCache<T>(key);
        if (cached) {
          this.updateMetrics(startTime, true);
          return cached;
        }
      }

      // Check if we can run analysis immediately
      if (this.canExecuteAnalysis()) {
        return await this.executeAnalysis(key, analysisFn, startTime);
      } else {
        // Queue the analysis
        return await this.queueAnalysis(key, analysisFn, priority, startTime);
      }
    } catch (error) {
      this.updateMetrics(startTime, false, true);
      throw error;
    }
  }

  /**
   * Execute batch analysis for multiple items
   */
  async executeBatchAnalysis<T, R>(
    items: T[],
    analysisFn: (item: T) => Promise<R>,
    options: {
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
      onBatchComplete?: (batch: R[], batchIndex: number) => void;
    } = {}
  ): Promise<BatchAnalysisResult<R>> {
    const startTime = Date.now();
    const { batchSize = this.config.batchSize!, onProgress, onBatchComplete } = options;

    const results: R[] = [];
    const errors: Array<{ item: T; error: Error; index: number }> = [];

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchStartTime = Date.now();

      try {
        // Execute batch in parallel
        const batchPromises = batch.map((item, index) =>
          analysisFn(item).catch(error => {
            errors.push({ item, error, index: i + index });
            return null;
          })
        );

        const batchResults = await Promise.all(batchPromises);

        // Filter out null results (errors)
        const validResults = batchResults.filter((result): result is R => result !== null);
        results.push(...validResults);

        // Notify batch completion
        onBatchComplete?.(validResults, Math.floor(i / batchSize));

        // Update progress
        onProgress?.(i + batch.length, items.length);

        // Add delay between batches to prevent overwhelming the system
        const batchTime = Date.now() - batchStartTime;
        if (batchTime < 1000 && i + batchSize < items.length) {
          await this.delay(1000 - batchTime);
        }
      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize)} failed:`, error);
        errors.push(...batch.map((item, index) => ({
          item,
          error: error as Error,
          index: i + index
        })));
      }
    }

    const totalTime = Date.now() - startTime;

    return {
      results,
      errors,
      totalItems: items.length,
      successfulItems: results.length,
      failedItems: errors.length,
      totalTime,
      averageTimePerItem: totalTime / items.length,
      batches: Math.ceil(items.length / batchSize)
    };
  }

  /**
   * Optimize memory usage during analysis
   */
  async withMemoryOptimization<T>(fn: () => Promise<T>): Promise<T> {
    const initialMemory = this.getMemoryUsage();

    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const result = await fn();

      // Clean up after analysis
      this.cleanup();

      return result;
    } catch (error) {
      this.cleanup();
      throw error;
    } finally {
      const finalMemory = this.getMemoryUsage();
      this.logMemoryUsage(initialMemory, finalMemory);
    }
  }

  /**
   * Stream large dataset processing
   */
  async *streamAnalysis<T, R>(
    dataStream: AsyncIterable<T>,
    processor: (item: T) => Promise<R>,
    options: {
      bufferSize?: number;
      onProgress?: (processed: number, total?: number) => void;
    } = {}
  ): AsyncIterable<R> {
    const { bufferSize = 100, onProgress } = options;
    let processed = 0;
    let total = 0;

    try {
      const buffer: T[] = [];

      for await (const item of dataStream) {
        buffer.push(item);
        total++;

        if (buffer.length >= bufferSize) {
          // Process buffer
          const results = await Promise.all(
            buffer.map(item => processor(item))
          );

          // Yield results
          for (const result of results) {
            yield result;
            processed++;
            onProgress?.(processed, total);
          }

          // Clear buffer
          buffer.length = 0;

          // Memory check
          if (this.shouldTriggerGC()) {
            await this.forceGarbageCollection();
          }
        }
      }

      // Process remaining items
      if (buffer.length > 0) {
        const results = await Promise.all(
          buffer.map(item => processor(item))
        );

        for (const result of results) {
          yield result;
          processed++;
          onProgress?.(processed, total);
        }
      }
    } catch (error) {
      console.error('Streaming analysis error:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear cache and reset metrics
   */
  clearCache(): void {
    this.cache.clear();
    this.resetMetrics();
    console.log('🧹 Cache cleared and metrics reset');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalRequests: number;
    averageAge: number;
  } {
    const now = Date.now();
    let totalAge = 0;
    let validEntries = 0;

    for (const entry of this.cache.values()) {
      if (now < entry.expiresAt) {
        totalAge += now - entry.timestamp;
        validEntries++;
      }
    }

    return {
      size: this.cache.size,
      hitRate: this.performanceMetrics.cacheHitRate,
      totalRequests: this.performanceMetrics.totalAnalyses,
      averageAge: validEntries > 0 ? totalAge / validEntries : 0
    };
  }

  // Private methods
  private async executeAnalysis<T>(
    key: string,
    analysisFn: () => Promise<T>,
    startTime: number
  ): Promise<T> {
    this.activeAnalyses.add(key);

    try {
      const result = await this.withMemoryOptimization(analysisFn);

      if (this.config.enableCaching) {
        this.setCache(key, result);
      }

      this.updateMetrics(startTime, false);
      return result;
    } finally {
      this.activeAnalyses.delete(key);
    }
  }

  private async queueAnalysis<T>(
    key: string,
    analysisFn: () => Promise<T>,
    priority: 'high' | 'medium' | 'low',
    startTime: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueItem = {
        key,
        fn: analysisFn,
        resolve,
        reject,
        startTime,
        priority
      };

      this.analysisQueue[priority].push(queueItem);

      // Process queue if we have capacity
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.activeAnalyses.size >= this.config.maxConcurrentAnalyses!) {
      return;
    }

    // Get next item from priority queue
    let nextItem = null;
    if (this.analysisQueue.high.length > 0) {
      nextItem = this.analysisQueue.high.shift();
    } else if (this.analysisQueue.medium.length > 0) {
      nextItem = this.analysisQueue.medium.shift();
    } else if (this.analysisQueue.low.length > 0) {
      nextItem = this.analysisQueue.low.shift();
    }

    if (nextItem) {
      try {
        const result = await this.executeAnalysis(
          nextItem.key,
          nextItem.fn,
          nextItem.startTime
        );
        nextItem.resolve(result);
      } catch (error) {
        nextItem.reject(error);
      }

      // Process next item
      setImmediate(() => this.processQueue());
    }
  }

  private canExecuteAnalysis(): boolean {
    return this.activeAnalyses.size < this.config.maxConcurrentAnalyses! &&
           this.getMemoryUsage().percentage < this.config.memoryThreshold!;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.config.cacheTtl!
    };

    this.cache.set(key, entry);
  }

  private updateMetrics(startTime: number, fromCache: boolean, hasError = false): void {
    const analysisTime = Date.now() - startTime;

    this.performanceMetrics.totalAnalyses++;

    if (fromCache) {
      this.performanceMetrics.cacheHitRate =
        (this.performanceMetrics.cacheHitRate * (this.performanceMetrics.totalAnalyses - 1) + 1) /
        this.performanceMetrics.totalAnalyses;
    } else {
      this.performanceMetrics.averageAnalysisTime =
        (this.performanceMetrics.averageAnalysisTime * (this.performanceMetrics.totalAnalyses - 1) + analysisTime) /
        this.performanceMetrics.totalAnalyses;
    }

    if (hasError) {
      this.performanceMetrics.errorRate =
        (this.performanceMetrics.errorRate * (this.performanceMetrics.totalAnalyses - 1) + 1) /
        this.performanceMetrics.totalAnalyses;
    }

    // Update throughput (analyses per minute)
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    this.performanceMetrics.throughput = this.performanceMetrics.totalAnalyses / (timeWindow / 1000 / 60);

    // Update memory usage
    this.performanceMetrics.memoryUsage = this.getMemoryUsage();
  }

  private resetMetrics(): void {
    this.performanceMetrics = {
      totalAnalyses: 0,
      averageAnalysisTime: 0,
      cacheHitRate: 0,
      memoryUsage: { used: 0, total: 0, percentage: 0 },
      errorRate: 0,
      throughput: 0
    };
  }

  private startMemoryMonitoring(): void {
    this.memoryMonitor = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();

      if (memoryUsage.percentage > this.config.memoryThreshold!) {
        console.warn(`⚠️ High memory usage detected: ${memoryUsage.percentage.toFixed(1)}%`);
        this.forceGarbageCollection();
      }
    }, 5000); // Check every 5 seconds
  }

  private getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    const percentage = (usage.heapUsed / usage.heapTotal) * 100;

    return {
      used: usage.heapUsed,
      total: usage.heapTotal,
      percentage: Math.round(percentage * 100) / 100
    };
  }

  private shouldTriggerGC(): boolean {
    const memoryUsage = this.getMemoryUsage();
    return memoryUsage.percentage > 0.9; // Trigger GC at 90% usage
  }

  private async forceGarbageCollection(): Promise<void> {
    if (global.gc) {
      global.gc();
      console.log('🧹 Forced garbage collection');
    }
  }

  private cleanup(): void {
    // Clear any temporary data
    if (global.gc) {
      global.gc();
    }
  }

  private logMemoryUsage(initial: MemoryUsage, final: MemoryUsage): void {
    const increase = final.used - initial.used;
    if (Math.abs(increase) > 10 * 1024 * 1024) { // Log if > 10MB change
      console.log(`📊 Memory usage: ${initial.used / 1024 / 1024}MB → ${final.used / 1024 / 1024}MB (${increase > 0 ? '+' : ''}${increase / 1024 / 1024}MB)`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = null;
    }

    this.cache.clear();
    this.analysisQueue.high.length = 0;
    this.analysisQueue.medium.length = 0;
    this.analysisQueue.low.length = 0;
    this.activeAnalyses.clear();

    console.log('🧹 Performance optimizer destroyed');
  }
}

export default PerformanceOptimizer;
