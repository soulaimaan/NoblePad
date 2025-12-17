// Monitor for NoblePad Marketing Agents
const pm2 = require('pm2');
const fs = require('fs');
const path = require('path');
const config = require('../config/marketing-config.json');
const { WebhookClient } = require('discord-webhook-node');

class AgentMonitor {
  constructor() {
    this.config = config.monitoring;
    this.agents = ['marketing-agent', 'banner-generator'];
    this.webhook = process.env.DISCORD_WEBHOOK_URL 
      ? new WebhookClient(process.env.DISCORD_WEBHOOK_URL)
      : null;
  }

  async start() {
    console.log('🚀 Starting Agent Monitor...');
    await this.connectToPM2();
    this.setupEventListeners();
    this.scheduleHealthChecks();
  }

  async connectToPM2() {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          console.error('Error connecting to PM2:', err);
          return reject(err);
        }
        console.log('✅ Connected to PM2');
        resolve();
      });
    });
  }

  setupEventListeners() {
    pm2.launchBus((err, bus) => {
      if (err) {
        console.error('Error setting up PM2 event bus:', err);
        return;
      }

      bus.on('process:event', (data) => {
        this.handleProcessEvent(data);
      });

      console.log('🔔 Listening for PM2 events...');
    });
  }

  handleProcessEvent(event) {
    const message = `[${event.process.name}] ${event.event}: ${event.data || ''}`;
    console.log(`📢 ${message}`);
    
    // Send important events to Discord
    if (this.webhook && this.isImportantEvent(event)) {
      this.webhook.send(`[${new Date().toISOString()}] ${message}`);
    }
  }

  isImportantEvent(event) {
    const importantEvents = [
      'start', 'stop', 'restart', 'restart overlimit', 
      'exit', 'delete', 'error', 'exception'
    ];
    return importantEvents.includes(event.event);
  }

  scheduleHealthChecks() {
    setInterval(() => this.checkAgentHealth(), this.config.healthCheckInterval);
    console.log(`🔄 Health checks scheduled every ${this.config.healthCheckInterval / 60000} minutes`);
  }

  async checkAgentHealth() {
    console.log('🔍 Running health check...');
    
    for (const agent of this.agents) {
      try {
        const processes = await this.getProcesses(agent);
        if (processes.length === 0) {
          console.warn(`⚠️  ${agent} is not running. Attempting to start...`);
          await this.startProcess(agent);
        } else {
          console.log(`✅ ${agent} is running (PID: ${processes[0].pid})`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${agent}:`, error.message);
      }
    }

    this.cleanupLogs();
  }

  getProcesses(name) {
    return new Promise((resolve, reject) => {
      pm2.list((err, processes) => {
        if (err) return reject(err);
        resolve(processes.filter(p => p.name === name));
      });
    });
  }

  startProcess(name) {
    return new Promise((resolve, reject) => {
      pm2.start({
        name,
        script: `./agents/${name}.js`,
        error_file: `./logs/${name}-error.log`,
        out_file: `./logs/${name}-out.log`,
        time: true
      }, (err) => {
        if (err) return reject(err);
        console.log(`🚀 Started ${name}`);
        resolve();
      });
    });
  }

  cleanupLogs() {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) return;

    const files = fs.readdirSync(logDir);
    files.forEach(file => {
      if (file.endsWith('.log')) {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        
        // Rotate logs that are too large
        if (stats.size > this.config.maxLogSize) {
          this.rotateLog(filePath);
        }
      }
    });
  }

  rotateLog(filePath) {
    try {
      const dir = path.dirname(filePath);
      const ext = path.extname(filePath);
      const base = path.basename(filePath, ext);
      
      // Delete oldest log if we've reached maxLogFiles
      const logFiles = fs.readdirSync(dir)
        .filter(f => f.startsWith(base) && f.endsWith(ext))
        .sort();
      
      if (logFiles.length >= this.config.maxLogFiles) {
        const oldestLog = path.join(dir, logFiles[0]);
        fs.unlinkSync(oldestLog);
        console.log(`🗑️  Removed old log: ${oldestLog}`);
      }
      
      // Rename current log with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newPath = path.join(dir, `${base}-${timestamp}${ext}`);
      fs.renameSync(filePath, newPath);
      console.log(`🔄 Rotated log: ${filePath} -> ${newPath}`);
      
    } catch (error) {
      console.error('Error rotating logs:', error);
    }
  }
}

// Start the monitor
const monitor = new AgentMonitor();
monitor.start().catch(console.error);

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping Agent Monitor...');
  pm2.disconnect();
  process.exit(0);
});
