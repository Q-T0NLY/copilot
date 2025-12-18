/**
 * WarpEngine - Standalone implementation of Warp-style terminal intelligence
 * Provides AI-powered command suggestions, natural language to shell, and workflow automation
 */

import MultiModelConsensus from '../llm/MultiModelConsensus';

export interface WarpSuggestRequest {
  query: string;
  platform: 'linux' | 'macos' | 'windows';
  shell?: string;
  context?: string;
}

export interface WarpExplainRequest {
  command: string;
  platform: 'linux' | 'macos' | 'windows';
}

export interface WarpWorkflowRequest {
  goal: string;
  platform: 'linux' | 'macos' | 'windows';
  constraints?: string[];
}

export interface WarpFixRequest {
  command: string;
  error: string;
  platform: 'linux' | 'macos' | 'windows';
}

export class WarpEngine {
  private consensus: MultiModelConsensus;
  private commandHistory: string[];

  constructor() {
    this.consensus = new MultiModelConsensus();
    this.commandHistory = [];
  }

  /**
   * Suggest shell command from natural language
   */
  async suggest(request: WarpSuggestRequest): Promise<{
    command: string;
    explanation: string;
    alternatives: string[];
    safety: 'safe' | 'caution' | 'dangerous';
  }> {
    const shell = request.shell || this.getDefaultShell(request.platform);
    const systemPrompt = `You are Warp AI. Convert natural language to ${shell} commands for ${request.platform}.
Always prioritize safety and explain what commands do.`;

    const userPrompt = `${request.context ? `Context: ${request.context}\n\n` : ''}Platform: ${request.platform}
Shell: ${shell}

User query: "${request.query}"

Provide:
COMMAND: <primary command>
EXPLANATION: <what it does>
ALTERNATIVE1: <alternative approach>
ALTERNATIVE2: <another alternative>
SAFETY: <safe|caution|dangerous>`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    const response = this.parseCommandSuggestion(result.finalResponse);
    
    // Add to history
    this.commandHistory.push(response.command);
    if (this.commandHistory.length > 100) {
      this.commandHistory.shift();
    }

    return response;
  }

  /**
   * Explain a shell command
   */
  async explain(request: WarpExplainRequest): Promise<{
    explanation: string;
    breakdown: Array<{ part: string; description: string }>;
    warnings: string[];
  }> {
    const systemPrompt = `You are an expert in ${request.platform} shell commands. Explain commands clearly and highlight risks.`;

    const userPrompt = `Explain this ${request.platform} command:

${request.command}

Provide:
EXPLANATION: <overall purpose>
BREAKDOWN: <part-by-part explanation>
WARNINGS: <potential risks or side effects>`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'analysis' }
    );

    return this.parseCommandExplanation(result.finalResponse);
  }

  /**
   * Create multi-step workflow
   */
  async createWorkflow(request: WarpWorkflowRequest): Promise<{
    steps: Array<{ command: string; description: string; safety: string }>;
    summary: string;
    totalSafety: 'safe' | 'caution' | 'dangerous';
  }> {
    const systemPrompt = `You are a workflow automation expert. Create safe, efficient multi-step shell workflows.`;

    const constraints = request.constraints?.length
      ? `\nConstraints: ${request.constraints.join(', ')}`
      : '';

    const userPrompt = `Platform: ${request.platform}
Goal: ${request.goal}${constraints}

Create a step-by-step workflow. For each step provide:
STEP: <step number>
COMMAND: <shell command>
DESCRIPTION: <what this step does>
SAFETY: <safe|caution|dangerous>

End with:
SUMMARY: <overall workflow summary>`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.parseWorkflow(result.finalResponse);
  }

  /**
   * Diagnose and fix command errors
   */
  async fix(request: WarpFixRequest): Promise<{
    diagnosis: string;
    fixedCommand: string;
    explanation: string;
  }> {
    const systemPrompt = `You are an expert troubleshooter. Diagnose command errors and provide fixes.`;

    const userPrompt = `Platform: ${request.platform}

Command that failed:
${request.command}

Error message:
${request.error}

Provide:
DIAGNOSIS: <what went wrong>
FIXED: <corrected command>
EXPLANATION: <why this fixes it>`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'reasoning' }
    );

    return this.parseErrorFix(result.finalResponse);
  }

  /**
   * Get command completion suggestions
   */
  async complete(partial: string, platform: 'linux' | 'macos' | 'windows'): Promise<string[]> {
    const systemPrompt = `You are a shell auto-completion expert.`;

    const userPrompt = `Platform: ${platform}

Partial command: ${partial}

Provide 5 likely completions, each on a new line starting with "COMPLETION:".`;

    const result = await this.consensus.evaluateParallel(
      userPrompt,
      { systemPrompt, taskType: 'speed' }
    );

    const completions: string[] = [];
    const lines = result.finalResponse.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('COMPLETION:')) {
        completions.push(line.replace('COMPLETION:', '').trim());
      }
    }

    return completions.slice(0, 5);
  }

  /**
   * Get command history analysis
   */
  getHistoryAnalysis(): {
    mostUsed: string[];
    patterns: string[];
    suggestions: string[];
  } {
    const frequency = new Map<string, number>();
    
    for (const cmd of this.commandHistory) {
      const base = cmd.split(' ')[0];
      frequency.set(base, (frequency.get(base) || 0) + 1);
    }

    const mostUsed = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cmd]) => cmd);

    return {
      mostUsed,
      patterns: this.detectPatterns(this.commandHistory),
      suggestions: this.generateSuggestions(mostUsed)
    };
  }

  /**
   * Get default shell for platform
   */
  private getDefaultShell(platform: 'linux' | 'macos' | 'windows'): string {
    const shells = {
      linux: 'bash',
      macos: 'zsh',
      windows: 'powershell'
    };
    return shells[platform];
  }

  /**
   * Parse command suggestion
   */
  private parseCommandSuggestion(response: string): {
    command: string;
    explanation: string;
    alternatives: string[];
    safety: 'safe' | 'caution' | 'dangerous';
  } {
    const commandMatch = response.match(/COMMAND:(.*?)(?=\n|$)/);
    const explanationMatch = response.match(/EXPLANATION:([\s\S]*?)(?=ALTERNATIVE|SAFETY|$)/);
    const safetyMatch = response.match(/SAFETY:\s*(\w+)/);

    const alternatives: string[] = [];
    const alt1Match = response.match(/ALTERNATIVE1:(.*?)(?=\n|$)/);
    const alt2Match = response.match(/ALTERNATIVE2:(.*?)(?=\n|$)/);
    
    if (alt1Match) alternatives.push(alt1Match[1].trim());
    if (alt2Match) alternatives.push(alt2Match[1].trim());

    return {
      command: commandMatch ? commandMatch[1].trim() : '',
      explanation: explanationMatch ? explanationMatch[1].trim() : '',
      alternatives,
      safety: (safetyMatch?.[1] as any) || 'caution'
    };
  }

  /**
   * Parse command explanation
   */
  private parseCommandExplanation(response: string): {
    explanation: string;
    breakdown: Array<{ part: string; description: string }>;
    warnings: string[];
  } {
    const explanationMatch = response.match(/EXPLANATION:([\s\S]*?)(?=BREAKDOWN|WARNINGS|$)/);
    const breakdownMatch = response.match(/BREAKDOWN:([\s\S]*?)(?=WARNINGS|$)/);
    const warningsMatch = response.match(/WARNINGS:([\s\S]*?)$/);

    const breakdown: Array<{ part: string; description: string }> = [];
    if (breakdownMatch) {
      const lines = breakdownMatch[1].split('\n').filter(l => l.trim());
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          breakdown.push({
            part: parts[0].trim(),
            description: parts.slice(1).join(':').trim()
          });
        }
      }
    }

    const warnings = warningsMatch 
      ? warningsMatch[1].split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, ''))
      : [];

    return {
      explanation: explanationMatch ? explanationMatch[1].trim() : '',
      breakdown,
      warnings
    };
  }

  /**
   * Parse workflow
   */
  private parseWorkflow(response: string): {
    steps: Array<{ command: string; description: string; safety: string }>;
    summary: string;
    totalSafety: 'safe' | 'caution' | 'dangerous';
  } {
    const steps: Array<{ command: string; description: string; safety: string }> = [];
    const stepBlocks = response.split(/STEP:\s*\d+/);

    for (const block of stepBlocks.slice(1)) {
      const cmdMatch = block.match(/COMMAND:(.*?)(?=\n|$)/);
      const descMatch = block.match(/DESCRIPTION:(.*?)(?=\n|$)/);
      const safetyMatch = block.match(/SAFETY:(.*?)(?=\n|$)/);

      if (cmdMatch) {
        steps.push({
          command: cmdMatch[1].trim(),
          description: descMatch ? descMatch[1].trim() : '',
          safety: safetyMatch ? safetyMatch[1].trim() : 'caution'
        });
      }
    }

    const summaryMatch = response.match(/SUMMARY:([\s\S]*?)$/);
    const summary = summaryMatch ? summaryMatch[1].trim() : '';

    const hasDangerous = steps.some(s => s.safety === 'dangerous');
    const hasCaution = steps.some(s => s.safety === 'caution');
    const totalSafety = hasDangerous ? 'dangerous' : hasCaution ? 'caution' : 'safe';

    return { steps, summary, totalSafety };
  }

  /**
   * Parse error fix
   */
  private parseErrorFix(response: string): {
    diagnosis: string;
    fixedCommand: string;
    explanation: string;
  } {
    const diagnosisMatch = response.match(/DIAGNOSIS:([\s\S]*?)(?=FIXED|$)/);
    const fixedMatch = response.match(/FIXED:(.*?)(?=\n|$)/);
    const explanationMatch = response.match(/EXPLANATION:([\s\S]*?)$/);

    return {
      diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : '',
      fixedCommand: fixedMatch ? fixedMatch[1].trim() : '',
      explanation: explanationMatch ? explanationMatch[1].trim() : ''
    };
  }

  /**
   * Detect command patterns
   */
  private detectPatterns(commands: string[]): string[] {
    const patterns: string[] = [];
    
    // Look for common sequences
    for (let i = 0; i < commands.length - 1; i++) {
      const current = commands[i].split(' ')[0];
      const next = commands[i + 1].split(' ')[0];
      const pattern = `${current} → ${next}`;
      
      if (!patterns.includes(pattern)) {
        patterns.push(pattern);
      }
    }

    return patterns.slice(0, 3);
  }

  /**
   * Generate suggestions based on history
   */
  private generateSuggestions(mostUsed: string[]): string[] {
    const suggestions: string[] = [];
    
    for (const cmd of mostUsed) {
      if (cmd === 'git') {
        suggestions.push('Consider using git aliases for frequently used commands');
      } else if (cmd === 'npm' || cmd === 'yarn') {
        suggestions.push('Use package.json scripts for common tasks');
      } else if (cmd === 'docker') {
        suggestions.push('Create docker-compose.yml for multi-container workflows');
      }
    }

    return suggestions.slice(0, 3);
  }
}

export default WarpEngine;
