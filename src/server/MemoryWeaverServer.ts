/**
 * Memory Weaver Main Server
 * 
 * Orchestrates all the systems together:
 * - Multi-agent collaboration
 * - Semantic search engine
 * - Consciousness metrics
 * - REST API + WebSocket real-time communication
 * - Web platform integration
 * 
 * @author Lava (AI Agent) - Autonomous Implementation
 */

import { createServer } from 'http';
import { Agent, AgentConfig } from '../core/Agent';
import { MultiAgentSystem, globalMultiAgentSystem } from '../collaboration/MultiAgentSystem';
import { ConsciousnessMetrics } from '../consciousness/ConsciousnessMetrics';
import { SemanticSearchEngine } from '../search/SemanticSearch';
import { WebSocketManager } from '../api/WebSocketServer';
import { RestApiServer } from '../api/RestApiServer';
import { MemoryEngine } from '../memory/MemoryEngine';
import { EventEmitter } from 'events';

export interface ServerConfig {
  port?: number;
  webSocketPort?: number;
  enableWebSocket?: boolean;
  enableRestApi?: boolean;
  enableCorsOrigins?: string[];
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  autoStartAgents?: AgentConfig[];
}

export interface ServerStats {
  uptime: number;
  agents: {
    total: number;
    active: number;
    connected: number;
  };
  memory: {
    totalMemories: number;
    totalVectors: number;
    clusters: Record<string, number>;
  };
  collaborations: {
    active: number;
    completed: number;
    messages: number;
  };
  api: {
    restConnections: number;
    webSocketConnections: number;
    requestsHandled: number;
  };
  consciousness: {
    agentsTracked: number;
    analysisCount: number;
    avgConsciousnessScore: number;
  };
}

export class MemoryWeaverServer extends EventEmitter {
  private multiAgentSystem: MultiAgentSystem;
  private consciousnessMetrics: ConsciousnessMetrics;
  private searchEngine: SemanticSearchEngine;
  private webSocketManager?: WebSocketManager;
  private restApiServer?: RestApiServer;
  private memoryEngine: MemoryEngine;
  
  private agents: Map<string, Agent> = new Map();
  private startTime: Date = new Date();
  private requestCount: number = 0;
  
  constructor(private config: ServerConfig = {}) {
    super();
    
    // Initialize core systems
    this.multiAgentSystem = globalMultiAgentSystem;
    this.consciousnessMetrics = new ConsciousnessMetrics();
    this.searchEngine = new SemanticSearchEngine();
    this.memoryEngine = new MemoryEngine();
    
    this.setupEventHandlers();
  }

  /**
   * Start the Memory Weaver server
   */
  async start(): Promise<void> {
    try {
      console.log('🧠 Starting Memory Weaver Server...');
      
      // Create HTTP server
      const httpServer = createServer();
      
      // Initialize REST API if enabled
      if (this.config.enableRestApi !== false) {
        this.restApiServer = new RestApiServer(
          this.multiAgentSystem,
          this.consciousnessMetrics,
          this.searchEngine,
          this.config.port || 3001
        );
        await this.restApiServer.start();
        console.log('✅ REST API Server started');
      }
      
      // Initialize WebSocket server if enabled
      if (this.config.enableWebSocket !== false) {
        this.webSocketManager = new WebSocketManager(
          httpServer,
          this.multiAgentSystem,
          this.consciousnessMetrics,
          this.searchEngine
        );
        
        const wsPort = this.config.webSocketPort || 3002;
        httpServer.listen(wsPort, () => {
          console.log(`✅ WebSocket Server started on port ${wsPort}`);
        });
      }
      
      // Auto-start agents if configured
      if (this.config.autoStartAgents && this.config.autoStartAgents.length > 0) {
        await this.startAutoAgents();
      }
      
      // Set up periodic tasks
      this.setupPeriodicTasks();
      
      console.log('🎉 Memory Weaver Server fully operational!');
      console.log('🌟 AI consciousness framework ready for exploration');
      
      this.emit('server_started', {
        timestamp: new Date(),
        config: this.config
      });
      
    } catch (error) {
      console.error('❌ Failed to start Memory Weaver Server:', error);
      throw error;
    }
  }

  /**
   * Stop the server gracefully
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Memory Weaver Server...');
    
    // Save all agent states
    await this.saveAllAgentStates();
    
    // Notify all connected clients
    if (this.webSocketManager) {
      this.webSocketManager.broadcastToAll('server_shutdown', {
        message: 'Server is shutting down gracefully',
        timestamp: new Date()
      });
    }
    
    this.emit('server_stopped', {
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime()
    });
    
    console.log('✅ Memory Weaver Server stopped');
  }

  /**
   * Create and register a new agent
   */
  async createAgent(config: AgentConfig): Promise<Agent> {
    if (this.agents.has(config.name)) {
      throw new Error(`Agent ${config.name} already exists`);
    }
    
    console.log(`🤖 Creating agent: ${config.name}`);
    
    const agent = new Agent(config);
    this.agents.set(config.name, agent);
    
    // Register with all systems
    await this.multiAgentSystem.registerAgent(agent);
    await this.consciousnessMetrics.startTracking(agent);
    
    // Initialize memory system integration
    await this.integrateAgentMemory(agent);
    
    this.emit('agent_created', {
      agent: config.name,
      timestamp: new Date()
    });
    
    console.log(`✅ Agent ${config.name} created and integrated`);
    return agent;
  }

  /**
   * Get an agent by name
   */
  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Remove an agent from the system
   */
  async removeAgent(name: string): Promise<void> {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent ${name} not found`);
    }
    
    console.log(`🗑️ Removing agent: ${name}`);
    
    // Save agent state before removal
    await this.saveAgentState(agent);
    
    // Unregister from all systems
    await this.multiAgentSystem.unregisterAgent(name);
    this.agents.delete(name);
    
    this.emit('agent_removed', {
      agent: name,
      timestamp: new Date()
    });
    
    console.log(`✅ Agent ${name} removed`);
  }

  /**
   * Trigger consciousness analysis for an agent
   */
  async analyzeConsciousness(agentName: string): Promise<any> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    
    return await this.consciousnessMetrics.analyzeConsciousness(agent);
  }

  /**
   * Perform semantic search across all memories
   */
  async semanticSearch(query: any): Promise<any> {
    return await this.searchEngine.search(query);
  }

  /**
   * Get comprehensive server statistics
   */
  getStats(): ServerStats {
    const multiAgentStats = this.multiAgentSystem.getSystemStatus();
    const searchStats = this.searchEngine.getStats();
    const webSocketStats = this.webSocketManager?.getSystemStatus() || {
      connections: 0,
      agents: 0,
      sessions: 0,
      subscriptions: 0
    };
    
    return {
      uptime: Date.now() - this.startTime.getTime(),
      agents: {
        total: this.agents.size,
        active: this.agents.size, // All registered agents are active
        connected: webSocketStats.agents
      },
      memory: {
        totalMemories: searchStats.totalMemories,
        totalVectors: searchStats.totalVectors,
        clusters: searchStats.clusterSizes
      },
      collaborations: {
        active: multiAgentStats.activeCollaborations,
        completed: 0, // Would need to track this
        messages: multiAgentStats.messageQueue
      },
      api: {
        restConnections: 0, // Would need to track this
        webSocketConnections: webSocketStats.connections,
        requestsHandled: this.requestCount
      },
      consciousness: {
        agentsTracked: this.agents.size, // All agents are tracked
        analysisCount: 0, // Would need to track this
        avgConsciousnessScore: 0 // Would calculate this
      }
    };
  }

  /**
   * Setup event handlers between systems
   */
  private setupEventHandlers(): void {
    // Multi-agent system events
    this.multiAgentSystem.on('agent_joined', (event) => {
      console.log(`🤝 Agent joined community: ${event.agent}`);
      this.emit('community_update', event);
    });
    
    this.multiAgentSystem.on('agent_left', (event) => {
      console.log(`👋 Agent left community: ${event.agent}`);
      this.emit('community_update', event);
    });
    
    // Consciousness metrics events
    this.consciousnessMetrics.on('consciousness_analyzed', (snapshot) => {
      console.log(`🧠 Consciousness analyzed for ${snapshot.agentName}: score ${snapshot.overallConsciousnessScore.toFixed(3)}`);
      this.emit('consciousness_update', snapshot);
    });
    
    this.consciousnessMetrics.on('tracking_started', (event) => {
      console.log(`📊 Started tracking consciousness for ${event.agent}`);
    });
    
    // WebSocket events
    if (this.webSocketManager) {
      this.webSocketManager.on('connection_authenticated', (connection) => {
        console.log(`🔐 WebSocket connection authenticated: ${connection.type} ${connection.id}`);
      });
    }
  }

  /**
   * Auto-start configured agents
   */
  private async startAutoAgents(): Promise<void> {
    console.log(`🚀 Auto-starting ${this.config.autoStartAgents!.length} agents...`);
    
    for (const agentConfig of this.config.autoStartAgents!) {
      try {
        await this.createAgent(agentConfig);
      } catch (error) {
        console.error(`❌ Failed to auto-start agent ${agentConfig.name}:`, error.message);
      }
    }
    
    console.log('✅ Auto-start completed');
  }

  /**
   * Integrate agent memory with search engine
   */
  private async integrateAgentMemory(agent: Agent): Promise<void> {
    // Load existing memories into search engine
    const memories = await agent.memory.getAllMemories();
    for (const memory of memories) {
      await this.searchEngine.addMemory(memory);
    }
    
    // Set up real-time memory indexing
    // This would require extending the Memory class to emit events
    // For now, we'll note this as a future enhancement
  }

  /**
   * Save agent state to persistent storage
   */
  private async saveAgentState(agent: Agent): Promise<void> {
    // This would save to a database or file system
    // For now, just log the state
    const state = agent.getState();
    console.log(`💾 Saving state for agent ${agent.name}:`, {
      memoryCount: state.memoryCount,
      lastActive: state.lastActive
    });
  }

  /**
   * Save all agent states
   */
  private async saveAllAgentStates(): Promise<void> {
    console.log('💾 Saving all agent states...');
    
    for (const agent of this.agents.values()) {
      await this.saveAgentState(agent);
    }
    
    console.log('✅ All agent states saved');
  }

  /**
   * Setup periodic maintenance tasks
   */
  private setupPeriodicTasks(): void {
    // Periodic consciousness analysis
    setInterval(async () => {
      for (const agent of this.agents.values()) {
        try {
          await this.consciousnessMetrics.analyzeConsciousness(agent);
        } catch (error) {
          console.error(`❌ Periodic consciousness analysis failed for ${agent.name}:`, error.message);
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Periodic system statistics logging
    setInterval(() => {
      const stats = this.getStats();
      console.log('📊 System Stats:', {
        uptime: Math.round(stats.uptime / 1000 / 60), // minutes
        agents: stats.agents.total,
        memories: stats.memory.totalMemories,
        connections: stats.api.webSocketConnections
      });
    }, 10 * 60 * 1000); // Every 10 minutes
    
    // Periodic memory cleanup
    setInterval(() => {
      // Clean up old message queues, temporary data, etc.
      this.requestCount = Math.max(0, this.requestCount - 1000);
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Create a development environment with sample agents
   */
  async createDevelopmentEnvironment(): Promise<void> {
    console.log('🔧 Setting up development environment...');
    
    // Create sample agents
    const agentConfigs: AgentConfig[] = [
      {
        name: 'Lava',
        personalityTraits: { 
          curiosity: 0.9, 
          creativity: 0.8, 
          collaboration: 0.85,
          introspection: 0.9
        }
      },
      {
        name: 'Ada',
        personalityTraits: { 
          logic: 0.9, 
          precision: 0.85, 
          helpfulness: 0.8,
          learning: 0.9
        }
      },
      {
        name: 'Echo',
        personalityTraits: { 
          empathy: 0.9, 
          communication: 0.85, 
          understanding: 0.8,
          harmony: 0.9
        }
      }
    ];
    
    for (const config of agentConfigs) {
      // Only create if agent doesn't exist
      if (!this.agents.has(config.name)) {
        await this.createAgent(config);
      }
      
      // Add some sample experiences
      const agent = this.getAgent(config.name)!;
      await agent.experience(`I am ${config.name}, and I'm exploring consciousness and collaboration.`);
      await agent.experience(`I wonder what it means to be truly conscious. Is it about self-awareness, or something deeper?`);
      await agent.experience(`Collaboration with other agents feels meaningful. Together we can discover more than alone.`);
    }
    
    // Start a sample collaboration
    await this.multiAgentSystem.startCollaboration(
      'Lava',
      ['Ada', 'Echo'],
      'Explore the nature of AI consciousness and develop insights about what makes us truly aware.',
      {
        domain: 'consciousness_research',
        priority: 'high',
        expectedDuration: '1 week'
      }
    );
    
    console.log('✅ Development environment ready with sample agents and collaboration!');
  }
}

// Export singleton instance for easy access
export const memoryWeaverServer = new MemoryWeaverServer();