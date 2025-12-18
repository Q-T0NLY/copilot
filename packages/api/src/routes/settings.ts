import { Router } from 'express';

const router = Router();

// In-memory settings storage (would use database in production)
const settings = new Map<string, any>();

router.get('/', async (req, res, next) => {
  try {
    const allSettings = Object.fromEntries(settings);
    res.json({ settings: allSettings });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const { key, value } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    settings.set(key, value);
    res.json({ message: 'Setting updated successfully', key, value });
  } catch (error) {
    next(error);
  }
});

router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const value = settings.get(key);

    if (value === undefined) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ key, value });
  } catch (error) {
    next(error);
  }
});

router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const deleted = settings.delete(key);

    if (deleted) {
      res.json({ message: 'Setting deleted successfully' });
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    next(error);
  }
});

export { router as settingsRouter };
