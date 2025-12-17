// Turbo Integration Specialist
// Purpose: Ensure seamless integration between all system components

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ethers = require('ethers');

class TurboIntegrationAgent {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.integrationLogs = [];
    this.setup();
  }

  async setup() {
    this.loadConfig();
    await this.initializeProviders();
  }

  loadConfig() {
    const configPath = path.join(this.projectRoot, 'config', 'integration.json');
    this.config = fs.existsSync(configPath) 
      ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      : {
          networks: {},
          contracts: {},
          endpoints: {}
        };
  }

  async initializeProviders() {
    this.providers = {};
    
    // Initialize providers for all configured networks
    for (const [network, config] of Object.entries(this.config.networks)) {
      try {
        this.providers[network] = new ethers.providers.JsonRpcProvider(config.rpcUrl);
        this.log(`✅ Connected to ${network} network`);
      } catch (error) {
        this.log(`❌ Failed to connect to ${network}: ${error.message}`, 'error');
      }
    }
  }

  async verifyContractIntegration(contractName, network) {
    this.log(`🔍 Verifying ${contractName} on ${network}...`);
    
    try {
      const contractConfig = this.config.contracts[contractName];
      if (!contractConfig) {
        throw new Error(`No configuration found for ${contractName}`);
      }

      const provider = this.providers[network];
      if (!provider) {
        throw new Error(`No provider configured for ${network}`);
      }

      const contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        provider
      );

      // Basic connectivity check
      const code = await provider.getCode(contractConfig.address);
      if (code === '0x') {
        throw new Error('Contract not deployed at the specified address');
      }

      // Function availability check
      const functions = contractConfig.requiredFunctions || [];
      for (const func of functions) {
        if (typeof contract[func] !== 'function') {
          throw new Error(`Required function ${func} not found in contract`);
        }
      }

      this.log(`✅ ${contractName} integration verified on ${network}`);
      return true;
    } catch (error) {
      this.log(`❌ ${contractName} integration failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkAPIConnection(endpointName) {
    const endpoint = this.config.endpoints[endpointName];
    if (!endpoint) {
      this.log(`❌ No configuration found for endpoint: ${endpointName}`, 'error');
      return false;
    }

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method || 'GET',
        headers: endpoint.headers || {},
        body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.log(`✅ Successfully connected to ${endpointName}`);
      return true;
    } catch (error) {
      this.log(`❌ Failed to connect to ${endpointName}: ${error.message}`, 'error');
      return false;
    }
  }

  async runIntegrationTests() {
    this.log('🚀 Running integration tests...');
    let allPassed = true;

    // Test contract integrations
    for (const [contract, config] of Object.entries(this.config.contracts || {})) {
      const success = await this.verifyContractIntegration(contract, config.network);
      if (!success) allPassed = false;
    }

    // Test API connections
    for (const endpoint of Object.keys(this.config.endpoints || {})) {
      const success = await this.checkAPIConnection(endpoint);
      if (!success) allPassed = false;
    }

    if (allPassed) {
      this.log('🎉 All integration tests passed!');
    } else {
      this.log('❌ Some integration tests failed', 'error');
    }

    return allPassed;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    this.integrationLogs.push(logEntry);
    console[level === 'error' ? 'error' : 'log'](logEntry);
  }

  getLogs() {
    return this.integrationLogs;
  }
}

// Export singleton instance
module.exports = new TurboIntegrationAgent();
