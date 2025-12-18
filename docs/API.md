# API Documentation

## Overview

The AI Development Platform API provides a comprehensive REST API for interacting with multiple LLM providers, web crawling, and application settings management.

## Base URL

```
http://localhost:3001
```

## Authentication

All endpoints (except `/health` and `/api/auth/*`) require an API key.

Include your API key in the request header:

```
x-api-key: your-api-key-here
```

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

#### Register API Key

**POST** `/api/auth/register`

Generate a new API key.

**Request Body:**
```json
{
  "name": "My Application"
}
```

**Response:**
```json
{
  "apiKey": "sk-abc123...",
  "message": "API key generated successfully"
}
```

#### List API Keys

**GET** `/api/auth/keys`

**Response:**
```json
{
  "keys": [
    {
      "id": "uuid",
      "key": "sk-abc123...",
      "name": "My Application",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "usageCount": 42
    }
  ]
}
```

### LLM Operations

#### Get Providers

**GET** `/api/llm/providers`

**Response:**
```json
{
  "providers": [
    {
      "name": "openai",
      "models": ["gpt-4", "gpt-4-turbo-preview", "gpt-3.5-turbo"]
    }
  ]
}
```

#### Complete Text

**POST** `/api/llm/complete`

**Request Body:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "prompt": "Explain async/await",
  "maxTokens": 2000,
  "temperature": 0.7,
  "context": ["previous message 1", "previous message 2"]
}
```

**Response:**
```json
{
  "completion": "Async/await is a syntactic feature..."
}
```

#### Complete Code

**POST** `/api/llm/code/complete`

**Request Body:**
```json
{
  "code": "function add(a, b) {",
  "language": "javascript"
}
```

**Response:**
```json
{
  "completion": "  return a + b;\n}"
}
```

#### Generate Code

**POST** `/api/llm/code/generate`

**Request Body:**
```json
{
  "description": "a function to reverse a string",
  "language": "typescript"
}
```

**Response:**
```json
{
  "code": "function reverseString(str: string): string {\n  return str.split('').reverse().join('');\n}"
}
```

### Web Crawler

#### Crawl Single URL

**POST** `/api/crawler/crawl`

**Request Body:**
```json
{
  "url": "https://example.com",
  "javascript": false
}
```

**Response:**
```json
{
  "result": {
    "url": "https://example.com",
    "title": "Example Domain",
    "content": "This domain is for use in illustrative examples...",
    "links": ["https://www.iana.org/domains/example"],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

Common status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing API key)
- `403` - Forbidden (invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

## Examples

### Using cURL

```bash
# Get API key
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key"}'

# Use API key
curl -X POST http://localhost:3001/api/llm/complete \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-key-here" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "prompt": "Hello, AI!"
  }'
```
