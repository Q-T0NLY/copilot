# Advanced AI Systems Documentation

## DAG/RAG++, Prompt Toolkit, and Context/NLP Fusion

This guide covers the three advanced AI systems integrated into the platform.

---

## 🔗 DAG/RAG++ Engine

### Overview

The DAG (Directed Acyclic Graph) RAG++ Engine provides advanced retrieval-augmented generation with query optimization and multi-source knowledge fusion.

### Key Features

- **Query DAG Construction** - Automatic decomposition of complex queries
- **Multi-Strategy Search** - Semantic, keyword, hybrid, and structured search
- **Result Fusion** - 4 fusion strategies (linear, reciprocal, weighted, neural)
- **Topological Optimization** - Efficient DAG traversal
- **Embedding-Based Retrieval** - Semantic similarity using vector embeddings

### API Endpoints

#### Index Documents
```bash
POST /api/advanced-ai/rag/index
Content-Type: application/json

{
  "documents": [
    {
      "id": "doc1",
      "content": "Machine learning is a subset of artificial intelligence...",
      "source": "ml-guide.md"
    },
    {
      "id": "doc2",
      "content": "Neural networks are composed of layers of interconnected nodes...",
      "source": "nn-basics.md"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "indexed": 2,
  "stats": {
    "documentsIndexed": 2,
    "queryNodesActive": 0,
    "config": {
      "maxDepth": 3,
      "topK": 5,
      "similarityThreshold": 0.7,
      "fusionStrategy": "reciprocal",
      "reranking": true
    }
  }
}
```

#### Generate with RAG++
```bash
POST /api/advanced-ai/rag/generate
Content-Type: application/json

{
  "query": "What is the relationship between neural networks and machine learning?",
  "context": "Focusing on deep learning architectures"
}
```

**Response:**
```json
{
  "answer": "Machine learning is a broad field that encompasses various techniques...",
  "query": "What is the relationship between neural networks and machine learning?",
  "stats": {
    "documentsIndexed": 2,
    "queryNodesActive": 3
  }
}
```

#### Build Query DAG
```bash
POST /api/advanced-ai/rag/dag
Content-Type: application/json

{
  "query": "Explain backpropagation in neural networks"
}
```

**Response:**
```json
{
  "query": "Explain backpropagation in neural networks",
  "dag": [
    {
      "id": "root",
      "query": "Explain backpropagation in neural networks",
      "type": "hybrid",
      "dependencies": []
    },
    {
      "id": "sub_0",
      "query": "What is backpropagation?",
      "type": "semantic",
      "dependencies": ["root"]
    },
    {
      "id": "sub_1",
      "query": "How does backpropagation work in neural networks?",
      "type": "semantic",
      "dependencies": ["root"]
    }
  ],
  "nodeCount": 3
}
```

### Fusion Strategies

**Linear Fusion:**
```
score = (score1 + score2) / 2
```

**Reciprocal Rank Fusion:**
```
score = 1 / (1/score1 + 1/score2)
```

**Weighted Fusion:**
```
score = 0.6 * score1 + 0.4 * score2
```

**Neural Fusion:**
```
score = max(score1, score2) * 0.8 + min(score1, score2) * 0.2
```

---

## 📝 Prompt Toolkit

### Overview

Comprehensive prompt engineering system with templates, optimization, and chaining capabilities.

### Key Features

- **8+ Pre-built Templates** - Code, chat, analysis, creative, structured
- **Prompt Optimization** - Automatic quality improvement
- **Quality Metrics** - Clarity, specificity, context, instructions
- **Prompt Chaining** - Multi-step prompt workflows
- **Few-Shot Learning** - Example-based generation
- **Template Search** - By category and tags

### API Endpoints

#### List Templates
```bash
GET /api/advanced-ai/prompts/templates?category=code
```

**Response:**
```json
{
  "templates": [
    {
      "id": "code-explain",
      "name": "Code Explanation",
      "template": "Explain the following {{language}} code...",
      "variables": ["language", "code"],
      "category": "code",
      "tags": ["explain", "analysis"]
    }
  ],
  "count": 1
}
```

#### Render Prompt
```bash
POST /api/advanced-ai/prompts/render
Content-Type: application/json

{
  "templateId": "code-explain",
  "variables": {
    "language": "Python",
    "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"
  }
}
```

**Response:**
```json
{
  "templateId": "code-explain",
  "rendered": "Explain the following Python code in detail:\n\n```Python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```\n\nProvide:\n1. High-level overview\n2. Line-by-line explanation\n3. Time/space complexity\n4. Potential improvements",
  "variables": {
    "language": "Python",
    "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"
  }
}
```

#### Optimize Prompt
```bash
POST /api/advanced-ai/prompts/optimize
Content-Type: application/json

{
  "prompt": "Write code for sorting"
}
```

**Response:**
```json
{
  "optimized": "Write a Python function to implement the quicksort algorithm:\n\n1. Accept a list of integers as input\n2. Return a sorted list in ascending order\n3. Use in-place sorting where possible\n4. Add type hints and docstrings\n5. Handle edge cases (empty list, single element)\n\nProvide the complete, production-ready implementation.",
  "metrics": {
    "clarity": 0.9,
    "specificity": 0.95,
    "contextQuality": 0.8,
    "instructionQuality": 1.0,
    "overallScore": 0.91
  },
  "suggestions": []
}
```

### Available Templates

1. **code-explain** - Explain code with complexity analysis
2. **code-refactor** - Refactor code for improvements
3. **bug-fix** - Fix bugs with root cause analysis
4. **test-generation** - Generate comprehensive tests
5. **creative-writing** - Creative content generation
6. **data-analysis** - Data insights and recommendations
7. **chat-assistant** - Conversational AI responses
8. **structured-output** - JSON/structured format generation

---

## 🧠 Context/NLP Fusion

### Overview

Multi-source context aggregation with NLP processing for enhanced AI responses.

### Key Features

- **Named Entity Recognition (NER)** - Extract entities (email, URL, numbers, names)
- **Keyword Extraction** - TF-IDF-based keyword identification
- **Sentiment Analysis** - Positive/negative/neutral classification
- **Topic Modeling** - Automatic topic extraction
- **Text Summarization** - Extractive summarization
- **Context Fusion** - Merge multiple context sources with relevance ranking

### API Endpoints

#### Add Context Source
```bash
POST /api/advanced-ai/nlp/context
Content-Type: application/json

{
  "id": "ctx1",
  "type": "documentation",
  "content": "The API supports RESTful endpoints for data retrieval. Contact support@example.com for assistance.",
  "metadata": {
    "version": "2.0",
    "updated": "2024-01-15"
  }
}
```

**Response:**
```json
{
  "success": true,
  "context": {
    "id": "ctx1",
    "type": "documentation",
    "content": "The API supports RESTful endpoints...",
    "metadata": {...},
    "timestamp": "2024-01-20T10:30:00.000Z"
  },
  "stats": {
    "contextSourcesStored": 1,
    "maxContextWindow": 8000,
    "types": {
      "documentation": 1
    }
  }
}
```

#### Extract NLP Features
```bash
POST /api/advanced-ai/nlp/features
Content-Type: application/json

{
  "text": "Machine learning is transforming the tech industry. Companies like Google and Microsoft are investing heavily. Contact ml-team@company.com for collaboration."
}
```

**Response:**
```json
{
  "entities": [
    {"text": "ml-team@company.com", "type": "EMAIL", "score": 1.0},
    {"text": "Google", "type": "PROPER_NOUN", "score": 0.6},
    {"text": "Microsoft", "type": "PROPER_NOUN", "score": 0.6}
  ],
  "keywords": ["machine", "learning", "transforming", "industry", "companies", "investing"],
  "sentiment": {
    "score": 0.3,
    "label": "positive"
  },
  "topics": ["technology", "business"],
  "summary": "Machine learning is transforming the tech industry. Companies like Google and Microsoft are investing heavily."
}
```

#### Fuse Contexts
```bash
POST /api/advanced-ai/nlp/fuse
Content-Type: application/json

{
  "query": "How to implement authentication?",
  "sourceIds": ["ctx1", "ctx2", "ctx3"]
}
```

**Response:**
```json
{
  "content": "[documentation] Authentication requires JWT tokens...\n\n[code] Example implementation: const auth = require('jwt')...",
  "sources": [
    {
      "id": "ctx1",
      "type": "documentation",
      "content": "Authentication requires JWT tokens...",
      "metadata": {},
      "timestamp": "2024-01-20T10:30:00.000Z"
    }
  ],
  "features": {
    "entities": [...],
    "keywords": ["authentication", "jwt", "tokens"],
    "sentiment": {"score": 0, "label": "neutral"},
    "topics": ["technology"],
    "summary": "Authentication requires JWT tokens for secure API access."
  },
  "relevanceScore": 0.85
}
```

---

## 🔄 Integration Examples

### RAG++ with Prompt Optimization
```javascript
// 1. Index knowledge base
await fetch('/api/advanced-ai/rag/index', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    documents: knowledgeBase
  })
});

// 2. Optimize query prompt
const optimized = await fetch('/api/advanced-ai/prompts/optimize', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    prompt: userQuery
  })
}).then(r => r.json());

// 3. Generate with RAG++
const answer = await fetch('/api/advanced-ai/rag/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    query: optimized.optimized
  })
}).then(r => r.json());
```

### Prompt Chain with NLP Features
```javascript
// 1. Extract features from user input
const features = await fetch('/api/advanced-ai/nlp/features', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    text: userInput
  })
}).then(r => r.json());

// 2. Use features to select appropriate template
const template = features.topics.includes('code') ? 'code-explain' : 'chat-assistant';

// 3. Render and execute
const rendered = await fetch('/api/advanced-ai/prompts/render', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    templateId: template,
    variables: {
      language: 'Python',
      code: extractedCode
    }
  })
}).then(r => r.json());
```

---

## 📈 Performance & Best Practices

### RAG++ Optimization

1. **Batch indexing** - Index documents in batches of 50-100
2. **Regular cleanup** - Remove outdated documents
3. **Fusion strategy** - Use 'reciprocal' for balanced results
4. **Top-K tuning** - Start with 5, adjust based on results

### Prompt Engineering

1. **Use templates** - Start with pre-built templates
2. **Optimize prompts** - Run optimization on custom prompts
3. **Add examples** - Include few-shot examples for better results
4. **Chain steps** - Break complex tasks into prompt chains

### Context Management

1. **Source typing** - Properly categorize context sources
2. **Relevance filtering** - Remove low-relevance contexts
3. **Window management** - Stay within token limits (default: 8000)
4. **Feature extraction** - Use NLP features for better routing

---

## 🔒 Security Considerations

- Validate all user inputs
- Sanitize document content before indexing
- Limit context window to prevent token abuse
- Rate limit API endpoints
- Monitor prompt optimization requests

---

## 🐛 Troubleshooting

**Issue:** Low relevance scores in RAG++
- **Solution:** Lower similarity threshold or increase top-K

**Issue:** Prompt optimization returns similar prompt
- **Solution:** Original prompt is already high-quality

**Issue:** NLP features extraction is slow
- **Solution:** Reduce text length or use batching

**Issue:** Context fusion exceeds token limit
- **Solution:** Reduce maxContextWindow or filter sources

---

## 📚 Additional Resources

- [Advanced Prompting Techniques](https://platform.openai.com/docs/guides/prompt-engineering)
- [RAG Best Practices](https://docs.anthropic.com/claude/docs/retrieval-augmented-generation)
- [NLP Fundamentals](https://huggingface.co/docs/transformers)
