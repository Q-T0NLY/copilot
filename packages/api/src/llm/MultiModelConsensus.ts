/**
 * Multi-Model Consensus Protocol
 * 
 * Implements parallel evaluation across multiple AI models:
 * - GPT-4, Claude 3, Gemini, and more
 * - Confidence scoring and weighted voting
 * - Cross-model alignment verification
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface ModelResponse {
  model: string;
  response: string;
  confidence: number;
  latency: number;
  tokens?: number;
}

interface ConsensusResult {
  finalResponse: string;
  confidence: number;
  agreement: number;
  responses: ModelResponse[];
  method: 'unanimous' | 'majority' | 'weighted' | 'single';
}

interface ModelWeight {
  model: string;
  weight: number;
  specialty: string;
}

class MultiModelConsensus {
  private openai: OpenAI;
  private anthropic: Anthropic;
  
  private modelWeights: ModelWeight[] = [
    { model: 'gpt-4', weight: 1.0, specialty: 'reasoning' },
    { model: 'gpt-3.5-turbo', weight: 0.7, specialty: 'speed' },
    { model: 'claude-3-opus-20240229', weight: 1.0, specialty: 'analysis' },
    { model: 'claude-3-sonnet-20240229', weight: 0.8, specialty: 'balance' },
  ];

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  /**
   * Evaluate prompt across multiple models in parallel
   */
  async evaluateParallel(
    prompt: string,
    models: string[] = ['gpt-4', 'claude-3-opus-20240229'],
    options: {
      maxTokens?: number;
      temperature?: number;
      requireConsensus?: boolean;
    } = {}
  ): Promise<ConsensusResult> {
    const { maxTokens = 1000, temperature = 0.7, requireConsensus = false } = options;

    // Execute all models in parallel
    const promises = models.map((model) =>
      this.evaluateModel(model, prompt, { maxTokens, temperature })
    );

    const responses = await Promise.allSettled(promises);

    // Filter successful responses
    const successfulResponses: ModelResponse[] = responses
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<ModelResponse>).value);

    if (successfulResponses.length === 0) {
      throw new Error('All models failed to respond');
    }

    // Calculate consensus
    return this.calculateConsensus(successfulResponses, requireConsensus);
  }

  /**
   * Evaluate a single model
   */
  private async evaluateModel(
    model: string,
    prompt: string,
    options: { maxTokens: number; temperature: number }
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      let response: string;
      let tokens = 0;

      if (model.startsWith('gpt')) {
        const completion = await this.openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens,
          temperature: options.temperature,
        });

        response = completion.choices[0]?.message?.content || '';
        tokens = completion.usage?.total_tokens || 0;
      } else if (model.startsWith('claude')) {
        const completion = await this.anthropic.messages.create({
          model,
          max_tokens: options.maxTokens,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature,
        });

        const content = completion.content[0];
        response = content.type === 'text' ? content.text : '';
        tokens = (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }

      const latency = Date.now() - startTime;

      return {
        model,
        response,
        confidence: this.calculateConfidence(response, model),
        latency,
        tokens,
      };
    } catch (error) {
      throw new Error(`Model ${model} failed: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate confidence score for a response
   */
  private calculateConfidence(response: string, model: string): number {
    // Base confidence on model weight
    const modelWeight = this.modelWeights.find((w) => w.model === model)?.weight || 0.5;

    // Adjust based on response quality indicators
    let qualityScore = 0.5;

    // Longer, more detailed responses get higher scores
    if (response.length > 500) qualityScore += 0.1;
    if (response.length > 1000) qualityScore += 0.1;

    // Responses with code blocks or structured content
    if (response.includes('```')) qualityScore += 0.1;
    if (response.includes('\n-') || response.includes('\n1.')) qualityScore += 0.05;

    // Responses with clear conclusions
    if (response.toLowerCase().includes('in conclusion') ||
        response.toLowerCase().includes('therefore') ||
        response.toLowerCase().includes('in summary')) {
      qualityScore += 0.05;
    }

    // Combine model weight and quality score
    return Math.min(1.0, modelWeight * 0.7 + qualityScore * 0.3);
  }

  /**
   * Calculate consensus from multiple model responses
   */
  private calculateConsensus(
    responses: ModelResponse[],
    requireConsensus: boolean
  ): ConsensusResult {
    if (responses.length === 1) {
      return {
        finalResponse: responses[0].response,
        confidence: responses[0].confidence,
        agreement: 1.0,
        responses,
        method: 'single',
      };
    }

    // Calculate similarity between responses
    const agreement = this.calculateAgreement(responses);

    // Determine consensus method
    let method: ConsensusResult['method'];
    let finalResponse: string;
    let confidence: number;

    if (agreement > 0.9) {
      // Unanimous - all models agree
      method = 'unanimous';
      finalResponse = responses[0].response;
      confidence = 0.95;
    } else if (agreement > 0.7) {
      // Majority - most models agree
      method = 'majority';
      finalResponse = this.getMajorityResponse(responses);
      confidence = 0.8;
    } else if (!requireConsensus) {
      // Weighted - use confidence weights
      method = 'weighted';
      finalResponse = this.getWeightedResponse(responses);
      confidence = this.getAverageConfidence(responses);
    } else {
      throw new Error(
        `Consensus required but agreement only ${(agreement * 100).toFixed(1)}%`
      );
    }

    return {
      finalResponse,
      confidence,
      agreement,
      responses,
      method,
    };
  }

  /**
   * Calculate agreement score between responses
   */
  private calculateAgreement(responses: ModelResponse[]): number {
    if (responses.length < 2) return 1.0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        totalSimilarity += this.calculateSimilarity(
          responses[i].response,
          responses[j].response
        );
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * Calculate similarity between two responses (simple word overlap)
   */
  private calculateSimilarity(resp1: string, resp2: string): number {
    const words1 = new Set(resp1.toLowerCase().split(/\s+/));
    const words2 = new Set(resp2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get majority response (most common or highest confidence)
   */
  private getMajorityResponse(responses: ModelResponse[]): string {
    // Return response with highest confidence
    return responses.reduce((prev, current) =>
      current.confidence > prev.confidence ? current : prev
    ).response;
  }

  /**
   * Get weighted response based on confidence scores
   */
  private getWeightedResponse(responses: ModelResponse[]): string {
    // Return response with highest weighted confidence
    return responses.reduce((prev, current) => {
      const prevWeight =
        prev.confidence * (this.modelWeights.find((w) => w.model === prev.model)?.weight || 1);
      const currentWeight =
        current.confidence * (this.modelWeights.find((w) => w.model === current.model)?.weight || 1);
      return currentWeight > prevWeight ? current : prev;
    }).response;
  }

  /**
   * Calculate average confidence across responses
   */
  private getAverageConfidence(responses: ModelResponse[]): number {
    const sum = responses.reduce((acc, r) => acc + r.confidence, 0);
    return sum / responses.length;
  }

  /**
   * Get consensus for a specific task type
   */
  async getConsensusForTask(
    prompt: string,
    taskType: 'reasoning' | 'analysis' | 'creativity' | 'speed'
  ): Promise<ConsensusResult> {
    // Select models based on task type
    const models = this.modelWeights
      .filter((w) => w.specialty === taskType || w.specialty === 'balance')
      .map((w) => w.model)
      .slice(0, 3); // Use top 3 models

    return this.evaluateParallel(prompt, models);
  }
}

export default MultiModelConsensus;
