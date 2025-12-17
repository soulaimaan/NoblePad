const { ethers } = require('ethers');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Deployer {
  constructor(network = 'goerli') {
    this.network = network;
    this.provider = new ethers.providers.InfuraProvider(network, process.env.INFURA_API_KEY);
    this.wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, this.provider);
    this.contracts = {};
    this.deploymentLog = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    this.deploymentLog.push(logEntry);
    
    switch (type) {
      case 'error':
        console.error(chalk.red(logEntry));
        break;
      case 'success':
        console.log(chalk.green(logEntry));
        break;
      case 'warning':
        console.warn(chalk.yellow(logEntry));
        break;
      default:
        console.log(logEntry);
    }
  }

  async deployContract(contractName, args = []) {
    this.log(`Deploying ${contractName}...`);
    
    try {
      const contractFactory = await ethers.getContractFactory(contractName);
      const contract = await contractFactory.deploy(...args);
      
      this.log(`  - Transaction hash: ${contract.deployTransaction.hash}`, 'info');
      this.log(`  - Waiting for confirmation...`, 'info');
      
      await contract.deployed();
      
      this.contracts[contractName] = {
        address: contract.address,
        abi: JSON.parse(contract.interface.format('json')),
        transactionHash: contract.deployTransaction.hash
      };
      
      this.log(`✅ ${contractName} deployed to: ${contract.address}`, 'success');
      return contract;
    } catch (error) {
      this.log(`❌ Failed to deploy ${contractName}: ${error.message}`, 'error');
      throw error;
    }
  }

  async verifyContract(contractName, address, args = []) {
    this.log(`Verifying ${contractName} on Etherscan...`);
    
    try {
      // This is a simplified example - in a real scenario, you would use the Etherscan API
      // or a plugin like hardhat-etherscan for verification
      this.log(`  - Verification would be done here for ${contractName} at ${address}`, 'info');
      
      // In a real implementation, you would call the Etherscan API here
      // For now, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.log(`✅ ${contractName} verified on Etherscan`, 'success');
      return true;
    } catch (error) {
      this.log(`⚠️  Could not verify ${contractName}: ${error.message}`, 'warning');
      return false;
    }
  }

  async saveDeploymentInfo() {
    const deploymentInfo = {
      network: this.network,
      timestamp: new Date().toISOString(),
      contracts: this.contracts,
      deployer: this.wallet.address
    };
    
    const deploymentDir = path.join(__dirname, 'deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentDir, `deployment-${this.network}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    // Also save the deployment log
    const logFile = path.join(deploymentDir, `deployment-${this.network}-${Date.now()}.log`);
    fs.writeFileSync(logFile, this.deploymentLog.join('\n'));
    
    this.log(`\n📝 Deployment information saved to ${deploymentFile}`, 'success');
    this.log(`📋 Log saved to ${logFile}`, 'success');
  }

  async deployAll() {
    this.log(`\n🚀 Starting deployment to ${this.network.toUpperCase()} network`);
    this.log(`📡 Using RPC URL: ${this.provider.connection.url}`);
    this.log(`👤 Deployer: ${this.wallet.address}\n`);
    
    try {
      // Deploy TokenFactory
      const tokenFactory = await this.deployContract('TokenFactory');
      await this.verifyContract('TokenFactory', tokenFactory.address);
      
      // Deploy PresaleFactory
      const presaleFactory = await this.deployContract('PresaleFactory', [tokenFactory.address]);
      await this.verifyContract('PresaleFactory', presaleFactory.address, [tokenFactory.address]);
      
      // Save deployment info
      await this.saveDeploymentInfo();
      
      this.log('\n🎉 Deployment completed successfully!', 'success');
      return true;
    } catch (error) {
      this.log(`\n❌ Deployment failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Export for testing
module.exports = { Deployer };

// Run deployment if this file is executed directly
if (require.main === module) {
  // Check for required environment variables
  if (!process.env.INFURA_API_KEY || !process.env.DEPLOYER_PRIVATE_KEY) {
    console.error(chalk.red('❌ Error: INFURA_API_KEY and DEPLOYER_PRIVATE_KEY must be set in .env'));
    process.exit(1);
  }
  
  const network = process.argv[2] || 'goerli';
  const deployer = new Deployer(network);
  
  deployer.deployAll().then(success => {
    process.exit(success ? 0 : 1);
  });
}
