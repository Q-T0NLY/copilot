/**
 * CodexEngine - Standalone implementation of Codex-style code intelligence
 * Provides natural language to code translation, refactoring, and test generation
 */

import MultiModelConsensus from '../llm/MultiModelConsensus';

export interface CodexTranslateRequest {
  prompt: string;
  language: string;
  context?: string;
}

export interface CodexCompleteRequest {
  code: string;
  language: string;
  context?: string;
}

export interface CodexRefactorRequest {
  code: string;
  language: string;
  instruction: string;
}

export interface CodexTestRequest {
  code: string;
  language: string;
  framework?: string;
}

export interface CodexExplainRequest {
  code: string;
  language: string;
}

export class CodexEngine {
  private consensus: MultiModelConsensus;

  constructor() {
    this.consensus = new MultiModelConsensus();
  }

  /**
   * Translate natural language to code
   */
  async translate(request: CodexTranslateRequest): Promise<string> {
    const systemPrompt = `You are an expert programmer. Convert natural language descriptions into clean, efficient ${request.language} code.
Follow best practices and include helpful comments.`;

    const userPrompt = `${request.context ? `Context: ${request.context}\n\n` : ''}Task: ${request.prompt}

Generate complete, production-ready ${request.language} code.`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.extractCode(result.finalResponse, request.language);
  }

  /**
   * Intelligent code completion
   */
  async complete(request: CodexCompleteRequest): Promise<string[]> {
    const systemPrompt = `You are an expert ${request.language} programmer. Provide intelligent code completions.`;

    const userPrompt = `${request.context ? `Context: ${request.context}\n\n` : ''}Complete this ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

Provide 3 different completion suggestions, each on a new line starting with "COMPLETION:".`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'speed' }
    );

    return this.extractCompletions(result.finalResponse);
  }

  /**
   * Refactor code based on instructions
   */
  async refactor(request: CodexRefactorRequest): Promise<string> {
    const systemPrompt = `You are an expert code refactoring assistant. Apply refactoring while preserving functionality.`;

    const userPrompt = `Refactor this ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

Instruction: ${request.instruction}

Provide the refactored code with explanatory comments.`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.extractCode(result.finalResponse, request.language);
  }

  /**
   * Generate unit tests
   */
  async generateTests(request: CodexTestRequest): Promise<string> {
    const framework = request.framework || this.getDefaultTestFramework(request.language);
    
    const systemPrompt = `You are an expert in test-driven development. Generate comprehensive unit tests.`;

    const userPrompt = `Generate ${framework} unit tests for this ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

Include:
- Edge cases
- Error scenarios
- Happy path tests
- Mock dependencies where needed`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.extractCode(result.finalResponse, request.language);
  }

  /**
   * Explain code in natural language
   */
  async explain(request: CodexExplainRequest): Promise<string> {
    const systemPrompt = `You are an expert code reviewer. Explain code clearly and concisely.`;

    const userPrompt = `Explain this ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

Provide:
1. High-level purpose
2. Key logic flows
3. Potential issues or improvements`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'analysis' }
    );

    return result.finalResponse;
  }

  /**
   * Generate documentation/docstrings
   */
  async generateDocs(code: string, language: string): Promise<string> {
    const systemPrompt = `You are an expert technical writer. Generate clear, comprehensive documentation.`;

    const userPrompt = `Generate documentation for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
- Function/class descriptions
- Parameter documentation
- Return value documentation
- Usage examples`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'analysis' }
    );

    return result.finalResponse;
  }

  /**
   * Detect and fix bugs
   */
  async fixBugs(code: string, language: string, error?: string): Promise<{ fixed: string; explanation: string }> {
    const systemPrompt = `You are an expert debugger. Find and fix bugs while explaining the issues.`;

    const userPrompt = `${error ? `Error: ${error}\n\n` : ''}Find and fix bugs in this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Fixed code
2. Explanation of the bug
3. Prevention tips`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    const response = result.finalResponse;
    const fixed = this.extractCode(response, language);
    const explanation = response.split('```')[0] || response;

    return { fixed, explanation };
  }

  /**
   * Extract code from markdown response
   */
  private extractCode(response: string, language: string): string {
    const codeBlockRegex = new RegExp(`\`\`\`${language}?\\n([\\s\\S]*?)\`\`\``, 'i');
    const match = response.match(codeBlockRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback: try to extract any code block
    const anyCodeBlock = response.match(/```[\s\S]*?\n([\s\\S]*?)```/);
    if (anyCodeBlock && anyCodeBlock[1]) {
      return anyCodeBlock[1].trim();
    }

    return response.trim();
  }

  /**
   * Extract multiple completions from response
   */
  private extractCompletions(response: string): string[] {
    const completions: string[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      if (line.startsWith('COMPLETION:')) {
        completions.push(line.replace('COMPLETION:', '').trim());
      }
    }

    // Fallback: if no COMPLETION markers, split by double newlines
    if (completions.length === 0) {
      return response.split('\n\n').filter(s => s.trim()).slice(0, 3);
    }

    return completions.slice(0, 3);
  }

  /**
   * Get default test framework for language
   */
  private getDefaultTestFramework(language: string): string {
    const frameworks: Record<string, string> = {
      typescript: 'Jest',
      javascript: 'Jest',
      python: 'pytest',
      java: 'JUnit',
      go: 'testing',
      rust: 'cargo test',
      csharp: 'NUnit'
    };

    return frameworks[language.toLowerCase()] || 'standard testing library';
  }
}

export default CodexEngine;
