const { TestRunner } = require('./test-runner');
const { Deployer } = require('./deploy-script');
const chalk = require('chalk');
const { startDevelopment } = require('./launchpad-coordinator');

class LaunchpadLauncher {
  constructor() {
    this.phases = [
      { name: 'Development', run: this.runDevelopment.bind(this) },
      { name: 'Testing', run: this.runTests.bind(this) },
      { name: 'Deployment', run: this.runDeployment.bind(this) }
    ];
    this.currentPhase = 0;
    this.testResults = null;
    this.deploymentResults = null;
  }

  async runDevelopment() {
    console.log(chalk.blue.bold('\n🚀 Starting Development Phase'));
    console.log(chalk.blue('==========================='));
    
    // Run the development workflow
    await startDevelopment();
    
    console.log(chalk.green('\n✅ Development phase completed successfully!'));
    return true;
  }

  async runTests() {
    console.log(chalk.blue.bold('\n🔍 Starting Testing Phase'));
    console.log(chalk.blue('========================'));
    
    const testRunner = new TestRunner();
    const success = await testRunner.runAllTests();
    this.testResults = testRunner.testResults;
    
    if (!success) {
      console.log(chalk.yellow('\n⚠️  Some tests failed. Please review the test results.'));
      const shouldContinue = await this.askConfirmation('Do you want to continue with deployment?');
      if (!shouldContinue) {
        return false;
      }
    }
    
    return true;
  }

  async runDeployment() {
    console.log(chalk.blue.bold('\n🚀 Starting Deployment Phase'));
    console.log(chalk.blue('==========================='));
    
    if (!process.env.INFURA_API_KEY || !process.env.DEPLOYER_PRIVATE_KEY) {
      console.error(chalk.red('❌ Error: INFURA_API_KEY and DEPLOYER_PRIVATE_KEY must be set in .env'));
      return false;
    }
    
    const deployer = new Deployer('goerli');
    const success = await deployer.deployAll();
    this.deploymentResults = {
      success,
      contracts: deployer.contracts
    };
    
    return success;
  }

  async askConfirmation(question) {
    // In a real implementation, you would use something like inquirer
    // For now, we'll simulate a confirmation
    return new Promise(resolve => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question(`${question} (y/N) `, answer => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  async run() {
    console.log(chalk.magenta.bold('\n🚀🚀🚀 Anti-Rug Launchpad Deployment System 🚀🚀🚀'));
    console.log(chalk.magenta('==========================================\n'));
    
    for (const [index, phase] of this.phases.entries()) {
      this.currentPhase = index + 1;
      console.log(chalk.yellow(`\n🔄 [${this.currentPhase}/${this.phases.length}] Starting ${phase.name} Phase`));
      
      try {
        const success = await phase.run();
        if (!success) {
          console.error(chalk.red(`\n❌ ${phase.name} phase failed. Aborting.`));
          return false;
        }
        console.log(chalk.green(`\n✅ ${phase.name} phase completed successfully!`));
      } catch (error) {
        console.error(chalk.red(`\n❌ Error during ${phase.name} phase: ${error.message}`));
        return false;
      }
    }
    
    console.log(chalk.green.bold('\n🎉🎉🎉 All phases completed successfully! 🎉🎉🎉'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('1. Verify contracts on Etherscan');
    console.log('2. Update frontend with new contract addresses');
    console.log('3. Deploy frontend to production');
    console.log('4. Announce the launch!\n');
    
    return true;
  }
}

// Run the launcher if this file is executed directly
if (require.main === module) {
  const launcher = new LaunchpadLauncher();
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Process terminated by user');
    process.exit(0);
  });
  
  // Start the launch sequence
  launcher.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { LaunchpadLauncher };
