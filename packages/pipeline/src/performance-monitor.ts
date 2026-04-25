/**
 * Performance Monitor
 *
 * Tracks execution time for each layer and provides performance reports.
 */

/**
 * Metrics for a single phase
 */
export interface PhaseMetrics {
  count: number;
  totalTime: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
}

/**
 * Performance report
 */
export interface PerformanceReport {
  phases: {
    [phase: string]: PhaseMetrics;
  };
}

/**
 * Performance Monitor
 *
 * Tracks execution time for pipeline phases and provides performance metrics.
 */
export class PerformanceMonitor {
  private phases: Map<string, PhaseMetrics>;
  private currentPhase: string | null;
  private phaseStartTime: number;

  constructor() {
    this.phases = new Map();
    this.currentPhase = null;
    this.phaseStartTime = 0;
  }

  /**
   * Start timing a phase
   */
  startPhase(phase: string): void {
    this.currentPhase = phase;
    this.phaseStartTime = Date.now();
  }

  /**
   * End timing a phase
   */
  endPhase(phase: string): void {
    if (this.currentPhase !== phase) {
      console.warn(`[PerformanceMonitor] Phase mismatch: expected ${this.currentPhase}, got ${phase}`);
      return;
    }

    const duration = Date.now() - this.phaseStartTime;

    const existing = this.phases.get(phase);
    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.count;
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.minTime = Math.min(existing.minTime, duration);
    } else {
      this.phases.set(phase, {
        count: 1,
        totalTime: duration,
        avgTime: duration,
        maxTime: duration,
        minTime: duration,
      });
    }

    this.currentPhase = null;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): string {
    return this.currentPhase || "unknown";
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const report: PerformanceReport = {
      phases: {},
    };

    for (const [phase, metrics] of this.phases.entries()) {
      report.phases[phase] = { ...metrics };
    }

    return report;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.phases.clear();
    this.currentPhase = null;
  }
}
