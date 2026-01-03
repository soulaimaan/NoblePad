#!/usr/bin/env node

/**
 * NoblePad Project Verification Checklist
 * 
 * Verifies that all smart contracts are compiled and deployment files are ready
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const checks = {
  'PASS': [],
  'FAIL': [],
  'WARN': []
};

function check(name, condition, details = '') {
  if (condition) {
    checks['PASS'].push(`${name}${details ? ` - ${details}` : ''}`);
  } else {
    checks['FAIL'].push(`${name}${details ? ` - ${details}` : ''}`);
  }
}

function warn(name, details = '') {
  checks['WARN'].push(`${name}${details ? ` - ${details}` : ''}`);
}

console.log('\n🔍 NoblePad Project Verification\n');
console.log('Checking smart contracts and deployment files...\n');

// Check contract files
const contractsDir = path.join(__dirname, 'contracts');
const contracts = [
  'Presale.sol',
  'PresaleFactory.sol',
  'TokenLock.sol',
  'Vesting.sol',
  'TreasuryTimelock.sol',
  'Greeter.sol'
];

console.log('📋 Smart Contract Files:');
contracts.forEach(contract => {
  const exists = fs.existsSync(path.join(contractsDir, contract));
  check(`  ${contract}`, exists);
});

// Check artifacts (compiled)
console.log('\n📦 Compiled Artifacts:');
const artifactsDir = path.join(__dirname, 'artifacts', 'contracts');
contracts.forEach(contract => {
  const contractName = contract.replace('.sol', '');
  const artifactPath = path.join(artifactsDir, contract, `${contractName}.json`);
  const exists = fs.existsSync(artifactPath);
  check(`  ${contractName}.json`, exists);
});

// Check deployment scripts
console.log('\n🚀 Deployment Scripts:');
check('  deploy.js', fs.existsSync(path.join(__dirname, 'scripts', 'deploy.js')));
check('  deploy-sepolia.js', fs.existsSync(path.join(__dirname, 'scripts', 'deploy-sepolia.js')));

// Check documentation
console.log('\n📚 Documentation:');
check('  DEPLOYMENT_GUIDE.md', fs.existsSync(path.join(__dirname, 'DEPLOYMENT_GUIDE.md')));
check('  QUICK_DEPLOY.md', fs.existsSync(path.join(__dirname, 'QUICK_DEPLOY.md')));
// These are likely in root, let's check relative to project root (up one level)
const projectRoot = path.join(__dirname, '..');
check('  ANTI_RUG_SPEC.md', fs.existsSync(path.join(projectRoot, 'ANTI_RUG_SPEC.md')));
check('  DEPLOYMENT_STATUS.md', fs.existsSync(path.join(projectRoot, 'DEPLOYMENT_STATUS.md')));
check('  COMPLETION_SUMMARY.md', fs.existsSync(path.join(projectRoot, 'COMPLETION_SUMMARY.md')));
check('  FRONTEND_INTEGRATION.md', fs.existsSync(path.join(projectRoot, 'FRONTEND_INTEGRATION.md')));
check('  NEXT_ACTIONS.md', fs.existsSync(path.join(projectRoot, 'NEXT_ACTIONS.md')));

// Check Hardhat config
console.log('\n⚙️ Configuration:');
const hardhatConfig = path.join(__dirname, 'hardhat.config.js');
check('  hardhat.config.js', fs.existsSync(hardhatConfig));

if (fs.existsSync(hardhatConfig)) {
  const content = fs.readFileSync(hardhatConfig, 'utf8');
  check('    ESM export', content.includes('export default'));
  check('    viaIR optimizer', content.includes('viaIR: true'));
  check('    Solidity 0.8.20', content.includes('0.8.20'));
}

// Check package.json
console.log('\n📦 Package Configuration:');
const packageJson = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJson)) {
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  check('  Hardhat installed', pkg.devDependencies?.hardhat ? `v${pkg.devDependencies.hardhat}` : false);
  check('  ethers.js installed', pkg.dependencies?.ethers ? `v${pkg.dependencies.ethers}` : false);
  check('  OpenZeppelin contracts', pkg.dependencies?.['@openzeppelin/contracts'] ? `v${pkg.dependencies['@openzeppelin/contracts']}` : false);
  check('  Deploy script in npm', pkg.scripts?.['deploy:sepolia'] ? true : false);
}

// Check for test files
console.log('\n🧪 Test Infrastructure:');
check('  test/NoblePad.test.js', fs.existsSync(path.join(__dirname, 'test', 'NoblePad.test.js')));

// Print results
console.log('\n[RESULTS]\n');

if (checks['PASS'].length > 0) {
  console.log('✓ PASSED:');
  checks['PASS'].forEach(item => console.log(`   ${item}`));
}

if (checks['WARN'].length > 0) {
  console.log('\n⚠ WARNINGS:');
  checks['WARN'].forEach(item => console.log(`   ${item}`));
}

if (checks['FAIL'].length > 0) {
  console.log('\n✗ ISSUES:');
  checks['FAIL'].forEach(item => console.log(`   ${item}`));
  console.log('\n⚠ Please fix the above issues before deployment.');
  process.exit(1);
}

// Final status
console.log('\n' + '='.repeat(50));
const totalChecks = checks['PASS'].length + checks['WARN'].length + checks['FAIL'].length;
const passRate = Math.round((checks['PASS'].length / totalChecks) * 100);

if (passRate === 100) {
  console.log('✓ ALL CHECKS PASSED! Ready for Sepolia deployment.');
  console.log('\nNext steps:');
  console.log('1. Get Sepolia ETH from faucet (https://sepoliafaucet.com)');
  console.log('2. Create .env file in contracts/ with PRIVATE_KEY and SEPOLIA_RPC_URL');
  console.log('3. Run: npm run deploy:sepolia');
  console.log('\nSee NEXT_ACTIONS.md for detailed instructions.');
} else if (passRate >= 80) {
  console.log(`⚠ Most checks passed (${passRate}%). Review warnings above.`);
} else {
  console.log(`✗ Multiple issues detected (${passRate}%). Fix before deploying.`);
  process.exit(1);
}

console.log('='.repeat(50) + '\n');
