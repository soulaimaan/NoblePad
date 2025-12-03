#!/bin/bash
# NoblePad Supabase Deployment Script
# Deploy Three-Tier Architecture to Supabase

set -e

echo "🚀 Starting NoblePad Supabase Deployment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "🔑 Please login to Supabase:"
    supabase login
fi

# Initialize Supabase project if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
fi

# Link to remote project (you'll need to replace YOUR_PROJECT_ID)
read -p "Enter your Supabase project ID: " PROJECT_ID
if [ ! -z "$PROJECT_ID" ]; then
    echo "🔗 Linking to Supabase project: $PROJECT_ID"
    supabase link --project-ref $PROJECT_ID
fi

# Run database migrations
echo "🗄️ Running database migrations..."
supabase db push

# Deploy Edge Functions
echo "📡 Deploying Edge Functions..."

echo "  📤 Deploying get-presales..."
supabase functions deploy get-presales

echo "  📤 Deploying get-presale-details..."
supabase functions deploy get-presale-details

echo "  📤 Deploying create-presale..."
supabase functions deploy create-presale

echo "  📤 Deploying admin-actions..."
supabase functions deploy admin-actions

echo "  📤 Deploying commit-to-presale..."
supabase functions deploy commit-to-presale

echo "  📤 Deploying user-tier..."
supabase functions deploy user-tier

# Set environment variables for Edge Functions
echo "🔧 Setting up environment variables..."

# You'll need to set these via Supabase Dashboard > Settings > Environment Variables
echo "⚠️  Please set the following environment variables in your Supabase dashboard:"
echo "   ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4,0x..."
echo "   WALLETCONNECT_PROJECT_ID=your_project_id"

# Create storage buckets
echo "📦 Creating storage buckets..."
supabase storage create kyc-documents

# Set storage policies
echo "🔒 Setting up storage policies..."
supabase storage update kyc-documents --public false

echo "✅ Supabase deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your .env.local with the Supabase URL and keys"
echo "2. Set environment variables in Supabase dashboard"
echo "3. Test the application locally: npm run dev"
echo "4. Deploy frontend to Vercel: npm run build && vercel --prod"
echo ""
echo "🔗 Your Supabase Dashboard: https://app.supabase.com/project/$PROJECT_ID"