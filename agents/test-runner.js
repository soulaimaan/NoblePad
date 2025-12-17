const { execSync } = require('child_process');
const chalk = require('chalk');

class TestRunner {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, details: [] },
      integration: { passed: 0, failed: 0, details: [] },
      security: { passed: 0, failed: 0, details: [] }
    };
  }

  runUnitTests() {
    console.log(chalk.blue('\n🔍 Running unit tests...'));
    try {
      // Run Hardhat tests
      execSync('npx hardhat test', { stdio: 'inherit' });
      this.testResults.unit.passed++;
      this.testResults.unit.details.push('All unit tests passed');
      console.log(chalk.green('✅ Unit tests completed successfully'));
    } catch (error) {
      this.testResults.unit.failed++;
      this.testResults.unit.details.push('Unit tests failed');
      console.error(chalk.red('❌ Unit tests failed'));
    }
  }

  runIntegrationTests() {
    console.log(chalk.blue('\n🔗 Running integration tests...'));
    try {
      // Run integration tests (you'll need to implement these)
      execSync('npx jest tests/integration', { stdio: 'inherit' });
      this.testResults.integration.passed++;
      this.testResults.integration.details.push('All integration tests passed');
      console.log(chalk.green('✅ Integration tests completed successfully'));
    } catch (error) {
      this.testResults.integration.failed++;
      this.testResults.integration.details.push('Integration tests failed');
      console.error(chalk.red('❌ Integration tests failed'));
    }
  }

  runSecurityChecks() {
    console.log(chalk.blue('\n🔒 Running security checks...'));
    try {
      // Run Slither for static analysis
      console.log(chalk.yellow('Running Slither analysis...'));
      execSync('slither .', { stdio: 'inherit' });
      
      // Run Mythril for symbolic execution
      console.log(chalk.yellow('\nRunning Mythril analysis...'));
      execSync('docker run -v $(pwd):/tmp mythril/myth analyze /tmp/contracts', { stdio: 'inherit' });
      
      this.testResults.security.passed++;
      this.testResults.security.details.push('Security checks completed');
      console.log(chalk.green('✅ Security checks completed'));
    } catch (error) {
      this.testResults.security.failed++;
      this.testResults.security.details.push('Security checks found issues');
      console.error(chalk.yellow('⚠️  Security checks found potential issues'));
    }
  }

  generateReport() {
    console.log(chalk.cyan('\n📊 Test Results Summary'));
    console.log(chalk.cyan('======================'));
    
    // Unit Tests
    console.log('\n🔍 Unit Tests:');
    console.log(`  ✅ Passed: ${this.testResults.unit.passed}`);
    console.log(`  ❌ Failed: ${this.testResults.unit.failed}`);
    this.testResults.unit.details.forEach(detail => {
      console.log(`  • ${detail}`);
    });

    // Integration Tests
    console.log('\n🔗 Integration Tests:');
    console.log(`  ✅ Passed: ${this.testResults.integration.passed}`);
    console.log(`  ❌ Failed: ${this.testResults.integration.failed}`);
    this.testResults.integration.details.forEach(detail => {
      console.log(`  • ${detail}`);
    });

    // Security Checks
    console.log('\n🔒 Security Checks:');
    console.log(`  ✅ Passed: ${this.testResults.security.passed}`);
    console.log(`  ❌ Failed: ${this.testResults.security.failed}`);
    this.testResults.security.details.forEach(detail => {
      console.log(`  • ${detail}`);
    });

    // Overall Status
    const totalFailed = 
      this.testResults.unit.failed + 
      this.testResults.integration.failed + 
      this.testResults.security.failed;

    console.log(chalk.cyan('\n🏁 Overall Status:'));
    if (totalFailed === 0) {
      console.log(chalk.green('✅ All tests passed successfully!'));
    } else {
      console.log(chalk.red(`❌ ${totalFailed} test categories failed`));
    }

    return totalFailed === 0;
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🚀 Starting Test Suite'));
    console.log(chalk.blue('===================='));

    // Run tests in sequence
    this.runUnitTests();
    this.runIntegrationTests();
    this.runSecurityChecks();

    // Generate and return final report
    return this.generateReport();
  }
}

// Export for testing
module.exports = { TestRunner };

// Run tests if this file is executed directly
if (require.main === module) {
  const testRunner = new TestRunner();
  testRunner.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
