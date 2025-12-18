/**
 * Performance Monitoring Routes
 * 
 * Provides endpoints for performance metrics, compliance checking,
 * and real-time monitoring of system performance targets.
 */

import { Router, Request, Response } from 'express';
import PerformanceMonitor from '../performance/PerformanceMonitor';

const router = Router();
const perfMonitor = PerformanceMonitor.getInstance();

/**
 * GET /api/performance/metrics
 * Get current performance metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = perfMonitor.getCurrentMetrics();
  res.json({
    success: true,
    data: metrics,
  });
});

/**
 * GET /api/performance/report
 * Get comprehensive performance report
 */
router.get('/report', (req: Request, res: Response) => {
  const report = perfMonitor.getReport();
  res.json({
    success: true,
    data: report,
  });
});

/**
 * GET /api/performance/compliance
 * Check if current metrics meet performance targets
 */
router.get('/compliance', (req: Request, res: Response) => {
  const compliance = perfMonitor.meetsTargets();
  res.json({
    success: true,
    data: compliance,
  });
});

/**
 * POST /api/performance/reset
 * Reset performance metrics
 */
router.post('/reset', (req: Request, res: Response) => {
  perfMonitor.reset();
  res.json({
    success: true,
    message: 'Performance metrics reset successfully',
  });
});

/**
 * GET /api/performance/targets
 * Get performance targets
 */
router.get('/targets', (req: Request, res: Response) => {
  const report = perfMonitor.getReport();
  res.json({
    success: true,
    data: {
      targets: report.targets,
      description: {
        coreLatency: 'Core processing latency target: <1ms',
        networkLatency: 'Network latency target: <10ms',
        endToEndLatency: 'End-to-end request latency target: <50ms',
        uptime: 'System uptime SLA: 99.999%',
        throughput: 'Operations throughput target: 12.7M ops/sec',
        errorRate: 'Error rate target: <0.001%',
      },
    },
  });
});

export default router;
