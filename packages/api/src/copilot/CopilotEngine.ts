/**
 * CopilotEngine - Standalone implementation of GitHub Copilot-style pair programming
 * Provides real-time code suggestions, pattern recognition, and inline chat
 */

import MultiModelConsensus from '../llm/MultiModelConsensus';

export interface CopilotSuggestRequest {
  code: string;
  language: string;
  cursorPosition?: number;
  context?: string;
  fileContent?: string;
}

export interface CopilotChatRequest {
  question: string;
  code?: string;
  language?: string;
}

export interface CopilotSuggestion {
  text: string;
  score: number;
  type: 'completion' | 'snippet' | 'refactor';
}

export class CopilotEngine {
  private consensus: MultiModelConsensus;
  private suggestionCache: Map<string, CopilotSuggestion[]>;

  constructor() {
    this.consensus = new MultiModelConsensus();
    this.suggestionCache = new Map();
  }

  /**
   * Get real-time code suggestions
   */
  async suggest(request: CopilotSuggestRequest): Promise<CopilotSuggestion[]> {
    const cacheKey = `${request.language}:${request.code}`;
    
    // Check cache
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey)!;
    }

    const systemPrompt = `You are GitHub Copilot. Provide intelligent, context-aware code suggestions.`;

    const userPrompt = `${request.context ? `File context: ${request.context}\n\n` : ''}${request.fileContent ? `Full file:\n${request.fileContent}\n\n` : ''}Current code:
\`\`\`${request.language}
${request.code}
\`\`\`

Provide 3 different completion suggestions. Format each as:
SUGGESTION: <code here>
TYPE: <completion|snippet|refactor>
SCORE: <0-100>`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'speed' }
    );

    const suggestions = this.parseSuggestions(result.finalResponse);
    
    // Cache the result
    this.suggestionCache.set(cacheKey, suggestions);
    
    // Clear old cache entries (keep last 100)
    if (this.suggestionCache.size > 100) {
      const firstKey = this.suggestionCache.keys().next().value;
      this.suggestionCache.delete(firstKey);
    }

    return suggestions;
  }

  /**
   * Get alternative suggestions
   */
  async getAlternatives(code: string, language: string, count: number = 3): Promise<string[]> {
    const systemPrompt = `You are GitHub Copilot. Provide ${count} alternative implementations.`;

    const userPrompt = `Provide ${count} different ways to implement this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Each alternative should be preceded by "ALTERNATIVE:".`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'creativity' }
    );

    return this.extractAlternatives(result.finalResponse);
  }

  /**
   * Inline chat for code questions
   */
  async chat(request: CopilotChatRequest): Promise<string> {
    const systemPrompt = `You are GitHub Copilot Chat. Answer code-related questions concisely and helpfully.`;

    const userPrompt = `${request.code && request.language ? `Code context:\n\`\`\`${request.language}\n${request.code}\n\`\`\`\n\n` : ''}Question: ${request.question}

Provide a clear, actionable answer.`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'analysis' }
    );

    return result.finalResponse;
  }

  /**
   * Generate function/class from comment
   */
  async generateFromComment(comment: string, language: string, context?: string): Promise<string> {
    const systemPrompt = `You are GitHub Copilot. Generate code from natural language comments.`;

    const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Generate ${language} code for this comment:

// ${comment}

Provide complete, well-structured code.`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.extractCode(result.finalResponse, language);
  }

  /**
   * Infer imports/dependencies
   */
  async inferImports(code: string, language: string): Promise<string[]> {
    const systemPrompt = `You are an expert in ${language} dependency management.`;

    const userPrompt = `Analyze this ${language} code and list all required imports:

\`\`\`${language}
${code}
\`\`\`

List each import on a new line starting with "IMPORT:".`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'analysis' }
    );

    const imports: string[] = [];
    const lines = result.finalResponse.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('IMPORT:')) {
        imports.push(line.replace('IMPORT:', '').trim());
      }
    }

    return imports;
  }

  /**
   * Pattern recognition and code smell detection
   */
  async detectPatterns(code: string, language: string): Promise<{
    patterns: string[];
    smells: string[];
    suggestions: string[];
  }> {
    const systemPrompt = `You are an expert code reviewer. Identify patterns, code smells, and improvements.`;

    const userPrompt = `Analyze this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Identify:
PATTERNS: <design patterns used>
SMELLS: <code smells detected>
SUGGESTIONS: <improvement suggestions>`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'analysis' }
    );

    return this.parsePatternAnalysis(result.finalResponse);
  }

  /**
   * Parse suggestions from response
   */
  private parseSuggestions(response: string): CopilotSuggestion[] {
    const suggestions: CopilotSuggestion[] = [];
    const blocks = response.split('SUGGESTION:').slice(1);

    for (const block of blocks) {
      const typeMatch = block.match(/TYPE:\s*(\w+)/);
      const scoreMatch = block.match(/SCORE:\s*(\d+)/);
      const text = block.split('TYPE:')[0].trim();

      if (text) {
        suggestions.push({
          text,
          type: (typeMatch?.[1] as any) || 'completion',
          score: scoreMatch ? parseInt(scoreMatch[1]) : 50
        });
      }
    }

    // Fallback: if parsing failed, create single suggestion
    if (suggestions.length === 0 && response.trim()) {
      suggestions.push({
        text: response.trim(),
        type: 'completion',
        score: 50
      });
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }

  /**
   * Extract alternatives from response
   */
  private extractAlternatives(response: string): string[] {
    const alternatives: string[] = [];
    const blocks = response.split('ALTERNATIVE:').slice(1);

    for (const block of blocks) {
      const cleaned = block.trim().split('\n\n')[0];
      if (cleaned) {
        alternatives.push(cleaned);
      }
    }

    return alternatives;
  }

  /**
   * Extract code from markdown
   */
  private extractCode(response: string, language: string): string {
    const codeBlockRegex = new RegExp(`\`\`\`${language}?\\n([\\s\\S]*?)\`\`\``, 'i');
    const match = response.match(codeBlockRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }

    return response.trim();
  }

  /**
   * Parse pattern analysis
   */
  private parsePatternAnalysis(response: string): {
    patterns: string[];
    smells: string[];
    suggestions: string[];
  } {
    const result = {
      patterns: [] as string[],
      smells: [] as string[],
      suggestions: [] as string[]
    };

    const sections = response.split(/PATTERNS:|SMELLS:|SUGGESTIONS:/);
    
    if (sections.length > 1) {
      result.patterns = sections[1]?.split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')) || [];
    }
    if (sections.length > 2) {
      result.smells = sections[2]?.split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')) || [];
    }
    if (sections.length > 3) {
      result.suggestions = sections[3]?.split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')) || [];
    }

    return result;
  }
}

export default CopilotEngine;
