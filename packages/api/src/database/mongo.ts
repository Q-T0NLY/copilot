import { MongoClient, Db, Collection } from 'mongodb';

export class MongoDatabase {
  private static instance: MongoDatabase;
  private client: MongoClient;
  private db: Db | null = null;

  private constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.client = new MongoClient(uri);
  }

  public static getInstance(): MongoDatabase {
    if (!MongoDatabase.instance) {
      MongoDatabase.instance = new MongoDatabase();
    }
    return MongoDatabase.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB || 'aidevplatform');
      
      // Create indexes
      await this.getCollection('sessions').createIndex({ userId: 1, timestamp: -1 });
      await this.getCollection('generations').createIndex({ userId: 1, createdAt: -1 });
      await this.getCollection('analytics').createIndex({ event: 1, timestamp: -1 });
      
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public getCollection<T = any>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection<T>(name);
  }

  public async saveChatSession(userId: string, sessionData: any): Promise<void> {
    const collection = this.getCollection('sessions');
    await collection.insertOne({
      userId,
      ...sessionData,
      timestamp: new Date()
    });
  }

  public async saveGeneration(userId: string, generation: any): Promise<void> {
    const collection = this.getCollection('generations');
    await collection.insertOne({
      userId,
      ...generation,
      createdAt: new Date()
    });
  }

  public async getChatHistory(userId: string, limit: number = 50): Promise<any[]> {
    const collection = this.getCollection('sessions');
    return await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  public async saveAnalytics(event: string, data: any): Promise<void> {
    const collection = this.getCollection('analytics');
    await collection.insertOne({
      event,
      data,
      timestamp: new Date()
    });
  }

  public async close(): Promise<void> {
    await this.client.close();
  }
}
