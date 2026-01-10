const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file does not exist');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
];

let allFound = true;
requiredVars.forEach(v => {
    if (envContent.includes(v)) {
        console.log(`✅ ${v} found`);
    } else {
        console.log(`❌ ${v} missing`);
        allFound = false;
    }
});

if (allFound) {
    console.log('\n🚀 All required Supabase environment variables are present.');
} else {
    console.log('\n⚠️ Some environment variables are missing. Please check .env');
}
