/**
 * Advanced Context/NLP Fusion Engine
 * Multi-source context aggregation with NLP processing
 */

interface ContextSource {
  id: string;
  type: 'code' | 'documentation' | 'conversation' | 'external';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

interface NLPFeatures {
  entities: Array<{text: string, type: string, score: number}>;
  keywords: string[];
  sentiment: {score: number, label: 'positive' | 'negative' | 'neutral'};
  topics: string[];
  summary: string;
}

interface FusedContext {
  content: string;
  sources: ContextSource[];
  features: NLPFeatures;
  relevanceScore: number;
}

export class ContextNLPFusion {
  private contextStore: Map<string, ContextSource>;
  private maxContextWindow: number;

  constructor(maxContextWindow: number = 8000) {
    this.contextStore = new Map();
    this.maxContextWindow = maxContextWindow;
  }

  /**
   * Add context source
   */
  addContext(source: ContextSource): void {
    this.contextStore.set(source.id, source);
  }

  /**
   * Extract NLP features from text
   */
  async extractFeatures(text: string): Promise<NLPFeatures> {
    return {
      entities: await this.extractEntities(text),
      keywords: this.extractKeywords(text),
      sentiment: this.analyzeSentiment(text),
      topics: await this.extractTopics(text),
      summary: await this.generateSummary(text)
    };
  }

  /**
   * Named Entity Recognition
   */
  private async extractEntities(text: string): Promise<Array<{text: string, type: string, score: number}>> {
    // Simple pattern-based NER
    const entities: Array<{text: string, type: string, score: number}> = [];
    
    // Email pattern
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach(email => entities.push({text: email, type: 'EMAIL', score: 1.0}));
    
    // URL pattern
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex) || [];
    urls.forEach(url => entities.push({text: url, type: 'URL', score: 1.0}));
    
    // Number pattern
    const numberRegex = /\b\d+\.?\d*\b/g;
    const numbers = text.match(numberRegex) || [];
    numbers.forEach(num => entities.push({text: num, type: 'NUMBER', score: 0.8}));
    
    // Capitalized words (potential proper nouns)
    const capitalizedRegex = /\b[A-Z][a-z]+\b/g;
    const capitalized = text.match(capitalizedRegex) || [];
    capitalized.forEach(word => {
      if (!entities.find(e => e.text === word)) {
        entities.push({text: word, type: 'PROPER_NOUN', score: 0.6});
      }
    });
    
    return entities;
  }

  /**
   * Extract keywords using TF-IDF-like approach
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    // Count frequencies
    const freq = new Map<string, number>();
    words.forEach(word => {
      freq.set(word, (freq.get(word) || 0) + 1);
    });
    
    // Filter out common words
    const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'will', 'would', 'could', 'should']);
    const filtered = Array.from(freq.entries())
      .filter(([word]) => !stopWords.has(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    return filtered;
  }

  /**
   * Sentiment analysis
   */
  private analyzeSentiment(text: string): {score: number, label: 'positive' | 'negative' | 'neutral'} {
    const positiveWords = ['good', 'great', 'excellent', 'awesome', 'perfect', 'love', 'wonderful', 'amazing', 'best', 'fantastic'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'failed', 'error'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      const matches = lowerText.match(new RegExp(word, 'g'));
      if (matches) score += matches.length;
    });
    
    negativeWords.forEach(word => {
      const matches = lowerText.match(new RegExp(word, 'g'));
      if (matches) score -= matches.length;
    });
    
    const normalized = Math.max(-1, Math.min(1, score / 10));
    
    let label: 'positive' | 'negative' | 'neutral';
    if (normalized > 0.2) label = 'positive';
    else if (normalized < -0.2) label = 'negative';
    else label = 'neutral';
    
    return { score: normalized, label };
  }

  /**
   * Topic extraction
   */
  private async extractTopics(text: string): Promise<string[]> {
    const keywords = this.extractKeywords(text);
    
    // Group related keywords into topics
    const topics: string[] = [];
    
    // Technology topics
    const techWords = keywords.filter(w => 
      ['code', 'function', 'class', 'method', 'api', 'database', 'server'].includes(w)
    );
    if (techWords.length > 0) topics.push('technology');
    
    // Business topics
    const businessWords = keywords.filter(w =>
      ['user', 'customer', 'business', 'product', 'service', 'market'].includes(w)
    );
    if (businessWords.length > 0) topics.push('business');
    
    // Data topics
    const dataWords = keywords.filter(w =>
      ['data', 'analysis', 'metric', 'report', 'statistics'].includes(w)
    );
    if (dataWords.length > 0) topics.push('data-analysis');
    
    return topics.length > 0 ? topics : ['general'];
  }

  /**
   * Generate summary
   */
  private async generateSummary(text: string, maxLength: number = 200): Promise<string> {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return text.substring(0, maxLength);
    }
    
    // Score sentences based on keywords
    const keywords = this.extractKeywords(text);
    const scoredSentences = sentences.map(sentence => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (sentence.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0);
      return { sentence, score };
    });
    
    // Select top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.sentence.trim())
      .join('. ');
    
    return topSentences.substring(0, maxLength) + (topSentences.length > maxLength ? '...' : '');
  }

  /**
   * Fuse multiple context sources
   */
  async fuseContexts(query: string, sourceIds?: string[]): Promise<FusedContext> {
    // Get relevant sources
    const sources = sourceIds 
      ? sourceIds.map(id => this.contextStore.get(id)).filter(s => s !== undefined) as ContextSource[]
      : Array.from(this.contextStore.values());
    
    // Rank by relevance
    const ranked = sources.map(source => ({
      source,
      relevance: this.calculateRelevance(query, source.content)
    })).sort((a, b) => b.relevance - a.relevance);
    
    // Build fused context within token limit
    let fusedContent = '';
    const selectedSources: ContextSource[] = [];
    let totalTokens = 0;
    
    for (const {source, relevance} of ranked) {
      const tokens = this.estimateTokens(source.content);
      if (totalTokens + tokens <= this.maxContextWindow) {
        fusedContent += `\n\n[${source.type}] ${source.content}`;
        selectedSources.push(source);
        totalTokens += tokens;
      }
    }
    
    // Extract NLP features
    const features = await this.extractFeatures(fusedContent);
    
    return {
      content: fusedContent.trim(),
      sources: selectedSources,
      features,
      relevanceScore: ranked.length > 0 ? ranked[0].relevance : 0
    };
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let score = 0;
    queryWords.forEach(word => {
      const regex = new RegExp(word, 'g');
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length / queryWords.length;
      }
    });
    
    return Math.min(score, 1.0);
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get context statistics
   */
  getStats() {
    return {
      contextSourcesStored: this.contextStore.size,
      maxContextWindow: this.maxContextWindow,
      types: this.getContextTypeDistribution()
    };
  }

  private getContextTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    this.contextStore.forEach(source => {
      distribution[source.type] = (distribution[source.type] || 0) + 1;
    });
    return distribution;
  }
}
