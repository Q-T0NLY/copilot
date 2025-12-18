import { PostgresDatabase } from '../database/postgres';

export interface CodeSnippet {
  id?: number;
  user_id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
  created_at?: Date;
  updated_at?: Date;
}

export class CodeSnippetService {
  private db: PostgresDatabase;

  constructor() {
    this.db = PostgresDatabase.getInstance();
  }

  async saveSnippet(snippet: CodeSnippet): Promise<number> {
    const result = await this.db.query(
      `INSERT INTO code_snippets (user_id, title, code, language, description, tags) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        snippet.user_id,
        snippet.title,
        snippet.code,
        snippet.language,
        snippet.description || '',
        snippet.tags || []
      ]
    );
    return result.rows[0].id;
  }

  async getSnippets(userId: string, language?: string): Promise<CodeSnippet[]> {
    let query = `SELECT * FROM code_snippets WHERE user_id = $1`;
    const params: any[] = [userId];

    if (language) {
      query += ` AND language = $2`;
      params.push(language);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async updateSnippet(id: number, updates: Partial<CodeSnippet>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.query(
      `UPDATE code_snippets SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      values
    );
  }

  async deleteSnippet(id: number, userId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM code_snippets WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  async searchSnippets(userId: string, searchTerm: string): Promise<CodeSnippet[]> {
    const result = await this.db.query(
      `SELECT * FROM code_snippets 
       WHERE user_id = $1 AND (
         title ILIKE $2 OR 
         description ILIKE $2 OR 
         code ILIKE $2 OR
         $3 = ANY(tags)
       )
       ORDER BY created_at DESC`,
      [userId, `%${searchTerm}%`, searchTerm]
    );
    return result.rows;
  }
}
