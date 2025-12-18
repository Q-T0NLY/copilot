/**
 * Advanced Prompt Toolkit
 * Comprehensive prompt engineering, templates, optimization, and chain management
 */

import { LLMService } from '../services/llmService';

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: 'code' | 'chat' | 'analysis' | 'creative' | 'structured';
  tags: string[];
  examples?: Array<{input: Record<string, string>, output: string}>;
}

interface PromptChain {
  id: string;
  steps: Array<{
    templateId: string;
    transform?: (input: string) => string;
    validate?: (output: string) => boolean;
  }>;
}

interface OptimizationMetrics {
  clarity: number;
  specificity: number;
  contextQuality: number;
  instructionQuality: number;
  overallScore: number;
}

export class PromptToolkit {
  private templates: Map<string, PromptTemplate>;
  private chains: Map<string, PromptChain>;
  private llmService: LLMService;

  constructor() {
    this.templates = new Map();
    this.chains = new Map();
    this.llmService = new LLMService();
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default prompt templates
   */
  private initializeDefaultTemplates() {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'code-explain',
        name: 'Code Explanation',
        template: `Explain the following {{language}} code in detail:

\`\`\`{{language}}
{{code}}
\`\`\`

Provide:
1. High-level overview
2. Line-by-line explanation
3. Time/space complexity
4. Potential improvements`,
        variables: ['language', 'code'],
        category: 'code',
        tags: ['explain', 'analysis']
      },
      {
        id: 'code-refactor',
        name: 'Code Refactoring',
        template: `Refactor the following {{language}} code to improve {{focus}}:

\`\`\`{{language}}
{{code}}
\`\`\`

Requirements:
- Maintain functionality
- Add comments
- Follow best practices
- Improve {{focus}}`,
        variables: ['language', 'code', 'focus'],
        category: 'code',
        tags: ['refactor', 'improve']
      },
      {
        id: 'bug-fix',
        name: 'Bug Fix',
        template: `Fix the bug in the following code:

\`\`\`{{language}}
{{code}}
\`\`\`

Error: {{error}}

Provide:
1. Root cause analysis
2. Fixed code
3. Explanation of the fix
4. Prevention strategies`,
        variables: ['language', 'code', 'error'],
        category: 'code',
        tags: ['debug', 'fix']
      },
      {
        id: 'test-generation',
        name: 'Test Generation',
        template: `Generate comprehensive unit tests for:

\`\`\`{{language}}
{{code}}
\`\`\`

Include:
- Happy path tests
- Edge cases
- Error cases
- Use {{framework}} testing framework`,
        variables: ['language', 'code', 'framework'],
        category: 'code',
        tags: ['testing', 'quality']
      },
      {
        id: 'creative-writing',
        name: 'Creative Writing',
        template: `Write a {{type}} about {{topic}} in a {{tone}} tone.

Requirements:
- Length: {{length}}
- Style: {{style}}
- Target audience: {{audience}}

Content:`,
        variables: ['type', 'topic', 'tone', 'length', 'style', 'audience'],
        category: 'creative',
        tags: ['writing', 'content']
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        template: `Analyze the following data and provide insights:

{{data}}

Analysis requirements:
1. Statistical summary
2. Trends and patterns
3. Anomalies
4. Actionable recommendations

Focus on: {{focus}}`,
        variables: ['data', 'focus'],
        category: 'analysis',
        tags: ['data', 'insights']
      },
      {
        id: 'chat-assistant',
        name: 'Chat Assistant',
        template: `You are a helpful {{role}} assistant with expertise in {{domain}}.

Context: {{context}}

User: {{query}}

Respond in a {{tone}} manner, providing {{detail}} detail.`,
        variables: ['role', 'domain', 'context', 'query', 'tone', 'detail'],
        category: 'chat',
        tags: ['assistant', 'conversation']
      },
      {
        id: 'structured-output',
        name: 'Structured Output',
        template: `Generate a structured {{format}} for:

Topic: {{topic}}

Requirements:
{{requirements}}

Output format: {{format}}
Ensure all fields are complete and accurate.`,
        variables: ['format', 'topic', 'requirements'],
        category: 'structured',
        tags: ['json', 'structured']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Render prompt from template
   */
  renderPrompt(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate variables
    const missingVars = template.variables.filter(v => !(v in variables));
    if (missingVars.length > 0) {
      throw new Error(`Missing variables: ${missingVars.join(', ')}`);
    }

    // Replace variables
    let rendered = template.template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return rendered;
  }

  /**
   * Optimize prompt for better results
   */
  async optimizePrompt(prompt: string): Promise<{optimized: string, metrics: OptimizationMetrics, suggestions: string[]}> {
    // Analyze current prompt
    const metrics = this.analyzePrompt(prompt);
    const suggestions: string[] = [];

    // Generate optimization suggestions
    if (metrics.clarity < 0.7) {
      suggestions.push('Add more specific instructions and clarify ambiguous terms');
    }
    if (metrics.specificity < 0.7) {
      suggestions.push('Include concrete examples and specific requirements');
    }
    if (metrics.contextQuality < 0.7) {
      suggestions.push('Provide more relevant context and background information');
    }
    if (metrics.instructionQuality < 0.7) {
      suggestions.push('Break down complex instructions into clear, numbered steps');
    }

    // Use LLM to optimize
    const optimizationPrompt = `Optimize the following prompt for better clarity and results:

Original: ${prompt}

Suggestions:
${suggestions.join('\n')}

Provide an optimized version that is clear, specific, and well-structured.`;

    const optimized = await this.llmService.generateText(optimizationPrompt, {
      model: 'gpt-4',
      temperature: 0.5
    });

    return {
      optimized: optimized.trim(),
      metrics: this.analyzePrompt(optimized),
      suggestions
    };
  }

  /**
   * Analyze prompt quality
   */
  private analyzePrompt(prompt: string): OptimizationMetrics {
    const clarity = this.calculateClarity(prompt);
    const specificity = this.calculateSpecificity(prompt);
    const contextQuality = this.calculateContextQuality(prompt);
    const instructionQuality = this.calculateInstructionQuality(prompt);

    return {
      clarity,
      specificity,
      contextQuality,
      instructionQuality,
      overallScore: (clarity + specificity + contextQuality + instructionQuality) / 4
    };
  }

  private calculateClarity(prompt: string): number {
    const hasQuestions = /\?/.test(prompt);
    const hasInstructions = /(provide|generate|create|explain|analyze)/i.test(prompt);
    const avgSentenceLength = prompt.split(/[.!?]+/).reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0) / prompt.split(/[.!?]+/).length;
    
    let score = 0.5;
    if (hasQuestions) score += 0.2;
    if (hasInstructions) score += 0.2;
    if (avgSentenceLength < 25) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculateSpecificity(prompt: string): number {
    const hasNumbers = /\d+/.test(prompt);
    const hasExamples = /(example|such as|for instance)/i.test(prompt);
    const hasConstraints = /(must|should|required|ensure)/i.test(prompt);
    const hasFormat = /(format|structure|json|list)/i.test(prompt);
    
    let score = 0.3;
    if (hasNumbers) score += 0.2;
    if (hasExamples) score += 0.2;
    if (hasConstraints) score += 0.2;
    if (hasFormat) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculateContextQuality(prompt: string): number {
    const hasContext = /(context|background|given|considering)/i.test(prompt);
    const hasDetails = prompt.length > 100;
    const hasStructure = /\n/.test(prompt);
    
    let score = 0.3;
    if (hasContext) score += 0.3;
    if (hasDetails) score += 0.2;
    if (hasStructure) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateInstructionQuality(prompt: string): number {
    const hasSteps = /\d+\.|step|first|second|then|finally/i.test(prompt);
    const hasActionVerbs = /(analyze|generate|create|explain|provide|describe)/i.test(prompt);
    const hasOutputFormat = /(output|result|response|format)/i.test(prompt);
    
    let score = 0.3;
    if (hasSteps) score += 0.3;
    if (hasActionVerbs) score += 0.2;
    if (hasOutputFormat) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  /**
   * Create prompt chain
   */
  createChain(id: string, steps: PromptChain['steps']): void {
    this.chains.set(id, { id, steps });
  }

  /**
   * Execute prompt chain
   */
  async executeChain(chainId: string, initialInput: Record<string, string>): Promise<string[]> {
    const chain = this.chains.get(chainId);
    if (!chain) {
      throw new Error(`Chain not found: ${chainId}`);
    }

    const results: string[] = [];
    let currentInput = initialInput;

    for (const step of chain.steps) {
      const prompt = this.renderPrompt(step.templateId, currentInput);
      const transformedPrompt = step.transform ? step.transform(prompt) : prompt;
      
      const response = await this.llmService.generateText(transformedPrompt, {
        model: 'gpt-4',
        temperature: 0.7
      });
      
      if (step.validate && !step.validate(response)) {
        throw new Error(`Chain step validation failed at ${step.templateId}`);
      }
      
      results.push(response);
      currentInput = { ...currentInput, previous_output: response };
    }

    return results;
  }

  /**
   * Add custom template
   */
  addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * List templates by category
   */
  listTemplates(category?: PromptTemplate['category']): PromptTemplate[] {
    const all = Array.from(this.templates.values());
    return category ? all.filter(t => t.category === category) : all;
  }

  /**
   * Search templates by tags
   */
  searchTemplates(tags: string[]): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(template =>
      tags.some(tag => template.tags.includes(tag))
    );
  }

  /**
   * Get template
   */
  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Generate few-shot examples
   */
  generateFewShot(template: PromptTemplate, count: number = 3): string {
    if (!template.examples || template.examples.length === 0) {
      return '';
    }

    const examples = template.examples.slice(0, count);
    return examples.map((ex, i) => {
      const input = this.renderPrompt(template.id, ex.input);
      return `Example ${i + 1}:\nInput: ${input}\nOutput: ${ex.output}`;
    }).join('\n\n');
  }
}
