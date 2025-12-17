// Turbo Testing & QA Bot
// Purpose: Ensure code quality and prevent regressions

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { ESLint } = require('eslint');

class TurboQABot {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.testResults = {
      unit: { passed: 0, failed: 0, details: [] },
      integration: { passed: 0, failed: 0, details: [] },
      e2e: { passed: 0, failed: 0, details: [] },
      security: { issues: [], details: [] }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive QA process...');
    
    await this.runLinter();
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runE2ETests();
    await this.runSecurityScan();
    
    this.generateReport();
    return this.getTestResults();
  }

  async runLinter() {
    console.log('🔍 Running ESLint...');
    try {
      const eslint = new ESLint();
      const results = await eslint.lintFiles(['src/**/*.{js,jsx,ts,tsx}']);
      
      const formatter = await eslint.loadFormatter('stylish');
      const resultText = formatter.format(results);
      
      if (resultText) {
        console.log(resultText);
      }
      
      console.log('✅ Linting completed');
      return true;
    } catch (error) {
      console.error('❌ Linting failed:', error);
      return false;
    }
  }

  async runUnitTests() {
    console.log('🧪 Running unit tests...');
    return this.runTests('unit', 'npm test -- --coverage');
  }

  async runIntegrationTests() {
    console.log('🔄 Running integration tests...');
    return this.runTests('integration', 'npm run test:integration');
  }

  async runE2ETests() {
    console.log('🌐 Running end-to-end tests...');
    return this.runTests('e2e', 'npm run test:e2e');
  }

  async runSecurityScan() {
    console.log('🔒 Running security scan...');
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { encoding: 'utf-8' });
      const auditData = JSON.parse(auditResult);
      
      // Check for critical vulnerabilities
      const criticalVulns = auditData.metadata?.vulnerabilities?.critical || 0;
      
      if (criticalVulns > 0) {
        this.testResults.security.issues.push({
          type: 'critical',
          count: criticalVulns,
          message: `${criticalVulns} critical vulnerabilities found`
        });
      }
      
      console.log('✅ Security scan completed');
      return true;
    } catch (error) {
      console.error('❌ Security scan failed:', error);
      return false;
    }
  }

  async runTests(type, command) {
    return new Promise((resolve) => {
      const testProcess = spawn(command, { 
        shell: true,
        stdio: 'pipe'
      });

      let output = '';

      testProcess.stdout.on('data', (data) => {
        const text = data.toString();
        process.stdout.write(text);
        output += text;
      });

      testProcess.stderr.on('data', (data) => {
        const text = data.toString();
        process.stderr.write(text);
        output += `ERROR: ${text}`;
      });

      testProcess.on('close', (code) => {
        const passed = code === 0;
        const result = {
          type,
          passed,
          output,
          timestamp: new Date().toISOString()
        };

        this.testResults[type].details.push(result);
        if (passed) {
          this.testResults[type].passed++;
          console.log(`✅ ${type} tests passed`);
        } else {
          this.testResults[type].failed++;
          console.error(`❌ ${type} tests failed`);
        }

        resolve(passed);
      });
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.getTotalTests(),
        passed: this.getPassedTests(),
        failed: this.getFailedTests(),
        coverage: this.getTestCoverage()
      },
      details: this.testResults
    };

    const reportPath = path.join(this.projectRoot, 'qa-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 QA report generated at: ${reportPath}`);
    return report;
  }

  getTotalTests() {
    return Object.values(this.testResults).reduce((total, category) => {
      return total + (category.passed || 0) + (category.failed || 0);
    }, 0);
  }

  getPassedTests() {
    return Object.values(this.testResults).reduce((total, category) => {
      return total + (category.passed || 0);
    }, 0);
  }

  getFailedTests() {
    return Object.values(this.testResults).reduce((total, category) => {
      return total + (category.failed || 0);
    }, 0);
  }

  getTestCoverage() {
    try {
      const coveragePath = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
        return coverage.total;
      }
      return null;
    } catch (error) {
      console.error('Error getting test coverage:', error);
      return null;
    }
  }

  getTestResults() {
    return {
      summary: {
        total: this.getTotalTests(),
        passed: this.getPassedTests(),
        failed: this.getFailedTests()
      },
      details: this.testResults
    };
  }
}

// Export singleton instance
module.exports = new TurboQABot();
