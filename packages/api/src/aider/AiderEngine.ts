/**
 * AiderEngine - Standalone implementation of Aider-style AI pair programming
 * Provides conversational code editing, multi-file refactoring, and Git integration
 */

import MultiModelConsensus from '../llm/MultiModelConsensus';

export interface AiderEditRequest {
  instruction: string;
  files: string[];
  context?: string;
}

export interface AiderRefactorRequest {
  files: string[];
  goal: string;
  constraints?: string[];
}

export interface AiderDiffRequest {
  original: string;
  instruction: string;
  language: string;
}

export interface AiderCommitRequest {
  changes: string[];
  context?: string;
}

export class AiderEngine {
  private consensus: MultiModelConsensus;
  private conversationHistory: Array<{ role: string; content: string }>;

  constructor() {
    this.consensus = new MultiModelConsensus();
    this.conversationHistory = [];
  }

  /**
   * Conversational code editing
   */
  async edit(request: AiderEditRequest): Promise<{ changes: Record<string, string>; explanation: string }> {
    const systemPrompt = `You are Aider, an AI pair programmer. Make precise, targeted edits based on instructions.
Always explain your changes and maintain code quality.`;

    const userPrompt = `${request.context ? `Context: ${request.context}\n\n` : ''}Files to edit: ${request.files.join(', ')}

Instruction: ${request.instruction}

For each file, provide:
FILE: <filename>
CHANGES: <description of changes>
CODE: <updated code>`;

    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: request.instruction });

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    this.conversationHistory.push({ role: 'assistant', content: result.finalResponse });

    return this.parseEditResponse(result.finalResponse);
  }

  /**
   * Multi-file refactoring
   */
  async refactor(request: AiderRefactorRequest): Promise<{
    plan: string;
    changes: Record<string, string>;
    tests: string;
  }> {
    const systemPrompt = `You are an expert refactoring assistant. Plan and execute multi-file refactorings safely.`;

    const constraints = request.constraints?.length
      ? `\nConstraints: ${request.constraints.join(', ')}`
      : '';

    const userPrompt = `Refactor these files: ${request.files.join(', ')}

Goal: ${request.goal}${constraints}

Provide:
1. PLAN: Step-by-step refactoring plan
2. FILE CHANGES: Updated code for each file
3. TESTS: Test updates needed`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.parseRefactorResponse(result.finalResponse);
  }

  /**
   * Generate and apply diffs
   */
  async generateDiff(request: AiderDiffRequest): Promise<{
    diff: string;
    modified: string;
    explanation: string;
  }> {
    const systemPrompt = `You are an expert at generating precise code diffs. Create minimal, focused changes.`;

    const userPrompt = `Original ${request.language} code:
\`\`\`${request.language}
${request.original}
\`\`\`

Instruction: ${request.instruction}

Provide:
1. DIFF: Unified diff format
2. MODIFIED: Complete modified code
3. EXPLANATION: What changed and why`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.parseDiffResponse(result.finalResponse, request.language);
  }

  /**
   * Suggest architectural improvements
   */
  async suggestArchitecture(files: string[], currentStructure: string): Promise<{
    suggestions: string[];
    benefits: string[];
    migration: string;
  }> {
    const systemPrompt = `You are a software architect. Suggest structural improvements.`;

    const userPrompt = `Current project structure:
${currentStructure}

Files: ${files.join(', ')}

Suggest architectural improvements considering:
- Modularity
- Maintainability
- Scalability
- Best practices

Provide:
SUGGESTIONS: <list of improvements>
BENEFITS: <benefits of each>
MIGRATION: <migration plan>`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.parseArchitectureResponse(result.finalResponse);
  }

  /**
   * Generate commit message from changes
   */
  async generateCommitMessage(request: AiderCommitRequest): Promise<{
    message: string;
    body: string;
  }> {
    const systemPrompt = `You are an expert at writing clear, descriptive commit messages following conventional commits.`;

    const userPrompt = `${request.context ? `Context: ${request.context}\n\n` : ''}Changes made:
${request.changes.join('\n')}

Generate a commit message with:
1. TITLE: Concise summary (50 chars max)
2. BODY: Detailed description with bullet points`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'analysis' }
    );

    return this.parseCommitMessage(result.finalResponse);
  }

  /**
   * Test-driven development support
   */
  async generateTestFirst(requirement: string, language: string): Promise<{
    tests: string;
    implementation: string;
    plan: string;
  }> {
    const systemPrompt = `You are a TDD expert. Generate failing tests first, then implementation.`;

    const userPrompt = `Requirement: ${requirement}
Language: ${language}

Follow TDD:
1. TESTS: Write failing tests
2. IMPLEMENTATION: Minimal code to pass tests
3. PLAN: Refactoring opportunities`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.parseTDDResponse(result.finalResponse, language);
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation context
   */
  getHistory(): Array<{ role: string; content: string }> {
    return [...this.conversationHistory];
  }

  /**
   * Parse edit response
   */
  private parseEditResponse(response: string): { changes: Record<string, string>; explanation: string } {
    const changes: Record<string, string> = {};
    const files = response.split('FILE:').slice(1);

    for (const fileBlock of files) {
      const lines = fileBlock.split('\n');
      const filename = lines[0].trim();
      const codeMatch = fileBlock.match(/CODE:([\s\S]*?)(?=FILE:|$)/);
      
      if (codeMatch) {
        changes[filename] = codeMatch[1].trim();
      }
    }

    const explanation = response.split('FILE:')[0].trim() || 'Code updated successfully';

    return { changes, explanation };
  }

  /**
   * Parse refactor response
   */
  private parseRefactorResponse(response: string): {
    plan: string;
    changes: Record<string, string>;
    tests: string;
  } {
    const planMatch = response.match(/PLAN:([\s\S]*?)(?=FILE CHANGES:|$)/);
    const testsMatch = response.match(/TESTS:([\s\S]*?)$/);
    
    const plan = planMatch ? planMatch[1].trim() : '';
    const tests = testsMatch ? testsMatch[1].trim() : '';
    
    const changes: Record<string, string> = {};
    const fileChanges = response.match(/FILE CHANGES:([\s\S]*?)(?=TESTS:|$)/);
    
    if (fileChanges) {
      const files = fileChanges[1].split('FILE:').slice(1);
      for (const file of files) {
        const lines = file.split('\n');
        const filename = lines[0].trim();
        changes[filename] = file.substring(filename.length).trim();
      }
    }

    return { plan, changes, tests };
  }

  /**
   * Parse diff response
   */
  private parseDiffResponse(response: string, language: string): {
    diff: string;
    modified: string;
    explanation: string;
  } {
    const diffMatch = response.match(/DIFF:([\s\S]*?)(?=MODIFIED:|$)/);
    const modifiedMatch = response.match(/MODIFIED:([\s\S]*?)(?=EXPLANATION:|$)/);
    const explanationMatch = response.match(/EXPLANATION:([\s\S]*?)$/);

    return {
      diff: diffMatch ? diffMatch[1].trim() : '',
      modified: modifiedMatch ? modifiedMatch[1].trim() : '',
      explanation: explanationMatch ? explanationMatch[1].trim() : ''
    };
  }

  /**
   * Parse architecture response
   */
  private parseArchitectureResponse(response: string): {
    suggestions: string[];
    benefits: string[];
    migration: string;
  } {
    const sections = response.split(/SUGGESTIONS:|BENEFITS:|MIGRATION:/);
    
    return {
      suggestions: (sections[1] || '').split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')),
      benefits: (sections[2] || '').split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')),
      migration: (sections[3] || '').trim()
    };
  }

  /**
   * Parse commit message
   */
  private parseCommitMessage(response: string): { message: string; body: string } {
    const titleMatch = response.match(/TITLE:(.*?)(?=\n|$)/);
    const bodyMatch = response.match(/BODY:([\s\S]*?)$/);

    return {
      message: titleMatch ? titleMatch[1].trim() : 'Update code',
      body: bodyMatch ? bodyMatch[1].trim() : ''
    };
  }

  /**
   * Parse TDD response
   */
  private parseTDDResponse(response: string, language: string): {
    tests: string;
    implementation: string;
    plan: string;
  } {
    const sections = response.split(/TESTS:|IMPLEMENTATION:|PLAN:/);
    
    return {
      tests: (sections[1] || '').trim(),
      implementation: (sections[2] || '').trim(),
      plan: (sections[3] || '').trim()
    };
  }
}

export default AiderEngine;
