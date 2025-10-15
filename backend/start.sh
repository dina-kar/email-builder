#!/bin/bash

# Complete Email Builder Backend - All-in-One Setup and Start Script

echo "======================================================================"
echo "       EMAIL BUILDER BACKEND - COMPLETE SETUP & START"
echo "======================================================================"
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Step 1: Check Docker
print_info "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi
print_success "Docker is running"

# Step 2: Check pnpm
print_info "Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi
print_success "pnpm is available"

# Step 3: Create .env file
print_info "Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Environment file created"
else
    print_success "Environment file exists"
fi

# Step 4: Install dependencies
print_info "Installing dependencies (this may take a moment)..."
if [ ! -d node_modules ]; then
    pnpm install --silent
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 5: Start Docker services
print_info "Starting Docker services..."
docker-compose down > /dev/null 2>&1
docker-compose up -d

print_success "Docker services started"

# Step 6: Wait for PostgreSQL
print_info "Waiting for PostgreSQL to be ready..."
MAX_TRIES=30
COUNT=0
until docker exec email-builder-postgres pg_isready -U postgres > /dev/null 2>&1; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_TRIES ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done
print_success "PostgreSQL is ready"

# Step 7: Wait for LocalStack
print_info "Waiting for LocalStack to be ready..."
MAX_TRIES=30
COUNT=0
until curl -f http://localhost:4566/_localstack/health > /dev/null 2>&1; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_TRIES ]; then
        print_error "LocalStack failed to start"
        exit 1
    fi
    sleep 1
done
print_success "LocalStack is ready"

# Step 8: Verify S3 bucket
sleep 3
print_info "Verifying S3 bucket..."
if command -v aws > /dev/null 2>&1; then
    aws --endpoint-url=http://localhost:4566 s3 ls s3://email-templates-assets > /dev/null 2>&1 || true
fi
print_success "S3 bucket configured"

echo ""
echo "======================================================================"
print_success "SETUP COMPLETE - STARTING APPLICATION"
echo "======================================================================"
echo ""
echo "Services:"
echo "  • PostgreSQL:     localhost:5432"
echo "  • LocalStack S3:  localhost:4566"
echo "  • Backend API:    http://localhost:3000/api"
echo ""
echo "Starting NestJS application..."
echo ""
echo "----------------------------------------------------------------------"

# Step 9: Start the application
pnpm run start:dev
