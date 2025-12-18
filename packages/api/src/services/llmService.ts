import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface LLMProvider {
  name: string;
  models: string[];
}

export interface CompletionRequest {
  provider: string;
  model: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  context?: string[];
}

export class LLMService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
  }

  async getProviders(): Promise<LLMProvider[]> {
    const providers: LLMProvider[] = [];

    if (this.openai) {
      providers.push({
        name: 'openai',
        models: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo', 'gpt-4o']
      });
    }

    if (this.anthropic) {
      providers.push({
        name: 'anthropic',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
      });
    }

    return providers;
  }

  async complete(request: CompletionRequest): Promise<string> {
    const { provider, model, prompt, maxTokens = 2000, temperature = 0.7, context = [] } = request;

    let fullPrompt = prompt;
    if (context.length > 0) {
      fullPrompt = `Context:\n${context.join('\n\n')}\n\nPrompt: ${prompt}`;
    }

    if (provider === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: fullPrompt }],
        max_tokens: maxTokens,
        temperature
      });
      return response.choices[0]?.message?.content || '';
    }

    if (provider === 'anthropic' && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: fullPrompt }]
      });
      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    }

    throw new Error(`Provider ${provider} not configured or not supported`);
  }

  async codeCompletion(code: string, language: string): Promise<string> {
    const prompt = `Complete the following ${language} code:\n\n${code}`;
    
    return this.complete({
      provider: 'openai',
      model: 'gpt-4',
      prompt,
      temperature: 0.3
    });
  }

  async generateCode(description: string, language: string): Promise<string> {
    const prompt = `Generate ${language} code for the following requirement:\n\n${description}\n\nProvide only the code without explanations.`;

    const completion = await this.complete({
      provider: 'openai',
      model: 'gpt-4',
      prompt,
      maxTokens: 2000
    });

    return completion;
  }

  async getInlineSuggestion(
    code: string,
    language: string,
    cursorPosition: { line: number; column: number },
    context: string
  ): Promise<string> {
    const prompt = `You are an AI code completion assistant like GitHub Copilot or Cursor AI.

Current code:
\`\`\`${language}
${code}
\`\`\`

Cursor is at line ${cursorPosition.line}, column ${cursorPosition.column}.
Current line context: "${context}"

Provide ONLY the next few characters or tokens that would naturally continue from this position. 
Be concise - provide just the immediate completion, not entire functions.
Respond with ONLY the code suggestion, no explanations.`;

    try {
      const completion = await this.complete({
        provider: 'openai',
        model: 'gpt-4',
        prompt,
        maxTokens: 100,
        temperature: 0.3
      });

      return completion.trim();
    } catch (error) {
      console.error('Inline suggestion error:', error);
      return '';
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain the following ${language} code in clear, concise terms:

\`\`\`${language}
${code}
\`\`\`

Provide a detailed explanation of what this code does, how it works, and any important patterns or concepts used.`;

    const explanation = await this.complete({
      provider: 'openai',
      model: 'gpt-4',
      prompt,
      maxTokens: 1000
    });

    return explanation;
  }
}
