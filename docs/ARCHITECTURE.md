# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Development Platform                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    Web UI        │  │     CLI Tool     │  │   External APIs  │
│   (Next.js)      │  │  (Commander.js)  │  │  (HTTP/REST)     │
│                  │  │                  │  │                  │
│  • Chat Panel    │  │  • chat          │  │  • Third-party   │
│  • Code Editor   │  │  • generate      │  │    integrations  │
│  • Visual Panel  │  │  • complete      │  │                  │
│  • Settings      │  │  • crawl         │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         │                     │                      │
         └─────────────────────┴──────────────────────┘
                               │
                               ▼
         ┌─────────────────────────────────────────────┐
         │          API Gateway (Express.js)            │
         │                                              │
         │  ┌────────────────────────────────────────┐ │
         │  │     Authentication & API Keys          │ │
         │  └────────────────────────────────────────┘ │
         │                                              │
         │  ┌────────────────────────────────────────┐ │
         │  │         Request Routing                │ │
         │  │  • /api/auth    • /api/llm             │ │
         │  │  • /api/crawler • /api/settings        │ │
         │  └────────────────────────────────────────┘ │
         │                                              │
         │  ┌────────────────────────────────────────┐ │
         │  │      Middleware & Security             │ │
         │  │  • Rate Limiting  • CORS               │ │
         │  │  • Helmet        • Validation          │ │
         │  └────────────────────────────────────────┘ │
         └──────────────────┬───────────────────────────┘
                            │
         ┌──────────────────┼───────────────────────────┐
         │                  │                           │
         ▼                  ▼                           ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│  LLM Service    │ │ Crawler Service │ │  Settings Service   │
│                 │ │                 │ │                     │
│ • OpenAI API    │ │ • Puppeteer     │ │ • Configuration     │
│ • Anthropic API │ │ • Cheerio       │ │ • Persistence       │
│ • Code Gen      │ │ • Axios         │ │ • Key Management    │
│ • Completion    │ │ • JS Rendering  │ │                     │
└─────────────────┘ └─────────────────┘ └─────────────────────┘
         │                  │                           │
         ▼                  ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   OpenAI     │  │  Anthropic   │  │   Websites   │      │
│  │   GPT-4      │  │   Claude-3   │  │   (Crawl)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Code Generation Flow

```
User Input (Web/CLI)
    │
    ▼
API Gateway (/api/llm/code/generate)
    │
    ├─ Authentication Check
    │
    ├─ Rate Limiting
    │
    ▼
LLM Service
    │
    ├─ Format Prompt
    │
    ├─ Call LLM Provider (OpenAI/Anthropic)
    │
    ▼
Generated Code
    │
    ▼
Response to User
```

### 2. Web Crawling Flow

```
URL Input
    │
    ▼
API Gateway (/api/crawler/crawl)
    │
    ├─ Authentication Check
    │
    ▼
Crawler Service
    │
    ├─ Static Mode?
    │   │
    │   ├─ Yes → Axios + Cheerio
    │   │
    │   └─ No → Puppeteer (JS rendering)
    │
    ▼
Extracted Content
    │
    ├─ Title
    ├─ Content
    ├─ Links
    │
    ▼
JSON Response
```

### 3. Chat Conversation Flow

```
User Message
    │
    ▼
Web UI / CLI
    │
    ├─ Add to Conversation History
    │
    ▼
API Gateway (/api/llm/complete)
    │
    ├─ Authentication
    │
    ├─ Include Context (last 5 messages)
    │
    ▼
LLM Service
    │
    ├─ Format with Context
    │
    ├─ Call LLM API
    │
    ▼
AI Response
    │
    ├─ Store in History
    │
    ▼
Display to User
```

## Technology Stack

### Frontend (Web UI)
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Code Editor**: Monaco Editor
- **Markdown**: react-markdown + remark-gfm
- **Icons**: Lucide React

### Backend (API)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Security**: Helmet, CORS
- **Rate Limiting**: rate-limiter-flexible

### CLI
- **Framework**: Commander.js
- **Prompts**: Inquirer
- **Styling**: Chalk, Boxen, Ora
- **Config**: Conf

### LLM Integration
- **OpenAI**: GPT-4, GPT-4-Turbo, GPT-3.5-Turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)

### Web Scraping
- **Static**: Axios + Cheerio
- **Dynamic**: Puppeteer

### Build Tools
- **Monorepo**: Turbo
- **TypeScript**: tsc
- **Package Manager**: npm workspaces

## Security Features

1. **API Key Authentication**
   - Every request requires valid API key
   - Keys stored with usage tracking
   - Revocation support

2. **Rate Limiting**
   - Prevents abuse
   - Per-key limits

3. **Input Validation**
   - express-validator
   - Type checking

4. **CORS Protection**
   - Whitelist origins
   - Credentials support

5. **Security Headers**
   - Helmet.js
   - XSS protection
   - Content Security Policy

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- API keys in shared storage (Redis ready)
- Session-less authentication

### Vertical Scaling
- Async/await patterns
- Non-blocking I/O
- Stream processing for large files

### Caching
- LLM response caching (ready to implement)
- Crawler results caching
- Static asset caching (Next.js)

## Monitoring & Observability

### Logging
- Request logging
- Error logging
- Usage tracking

### Metrics (Ready to Add)
- API latency
- LLM token usage
- Crawler success rate
- Error rates

### Health Checks
- `/health` endpoint
- Service status monitoring

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│            Load Balancer                │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────┐
│  API 1  │      │  API 2  │  (Horizontal Scaling)
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              │
              ▼
     ┌────────────────┐
     │  Shared Cache  │
     │    (Redis)     │
     └────────────────┘
              │
              ▼
     ┌────────────────┐
     │   Database     │
     │  (PostgreSQL)  │
     └────────────────┘
```

## Future Enhancements

1. **Database Layer**
   - User management
   - Persistent API keys
   - Conversation history
   - Project storage

2. **Real-time Features**
   - WebSocket support
   - Live collaboration
   - Streaming responses

3. **Advanced AI**
   - Multi-modal support (vision + text)
   - Fine-tuned models
   - Custom training

4. **DevOps**
   - Docker containers
   - Kubernetes orchestration
   - CI/CD pipelines
   - Automated testing

5. **Analytics**
   - Usage dashboards
   - Performance metrics
   - User insights
