import { Pool, PoolClient } from 'pg';

export class PostgresDatabase {
  private static instance: PostgresDatabase;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'aidevplatform',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL error:', err);
    });
  }

  public static getInstance(): PostgresDatabase {
    if (!PostgresDatabase.instance) {
      PostgresDatabase.instance = new PostgresDatabase();
    }
    return PostgresDatabase.instance;
  }

  public async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.query;
  }

  public async initialize(): Promise<void> {
    try {
      // Create tables if they don't exist
      await this.query(`
        CREATE TABLE IF NOT EXISTS chat_history (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255),
          message TEXT NOT NULL,
          role VARCHAR(50) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          context JSONB
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS code_snippets (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255),
          title VARCHAR(255) NOT NULL,
          code TEXT NOT NULL,
          language VARCHAR(50) NOT NULL,
          description TEXT,
          tags TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id VARCHAR(255) PRIMARY KEY,
          preferences JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS project_states (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255),
          state JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(project_id, user_id)
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS error_logs (
          id SERIAL PRIMARY KEY,
          error_type VARCHAR(255) NOT NULL,
          error_message TEXT NOT NULL,
          stack_trace TEXT,
          context JSONB,
          resolved BOOLEAN DEFAULT FALSE,
          resolution_strategy TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp);
        CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);
        CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
      `);

      console.log('✅ PostgreSQL database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PostgreSQL:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
