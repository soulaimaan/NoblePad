#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AgentCoordinator {
  constructor() {
    this.agents = [
      { name: 'Frontend', script: './packages/frontend/agent.js', status: 'idle' },
      { name: 'Backend', script: './packages/backend/agent.js', status: 'idle' },
      { name: 'Contracts', script: './packages/contracts/agent.js', status: 'idle' },
      { name: 'Security', script: './security-agent.js', status: 'idle' },
      { name: 'Deployment', script: './deployment-agent.js', status: 'idle' }
    ];
    this.isRunning = false;
  }

  async startAgents() {
    console.log('🤖 Starting Agent Coordination Engine...');
    this.isRunning = true;

    for (const agent of this.agents) {
      try {
        console.log(`🚀 Starting ${agent.name} Agent...`);
        agent.process = spawn('node', [agent.script], {
          cwd: process.cwd(),
          stdio: 'inherit'
        });
        agent.status = 'running';
      } catch (error) {
        console.log(`⚠️ ${agent.name} Agent script not found, continuing...`);
        agent.status = 'script-missing';
      }
    }

    this.startStatusMonitor();
  }

  startStatusMonitor() {
    setInterval(() => {
      if (this.isRunning) {
        console.log('\n📊 Agent Status Report:');
        this.agents.forEach(agent => {
          console.log(`   ${agent.name}: ${agent.status}`);
        });
        console.log('------------------------');
      }
    }, 30000);
  }

  async stopAgents() {
    console.log('🛑 Stopping all agents...');
    this.isRunning = false;
    
    this.agents.forEach(agent => {
      if (agent.process) {
        agent.process.kill();
      }
    });
  }
}

const coordinator = new AgentCoordinator();
coordinator.startAgents();

process.on('SIGINT', () => {
  coordinator.stopAgents();
  process.exit(0);
});