import { PostgresDatabase } from '../database/postgres';

export interface ErrorLog {
  id?: number;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  context?: any;
  resolved?: boolean;
  resolution_strategy?: string;
  timestamp?: Date;
}

export interface RecoveryStrategy {
  name: string;
  condition: (error: Error, context?: any) => boolean;
  action: (error: Error, context?: any) => Promise<boolean>;
  priority: number;
}

export class AutoHealingService {
  private db: PostgresDatabase;
  private strategies: RecoveryStrategy[] = [];
  private errorPatterns: Map<string, number> = new Map();

  constructor() {
    this.db = PostgresDatabase.getInstance();
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Strategy 1: Retry with exponential backoff
    this.registerStrategy({
      name: 'exponential_backoff_retry',
      priority: 1,
      condition: (error) => {
        return error.message.includes('timeout') || 
               error.message.includes('ECONNREFUSED') ||
               error.message.includes('ETIMEDOUT');
      },
      action: async (error, context) => {
        console.log('🔄 Applying exponential backoff retry strategy');
        const maxRetries = 3;
        let delay = 1000;

        for (let i = 0; i < maxRetries; i++) {
          await new Promise(resolve => setTimeout(resolve, delay));
          try {
            if (context?.retryFunction) {
              await context.retryFunction();
              console.log('✅ Retry successful');
              return true;
            }
          } catch (retryError) {
            console.log(`⚠️  Retry ${i + 1} failed`);
          }
          delay *= 2;
        }
        return false;
      }
    });

    // Strategy 2: Fallback to alternative service
    this.registerStrategy({
      name: 'fallback_service',
      priority: 2,
      condition: (error) => {
        return error.message.includes('API') || 
               error.message.includes('service unavailable');
      },
      action: async (error, context) => {
        console.log('🔀 Switching to fallback service');
        if (context?.fallbackFunction) {
          try {
            await context.fallbackFunction();
            console.log('✅ Fallback successful');
            return true;
          } catch (fallbackError) {
            console.log('❌ Fallback failed');
            return false;
          }
        }
        return false;
      }
    });

    // Strategy 3: Clear cache and retry
    this.registerStrategy({
      name: 'cache_clear_retry',
      priority: 3,
      condition: (error) => {
        return error.message.includes('cache') || 
               error.message.includes('stale');
      },
      action: async (error, context) => {
        console.log('🗑️  Clearing cache and retrying');
        if (context?.clearCache) {
          await context.clearCache();
        }
        if (context?.retryFunction) {
          try {
            await context.retryFunction();
            console.log('✅ Cache clear retry successful');
            return true;
          } catch (retryError) {
            console.log('❌ Cache clear retry failed');
            return false;
          }
        }
        return false;
      }
    });

    // Strategy 4: Rollback to last known good state
    this.registerStrategy({
      name: 'state_rollback',
      priority: 4,
      condition: (error) => {
        return error.message.includes('state') || 
               error.message.includes('corrupt');
      },
      action: async (error, context) => {
        console.log('⏮️  Rolling back to last known good state');
        if (context?.rollback) {
          try {
            await context.rollback();
            console.log('✅ Rollback successful');
            return true;
          } catch (rollbackError) {
            console.log('❌ Rollback failed');
            return false;
          }
        }
        return false;
      }
    });

    // Strategy 5: Graceful degradation
    this.registerStrategy({
      name: 'graceful_degradation',
      priority: 5,
      condition: () => true, // Catch-all strategy
      action: async (error, context) => {
        console.log('🔻 Applying graceful degradation');
        if (context?.degradedMode) {
          try {
            await context.degradedMode();
            console.log('✅ Degraded mode activated');
            return true;
          } catch (degradeError) {
            console.log('❌ Degradation failed');
            return false;
          }
        }
        return false;
      }
    });
  }

  public registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  public async handleError(error: Error, context?: any): Promise<boolean> {
    console.log(`🚨 Error detected: ${error.message}`);

    // Log error to database
    await this.logError(error, context);

    // Track error pattern
    this.trackErrorPattern(error);

    // Check for recurring patterns and suggest proactive fixes
    await this.analyzePatterns();

    // Try recovery strategies
    for (const strategy of this.strategies) {
      if (strategy.condition(error, context)) {
        console.log(`🔧 Attempting recovery strategy: ${strategy.name}`);
        try {
          const success = await strategy.action(error, context);
          if (success) {
            await this.markResolved(error, strategy.name);
            return true;
          }
        } catch (strategyError) {
          console.error(`Strategy ${strategy.name} failed:`, strategyError);
        }
      }
    }

    console.log('❌ All recovery strategies exhausted');
    return false;
  }

  private async logError(error: Error, context?: any): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO error_logs (error_type, error_message, stack_trace, context) 
         VALUES ($1, $2, $3, $4)`,
        [
          error.name || 'Error',
          error.message,
          error.stack || '',
          JSON.stringify(context || {})
        ]
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private async markResolved(error: Error, strategy: string): Promise<void> {
    try {
      await this.db.query(
        `UPDATE error_logs 
         SET resolved = true, resolution_strategy = $1 
         WHERE error_message = $2 AND resolved = false`,
        [strategy, error.message]
      );
    } catch (updateError) {
      console.error('Failed to mark error as resolved:', updateError);
    }
  }

  private trackErrorPattern(error: Error): void {
    const errorKey = `${error.name}:${error.message.substring(0, 50)}`;
    const count = this.errorPatterns.get(errorKey) || 0;
    this.errorPatterns.set(errorKey, count + 1);
  }

  private async analyzePatterns(): Promise<void> {
    // Detect recurring errors
    for (const [pattern, count] of this.errorPatterns.entries()) {
      if (count >= 5) {
        console.log(`⚠️  Recurring error pattern detected: ${pattern} (${count} occurrences)`);
        // Could trigger proactive measures here
      }
    }
  }

  public async getErrorStats(): Promise<any> {
    const result = await this.db.query(`
      SELECT 
        error_type,
        COUNT(*) as total_count,
        SUM(CASE WHEN resolved THEN 1 ELSE 0 END) as resolved_count,
        array_agg(DISTINCT resolution_strategy) FILTER (WHERE resolution_strategy IS NOT NULL) as strategies_used
      FROM error_logs
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY error_type
      ORDER BY total_count DESC
    `);

    return result.rows;
  }

  public async getHealthStatus(): Promise<any> {
    const stats = await this.getErrorStats();
    const totalErrors = stats.reduce((sum: number, row: any) => sum + parseInt(row.total_count), 0);
    const resolvedErrors = stats.reduce((sum: number, row: any) => sum + parseInt(row.resolved_count), 0);

    return {
      status: totalErrors === 0 ? 'healthy' : resolvedErrors / totalErrors > 0.8 ? 'degraded' : 'critical',
      total_errors_24h: totalErrors,
      resolved_errors_24h: resolvedErrors,
      resolution_rate: totalErrors > 0 ? (resolvedErrors / totalErrors * 100).toFixed(2) + '%' : '100%',
      error_breakdown: stats
    };
  }
}
