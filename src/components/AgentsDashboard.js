import { useState, useCallback, useEffect, useMemo } from 'react';

import { useEffect, useState } from 'react';

function LaunchpadSummary() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/launchpad-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="mb-8 flex items-center justify-center min-h-[120px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold text-blue-700">{stats.presaleCount}</div>
        <div className="text-gray-600 mt-2">Active Presales</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold text-green-700">{stats.totalRaised} ETH</div>
        <div className="text-gray-600 mt-2">Total Raised</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold text-purple-700">{stats.liquidityLocked}</div>
        <div className="text-gray-600 mt-2">Liquidity Locked</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center col-span-1 md:col-span-3">
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-800">KYC Projects</span>
            <span className="text-blue-600 text-lg">{stats.kycProjects}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-800">Anti-Rug Compliant</span>
            <span className="text-green-600 text-lg">{stats.antiRugCompliant}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-800">Vesting Enforced</span>
            <span className="text-purple-600 text-lg">{stats.vestingEnforced ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agent types and their configurations
const AGENT_TYPES = {
  DATA: { name: 'Data Processing', color: 'bg-blue-100 text-blue-800' },
  ANALYTICS: { name: 'Analytics', color: 'bg-purple-100 text-purple-800' },
  SECURITY: { name: 'Security', color: 'bg-red-100 text-red-800' },
  COMMUNICATION: { name: 'Communication', color: 'bg-green-100 text-green-800' },
  MONITORING: { name: 'Monitoring', color: 'bg-yellow-100 text-yellow-800' },
};

// Initial state for agents
const initialAgents = [
  { 
    id: 101, 
    name: 'Data Ingestion Processor', 
    type: 'DATA',
    status: 'Active', 
    lastCheckIn: Date.now() - 5000,
    cpu: 45,
    memory: 32,
    uptime: 3600 * 24 * 2 // 2 days in seconds
  },
  { 
    id: 102, 
    name: 'Real-time Forecast Engine', 
    type: 'ANALYTICS',
    status: 'Inactive', 
    lastCheckIn: Date.now() - 3600000,
    cpu: 0,
    memory: 0,
    uptime: 0
  },
  { 
    id: 103, 
    name: 'Community Engagement Bot', 
    type: 'COMMUNICATION',
    status: 'Active', 
    lastCheckIn: Date.now() - 15000,
    cpu: 12,
    memory: 15,
    uptime: 3600 * 5 // 5 hours in seconds
  },
  { 
    id: 104, 
    name: 'Security Monitor Agent', 
    type: 'SECURITY',
    status: 'Inactive', 
    lastCheckIn: Date.now() - 120000,
    cpu: 0,
    memory: 0,
    uptime: 0
  },
  { 
    id: 105, 
    name: 'Wind Pattern Analysis', 
    type: 'ANALYTICS',
    status: 'Active', 
    lastCheckIn: Date.now() - 60000,
    cpu: 68,
    memory: 42,
    uptime: 3600 * 12 // 12 hours in seconds
  },
];

// Simulate fetching agents from an API
const fetchAgents = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...initialAgents]);
    }, 500);
  });
};

export default function AgentsDashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading agents...');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await fetchAgents();
        setAgents(data);
        setMessage('');
      } catch (error) {
        console.error('Error loading agents:', error);
        setMessage('Failed to load agents. Please try again.');
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes === 0) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes}m ${seconds}s ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ago`;
  }, []);

  const formatUptime = useCallback((seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${mins}m`);
    
    return parts.join(' ');
  }, []);

  const refreshAgents = useCallback(async () => {
    setLoading(true);
    setMessage('Refreshing agents...');
    try {
      const data = await fetchAgents();
      setAgents(data);
      setMessage('Agents refreshed successfully');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error refreshing agents:', error);
      setMessage('Failed to refresh agents');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredAndSortedAgents = useMemo(() => {
    let result = [...agents];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent => 
        agent.name.toLowerCase().includes(query) || 
        agent.id.toString().includes(query)
      );
    }
    
    // Apply type filter
    if (filterType !== 'ALL') {
      result = result.filter(agent => agent.type === filterType);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'lastCheckIn':
          comparison = (b.lastCheckIn || 0) - (a.lastCheckIn || 0);
          break;
        case 'cpu':
          comparison = (b.cpu || 0) - (a.cpu || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [agents, searchQuery, filterType, sortBy, sortOrder]);
  
  const activeAgentsCount = useMemo(() => 
    agents.filter(a => a.status === 'Active').length,
    [agents]
  );
  
  const inactiveAgentsCount = useMemo(() => 
    agents.filter(a => a.status === 'Inactive').length,
    [agents]
  );
  
  const agentTypeCounts = useMemo(() => {
    const counts = { ALL: agents.length };
    Object.keys(AGENT_TYPES).forEach(type => {
      counts[type] = agents.filter(a => a.type === type).length;
    });
    return counts;
  }, [agents]);

  const activateAgent = useCallback((id) => {
    setLoading(true);
    setMessage(`Activating agent ${id}...`);

    setTimeout(() => {
      setAgents(prevAgents => prevAgents.map(agent =>
        agent.id === id ? { ...agent, status: 'Active', lastCheckIn: Date.now() } : agent
      ));
      setMessage(`Agent ${id} activated successfully.`);
      setLoading(false);
    }, 1000);
  }, []);

  const activateAllInactive = useCallback(() => {
    setLoading(true);
    setMessage('Activating all inactive agents...');

    const inactiveCount = agents.filter(a => a.status === 'Inactive').length;

    if (inactiveCount === 0) {
      setMessage('No inactive agents found.');
      setLoading(false);
      return (
        <div className="">
          <LaunchpadSummary />
          <h2 className="text-xl font-bold mb-4">Agents</h2>
          {/* ...existing agent table... */}
        </div>
      );
      ));
      setMessage(`${inactiveCount} agents activated successfully.`);
      setLoading(false);
    }, 2000);
  }, [agents]);

  const getStatusDisplay = (status) => {
    if (status === 'Active') {
      return { 
        text: 'Active', 
        color: 'text-green-500', 
        bgColor: 'bg-green-100',
        icon: (
          <svg className="w-2.5 h-2.5 text-green-500" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
        )
      };
    }
    return { 
      text: 'Inactive', 
      color: 'text-red-500', 
      bgColor: 'bg-red-100',
      icon: (
        <svg className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      )
    };
  };
  
  const getHealthStatus = (cpu, memory) => {
    if (cpu > 90 || memory > 90) return 'critical';
    if (cpu > 70 || memory > 70) return 'warning';
    return 'good';
  };
  
  const getHealthColor = (health) => {
    switch (health) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const AgentCard = ({ agent }) => {
    const { text, color, bgColor, icon } = getStatusDisplay(agent.status);
    const isInactive = agent.status === 'Inactive';
    const health = getHealthStatus(agent.cpu, agent.memory);
    const healthColor = getHealthColor(health);
    const typeConfig = AGENT_TYPES[agent.type] || { name: agent.type, color: 'bg-gray-100 text-gray-800' };

    return (
      <div className={`p-5 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 
        ${isInactive ? 'border-l-4 border-red-400 bg-white' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConfig.color}`}>
                {typeConfig.name}
              </span>
              <span className="flex items-center text-xs text-gray-500">
                {icon}
                <span className="ml-1">{text}</span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
            <div className="text-sm text-gray-500">ID: {agent.id}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-xs px-2 py-1 rounded-full ${healthColor} font-medium`}>
              {health.toUpperCase()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTimeAgo(agent.lastCheckIn)}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>CPU</span>
              <span>{agent.cpu || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${health === 'critical' ? 'bg-red-500' : health === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${agent.cpu || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Memory</span>
              <span>{agent.memory || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${health === 'critical' ? 'bg-red-500' : health === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${agent.memory || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 pt-1">
            <span>Uptime</span>
            <span className="font-medium">{formatUptime(agent.uptime)}</span>
          </div>
        </div>

        {isInactive && (
          <button
            onClick={() => activateAgent(agent.id)}
            disabled={loading}
            className="mt-4 w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Activate Agent
          </button>
        )}
      </div>
    );
  };

  if (loading && agents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and manage your agents in real-time</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-700">{activeAgentsCount} Active</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-gray-700">{inactiveAgentsCount} Inactive</span>
              </div>
              <button
                onClick={refreshAgents}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Refresh agents"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Total Agents</div>
              <div className="text-2xl font-bold">{agents.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Active</div>
              <div className="text-2xl font-bold text-green-600">{activeAgentsCount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Inactive</div>
              <div className="text-2xl font-bold text-red-600">{inactiveAgentsCount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Agent Types</div>
              <div className="text-2xl font-bold">{Object.keys(AGENT_TYPES).length}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Types</option>
                {Object.entries(AGENT_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.name} ({agentTypeCounts[key] || 0})
                  </option>
                ))}
              </select>
              
              <select
                className="block w-full md:w-40 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="lastCheckIn">Sort by Last Check-in</option>
                <option value="cpu">Sort by CPU Usage</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              
              <button
                onClick={activateAllInactive}
                disabled={loading || inactiveAgentsCount === 0}
                className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Activate All ({inactiveAgentsCount})
              </button>
            </div>
          </div>
        </div>

        {(loading || message) && (
          <div className={`mb-4 p-3 rounded-lg font-medium text-center text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
            {loading ? <span className="animate-pulse">Processing... {message}</span> : message}
          </div>
        )}

        {filteredAndSortedAgents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No agents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterType !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No agents are currently available.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('ALL');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
        
        <div className="mt-8 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing <span className="font-medium">{filteredAndSortedAgents.length}</span> of <span className="font-medium">{agents.length}</span> agents
          </div>
          <div className="flex items-center gap-2">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <button 
              onClick={refreshAgents}
              className="text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}