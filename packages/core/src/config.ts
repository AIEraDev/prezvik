/**
 * Configuration for Prezvik Core
 *
 * Manages feature flags and configuration options for the pipeline.
 */

import type { PipelineMode } from "@prezvik/pipeline";

/**
 * Configuration options for Prezvik
 */
export interface PrezVikConfig {
  /**
   * Pipeline rendering mode
   * - 'legacy': Use current monolithic rendering (DEPRECATED - will be removed in v2.0)
   * - 'layered': Use new three-layer architecture (Theme → Visual → Export) (default)
   *
   * Can be set via:
   * 1. Environment variable: PREZVIK_PIPELINE_MODE=layered
   * 2. Configuration file
   * 3. Function parameter (highest priority)
   */
  pipelineMode: PipelineMode;

  /**
   * Enable performance monitoring
   */
  enablePerformanceMonitoring: boolean;

  /**
   * Enable caching
   */
  enableCaching: boolean;

  /**
   * Log level
   */
  logLevel: "debug" | "info" | "warn" | "error";
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PrezVikConfig = {
  pipelineMode: "layered",
  enablePerformanceMonitoring: true,
  enableCaching: true,
  logLevel: "info",
};

/**
 * Current configuration (mutable)
 */
let currentConfig: PrezVikConfig = { ...DEFAULT_CONFIG };

/**
 * Load configuration from environment variables
 */
function loadFromEnvironment(): Partial<PrezVikConfig> {
  const config: Partial<PrezVikConfig> = {};

  // Pipeline mode
  const pipelineMode = process.env.PREZVIK_PIPELINE_MODE;
  if (pipelineMode === "legacy" || pipelineMode === "layered") {
    config.pipelineMode = pipelineMode;
  } else if (pipelineMode) {
    console.warn(`[Config] Invalid PREZVIK_PIPELINE_MODE: ${pipelineMode}. Using default: ${DEFAULT_CONFIG.pipelineMode}`);
  }

  // Performance monitoring
  const enablePerformanceMonitoring = process.env.PREZVIK_ENABLE_PERFORMANCE_MONITORING;
  if (enablePerformanceMonitoring === "true" || enablePerformanceMonitoring === "false") {
    config.enablePerformanceMonitoring = enablePerformanceMonitoring === "true";
  }

  // Caching
  const enableCaching = process.env.PREZVIK_ENABLE_CACHING;
  if (enableCaching === "true" || enableCaching === "false") {
    config.enableCaching = enableCaching === "true";
  }

  // Log level
  const logLevel = process.env.PREZVIK_LOG_LEVEL;
  if (logLevel === "debug" || logLevel === "info" || logLevel === "warn" || logLevel === "error") {
    config.logLevel = logLevel;
  }

  return config;
}

/**
 * Initialize configuration
 * Loads from environment variables and merges with defaults
 */
export function initConfig(): void {
  const envConfig = loadFromEnvironment();
  currentConfig = { ...DEFAULT_CONFIG, ...envConfig };

  if (currentConfig.logLevel === "debug" || currentConfig.logLevel === "info") {
    console.log("[Config] Prezvik configuration initialized:");
    console.log(`  - Pipeline Mode: ${currentConfig.pipelineMode}`);
    console.log(`  - Performance Monitoring: ${currentConfig.enablePerformanceMonitoring}`);
    console.log(`  - Caching: ${currentConfig.enableCaching}`);
    console.log(`  - Log Level: ${currentConfig.logLevel}`);
  }
}

/**
 * Get current configuration
 */
export function getConfig(): Readonly<PrezVikConfig> {
  return currentConfig;
}

/**
 * Update configuration
 * @param updates - Partial configuration updates
 */
export function updateConfig(updates: Partial<PrezVikConfig>): void {
  currentConfig = { ...currentConfig, ...updates };

  if (currentConfig.logLevel === "debug") {
    console.log("[Config] Configuration updated:", updates);
  }
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };

  if (currentConfig.logLevel === "debug") {
    console.log("[Config] Configuration reset to defaults");
  }
}

/**
 * Get pipeline mode from configuration or environment
 * Priority: parameter > environment > config > default
 */
export function getPipelineMode(override?: PipelineMode): PipelineMode {
  if (override) {
    return override;
  }

  return currentConfig.pipelineMode;
}

// Initialize configuration on module load
initConfig();
