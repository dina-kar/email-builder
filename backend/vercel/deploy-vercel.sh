#!/bin/bash

# Vercel Deployment Quick Start Script
# This script helps set up and deploy your NestJS app to Vercel

set -e

echo "==================================="
echo "NestJS Vercel Deployment Setup"
echo "==================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "❌ Vercel CLI is not installed."
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "✅ Vercel CLI is installed"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo ""
    echo "❌ Error: package.json not found"
    echo "Please run this script from the backend directory"
    exit 1
fi

echo ""
echo "📦 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "What would you like to do?"
echo "1) Deploy to preview (staging)"
echo "2) Deploy to production"
echo "3) Just link/setup (no deployment)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "Deploying to preview..."
        vercel
        ;;
    2)
        echo "Deploying to production..."
        vercel --prod
        ;;
    3)
        echo "Linking project..."
        vercel link
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "==================================="
echo "✅ Deployment setup complete!"
echo "==================================="
echo ""
echo "📝 Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Verify your database connection"
echo "3. Test the API endpoints"
echo ""
echo "📚 For more information, see VERCEL_DEPLOYMENT.md"
