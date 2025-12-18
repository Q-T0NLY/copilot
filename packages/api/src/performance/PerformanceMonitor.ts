/**
 * Performance Monitor - Tracks and enforces performance targets
 * 
 * Performance Targets:
 * - Core latency: <1ms
 * - Network latency: <10ms
 * - End-to-end latency: <50ms
 * - Uptime SLA: 99.999%
 * - Throughput: 12.7M operations/second
 * - Error rate: <0.001%
 */

interface PerformanceMetrics {
  coreLatency: number;
  networkLatency: number;
  endToEndLatency: number;
  uptime: number;
  throughput: number;
  errorRate: number;
  timestamp: number;
}

interface PerformanceTargets {
  coreLatency: number;
  networkLatency: number;
  endToEndLatency: number;
  uptime: number;
  throughput: number;
  errorRate: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private targets: PerformanceTargets = {
    coreLatency: 1, // <1ms
    networkLatency: 10, // <10ms
    endToEndLatency: 50, // <50ms
    uptime: 99.999, // 99.999%
    throughput: 12700000, // 12.7M ops/sec
    errorRate: 0.001, // <0.001%
  };
  
  private startTime: number = Date.now();
  private totalRequests: number = 0;
  private successfulRequests: number = 0;
  private failedRequests: number = 0;
  private downtimeMs: number = 0;
  private lastDowntime: number = 0;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Track request start time for latency measurement
   */
  startRequest(): number {
    return process.hrtime.bigint();
  }

  /**
   * Track request completion and calculate metrics
   */
  endRequest(startTime: bigint, success: boolean = true): void {
    const endTime = process.hrtime.bigint();
    const latencyNs = Number(endTime - startTime);
    const latencyMs = latencyNs / 1000000; // Convert to milliseconds

    this.totalRequests++;
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }

    // Record metrics
    const currentMetrics: PerformanceMetrics = {
      coreLatency: latencyMs,
      networkLatency: latencyMs * 0.3, // Estimated network component
      endToEndLatency: latencyMs,
      uptime: this.calculateUptime(),
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate(),
      timestamp: Date.now(),
    };

    this.metrics.push(currentMetrics);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  /**
   * Record downtime event
   */
  recordDowntime(durationMs: number): void {
    this.downtimeMs += durationMs;
    this.lastDowntime = Date.now();
  }

  /**
   * Calculate current uptime percentage
   */
  private calculateUptime(): number {
    const totalTime = Date.now() - this.startTime;
    const uptimeMs = totalTime - this.downtimeMs;
    return (uptimeMs / totalTime) * 100;
  }

  /**
   * Calculate current throughput (operations per second)
   */
  private calculateThroughput(): number {
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    return elapsedSeconds > 0 ? this.totalRequests / elapsedSeconds : 0;
  }

  /**
   * Calculate current error rate
   */
  private calculateErrorRate(): number {
    return this.totalRequests > 0
      ? (this.failedRequests / this.totalRequests) * 100
      : 0;
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      coreLatency: this.getAverageLatency('coreLatency'),
      networkLatency: this.getAverageLatency('networkLatency'),
      endToEndLatency: this.getAverageLatency('endToEndLatency'),
      uptime: this.calculateUptime(),
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get average latency for a specific metric
   */
  private getAverageLatency(metric: keyof PerformanceMetrics): number {
    if (this.metrics.length === 0) return 0;

    const sum = this.metrics.reduce((acc, m) => {
      const value = m[metric];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    return sum / this.metrics.length;
  }

  /**
   * Check if current metrics meet targets
   */
  meetsTargets(): { meets: boolean; violations: string[] } {
    const current = this.getCurrentMetrics();
    const violations: string[] = [];

    if (current.coreLatency > this.targets.coreLatency) {
      violations.push(
        `Core latency ${current.coreLatency.toFixed(2)}ms exceeds target ${this.targets.coreLatency}ms`
      );
    }

    if (current.networkLatency > this.targets.networkLatency) {
      violations.push(
        `Network latency ${current.networkLatency.toFixed(2)}ms exceeds target ${this.targets.networkLatency}ms`
      );
    }

    if (current.endToEndLatency > this.targets.endToEndLatency) {
      violations.push(
        `End-to-end latency ${current.endToEndLatency.toFixed(2)}ms exceeds target ${this.targets.endToEndLatency}ms`
      );
    }

    if (current.uptime < this.targets.uptime) {
      violations.push(
        `Uptime ${current.uptime.toFixed(3)}% below target ${this.targets.uptime}%`
      );
    }

    if (current.errorRate > this.targets.errorRate) {
      violations.push(
        `Error rate ${current.errorRate.toFixed(4)}% exceeds target ${this.targets.errorRate}%`
      );
    }

    return {
      meets: violations.length === 0,
      violations,
    };
  }

  /**
   * Get performance report
   */
  getReport(): {
    current: PerformanceMetrics;
    targets: PerformanceTargets;
    compliance: { meets: boolean; violations: string[] };
    stats: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      uptimeHours: number;
    };
  } {
    const uptimeHours = (Date.now() - this.startTime) / (1000 * 60 * 60);

    return {
      current: this.getCurrentMetrics(),
      targets: this.targets,
      compliance: this.meetsTargets(),
      stats: {
        totalRequests: this.totalRequests,
        successfulRequests: this.successfulRequests,
        failedRequests: this.failedRequests,
        uptimeHours,
      },
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = [];
    this.startTime = Date.now();
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.downtimeMs = 0;
    this.lastDowntime = 0;
  }
}

export default PerformanceMonitor;
