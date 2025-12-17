#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class UnifiedAgentMonitor {
  constructor() {
    this.agents = [
      { 
        name: 'Frontend', 
        emoji: '🎨', 
        script: './packages/frontend/agent.js', 
        process: null, 
        status: 'stopped',
        lastUpdate: null 
      },
      { 
        name: 'Backend', 
        emoji: '⚙️', 
        script: './packages/backend/agent.js', 
        process: null, 
        status: 'stopped',
        lastUpdate: null 
      },
      { 
        name: 'Contracts', 
        emoji: '📜', 
        script: './packages/contracts/agent.js', 
        process: null, 
        status: 'stopped',
        lastUpdate: null 
      },
      { 
        name: 'Security', 
        emoji: '🛡️', 
        script: './security-agent.js', 
        process: null, 
        status: 'stopped',
        lastUpdate: null 
      },
      { 
        name: 'Deployment', 
        emoji: '🚀', 
        script: './deployment-agent.js', 
        process: null, 
        status: 'stopped',
        lastUpdate: null 
      }
    ];
    this.isRunning = false;
  }

  clearScreen() {
    console.clear();
  }

  displayHeader() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🤖  NOBLEPAD AI AGENT REAL-TIME MONITORING DASHBOARD  🤖');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log('───────────────────────────────────────────────────────────────');
  }

  displayAgentStatus() {
    console.log('\n📊 AGENT STATUS OVERVIEW:');
    console.log('───────────────────────────────────────────────────────────────');
    
    this.agents.forEach((agent, index) => {
      const statusIcon = agent.status === 'running' ? '🟢' : 
                        agent.status === 'error' ? '🔴' : '⚫';
      const lastSeen = agent.lastUpdate ? 
        `(Last seen: ${((Date.now() - agent.lastUpdate) / 1000).toFixed(1)}s ago)` : 
        '(Never started)';
      
      console.log(`${statusIcon} ${agent.emoji} ${agent.name.padEnd(12)} | ${agent.status.toUpperCase().padEnd(8)} ${lastSeen}`);
    });
  }

  displayControls() {
    console.log('\n🎮 CONTROLS:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('Press Ctrl+C to stop all agents and exit');
    console.log('Agents will auto-restart if they stop unexpectedly');
  }

  displayLogs() {
    console.log('\n📝 RECENT AGENT ACTIVITY:');
    console.log('───────────────────────────────────────────────────────────────');
    // Recent logs will be displayed here
  }

  async startAgent(agent) {
    try {
      if (!fs.existsSync(agent.script)) {
        console.log(`⚠️  ${agent.name} script not found: ${agent.script}`);
        agent.status = 'script-missing';
        return;
      }

      agent.process = spawn('node', [agent.script], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      agent.status = 'running';
      agent.lastUpdate = Date.now();

      agent.process.stdout.on('data', (data) => {
        agent.lastUpdate = Date.now();
        const output = data.toString().trim();
        if (output) {
          this.logAgentOutput(agent, output);
        }
      });

      agent.process.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error) {
          this.logAgentOutput(agent, `ERROR: ${error}`);
        }
      });

      agent.process.on('exit', (code) => {
        agent.status = code === 0 ? 'stopped' : 'error';
        agent.process = null;
        this.logAgentOutput(agent, `Process exited with code: ${code}`);
        
        // Auto-restart after 3 seconds
        setTimeout(() => {
          if (this.isRunning) {
            this.logAgentOutput(agent, 'Auto-restarting...');
            this.startAgent(agent);
          }
        }, 3000);
      });

    } catch (error) {
      agent.status = 'error';
      this.logAgentOutput(agent, `Failed to start: ${error.message}`);
    }
  }

  logAgentOutput(agent, message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${agent.emoji} ${agent.name}: ${message}`);
  }

  async startAllAgents() {
    this.clearScreen();
    this.displayHeader();
    console.log('\n🚀 Starting all NoblePad AI agents...\n');
    
    this.isRunning = true;

    for (const agent of this.agents) {
      this.logAgentOutput(agent, 'Starting...');
      await this.startAgent(agent);
      await new Promise(resolve => setTimeout(resolve, 500)); // Stagger starts
    }

    // Update display every 2 seconds
    setInterval(() => {
      this.updateDisplay();
    }, 2000);

    // Check for dead agents every 10 seconds
    setInterval(() => {
      this.checkAgentHealth();
    }, 10000);
  }

  updateDisplay() {
    // Don't clear screen, just update status section
    process.stdout.write('\u001b[H\u001b[J'); // Clear screen and move cursor to top
    this.displayHeader();
    this.displayAgentStatus();
    this.displayControls();
    console.log('\n📝 REAL-TIME AGENT ACTIVITY:');
    console.log('───────────────────────────────────────────────────────────────');
  }

  checkAgentHealth() {
    this.agents.forEach(agent => {
      if (agent.status === 'running' && agent.lastUpdate) {
        const timeSinceUpdate = Date.now() - agent.lastUpdate;
        
        // If no update in 30 seconds, consider agent stuck
        if (timeSinceUpdate > 30000) {
          this.logAgentOutput(agent, '⚠️ Agent appears stuck, restarting...');
          if (agent.process) {
            agent.process.kill();
          }
        }
      }
    });
  }

  async stopAllAgents() {
    console.log('\n🛑 Stopping all agents...');
    this.isRunning = false;
    
    this.agents.forEach(agent => {
      if (agent.process) {
        agent.process.kill();
        agent.status = 'stopped';
      }
    });

    console.log('✅ All agents stopped. Goodbye!');
    process.exit(0);
  }
}

const monitor = new UnifiedAgentMonitor();

console.log('🤖 NoblePad Unified Agent Monitor');
console.log('Starting all AI development agents...\n');

monitor.startAllAgents();

// Graceful shutdown
process.on('SIGINT', () => {
  monitor.stopAllAgents();
});

process.on('SIGTERM', () => {
  monitor.stopAllAgents();
});