import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

const apiKeyService = new ApiKeyService();

export const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const isValid = await apiKeyService.validateKey(apiKey);

    if (!isValid) {
      return res.status(403).json({ error: 'Invalid API key' });
    }

    // Track usage
    await apiKeyService.trackUsage(apiKey, req.path);

    next();
  } catch (error) {
    next(error);
  }
};
