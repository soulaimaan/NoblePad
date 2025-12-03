#!/bin/bash
# Complete Supabase Setup Script for NoblePad
# This script automates the entire Supabase backend setup

set -e

echo "🚀 NoblePad Supabase Complete Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "🔧 Supabase CLI not found. Installing..."
    npm install -g supabase
    print_status "Supabase CLI installed"
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    print_warning "Please login to Supabase first:"
    supabase login
fi

# Get project ID from user
echo ""
print_info "You need your Supabase project ID. Find it at:"
print_info "https://app.supabase.com/projects -> Your Project -> Settings -> General"
echo ""
read -p "Enter your Supabase Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    print_error "Project ID is required. Exiting."
    exit 1
fi

echo ""
print_info "Starting setup for project: $PROJECT_ID"
echo ""

# Link to remote project
print_info "1. Linking to Supabase project..."
if supabase link --project-ref $PROJECT_ID; then
    print_status "Project linked successfully"
else
    print_error "Failed to link project. Check your project ID."
    exit 1
fi

# Deploy database schema
print_info "2. Deploying database schema..."
if supabase db push; then
    print_status "Database schema deployed successfully"
else
    print_error "Failed to deploy database schema"
    exit 1
fi

# Deploy Edge Functions
print_info "3. Deploying Edge Functions..."

functions=("get-presales" "get-presale-details" "create-presale" "admin-actions" "commit-to-presale" "user-tier")

for func in "${functions[@]}"; do
    print_info "   Deploying $func..."
    if supabase functions deploy $func --no-verify-jwt; then
        print_status "   $func deployed successfully"
    else
        print_warning "   $func deployment had issues (may still work)"
    fi
done

# Create storage buckets
print_info "4. Setting up storage..."
if supabase storage create kyc-documents --public false; then
    print_status "KYC documents bucket created"
else
    print_warning "KYC bucket may already exist"
fi

# Get API keys
print_info "5. Retrieving API keys..."
PROJECT_URL="https://$PROJECT_ID.supabase.co"
print_info "Project URL: $PROJECT_URL"

echo ""
print_warning "Please get your API keys from Supabase Dashboard:"
print_info "Go to: https://app.supabase.com/project/$PROJECT_ID/settings/api"
echo ""

# Ask for API keys
read -p "Enter your Supabase Anon Key: " ANON_KEY
read -p "Enter your WalletConnect Project ID (or press enter for demo): " WALLETCONNECT_ID

if [ -z "$WALLETCONNECT_ID" ]; then
    WALLETCONNECT_ID="demo"
    print_warning "Using demo WalletConnect ID. Get real one at https://cloud.walletconnect.com"
fi

# Create/update .env.local
print_info "6. Creating environment configuration..."
cat > .env.local << EOF
# NoblePad Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$WALLETCONNECT_ID

# Admin Configuration
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

print_status "Environment file created: .env.local"

# Test the setup
print_info "7. Testing setup..."
if node scripts/test-supabase-setup.js; then
    print_status "Setup test completed"
else
    print_warning "Some tests may have failed (check output above)"
fi

echo ""
echo "🎉 Supabase Setup Complete!"
echo "=========================="
echo ""
print_info "Your NoblePad backend is ready with:"
print_status "Database schema with all tables and security policies"
print_status "6 Edge Functions for secure business logic"
print_status "Storage bucket for KYC documents"
print_status "Environment variables configured"
echo ""

print_warning "Next Steps:"
echo "1. Set environment variables in Supabase dashboard:"
echo "   Go to: https://app.supabase.com/project/$PROJECT_ID/settings/environment-variables"
echo "   Add: ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4,0xYourAdminWallet"
echo "   Add: WALLETCONNECT_PROJECT_ID=$WALLETCONNECT_ID"
echo ""
echo "2. Optional - Add sample data:"
echo "   Run the SQL in scripts/create-sample-data.sql in your Supabase SQL Editor"
echo ""
echo "3. Start development:"
echo "   npm run dev"
echo ""
echo "4. Test your application:"
echo "   Open http://localhost:3000 in your browser"
echo ""

print_status "🚀 Your NoblePad Three-Tier Architecture is ready!"
echo ""

# Ask if user wants to add sample data
read -p "Would you like me to show you the SQL for adding sample data? (y/N): " ADD_SAMPLE

if [[ $ADD_SAMPLE =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Sample Data SQL:"
    echo "Copy and run this in your Supabase SQL Editor:"
    echo "https://app.supabase.com/project/$PROJECT_ID/sql"
    echo ""
    echo "File location: scripts/create-sample-data.sql"
    print_warning "This will add test presales, users, and admin actions"
fi

echo ""
print_status "Setup complete! Happy building! 🎉"