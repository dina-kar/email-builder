# Quick Start Guide - Email Builder Backend

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v18+ installed
- ✅ pnpm installed (`npm install -g pnpm`)
- ✅ Docker Desktop running

## 5-Minute Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Run Setup Script

**On Windows:**
```bash
./setup.bat
```

**On Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
1. Check Docker is running
2. Create `.env` file
3. Install dependencies
4. Start PostgreSQL and LocalStack
5. Verify all services are ready

### Step 3: Start the Application
```bash
pnpm run start:dev
```

That's it! The API is now running at: **http://localhost:3000/api**

## Quick Test

Test the API is working:

```bash
# Get all templates (should return empty array initially)
curl http://localhost:3000/api/templates
```

## Manual Setup (Alternative)

If you prefer manual setup:

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Start Docker Services
```bash
docker-compose up -d
```

### 4. Wait for Services (30 seconds)
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Start Application
```bash
pnpm run start:dev
```

## Verify Setup

### Check PostgreSQL
```bash
docker exec -it email-builder-postgres psql -U postgres -d email_builder -c "\dt"
```

Expected output: Should show `templates` table

### Check LocalStack S3
```bash
# Install awscli-local if needed: pip install awscli-local
awslocal s3 ls s3://email-templates-assets
```

Expected output: Empty (bucket exists)

### Check API
```bash
curl http://localhost:3000/api/templates
```

Expected output: `[]`

## Create Your First Template

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Template",
    "html": "<h1>Hello World</h1>",
    "css": "h1 { color: blue; }",
    "status": "draft"
  }'
```

## Upload Your First Asset

```bash
curl -X POST http://localhost:3000/api/templates/upload/asset \
  -F "file=@/path/to/your/image.png"
```

## Common Issues

### Port 3000 already in use
```bash
# Change port in .env
PORT=3001
```

### Docker services not starting
```bash
# Clean restart
docker-compose down -v
docker-compose up -d
```

### Can't connect to database
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

## Next Steps

1. ✅ Read [SETUP.md](./SETUP.md) for detailed documentation
2. ✅ Read [API.md](./API.md) for API documentation
3. ✅ Integrate with frontend (see examples in API.md)
4. ✅ Configure production environment

## Stop Services

```bash
# Stop application (Ctrl+C)

# Stop Docker services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Development Commands

```bash
# Start with hot reload
pnpm run start:dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# View Docker logs
docker-compose logs -f

# Access PostgreSQL
docker exec -it email-builder-postgres psql -U postgres -d email_builder
```

## Environment Variables

Key variables in `.env`:

```env
PORT=3000                                    # API port
DB_HOST=localhost                           # Database host
DB_PORT=5432                                # Database port
AWS_ENDPOINT=http://localhost:4566          # LocalStack endpoint
AWS_S3_BUCKET=email-templates-assets        # S3 bucket name
```

## Support

Having issues? Check:
1. Docker is running
2. Ports 3000, 4566, 5432 are available
3. `.env` file exists
4. Dependencies are installed

Still stuck? See [SETUP.md](./SETUP.md) troubleshooting section.
