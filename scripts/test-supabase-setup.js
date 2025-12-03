#!/usr/bin/env node
// Test script to verify Supabase setup
// Run with: node scripts/test-supabase-setup.js

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧪 NoblePad Supabase Setup Test\n');

// Get user input for configuration
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Test HTTP request
function testRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: response.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: response.statusCode, data: data });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function main() {
  try {
    // Get configuration from user
    const supabaseUrl = await askQuestion('Enter your Supabase URL (https://your-project.supabase.co): ');
    const anonKey = await askQuestion('Enter your Supabase Anon Key: ');
    
    console.log('\n🔍 Testing Supabase setup...\n');
    
    const headers = {
      'apikey': anonKey,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Database connection via REST API
    console.log('1. Testing database connection...');
    try {
      const dbTest = await testRequest(`${supabaseUrl}/rest/v1/presales?select=id&limit=1`, headers);
      if (dbTest.status === 200) {
        console.log('   ✅ Database connection successful');
      } else {
        console.log(`   ❌ Database connection failed (Status: ${dbTest.status})`);
      }
    } catch (error) {
      console.log('   ❌ Database connection error:', error.message);
    }
    
    // Test 2: Edge Functions
    console.log('\n2. Testing Edge Functions...');
    
    const functions = [
      'get-presales',
      'get-presale-details', 
      'create-presale',
      'admin-actions',
      'commit-to-presale',
      'user-tier'
    ];
    
    for (const functionName of functions) {
      try {
        console.log(`   Testing ${functionName}...`);
        const functionTest = await testRequest(`${supabaseUrl}/functions/v1/${functionName}`, headers);
        
        if (functionTest.status === 200 || functionTest.status === 400 || functionTest.status === 401) {
          console.log(`   ✅ ${functionName} is deployed and responding`);
        } else {
          console.log(`   ❌ ${functionName} error (Status: ${functionTest.status})`);
        }
      } catch (error) {
        console.log(`   ❌ ${functionName} error:`, error.message);
      }
    }
    
    // Test 3: Storage
    console.log('\n3. Testing Storage...');
    try {
      const storageTest = await testRequest(`${supabaseUrl}/storage/v1/bucket`, headers);
      if (storageTest.status === 200) {
        console.log('   ✅ Storage service accessible');
      } else {
        console.log(`   ❌ Storage service error (Status: ${storageTest.status})`);
      }
    } catch (error) {
      console.log('   ❌ Storage service error:', error.message);
    }
    
    // Test 4: Auth service
    console.log('\n4. Testing Auth service...');
    try {
      const authTest = await testRequest(`${supabaseUrl}/auth/v1/settings`, headers);
      if (authTest.status === 200) {
        console.log('   ✅ Auth service accessible');
      } else {
        console.log(`   ❌ Auth service error (Status: ${authTest.status})`);
      }
    } catch (error) {
      console.log('   ❌ Auth service error:', error.message);
    }
    
    console.log('\n📋 Setup Verification Complete!');
    console.log('\nNext steps:');
    console.log('1. Update your .env.local file with the values you provided');
    console.log('2. Run: npm run dev');
    console.log('3. Test the application in your browser');
    console.log('4. Check the browser console for any errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    rl.close();
  }
}

main();