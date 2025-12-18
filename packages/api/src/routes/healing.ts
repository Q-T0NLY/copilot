import { Router } from 'express';
import { AutoHealingService } from '../healing/AutoHealingService';

const router = Router();
const healingService = new AutoHealingService();

// Get health status
router.get('/health', async (_req, res, next) => {
  try {
    const status = await healingService.getHealthStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// Get error statistics
router.get('/errors/stats', async (_req, res, next) => {
  try {
    const stats = await healingService.getErrorStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

// Manually trigger error recovery
router.post('/recover', async (req, res, next) => {
  try {
    const { error_type, error_message, context } = req.body;

    if (!error_type || !error_message) {
      res.status(400).json({ error: 'Error type and message required' });
      return;
    }

    const error = new Error(error_message);
    error.name = error_type;

    const recovered = await healingService.handleError(error, context);

    res.json({
      recovered,
      message: recovered ? 'Error recovered successfully' : 'Recovery failed'
    });
  } catch (error) {
    next(error);
  }
});

// Register custom recovery strategy
router.post('/strategies', async (req, res, next) => {
  try {
    const { name, priority, condition, action } = req.body;

    if (!name || !priority) {
      res.status(400).json({ error: 'Name and priority required' });
      return;
    }

    // Note: For security reasons, we can't directly accept function code from API
    // This would be used with predefined strategies
    res.json({
      message: 'Custom strategies must be registered in code for security',
      info: 'Use the AutoHealingService.registerStrategy() method directly'
    });
  } catch (error) {
    next(error);
  }
});

export { router as healingRouter };
