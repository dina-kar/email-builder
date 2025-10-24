# Vercel Deployment Checklist

Use this checklist to ensure your NestJS application is properly configured and deployed to Vercel.

## Pre-Deployment Setup

### Local Environment
- [ ] Clone the repository
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env` (for local testing)
- [ ] Database is running locally (Docker or direct connection)
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Application starts: `npm start:dev`

### Git Repository
- [ ] All changes are committed
- [ ] Code is pushed to your main branch
- [ ] No uncommitted changes in working directory
- [ ] `.env` file is in `.gitignore` ✅

## Vercel Account Setup

### Account & Project
- [ ] Vercel account created at [vercel.com](https://vercel.com)
- [ ] Email verified
- [ ] GitHub/GitLab account connected
- [ ] Vercel CLI installed (optional): `npm install -g vercel`

### Project Configuration
- [ ] Project imported on Vercel
- [ ] Git repository connected
- [ ] Correct branch selected (usually `main`)
- [ ] Root directory set to `backend` (if using monorepo)

## Environment Variables

### Database Configuration
- [ ] Database provider selected (Neon, Supabase, or AWS RDS)
- [ ] Database credentials obtained:
  - [ ] `DB_HOST`
  - [ ] `DB_PORT`
  - [ ] `DB_USERNAME`
  - [ ] `DB_PASSWORD`
  - [ ] `DB_DATABASE`
- [ ] Database allows connections from Vercel IPs
- [ ] Connection pooling enabled (for serverless)

### Storage Configuration
- [ ] AWS S3 credentials obtained:
  - [ ] `AWS_REGION`
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_S3_BUCKET`
  - [ ] `AWS_ENDPOINT` (if using S3-compatible service)
  - [ ] `AWS_S3_FORCE_PATH_STYLE`

### Application Configuration
- [ ] `NODE_ENV=production`
- [ ] `PORT` not explicitly needed (Vercel sets it)
- [ ] Any other required environment variables

### Vercel Dashboard Steps
- [ ] Go to Project Settings → Environment Variables
- [ ] Add all variables from `.env.vercel.example`
- [ ] Set environment to "Production"
- [ ] Confirm all variables are saved

## Build & Deployment Configuration

### Build Settings
- [ ] Framework: Select `Other` or leave blank
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install` (or `pnpm install`)
- [ ] Node.js Version: 18.x or later

### Vercel Configuration
- [ ] `vercel.json` is present in backend directory
- [ ] Configuration includes:
  - [ ] `version: 2`
  - [ ] `buildCommand` specified
  - [ ] `outputDirectory` set to `dist`
  - [ ] Rewrites configured for API routes
  - [ ] Function memory set appropriately
  - [ ] Max duration set to 60+ seconds

## Application Files

### Serverless Handler
- [ ] `api/index.ts` exists
- [ ] Exports default async handler
- [ ] Handler accepts (req, res, next)
- [ ] Cold start optimization implemented
- [ ] Error handling included

### TypeScript Configuration
- [ ] `tsconfig.json` includes all source files
- [ ] `tsconfig.build.json` configured properly
- [ ] All paths are relative

### Package.json
- [ ] `npm run build` command works
- [ ] No hardcoded absolute paths
- [ ] All required dependencies listed
- [ ] dev Dependencies don't include server packages

### Source Code
- [ ] No environment variable hardcoding
- [ ] Uses `configService` from `@nestjs/config`
- [ ] Database URL is configurable
- [ ] S3 endpoint is configurable
- [ ] CORS configured in serverless handler

## Testing & Validation

### Local Build Test
- [ ] Run `npm run build` successfully
- [ ] `dist/` directory is created
- [ ] No TypeScript errors
- [ ] No missing dependencies warnings

### Functionality Test (Local)
```bash
npm run build
npm start:prod  # or test locally if possible
```
- [ ] Application starts
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] Health check endpoint works

### Pre-Deployment Review
- [ ] Code review completed
- [ ] All tests pass: `npm test`
- [ ] No console errors or warnings
- [ ] No security vulnerabilities: `npm audit`

## Deployment

### Initial Deployment
- [ ] Trigger deployment via Git push or Vercel dashboard
- [ ] Monitor build progress in Vercel dashboard
- [ ] Build completes without errors
- [ ] Deployment status shows "Ready"

### Post-Deployment Verification
- [ ] Visit deployment URL
- [ ] API health check endpoint responds
- [ ] Get endpoints return data
- [ ] POST endpoints accept requests
- [ ] Error handling works (test 404, 500)

### Database Verification
- [ ] Tables exist in database
- [ ] Migrations ran successfully
- [ ] Data can be read from API
- [ ] Data can be written via API

### Storage Verification
- [ ] S3 bucket is accessible
- [ ] Upload endpoint works
- [ ] Files are stored in S3
- [ ] Files can be retrieved

## Monitoring & Maintenance

### Logging & Monitoring
- [ ] Vercel logs are accessible: `vercel logs <url>`
- [ ] No error spam in logs
- [ ] Performance metrics look good
- [ ] Cold start time is acceptable (~3-5s)

### Domain Setup (Optional)
- [ ] Custom domain configured (if needed)
- [ ] DNS records updated
- [ ] SSL certificate provisioned
- [ ] HTTPS working

### Production Safety
- [ ] Database backups enabled
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Uptime monitoring configured
- [ ] Rate limiting configured (if needed)

## Continuous Deployment

### Git Integration
- [ ] Auto-deployment on push enabled
- [ ] Main branch deployments working
- [ ] Preview deployments for PRs working
- [ ] CI/CD checks passing

### Updates & Patches
- [ ] Dependency updates reviewed regularly
- [ ] Security patches applied promptly
- [ ] New deployments tested before production

## Troubleshooting Checklist

If deployment fails:

1. [ ] Check build logs in Vercel dashboard
2. [ ] Verify environment variables are set
3. [ ] Check `npm run build` locally succeeds
4. [ ] Verify database connection works
5. [ ] Check `vercel logs <url>` for runtime errors
6. [ ] Review TypeScript compilation errors
7. [ ] Check Node.js version compatibility
8. [ ] Verify all imports use correct paths

## Documentation

- [ ] `VERCEL_DEPLOYMENT.md` read and understood
- [ ] Team members trained on deployment process
- [ ] Deployment steps documented in team wiki
- [ ] Emergency rollback procedure documented

## Final Sign-Off

- [ ] Project lead approval: _______________
- [ ] DevOps team approval: _______________
- [ ] QA verification: _______________
- [ ] Deployment date: _______________

---

**Note**: Keep this checklist for future deployments and reference. Update as needed based on your specific requirements.
