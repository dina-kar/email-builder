# NestJS Serverless Deployment Guide

This guide explains how to deploy your NestJS backend to Vercel as a serverless application.

## Overview

The application has been configured to run as a serverless function on Vercel with the following features:

- ✅ Serverless handler with cold start optimization
- ✅ Request caching for improved performance
- ✅ Full NestJS middleware and pipe support
- ✅ Automatic CORS handling
- ✅ Global error handling
- ✅ TypeORM database integration

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```
3. **Environment Variables**: Set up your environment variables in Vercel dashboard

## Environment Variables Required

Set these variables in your Vercel project settings:

```env
# Database Configuration (Neon, Supabase, or your PostgreSQL provider)
DB_HOST=your-database-host.neon.tech
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database-name

# AWS S3 Configuration (for Supabase or AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_ENDPOINT=https://your-s3-endpoint.com/storage/v1/s3
AWS_S3_FORCE_PATH_STYLE=true

# Application Configuration
NODE_ENV=production
```

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Connect your repository**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - Select the project

2. **Configure Build Settings**:
   - Framework: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `backend` (if using monorepo)

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all the variables from the section above

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically redeploy on push to main branch

### Method 2: CLI Deployment

```bash
# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# For initial setup with all configurations:
vercel --prod --confirm
```

### Method 3: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Push to GitHub (if using GitHub integration)

3. Vercel will automatically detect and deploy

## Project Structure

```
backend/
├── api/
│   └── index.ts              # Serverless handler (entry point)
├── src/
│   ├── app.module.ts         # Main module with TypeORM config
│   ├── main.ts               # Traditional server bootstrap
│   ├── templates/            # Your modules
│   ├── s3/                   # S3 service
│   └── filters/              # Exception filters
├── dist/                     # Compiled output
├── vercel.json              # Vercel configuration
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
└── README.md
```

## How It Works

### Serverless Handler (`api/index.ts`)

The handler implements a caching pattern to optimize cold starts:

```typescript
let cachedServer: ExpressApp;

async function bootstrapServer() {
  // Initialize NestJS app once
  const app = await NestFactory.create(AppModule);
  // ... configuration ...
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req, res, next) {
  // Reuse cached instance on warm starts
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(req, res, next);
}
```

This approach:
- Creates the NestJS instance only on first cold start
- Reuses the instance for subsequent requests
- Significantly reduces initialization time

## Performance Optimization

### Cold Start Time
- **First request**: ~3-5 seconds (TypeORM initialization + module loading)
- **Subsequent requests**: ~50-100ms

### Memory Configuration

Adjust in `vercel.json`:

```json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,        // MB (512-3008)
      "maxDuration": 60      // seconds (5-900)
    }
  }
}
```

### Database Connection Pooling

For serverless, enable connection pooling in your database provider:

**Neon**:
```env
DB_HOST=your-db.neon.tech
```

**Supabase**:
```env
DB_HOST=your-project.supabase.co
```

## Database Setup

### Option 1: Neon (Recommended for Vercel)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy the connection string:
   ```env
   DB_HOST=your-project.neon.tech
   DB_PORT=5432
   DB_USERNAME=user
   DB_PASSWORD=password
   DB_DATABASE=neondb
   ```

### Option 2: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Project Settings → Database
3. Set environment variables

### Option 3: AWS RDS

1. Create RDS instance
2. Configure security group to allow Vercel IPs
3. Set environment variables

## Monitoring & Debugging

### View Logs
```bash
# Using Vercel CLI
vercel logs <deployment-url>

# Real-time logs
vercel logs <deployment-url> --follow
```

### Enable Debug Logging

Update `api/index.ts` logger level:

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

## Common Issues

### 1. **Database Connection Timeout**

**Problem**: `Error: connect ENOTFOUND`

**Solution**:
- Verify DB credentials in environment variables
- Check database security group allows Vercel IPs
- Enable connection pooling in database provider

### 2. **Cold Start Timeout**

**Problem**: `504 Gateway Timeout`

**Solution**:
- Increase function timeout in `vercel.json`
- Optimize module imports (lazy loading)
- Use database connection pooling

### 3. **Module Not Found**

**Problem**: `Cannot find module`

**Solution**:
- Verify `tsconfig.json` paths are correct
- Ensure all imports use relative paths
- Check `baseUrl` in `tsconfig.json`

### 4. **CORS Errors**

The handler includes CORS configuration, but you can also:

```typescript
app.enableCors({
  origin: ['https://yourdomain.com'],
  credentials: true,
});
```

## Local Development

Continue developing locally with:

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build

# Test serverless handler locally (requires Node 18+)
npm run start:serverless
```

## Continuous Deployment

### Automatic Deployments

Every push to `main` branch triggers automatic deployment (if GitHub integration is enabled).

### Manual Redeploy

```bash
# Via CLI
vercel --prod --force

# Via GitHub
git push origin main
```

## Security Best Practices

1. **Never commit `.env` file** - Use Vercel's environment variable dashboard
2. **Use environment-specific configs** - Different values for dev/staging/prod
3. **Restrict database access** - Only allow Vercel IPs
4. **Rotate credentials regularly** - S3 keys, database passwords
5. **Use secret management** - Store sensitive data in Vercel KV or similar

## Testing

Run tests before deployment:

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm test:cov
```

## Scaling & Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Function Timeout | 60s | Free tier; up to 900s on Pro |
| Memory | 3GB max | Start with 1GB and monitor |
| Concurrent Executions | Auto-scaled | Vercel handles scaling |
| Request Size | 6MB | Total payload limit |

## Next Steps

1. ✅ Set up environment variables in Vercel
2. ✅ Connect your Git repository
3. ✅ Deploy and test
4. ✅ Monitor logs and performance
5. ✅ Set up custom domain
6. ✅ Configure CI/CD rules

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Serverless Framework Guide](https://www.serverless.com/framework/docs)
- [TypeORM Configuration](https://typeorm.io/data-source-options)

## Support

For issues or questions:

1. Check [Vercel Status](https://vercel.statuspage.io)
2. Review [Vercel Docs](https://vercel.com/docs)
3. Check application logs: `vercel logs <url>`
4. Verify environment variables are set correctly
