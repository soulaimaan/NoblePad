import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Play, Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// Main Dashboard Component
const NoblepadDashboard = () => {
  // State for agents and loading/error states
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Calculate and memoize dashboard stats
  const { totalAgents, activeAgents, inactiveAgents, uptimePercentage } = useMemo(() => {
    const total = agents.length;
    const active = agents.filter(a => a.status === 'Active').length;
    const inactive = total - active;
    const uptime = total > 0 ? Math.round((active / total) * 100) : 0;
    
    return { totalAgents: total, activeAgents: active, inactiveAgents: inactive, uptimePercentage: uptime };
  }, [agents]);

  // Fetch agents from API
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAgents(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setError('Failed to load agents. Using sample data instead.');
      
      // Fallback to sample data
      setAgents([
        { 
          id: 'TWITTER', 
          name: 'Twitter Marketing Bot', 
          description: 'Manages automated tweets and engagement',
          status: 'Active', 
          lastCheckIn: Date.now() - 5000,
          type: 'marketing'
        },
        { 
          id: 'TELEGRAM', 
          name: 'Telegram Community Manager', 
          description: 'Handles community engagement on Telegram',
          status: 'Inactive', 
          lastCheckIn: Date.now() - 3600000,
          type: 'community'
        },
        { 
          id: 'ANALYTICS', 
          name: 'Marketing Analytics Engine', 
          description: 'Tracks and analyzes marketing performance',
          status: 'Active', 
          lastCheckIn: Date.now() - 15000,
          type: 'analytics'
        },
        { 
          id: 'CONTENT', 
          name: 'Content Scheduler', 
          description: 'Manages content calendar and scheduling',
          status: 'Active', 
          lastCheckIn: Date.now() - 60000,
          type: 'automation'
        },
        { 
          id: 'MODERATION', 
          name: 'Community Moderation', 
          description: 'Automated moderation and spam control',
          status: 'Inactive', 
          lastCheckIn: Date.now() - 1800000,
          type: 'community'
        },
        { 
          id: 'LEADGEN', 
          name: 'Lead Generation', 
          description: 'Identifies and tracks potential leads',
          status: 'Active', 
          lastCheckIn: Date.now() - 30000,
          type: 'marketing'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    const fetchWithRetry = async () => {
      try {
        if (isMounted) setLoading(true);
        await fetchAgents();
        retryCount = 0; // Reset retry count on success
      } catch (error) {
        console.error('Error fetching agents:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying (${retryCount}/${maxRetries})...`);
          setTimeout(fetchWithRetry, retryDelay);
        } else if (isMounted) {
          setError('Failed to fetch agents after multiple attempts. Please check your connection.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial fetch
    fetchWithRetry();
    
    // Set up polling every 30 seconds with error handling
    const intervalId = setInterval(fetchWithRetry, 30000);
    
    // Clean up on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchAgents]);
  
  // Function to activate an agent with retry logic
  const activateAgent = useCallback(async (id) => {
    try {
      setLoading(true);
      setMessage(`Activating agent ${id}...`);
      
      // In a real app, you would make an API call here
      // await fetch(`/api/agents/${id}/activate`, { method: 'POST' });
      
      // For now, we'll just update the local state
      setAgents(prevAgents => 
        prevAgents.map(agent =>
          agent.id === id 
            ? { 
                ...agent, 
                status: 'Active', 
                lastCheckIn: Date.now() 
              } 
            : agent
        )
      );
      
      setMessage(`Agent ${id} activated successfully.`);
    } catch (error) {
      console.error('Error activating agent:', error);
      setMessage(`Failed to activate agent ${id}.`);
    } finally {
      setLoading(false);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, []);
  
  // Function to activate all inactive agents with retry logic
  const activateAllInactive = useCallback(async () => {
    const inactiveAgentsList = agents.filter(a => a.status === 'Inactive');
    if (inactiveAgentsList.length === 0) {
      setMessage('No inactive agents to activate.');
      return;
    }
    
    try {
      setLoading(true);
      setMessage(`Activating ${inactiveAgentsList.length} agents...`);
      
      // In a real app, you would make API calls here
      // await Promise.all(inactiveAgentsList.map(agent => 
      //   fetch(`/api/agents/${agent.id}/activate`, { method: 'POST' })
      // ));
      
      // Update local state
      setAgents(prevAgents =>
        prevAgents.map(agent =>
          agent.status === 'Inactive'
            ? { ...agent, status: 'Active', lastCheckIn: Date.now() }
            : agent
        )
      );
      
      setMessage(`Successfully activated ${inactiveAgentsList.length} agents.`);
    } catch (error) {
      console.error('Error activating agents:', error);
      setMessage('Failed to activate some agents.');
    } finally {
      setLoading(false);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, [agents]);

  // Function to format timestamp into readable time string
  const formatTimeAgo = useCallback((timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes === 0) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes}m ${seconds}s ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  }, []);
  
  // Memoize filtered agents
  const filteredAgents = useMemo(() => 
    activeFilter === 'all' 
      ? agents 
      : agents.filter(agent => agent.type === activeFilter),
    [agents, activeFilter]
  );


  // Determine the color and icon based on agent status
  const getStatusDisplay = (status) => {
    if (status === 'Active') {
      return { 
        text: 'Active', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100', 
        icon: CheckCircle,
        iconColor: 'text-green-500'
      };
    }
    return { 
      text: 'Inactive', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100', 
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    };
  };

  // Get agent type display details
  const getTypeDisplay = (type) => {
    const types = {
      marketing: { text: 'Marketing', color: 'bg-blue-100 text-blue-800' },
      community: { text: 'Community', color: 'bg-purple-100 text-purple-800' },
      analytics: { text: 'Analytics', color: 'bg-amber-100 text-amber-800' },
      automation: { text: 'Automation', color: 'bg-emerald-100 text-emerald-800' }
    };
    return types[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
  };

  // Agent Card Component
  const AgentCard = ({ agent }) => {
    const { text, color, bgColor, icon: StatusIcon, iconColor } = getStatusDisplay(agent.status);
    const typeDisplay = getTypeDisplay(agent.type);
    const isInactive = agent.status === 'Inactive';

    return (
      <div className={`p-5 rounded-xl shadow-md transition-all duration-300 ${
        isInactive ? 'border-2 border-red-200 bg-white hover:shadow-lg' : 'bg-white hover:shadow-md'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
          </div>
          <StatusIcon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeDisplay.color}`}>
            {typeDisplay.text}
          </span>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${bgColor} ${color}`}>
            {text}
          </span>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          <span>Last check-in: {formatTimeAgo(agent.lastCheckIn)}</span>
        </div>
        
        {isInactive && (
          <button
            onClick={() => activateAgent(agent.id)}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition duration-150 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>Activate {agent.name.split(' ')[0]}</span>
          </button>
        )}
      </div>
    );
  };

  // Stats card component
  const StatCard = ({ title, value, icon: Icon, trend, trendText, trendColor = 'text-green-600' }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 flex items-center text-sm ${trendColor}`}>
              {trend}
              <span className="ml-1">{trendText}</span>
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  // Remove duplicate stats calculation (already memoized above)

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="w-7 h-7 mr-3 text-blue-600" />
                Noblepad Agent Dashboard
              </h1>
              <p className="mt-2 text-gray-600">Monitor and manage your marketing automation agents</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={activateAllInactive}
                disabled={loading || inactiveAgents === 0}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all ${
                  inactiveAgents > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Activate All ({inactiveAgents})</span>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Agents" 
            value={totalAgents} 
            icon={Activity} 
          />
          <StatCard 
            title="Active" 
            value={activeAgents} 
            icon={CheckCircle} 
            trend={`+${Math.round((activeAgents / totalAgents) * 100)}%`}
            trendText="this week"
          />
          <StatCard 
            title="Inactive" 
            value={inactiveAgents} 
            icon={AlertTriangle} 
            trendColor="text-red-600"
          />
          <StatCard 
            title="System Uptime" 
            value={`${uptimePercentage}%`} 
            icon={Clock} 
          />
        </div>

        {/* System Message / Loading / Error Indicator */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 text-center">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}
        
        {loading && (
          <div className="mb-6 p-4 rounded-lg bg-blue-100 text-blue-800 text-center">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading agent data...</span>
            </div>
          </div>
        )}
        
        {message && !loading && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 text-center">
            {message}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Agents
          </button>
          {['marketing', 'community', 'analytics', 'automation'].map((type) => {
            const typeInfo = getTypeDisplay(type);
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeFilter === type 
                    ? `${typeInfo.color.replace('bg-', 'bg-opacity-20 ')} ${typeInfo.color.replace('text-', 'text-')}`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {typeInfo.text}
              </button>
            );
          })}
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.length > 0 ? (
            filteredAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="text-gray-400 mb-2">
                <svg 
                  className="mx-auto h-12 w-12" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No agents found</h3>
              <p className="mt-1 text-sm text-gray-500">There are no agents matching your current filters.</p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveFilter('all')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View all agents
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoblepadDashboard;
