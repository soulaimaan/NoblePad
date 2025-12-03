#!/bin/bash
# NoblePad Development Setup Script
# Complete setup for local development

set -e

echo "🛠️ Setting up NoblePad for local development..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "✅ Node.js version $NODE_VERSION is compatible"
else
    echo "❌ Node.js version $NODE_VERSION is not compatible. Please install Node.js 18 or higher."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual values:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
fi

# Install Supabase CLI
echo "🔧 Installing Supabase CLI..."
npm install -g supabase

# Start Supabase local development
echo "🚀 Starting local Supabase instance..."
supabase start

# Wait for Supabase to start
echo "⏳ Waiting for Supabase to be ready..."
sleep 10

# Run migrations
echo "🗄️ Running database migrations..."
supabase db reset

# Start the development server
echo "🌟 Starting Next.js development server..."
echo ""
echo "✅ Setup completed! Your NoblePad application is ready."
echo ""
echo "📋 Available commands:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npm run lint         - Run linting"
echo "   supabase status      - Check Supabase services"
echo "   supabase stop        - Stop local Supabase"
echo ""
echo "🔗 Application: http://localhost:3000"
echo "🔗 Supabase Studio: http://localhost:54323"
echo ""

# Ask if user wants to start dev server
read -p "Start development server now? (y/N): " START_DEV
if [[ $START_DEV =~ ^[Yy]$ ]]; then
    npm run dev
fi