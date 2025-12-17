#!/bin/bash

echo "🚀 NoblePad Launchpad - Local Development Setup"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local || cat > .env.local << 'EOF'
# NoblePad Launchpad Environment Variables

# Database (Your existing Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://fqlfxtuqizekehdwlcns.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_cxfbj61fHD_lfzimDEQxLQ_Vn_3cRf9
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Wallet Integration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=2f05ae7f1116030fde2d36508f472bfb-project-id

# Blockchain APIs (Optional - get free keys)
NEXT_PUBLIC_ALCHEMY_API_KEY=demo_key
NEXT_PUBLIC_INFURA_PROJECT_ID=demo_key

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3005

# Development Mode
NODE_ENV=development
EOF
    echo "✅ Created .env.local - Please update with your API keys"
else
    echo "✅ .env.local already exists"
fi

# Check if package.json has required scripts
if [ -f package.json ]; then
    echo "✅ package.json found"
else
    echo "📝 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "noblepad-launchpad",
  "version": "1.0.0",
  "description": "Multi-chain crypto launchpad built by autonomous AI agents",
  "scripts": {
    "dev": "next dev -p 3005",
    "dev:agent-monitor": "echo 'Agent monitor available at: http://localhost:3005/agent-monitor'",
    "dev:debug": "echo 'Debug tools available at: http://localhost:3005/debug'",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:agent-monitor\"",
    "build": "next build",
    "start": "next start -p 3005",
    "lint": "next lint",
    "test": "jest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "lucide-react": "^0.300.0",
    "tailwindcss": "^3.3.0",
    "@supabase/supabase-js": "^2.38.0"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
EOF
    echo "✅ Created package.json"
fi

echo ""
echo "🎯 Setup Summary:"
echo "=================="
echo "✅ Dependencies installed"
echo "✅ Environment configured"
echo "✅ Development scripts ready"
echo ""
echo "🚀 Quick Start Commands:"
echo "========================"
echo ""
echo "1. 📊 Monitor AI Agents:"
echo "   npm run dev"
echo "   Open: http://localhost:3005/agent-monitor"
echo ""
echo "2. 🔧 Test MetaMask Connection:"
echo "   Open: http://localhost:3005/debug"
echo ""
echo "3. 🎮 Try Current Features:"
echo "   Open: http://localhost:3005"
echo ""
echo "4. 📈 Watch Agent Progress:"
echo "   watch -n 5 'find agents/ -name \"*AGENT*.md\" -exec tail -n 3 {} \\;'"
echo ""

# Start development server
read -p "🚀 Start development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting NoblePad Launchpad..."
    echo "📊 Agent Monitor: http://localhost:3005/agent-monitor"
    echo "🔧 Debug Tools: http://localhost:3005/debug"
    echo "🎮 Main App: http://localhost:3005"
    echo ""
    npm run dev
else
    echo ""
    echo "👍 Setup complete! Run 'npm run dev' when ready."
    echo ""
    echo "💡 Pro tip: Use 'npm run dev:agent-monitor' to see AI agent progress"
fi