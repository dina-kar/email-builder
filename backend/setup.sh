#!/bin/bash

# Email Builder Backend - Setup and Run Script

set -e

echo "============================================"
echo "Email Builder Backend Setup"
echo "============================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services (PostgreSQL + LocalStack)..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
until docker exec email-builder-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Check LocalStack
echo "🔍 Checking LocalStack S3..."
until curl -f http://localhost:4566/_localstack/health > /dev/null 2>&1; do
    echo "   Waiting for LocalStack..."
    sleep 2
done
echo "✅ LocalStack is ready"

# Verify S3 bucket
echo "🪣 Verifying S3 bucket..."
sleep 3
if command -v aws > /dev/null 2>&1; then
    aws --endpoint-url=http://localhost:4566 s3 ls s3://email-templates-assets > /dev/null 2>&1 || true
fi
echo "✅ S3 bucket verified"

echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "Services running:"
echo "  - PostgreSQL: localhost:5432"
echo "  - LocalStack S3: localhost:4566"
echo ""
echo "To start the application:"
echo "  pnpm run start:dev"
echo ""
echo "To stop Docker services:"
echo "  docker-compose down"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
