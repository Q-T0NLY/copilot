import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
}

export class ApiKeyService {
  private keys: Map<string, ApiKey> = new Map();

  constructor() {
    // Initialize with a default key for development
    if (process.env.NODE_ENV === 'development') {
      const devKey = process.env.DEV_API_KEY || 'dev-key-12345';
      this.keys.set(devKey, {
        id: 'dev',
        key: devKey,
        name: 'Development Key',
        createdAt: new Date(),
        usageCount: 0
      });
    }
  }

  async generateKey(name: string): Promise<string> {
    const key = `sk-${crypto.randomBytes(32).toString('hex')}`;
    const apiKey: ApiKey = {
      id: uuidv4(),
      key,
      name,
      createdAt: new Date(),
      usageCount: 0
    };
    
    this.keys.set(key, apiKey);
    return key;
  }

  async validateKey(key: string): Promise<boolean> {
    return this.keys.has(key);
  }

  async trackUsage(key: string, endpoint: string): Promise<void> {
    const apiKey = this.keys.get(key);
    if (apiKey) {
      apiKey.usageCount++;
      apiKey.lastUsedAt = new Date();
    }
  }

  async listKeys(): Promise<ApiKey[]> {
    return Array.from(this.keys.values()).map(key => ({
      ...key,
      key: `${key.key.substring(0, 10)}...` // Mask the key
    }));
  }

  async revokeKey(key: string): Promise<boolean> {
    return this.keys.delete(key);
  }
}
