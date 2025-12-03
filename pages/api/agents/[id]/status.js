import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// Mock data for agent status
const AGENT_STATUS = {
  automation: {
    name: 'Automation Agent',
    type: 'automation',
    endpoints: [
      { name: 'Task Scheduler', status: 'online' },
      { name: 'Event Processor', status: 'online' },
      { name: 'Job Queue', status: 'online' },
    ],
  },
  integration: {
    name: 'Integration Specialist',
    type: 'integration',
    endpoints: [
      { name: 'API Gateway', status: 'online' },
      { name: 'Webhook Handler', status: 'online' },
      { name: 'Data Sync', status: 'degraded' },
    ],
  },
  qa: {
    name: 'Testing & QA Bot',
    type: 'testing',
    endpoints: [
      { name: 'Test Runner', status: 'online' },
      { name: 'Coverage', status: 'online' },
      { name: 'Security Scan', status: 'offline' },
    ],
  },
};

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if agent exists
    if (!AGENT_STATUS[id]) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get process status (example using pm2)
    let status = 'offline';
    let uptime = '0%';
    
    try {
      // Try to get process info using pm2
      const { stdout } = await execAsync(`pm2 jlist | grep -i ${id}`);
      const processes = JSON.parse(`[${stdout}]`);
      
      if (processes && processes.length > 0) {
        const process = processes.find(p => p.name.includes(id));
        if (process) {
          status = process.pm2_env.status;
          uptime = process.pm2_env.pm_uptime 
            ? `${Math.round((Date.now() - process.pm2_env.pm_uptime) / 3600000)}h` 
            : 'N/A';
        }
      }
    } catch (error) {
      console.error(`Error checking process status for ${id}:`, error);
      // Fallback to mock data if pm2 check fails
      const allOnline = AGENT_STATUS[id].endpoints.every(e => e.status === 'online');
      const anyOffline = AGENT_STATUS[id].endpoints.some(e => e.status === 'offline');
      
      status = allOnline ? 'online' : anyOffline ? 'offline' : 'degraded';
      uptime = '100%';
    }

    // Get system metrics
    let metrics = {};
    try {
      const { stdout: memInfo } = await execAsync('free -m');
      const { stdout: cpuInfo } = await execAsync('top -bn1 | grep "Cpu(s)"');
      
      // Parse memory info
      const memLine = memInfo.split('\n')[1];
      const memValues = memLine.split(/\s+/).filter(Boolean);
      
      // Parse CPU usage
      const cpuMatch = cpuInfo.match(/(\d+\.\d+)%?\s+us/);
      
      metrics = {
        memory: {
          total: memValues[1],
          used: memValues[2],
          free: memValues[3],
          unit: 'MB',
        },
        cpu: cpuMatch ? parseFloat(cpuMatch[1]) : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting system metrics:', error);
      metrics = { error: 'Failed to get system metrics' };
    }

    // Prepare response
    const response = {
      id,
      name: AGENT_STATUS[id].name,
      type: AGENT_STATUS[id].type,
      status,
      uptime,
      lastChecked: new Date().toISOString(),
      endpoints: AGENT_STATUS[id].endpoints,
      metrics,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error in agent status check for ${id}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
