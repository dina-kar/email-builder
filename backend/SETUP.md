# Email Builder Backend

A NestJS backend application for managing email templates with PostgreSQL database and S3 storage (LocalStack for development).

## Features

- 🚀 **NestJS Framework** - Modern, scalable backend architecture
- 🗄️ **PostgreSQL Database** - Reliable data persistence
- 📦 **S3 Storage (LocalStack)** - Asset storage for images and files
- 🔄 **TypeORM** - Database ORM with migrations support
- ✅ **Validation** - Request validation with class-validator
- 🔐 **CORS Enabled** - Cross-origin resource sharing configured
- 🐳 **Docker Support** - Easy setup with Docker Compose

## Architecture

### Database Schema

The `templates` table stores email template data:

```typescript
{
  id: UUID (Primary Key)
  name: string
  description: string (optional)
  html: text
  css: text
  components: JSONB
  styles: JSONB
  assets: string[] (S3 keys)
  thumbnail: string (S3 key)
  status: string (draft/published)
  metadata: JSONB
  createdAt: timestamp
  updatedAt: timestamp
}
```

### API Endpoints

#### Templates

- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create new template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template (also deletes associated assets)

#### Asset Upload

- `POST /api/templates/upload/asset` - Upload asset file (multipart/form-data)
- `POST /api/templates/upload/thumbnail` - Upload thumbnail (multipart/form-data)
- `POST /api/templates/upload/base64-image` - Upload base64 encoded image (JSON)

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Docker and Docker Compose

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Configure Environment

Copy the example environment file and update if needed:

```bash
cp .env.example .env
```

Default configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=email_builder

# AWS S3 (LocalStack)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_S3_BUCKET=email-templates-assets
AWS_ENDPOINT=http://localhost:4566
AWS_S3_FORCE_PATH_STYLE=true

# Application
PORT=3000
NODE_ENV=development
```

### 3. Start Docker Services

Start PostgreSQL and LocalStack (S3):

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **LocalStack S3** on port 4566

Verify services are running:

```bash
docker-compose ps
```

### 4. Initialize LocalStack S3

The S3 bucket is automatically created when LocalStack starts via the `init-localstack.sh` script.

To manually verify or recreate:

```bash
# Install AWS CLI Local (if not installed)
pip install awscli-local

# Check if bucket exists
awslocal s3 ls

# Create bucket if needed
awslocal s3 mb s3://email-templates-assets
```

### 5. Start the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

The API will be available at: `http://localhost:3000/api`

## Development

### Database Management

The application uses TypeORM with `synchronize: true` in development, which automatically syncs the schema. For production, you should:

1. Set `synchronize: false`
2. Use migrations:

```bash
# Generate migration
pnpm run typeorm migration:generate -n MigrationName

# Run migrations
pnpm run typeorm migration:run

# Revert migration
pnpm run typeorm migration:revert
```

### S3 Asset Management

#### Upload Asset (multipart)

```bash
curl -X POST http://localhost:3000/api/templates/upload/asset \
  -F "file=@/path/to/image.png"
```

Response:
```json
{
  "key": "assets/uuid.png",
  "url": "http://localhost:4566/email-templates-assets/assets/uuid.png"
}
```

#### Upload Base64 Image

```bash
curl -X POST http://localhost:3000/api/templates/upload/base64-image \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/png;base64,iVBORw0KG..."}'
```

### Create Template

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Email",
    "description": "Welcome email for new users",
    "html": "<div>Welcome!</div>",
    "css": "div { color: blue; }",
    "components": {},
    "styles": {},
    "assets": ["assets/uuid.png"],
    "status": "draft"
  }'
```

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Remove volumes (clean slate)
docker-compose down -v
```

## Troubleshooting

### PostgreSQL Connection Issues

1. Verify PostgreSQL is running:
```bash
docker-compose ps postgres
```

2. Check logs:
```bash
docker-compose logs postgres
```

3. Test connection:
```bash
docker exec -it email-builder-postgres psql -U postgres -d email_builder
```

### LocalStack S3 Issues

1. Verify LocalStack is running:
```bash
docker-compose ps localstack
```

2. Check S3 bucket:
```bash
awslocal s3 ls s3://email-templates-assets
```

3. View LocalStack logs:
```bash
docker-compose logs localstack
```

### Port Already in Use

If ports 3000, 4566, or 5432 are already in use, update the ports in:
- `.env` file (PORT)
- `docker-compose.yml` (PostgreSQL and LocalStack ports)

## Project Structure

```
backend/
├── src/
│   ├── templates/           # Templates module
│   │   ├── dto/            # Data transfer objects
│   │   ├── entities/       # TypeORM entities
│   │   ├── templates.controller.ts
│   │   ├── templates.service.ts
│   │   └── templates.module.ts
│   ├── s3/                 # S3 service module
│   │   ├── s3.service.ts
│   │   └── s3.module.ts
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── docker-compose.yml      # Docker services configuration
├── init-localstack.sh      # LocalStack initialization script
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## Production Deployment

For production deployment:

1. Update `.env` with production credentials
2. Set `synchronize: false` in TypeORM config
3. Use proper AWS S3 instead of LocalStack
4. Enable SSL/TLS
5. Set up proper logging
6. Configure database migrations
7. Use environment-specific configuration

## License

MIT
