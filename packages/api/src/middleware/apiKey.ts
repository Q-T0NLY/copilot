import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

const apiKeyService = new ApiKeyService();

export const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    const isValid = await apiKeyService.validateKey(apiKey);

    if (!isValid) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }

    // Track usage
    await apiKeyService.trackUsage(apiKey, req.path);

    next();
  } catch (error) {
    next(error);
  }
};
