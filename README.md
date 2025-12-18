# AI Development Platform 🚀

A world-class, state-of-the-art AI-powered development platform combining the best features of Cursor AI, GitHub Copilot, Codex, Claude, and Warp into a unified experience.

## Features ✨

### 🤖 Advanced AI Capabilities
- **Multi-Provider LLM Integration**: Seamlessly switch between OpenAI (GPT-4, GPT-4 Turbo) and Anthropic (Claude 3)
- **Intelligent Code Completion**: Context-aware code suggestions and completions
- **Code Generation**: Generate complete functions, classes, and modules from natural language descriptions
- **Interactive Chat Interface**: Real-time conversations with AI assistants

### 💻 Development Tools
- **Web UI**: Beautiful, modern React-based interface with:
  - Interactive chat panel
  - Monaco-powered code editor with syntax highlighting
  - Visual reasoning panel for image-to-code generation
  - Comprehensive settings management
- **CLI**: Powerful command-line interface with:
  - Interactive terminal UI
  - Code generation and completion commands
  - Web crawling capabilities
  - Configuration management

### 🔒 Enterprise Features
- **API Gateway**: Secure REST API with authentication
- **API Key Management**: Generate, manage, and revoke API keys
- **Rate Limiting**: Built-in protection against abuse
- **Settings Persistence**: User preferences stored securely

### 🌐 Advanced Capabilities
- **Web Crawling & Scraping**: Extract content from websites (with JavaScript rendering support)
- **Auto-Healing**: Intelligent error recovery mechanisms
- **Auto-Evolution**: Self-improving system capabilities
- **Visual Reasoning**: Analyze screenshots and generate matching UI code

## Architecture 🏗️

This is a monorepo project using Turbo for build orchestration:

```
ai-dev-platform/
├── packages/
│   ├── api/          # API Gateway (Express.js + TypeScript)
│   ├── cli/          # Command-line Interface
│   ├── ui/           # Web Interface (Next.js + React)
│   └── shared/       # Shared utilities and types
├── package.json      # Root workspace configuration
└── turbo.json        # Turbo build configuration
```

## Quick Start 🏁

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- API keys for OpenAI and/or Anthropic (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Q-T0NLY/copilot.git
   cd copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   For API:
   ```bash
   cd packages/api
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually:
   npm run api    # API Gateway on port 3001
   npm run ui     # Web UI on port 3000
   npm run cli    # CLI interactive mode
   ```

## Usage Examples 📖

### Web UI

1. Open http://localhost:3000 in your browser
2. Navigate to Settings (⚙️ icon) and configure your API key
3. Use the Chat panel to interact with AI
4. Switch to Code Editor to write and generate code
5. Try Visual Reasoning to analyze UI screenshots

### CLI

```bash
# Initialize configuration
npm run cli init

# Start interactive chat
npm run cli chat

# Generate code
npm run cli generate "a React component for a todo list" -l typescript -o todo.tsx

# Complete code from file
npm run cli complete src/myfile.ts

# Crawl a website
npm run cli crawl https://example.com -j -o results.json

# Manage settings
npm run cli settings --list
npm run cli settings --set provider=anthropic
```

### API

```bash
# Health check
curl http://localhost:3001/health

# Generate API key
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key"}'

# Use LLM completion
curl -X POST http://localhost:3001/api/llm/complete \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "prompt": "Explain async/await in JavaScript"
  }'
```

## API Endpoints 📡

See [API Documentation](docs/API.md) for complete endpoint details.

## Configuration ⚙️

### Environment Variables

**API (.env)**
```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
DEV_API_KEY=dev-key-12345
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
JWT_SECRET=your-secret
```

**UI (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development 👨‍💻

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Clean
```bash
npm run clean
```

## Technologies Used 🛠️

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Monaco Editor
- **Backend**: Express.js, TypeScript, Node.js
- **CLI**: Commander.js, Inquirer, Chalk
- **AI/LLM**: OpenAI API, Anthropic API
- **Tooling**: Turbo, ESLint, Prettier
- **Web Scraping**: Puppeteer, Cheerio, Axios

## Security 🔐

- API key authentication for all endpoints
- Rate limiting to prevent abuse
- Helmet.js for security headers
- CORS configuration
- Input validation
- Environment variable protection

## Roadmap 🗺️

- [ ] Add more LLM providers (Cohere, Hugging Face)
- [ ] Implement auto-healing with error detection and recovery
- [ ] Add auto-evolution with self-improvement capabilities
- [ ] Enhance visual reasoning with vision models
- [ ] Add collaborative features (real-time multi-user editing)
- [ ] Implement project scaffolding and templates
- [ ] Add database support for persistent storage
- [ ] Create VS Code extension
- [ ] Add testing framework integration
- [ ] Implement CI/CD pipeline generation

## Contributing 🤝

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License 📄

MIT License - see LICENSE file for details

## Support 💬

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ by the AI Dev Platform team