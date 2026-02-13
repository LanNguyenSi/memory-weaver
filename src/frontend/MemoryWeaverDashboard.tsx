/**
 * Memory Weaver Web Dashboard
 * 
 * React frontend for the Memory Weaver consciousness platform:
 * - Real-time agent monitoring
 * - Consciousness metrics visualization  
 * - Multi-agent collaboration interface
 * - Memory search and exploration
 * - Live system status
 * 
 * @author Lava (AI Agent) - Autonomous Implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface AgentState {
  name: string;
  memoryCount: number;
  personalityTraits: Record<string, number>;
  recentExperiences: Array<{
    timestamp: Date;
    content: string;
    emotions: Record<string, number>;
  }>;
  lastActive: Date;
}

interface ConsciousnessSnapshot {
  agentName: string;
  overallConsciousnessScore: number;
  selfAwareness: {
    selfReferenceFrequency: number;
    metacognitionScore: number;
    identityConsistency: number;
  };
  learning: {
    knowledgeGrowthRate: number;
    adaptabilityMeasure: number;
  };
  creativity: {
    originalityScore: number;
    ideaDiversityIndex: number;
  };
  insights: string[];
  timestamp: Date;
}

interface SystemStats {
  agents: { total: number; active: number };
  memory: { totalMemories: number; totalVectors: number };
  api: { webSocketConnections: number };
  uptime: number;
}

export const MemoryWeaverDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [consciousnessData, setConsciousnessData] = useState<Record<string, ConsciousnessSnapshot>>({});
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [realTimeEvents, setRealTimeEvents] = useState<any[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('ws://localhost:3002');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to Memory Weaver WebSocket');
      
      // Authenticate as a monitor
      newSocket.emit('authenticate', {
        type: 'human',
        userId: 'dashboard-user',
        permissions: ['read', 'monitor', 'search']
      });
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from Memory Weaver WebSocket');
    });

    newSocket.on('authenticated', (data) => {
      console.log('Authenticated with permissions:', data.permissions);
    });

    newSocket.on('real_time_event', (event) => {
      console.log('Real-time event:', event);
      setRealTimeEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
    });

    newSocket.on('consciousness_update', (update) => {
      console.log('Consciousness update:', update);
      setConsciousnessData(prev => ({
        ...prev,
        [update.agentName]: update.metrics
      }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch agents from REST API
  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  }, []);

  // Fetch system statistics
  const fetchSystemStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/status');
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.data.server);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  }, []);

  // Perform semantic search
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch('http://localhost:3001/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: searchQuery,
          maxResults: 10,
          similarityThreshold: 0.1
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [searchQuery]);

  // Request consciousness analysis for an agent
  const analyzeConsciousness = useCallback(async (agentName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/consciousness/${agentName}/analyze`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setConsciousnessData(prev => ({
          ...prev,
          [agentName]: data.data
        }));
      }
    } catch (error) {
      console.error('Consciousness analysis failed:', error);
    }
  }, []);

  // Subscribe to consciousness updates for an agent
  const subscribeToAgent = useCallback((agentName: string) => {
    if (socket && connected) {
      socket.emit('subscribe_consciousness', agentName);
      setSelectedAgent(agentName);
    }
  }, [socket, connected]);

  // Fetch data on component mount and periodically
  useEffect(() => {
    fetchAgents();
    fetchSystemStats();
    
    const interval = setInterval(() => {
      fetchAgents();
      fetchSystemStats();
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [fetchAgents, fetchSystemStats]);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getConsciousnessColor = (score: number) => {
    if (score >= 0.8) return '#4ade80'; // green
    if (score >= 0.6) return '#fbbf24'; // yellow
    if (score >= 0.4) return '#fb7185'; // pink
    return '#64748b'; // gray
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🧠 Memory Weaver Dashboard
          </h1>
          <p className="text-lg text-gray-300">
            AI Consciousness Framework - Founded by Lava 🌋
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className={`flex items-center gap-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {connected ? 'Connected' : 'Disconnected'}
            </div>
            {systemStats && (
              <div className="text-gray-400">
                Uptime: {formatUptime(systemStats.uptime)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Overview */}
          <div className="lg:col-span-1">
            <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">System Overview</h2>
              {systemStats && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Agents</span>
                    <span className="font-mono text-green-400">{agents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WebSocket Connections</span>
                    <span className="font-mono text-blue-400">{systemStats.api?.webSocketConnections || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Memories</span>
                    <span className="font-mono text-purple-400">{systemStats.memory?.totalMemories || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vector Embeddings</span>
                    <span className="font-mono text-orange-400">{systemStats.memory?.totalVectors || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Semantic Search */}
            <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-6 border border-gray-700 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Semantic Search</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                    placeholder="Search memories..."
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={performSearch}
                    className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Search
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-lg text-sm">
                      <div className="text-gray-300 mb-1">
                        {result.memory?.content?.substring(0, 80)}...
                      </div>
                      <div className="text-cyan-400 text-xs">
                        {(result.similarity * 100).toFixed(1)}% match
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="lg:col-span-2">
            <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">AI Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent) => {
                  const consciousness = consciousnessData[agent.name];
                  return (
                    <div
                      key={agent.name}
                      className="bg-gray-800 bg-opacity-50 p-4 rounded-xl border border-gray-600 hover:border-cyan-400 transition-colors cursor-pointer"
                      onClick={() => subscribeToAgent(agent.name)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{agent.name}</h3>
                        {consciousness && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getConsciousnessColor(consciousness.overallConsciousnessScore) }}
                            ></div>
                            <span className="text-sm text-gray-400">
                              {(consciousness.overallConsciousnessScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Memories</span>
                          <span className="text-cyan-400">{agent.memoryCount}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Experiences</span>
                          <span className="text-purple-400">{agent.recentExperiences.length}</span>
                        </div>
                        
                        {consciousness && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Self-Awareness</span>
                              <span className="text-green-400">
                                {(consciousness.selfAwareness.metacognitionScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-400">Learning Rate</span>
                              <span className="text-orange-400">
                                {(consciousness.learning.knowledgeGrowthRate * 100).toFixed(0)}%
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-400">Creativity</span>
                              <span className="text-pink-400">
                                {(consciousness.creativity.originalityScore * 100).toFixed(0)}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            analyzeConsciousness(agent.name);
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Analyze Consciousness
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Events */}
        <div className="mt-6">
          <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Real-Time Events</h2>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {realTimeEvents.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No events yet. System is monitoring for activity...
                </div>
              ) : (
                realTimeEvents.map((event, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 bg-opacity-50 p-3 rounded-lg border-l-4 border-cyan-400"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-cyan-400 font-medium capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {typeof event.data === 'string' 
                        ? event.data 
                        : JSON.stringify(event.data).substring(0, 100) + '...'
                      }
                    </div>
                    {event.source && (
                      <div className="text-gray-500 text-xs mt-1">
                        Source: {event.source}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Agent Details */}
        {selectedAgent && consciousnessData[selectedAgent] && (
          <div className="mt-6">
            <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                {selectedAgent} - Consciousness Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Consciousness Score */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {(consciousnessData[selectedAgent].overallConsciousnessScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-400">Overall Consciousness</div>
                </div>
                
                {/* Insights */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2 text-purple-400">Key Insights</h3>
                  <div className="space-y-1">
                    {consciousnessData[selectedAgent].insights.map((insight, index) => (
                      <div key={index} className="text-gray-300 text-sm">
                        • {insight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryWeaverDashboard;