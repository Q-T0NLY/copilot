# AI Development Platform - Quick Start Deployment Guide

This guide covers deploying the AI Development Platform with enterprise features.

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for containerized deployment)
- Kubernetes cluster (for production deployment)
- PostgreSQL 15+ (or use Docker)
- MongoDB 7+ (optional, or use Docker)

## Installation

### 1. Install Dependencies

```bash
# Root level
npm install

# Install all workspace dependencies
npm run build
```

### 2. Environment Configuration

Create `.env` files in each package:

**packages/api/.env:**
```env
# Server
NODE_ENV=development
PORT=3001

# API Keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=aidevplatform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# MongoDB (Optional)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=aidevplatform

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Database Setup (Local Development)

**Option A: Using Docker**

```bash
# Start databases with Docker Compose
cd docker
docker-compose up -d postgres mongodb redis

# Verify databases are running
docker-compose ps
```

**Option B: Manual Setup**

```bash
# PostgreSQL
createdb aidevplatform
psql aidevplatform < schema.sql

# MongoDB
mongosh
> use aidevplatform
```

### 4. Start Development Servers

```bash
# Start all services concurrently
npm run dev

# Or start individually:
npm run api    # API Gateway on port 3001
npm run ui     # Web UI on port 3000
npm run cli    # CLI commands
```

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Set environment variables
export OPENAI_API_KEY=your_key
export ANTHROPIC_API_KEY=your_key

# Build and start all services
cd docker
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f ui

# Stop services
docker-compose down
```

### Services Running

- **API Gateway**: http://localhost:3001
- **Web UI**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Kubernetes Deployment

### 1. Create Secrets

```bash
# Create namespace
kubectl create namespace aidev-platform

# AI API keys
kubectl create secret generic ai-keys \
  --from-literal=openai-key=$OPENAI_API_KEY \
  --from-literal=anthropic-key=$ANTHROPIC_API_KEY \
  -n aidev-platform

# Database credentials
kubectl create secret generic postgres-secret \
  --from-literal=database=aidevplatform \
  --from-literal=username=postgres \
  --from-literal=password=your-secure-password \
  -n aidev-platform

kubectl create secret generic mongodb-secret \
  --from-literal=uri=mongodb://mongodb-service:27017 \
  -n aidev-platform
```

### 2. Deploy Services

```bash
# Deploy API and UI
kubectl apply -f kubernetes/deployments/api-deployment.yaml -n aidev-platform
kubectl apply -f kubernetes/deployments/ui-deployment.yaml -n aidev-platform

# Deploy autoscaling
kubectl apply -f kubernetes/deployments/autoscaling.yaml -n aidev-platform

# Check deployment status
kubectl get pods -n aidev-platform
kubectl get svc -n aidev-platform
kubectl get hpa -n aidev-platform
```

### 3. Access the Application

```bash
# Get external IP (for LoadBalancer type)
kubectl get svc aidev-ui-service -n aidev-platform

# Port forwarding (for local access)
kubectl port-forward svc/aidev-ui-service 3000:80 -n aidev-platform
kubectl port-forward svc/aidev-api-service 3001:3001 -n aidev-platform
```

## Verification

### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Performance metrics
curl http://localhost:3001/api/performance/metrics

# Auto-healing status
curl http://localhost:3001/api/healing/health
```

### Test Multi-Model Consensus

```bash
curl -X POST http://localhost:3001/api/consensus/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "prompt": "Explain machine learning in simple terms",
    "models": ["gpt-4", "claude-3-opus-20240229"],
    "maxTokens": 500
  }'
```

### Test Web UI

1. Open browser: http://localhost:3000
2. Test Cursor AI code editor with inline suggestions
3. Try chat interface
4. Check visual reasoning panel
5. Configure settings

### Test CLI

```bash
# Initialize configuration
npm run cli -- init

# Start chat session
npm run cli -- chat

# Generate code
npm run cli -- generate "Create a React component for a todo list"
```

## Monitoring

### Performance Dashboard

```bash
# Get current metrics
curl http://localhost:3001/api/performance/report | jq

# Check compliance
curl http://localhost:3001/api/performance/compliance | jq
```

### Kubernetes Monitoring

```bash
# Pod status
kubectl get pods -n aidev-platform -o wide

# Resource usage
kubectl top pods -n aidev-platform

# Autoscaling status
kubectl get hpa -n aidev-platform --watch

# Logs
kubectl logs -f deployment/aidev-api -n aidev-platform
kubectl logs -f deployment/aidev-ui -n aidev-platform
```

## Scaling

### Manual Scaling

```bash
# Kubernetes
kubectl scale deployment aidev-api --replicas=5 -n aidev-platform

# Docker Compose
docker-compose up -d --scale api=3
```

### Auto-Scaling (Kubernetes)

Auto-scaling is configured via HPA:
- API: 3-10 replicas based on CPU/memory
- UI: 2-5 replicas based on CPU/memory

Monitor with:
```bash
kubectl describe hpa aidev-api-hpa -n aidev-platform
```

## Troubleshooting

### Build Issues

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Database Connection Issues

```bash
# Check database connectivity (Docker)
docker-compose ps
docker-compose logs postgres
docker-compose logs mongodb

# Test connection
docker-compose exec api nc -zv postgres 5432
```

### Performance Issues

```bash
# Check performance violations
curl http://localhost:3001/api/performance/compliance

# View error statistics
curl http://localhost:3001/api/healing/errors/stats

# Check resource usage (Kubernetes)
kubectl top pods -n aidev-platform
```

### Pod Not Starting (Kubernetes)

```bash
# Describe pod
kubectl describe pod <pod-name> -n aidev-platform

# View events
kubectl get events -n aidev-platform --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n aidev-platform --previous
```

## Production Checklist

- [ ] Set strong database passwords
- [ ] Configure proper API keys
- [ ] Enable HTTPS/TLS
- [ ] Set up backup strategy
- [ ] Configure monitoring/alerting
- [ ] Set resource limits
- [ ] Enable auto-scaling
- [ ] Configure log aggregation
- [ ] Set up CI/CD pipeline
- [ ] Enable security scanning
- [ ] Configure firewall rules
- [ ] Set up disaster recovery

## Next Steps

- See [ENTERPRISE_ARCHITECTURE.md](./ENTERPRISE_ARCHITECTURE.md) for detailed architecture
- See [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) for feature documentation
- See [API.md](./API.md) for API reference
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

## Support

For issues or questions:
1. Check documentation in `/docs`
2. Review error logs
3. Check performance metrics
4. Review auto-healing status
