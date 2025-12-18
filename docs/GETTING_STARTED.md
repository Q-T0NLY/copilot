# Getting Started Guide

## Introduction

Welcome to the AI Development Platform! This guide will help you get started with all the features of this world-class development tool.

## Installation

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** version 18.0.0 or higher
- **npm** version 9.0.0 or higher

Check your versions:
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Q-T0NLY/copilot.git
cd copilot

# Install all dependencies
npm install
```

This will install dependencies for all packages in the monorepo.

## Quick Start

### Option 1: Run Everything

Start all services at once:

```bash
npm run dev
```

This starts:
- **API Gateway** on http://localhost:3001
- **Web UI** on http://localhost:3000

### Option 2: Run Services Individually

Start services separately in different terminals:

```bash
# Terminal 1 - API Gateway
npm run api

# Terminal 2 - Web UI
npm run ui

# Terminal 3 - CLI
npm run cli
```

## Configuration

### API Gateway Setup

1. Navigate to the API package:
   ```bash
   cd packages/api
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your API keys:
   ```env
   PORT=3001
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000
   
   # Development API Key (change in production)
   DEV_API_KEY=dev-key-12345
   
   # Optional: Add your LLM provider keys
   OPENAI_API_KEY=sk-your-openai-key-here
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
   
   JWT_SECRET=your-random-secret-here
   ```

### Web UI Setup

The Web UI works out of the box! However, you can customize:

1. Create `.env.local` in `packages/ui`:
   ```bash
   cd packages/ui
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
   ```

### CLI Setup

The CLI will prompt you for configuration on first run:

```bash
npm run cli init
```

Follow the prompts to configure:
- API Gateway URL
- API Key
- Default LLM Provider
- Default Model

## Using the Platform

### Web UI

1. **Open your browser** to http://localhost:3000

2. **Configure Settings**
   - Click the Settings icon (⚙️) in the sidebar
   - Enter your API key (use `dev-key-12345` for development)
   - Select your preferred LLM provider and model
   - Click "Save Settings"

3. **Start Chatting**
   - Click the Chat icon (💬)
   - Type your message and press Enter
   - The AI will respond in real-time

4. **Code Editor**
   - Click the Code icon (</>) 
   - Select your programming language
   - Write code or click "Generate" to create code from a description
   - Use "Complete" to auto-complete your code
   - Download your code with the Download button

5. **Visual Reasoning**
   - Click the Brain icon (🧠)
   - Upload a screenshot or UI design
   - Click "Analyze & Generate Code"
   - Get AI-powered analysis and code suggestions

### CLI Commands

#### Initialize Configuration
```bash
npm run cli init
```

#### Interactive Chat
```bash
npm run cli chat
```

Type your messages and press Enter. Type `exit` or `quit` to end the session.

#### Generate Code
```bash
npm run cli generate "create a function that sorts an array" -l typescript -o sort.ts
```

Options:
- `-l, --language <language>`: Programming language (default: typescript)
- `-o, --output <file>`: Save to file

#### Complete Code
```bash
npm run cli complete src/myfile.ts -l typescript
```

#### Web Crawling
```bash
npm run cli crawl https://example.com -j -o results.json
```

Options:
- `-j, --javascript`: Enable JavaScript rendering
- `-o, --output <file>`: Save results to file

#### Manage Settings
```bash
# List all settings
npm run cli settings --list

# Set a setting
npm run cli settings --set apiUrl=http://localhost:3001

# Get a specific setting
npm run cli settings --get apiKey
```

### API Usage

#### Get an API Key

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key"}'
```

Response:
```json
{
  "apiKey": "sk-abc123...",
  "message": "API key generated successfully"
}
```

#### Use the API

```bash
curl -X POST http://localhost:3001/api/llm/complete \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "prompt": "Write a hello world in Python"
  }'
```

## Troubleshooting

### Port Already in Use

If you get an error about ports being in use:

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill the process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Dependencies Not Installing

Try cleaning and reinstalling:

```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### API Key Not Working

Make sure:
1. You've generated an API key using `/api/auth/register`
2. You're including it in the `x-api-key` header
3. The API Gateway is running on the correct port

### LLM Provider Errors

If you get errors from OpenAI or Anthropic:
1. Check that your API keys are correctly set in `.env`
2. Ensure your API keys are valid and have credits
3. Try using the development fallback: `DEV_API_KEY=dev-key-12345`

## Next Steps

- Read the [API Documentation](API.md) for detailed endpoint information
- Explore the example projects in the `examples/` directory (coming soon)
- Join our community for support and discussions
- Check out the roadmap for upcoming features

## Need Help?

- Check the [FAQ](FAQ.md)
- Open an issue on GitHub
- Read the full documentation

Happy coding! 🚀
