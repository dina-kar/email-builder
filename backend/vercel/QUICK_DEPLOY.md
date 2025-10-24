# Deployment Quick Reference

## One-Line Deploy

```bash
cd backend && npm run build && vercel --prod
```

## Step-by-Step Commands

### 1. First Time Setup
```bash
# Navigate to backend
cd backend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables in Vercel dashboard
# https://vercel.com/your-org/your-project/settings/environment-variables
```

### 2. Configure Environment Variables

Copy `.env.vercel.example` and add your values:

```bash
# Database
DB_HOST=your-host
DB_PORT=5432
DB_USERNAME=your-user
DB_PASSWORD=your-password
DB_DATABASE=email_builder

# Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_ENDPOINT=https://your-endpoint.com
AWS_S3_FORCE_PATH_STYLE=true

# App
NODE_ENV=production
```

Add these in Vercel: Project Settings → Environment Variables

### 3. Deploy to Preview (Staging)
```bash
npm run build
vercel
```

Test at the preview URL

### 4. Deploy to Production
```bash
npm run build
vercel --prod
```

## Git-Based Deployment (Recommended)

1. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "feat: serverless configuration"
   git push origin main
   ```

2. Vercel automatically deploys on push

3. Check deployment status at vercel.com dashboard

## Verify Deployment

```bash
# Check logs
vercel logs https://your-project.vercel.app

# Test API endpoint
curl https://your-project.vercel.app/api/templates

# Check health
curl https://your-project.vercel.app/api
```

## Rollback

```bash
# Go to Vercel dashboard
# Deployments tab → Select previous deployment → "Promote to Production"

# Or via CLI
vercel rollback
```

## View Logs

```bash
# Real-time logs
vercel logs https://your-deployment.vercel.app --follow

# Last 100 lines
vercel logs https://your-deployment.vercel.app

# Search logs
vercel logs https://your-deployment.vercel.app | grep "error"
```

## Troubleshooting

### Build Failed
```bash
# Test build locally
npm run build

# Check for errors
npm run lint

# Check dependencies
npm list
```

### Environment Variables Not Set
```bash
# Verify in Vercel dashboard:
# Settings → Environment Variables

# Verify variables are for "Production"
# Redeploy after adding variables:
vercel --prod --force
```

### Database Connection Error
```bash
# Check connection string
echo $DB_HOST
echo $DB_PORT
echo $DB_DATABASE

# Test connection locally with same credentials
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE
```

### 504 Gateway Timeout
```bash
# Increase timeout in vercel.json
# Increase memory in vercel.json
# Optimize cold start in api/index.ts
```

## Performance Check

```bash
# Measure cold start
time curl https://your-deployment.vercel.app/api

# Check function duration in logs
vercel logs https://your-deployment.vercel.app | grep "duration"
```

## Pre-Deployment Checklist

- [ ] `npm run build` succeeds locally
- [ ] `npm test` passes
- [ ] All environment variables added in Vercel
- [ ] Database is accessible from Vercel IPs
- [ ] S3 credentials are valid
- [ ] No secrets in code or package.json

## Documentation

- 📖 Full Guide: `VERCEL_DEPLOYMENT.md`
- ✅ Checklist: `DEPLOYMENT_CHECKLIST.md`
- ⚙️ Setup Info: `SETUP_SUMMARY.md`
- 🔧 Env Template: `.env.vercel.example`

## Emergency Contacts

- Vercel Status: https://vercel.statuspage.io
- Vercel Support: https://vercel.com/support
- Discord Community: https://discord.gg/vercel

---

**Quick Links:**
- 🚀 Vercel Dashboard: https://vercel.com/dashboard
- 📊 Project Settings: https://vercel.com/your-org/your-project/settings
- 🔑 Environment Variables: https://vercel.com/your-org/your-project/settings/environment-variables
- 📝 Deployments: https://vercel.com/your-org/your-project/deployments
