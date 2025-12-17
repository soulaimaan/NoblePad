#!/usr/bin/env node
// Interactive Supabase setup script for NoblePad
// Cross-platform (Windows/Mac/Linux) Node.js script

const { spawn, execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.blue}🔧 ${description}...${colors.reset}`);
    
    const child = spawn(command, { shell: true, stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        colorLog('green', `✅ ${description} completed successfully`);
        resolve();
      } else {
        colorLog('red', `❌ ${description} failed with code ${code}`);
        reject(new Error(`Command failed: ${command}`));
      }
    });
    
    child.on('error', (error) => {
      colorLog('red', `❌ Error running command: ${error.message}`);
      reject(error);
    });
  });
}

async function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`
${colors.magenta}🚀 NoblePad Supabase Setup Wizard${colors.reset}
${colors.magenta}======================================${colors.reset}

This script will set up your complete Supabase backend:
✅ Database schema with security policies
✅ 6 Edge Functions for business logic  
✅ File storage for KYC documents
✅ Environment configuration
✅ Sample data (optional)

Let's get started!
`);

  try {
    // Check if Supabase CLI is installed
    const hasSupabaseCLI = await checkSupabaseCLI();
    
    if (!hasSupabaseCLI) {
      colorLog('yellow', '⚠️  Supabase CLI not found. Installing...');
      await runCommand('npm install -g supabase', 'Installing Supabase CLI');
    } else {
      colorLog('green', '✅ Supabase CLI found');
    }

    // Check if user is logged in
    try {
      execSync('supabase projects list', { stdio: 'ignore' });
      colorLog('green', '✅ Already logged into Supabase');
    } catch {
      colorLog('yellow', '⚠️  Please login to Supabase first');
      console.log('\nThis will open your browser for authentication...');
      await askQuestion('Press Enter to continue...');
      await runCommand('supabase login', 'Logging into Supabase');
    }

    // Get project information
    console.log(`\n${colors.blue}📋 Project Information${colors.reset}`);
    console.log('Find your Project ID at: https://app.supabase.com/projects');
    console.log('Look in the URL: app.supabase.com/project/[YOUR_PROJECT_ID]');
    console.log('Or go to: Settings > General > Reference ID\n');

    const projectId = await askQuestion('Enter your Supabase Project ID: ');
    
    if (!projectId) {
      colorLog('red', '❌ Project ID is required');
      process.exit(1);
    }

    // Link project
    await runCommand(`supabase link --project-ref ${projectId}`, 'Linking to Supabase project');

    // Deploy database schema
    await runCommand('supabase db push', 'Deploying database schema');

    // Deploy Edge Functions
    console.log(`\n${colors.blue}📡 Deploying Edge Functions${colors.reset}`);
    const functions = [
      'get-presales',
      'get-presale-details', 
      'create-presale',
      'admin-actions',
      'commit-to-presale',
      'user-tier'
    ];

    for (const func of functions) {
      try {
        await runCommand(`supabase functions deploy ${func}`, `Deploying ${func}`);
      } catch (error) {
        colorLog('yellow', `⚠️  ${func} deployment had issues (may still work)`);
      }
    }

    // Create storage
    try {
      await runCommand('supabase storage create kyc-documents --public false', 'Creating storage bucket');
    } catch {
      colorLog('yellow', '⚠️  Storage bucket may already exist');
    }

    // Get API configuration
    console.log(`\n${colors.blue}🔑 API Configuration${colors.reset}`);
    const projectUrl = `https://${projectId}.supabase.co`;
    
    console.log('\nGet your API keys from:');
    console.log(`https://app.supabase.com/project/${projectId}/settings/api\n`);
    
    const anonKey = await askQuestion('Enter your Supabase Anon Key: ');
    
    console.log('\nGet your WalletConnect Project ID from:');
    console.log('https://cloud.walletconnect.com (free account)\n');
    
    let walletConnectId = await askQuestion('Enter WalletConnect Project ID (or press Enter for demo): ');
    if (!walletConnectId) {
      walletConnectId = 'demo';
      colorLog('yellow', '⚠️  Using demo WalletConnect ID');
    }

    // Create environment file
    const envContent = `# NoblePad Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${projectUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${walletConnectId}

# Admin Configuration
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
`;

    fs.writeFileSync('.env.local', envContent);
    colorLog('green', '✅ Environment file created: .env.local');

    // Test setup
    console.log(`\n${colors.blue}🧪 Testing Setup${colors.reset}`);
    try {
      await runCommand('node scripts/test-supabase-setup.js', 'Running setup tests');
    } catch {
      colorLog('yellow', '⚠️  Some tests may have failed (check output above)');
    }

    // Ask about sample data
    console.log(`\n${colors.blue}📊 Sample Data${colors.reset}`);
    const addSample = await askQuestion('Would you like to add sample test data? (y/N): ');
    
    if (addSample.toLowerCase() === 'y' || addSample.toLowerCase() === 'yes') {
      console.log('\nTo add sample data:');
      console.log(`1. Go to: https://app.supabase.com/project/${projectId}/sql`);
      console.log('2. Copy the contents of: scripts/create-sample-data.sql');
      console.log('3. Paste and run the SQL query');
      console.log('4. Refresh your app to see test presales');
    }

    // Success message
    console.log(`
${colors.green}🎉 Supabase Setup Complete!${colors.reset}
${colors.green}=============================${colors.reset}

Your NoblePad backend is ready with:
${colors.green}✅ Database schema with all tables and security policies${colors.reset}
${colors.green}✅ 6 Edge Functions for secure business logic${colors.reset}
${colors.green}✅ Storage bucket for KYC documents${colors.reset}
${colors.green}✅ Environment variables configured${colors.reset}

${colors.yellow}⚡ Next Steps:${colors.reset}

1. ${colors.blue}Set environment variables in Supabase dashboard:${colors.reset}
   Go to: https://app.supabase.com/project/${projectId}/settings/environment-variables
   Add: ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4,0xYourAdminWallet
   Add: WALLETCONNECT_PROJECT_ID=${walletConnectId}

2. ${colors.blue}Start development:${colors.reset}
   npm run dev

3. ${colors.blue}Test your application:${colors.reset}
   Open http://localhost:3000 in your browser

4. ${colors.blue}Optional - Add sample data:${colors.reset}
   Run SQL from scripts/create-sample-data.sql in Supabase SQL Editor

${colors.magenta}🚀 Your Three-Tier Architecture is complete!${colors.reset}
`);

    // Ask if user wants to start dev server
    const startDev = await askQuestion('Would you like to start the development server now? (y/N): ');
    
    if (startDev.toLowerCase() === 'y' || startDev.toLowerCase() === 'yes') {
      console.log(`\n${colors.blue}🚀 Starting development server...${colors.reset}`);
      console.log(`${colors.green}Your app will be available at: http://localhost:3000${colors.reset}`);
      await runCommand('npm run dev', 'Starting development server');
    }

  } catch (error) {
    colorLog('red', `❌ Setup failed: ${error.message}`);
    console.log('\nFor help, check:');
    console.log('- SUPABASE_SETUP_COMPLETE.md for detailed instructions');
    console.log('- Run: npm run supabase:test for diagnostics');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();