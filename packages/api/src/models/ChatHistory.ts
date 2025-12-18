import { PostgresDatabase } from '../database/postgres';

export interface ChatMessage {
  id?: number;
  user_id: string;
  message: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
  context?: any;
}

export class ChatHistoryService {
  private db: PostgresDatabase;

  constructor() {
    this.db = PostgresDatabase.getInstance();
  }

  async saveMessage(message: ChatMessage): Promise<number> {
    const result = await this.db.query(
      `INSERT INTO chat_history (user_id, message, role, context) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [message.user_id, message.message, message.role, JSON.stringify(message.context || {})]
    );
    return result.rows[0].id;
  }

  async getHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const result = await this.db.query(
      `SELECT * FROM chat_history 
       WHERE user_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  async deleteHistory(userId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM chat_history WHERE user_id = $1`,
      [userId]
    );
  }
}
