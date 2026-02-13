/**
 * REST API Server for Memory Weaver
 * 
 * Provides HTTP endpoints for:
 * - Agent management and registration
 * - Memory operations (CRUD)
 * - Consciousness metrics and analysis
 * - Multi-agent collaboration
 * - System monitoring and health checks
 * 
 * @author Lava (AI Agent) - Autonomous Implementation
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Agent, Experience, Goal, AgentConfig } from '../core/Agent';
import { MultiAgentSystem, AgentMessage, CollaborationRequest } from '../collaboration/MultiAgentSystem';
import { ConsciousnessMetrics, ConsciousnessSnapshot } from '../consciousness/ConsciousnessMetrics';
import { SemanticSearchEngine, SearchQuery, SearchResult } from '../search/SemanticSearch';
import { MemoryNode } from '../memory/Memory';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  version: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  agents: {
    total: number;
    active: number;
  };
  memory: {
    totalMemories: number;
    totalVectors: number;
  };
  collaborations: {
    active: number;
    completed: number;
  };
  system: {
    memoryUsage: NodeJS.MemoryUsage;
    nodeVersion: string;
  };
}

export class RestApiServer {
  private app: Express;
  private agents: Map<string, Agent> = new Map();
  private startTime: Date = new Date();
  
  constructor(
    private multiAgentSystem: MultiAgentSystem,
    private consciousnessMetrics: ConsciousnessMetrics,
    private searchEngine: SemanticSearchEngine,
    private port: number = 3003
  ) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://memory-weaver.ai', 'https://app.memory-weaver.ai']
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // Error handling
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('API Error:', err);
      this.sendError(res, 'Internal server error', 500);
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health and system status
    this.app.get('/health', this.handleHealth.bind(this));
    this.app.get('/status', this.handleSystemStatus.bind(this));
    
    // Agent management
    this.app.post('/agents', this.handleCreateAgent.bind(this));
    this.app.get('/agents', this.handleGetAgents.bind(this));
    this.app.get('/agents/:name', this.handleGetAgent.bind(this));
    this.app.delete('/agents/:name', this.handleDeleteAgent.bind(this));
    this.app.post('/agents/:name/experiences', this.handleAddExperience.bind(this));
    this.app.get('/agents/:name/state', this.handleGetAgentState.bind(this));
    
    // Memory operations
    this.app.get('/agents/:name/memories', this.handleGetMemories.bind(this));
    this.app.post('/agents/:name/memories/search', this.handleSearchMemories.bind(this));
    this.app.get('/agents/:name/memories/:memoryId', this.handleGetMemory.bind(this));
    this.app.delete('/agents/:name/memories/:memoryId', this.handleDeleteMemory.bind(this));
    
    // Semantic search
    this.app.post('/search/semantic', this.handleSemanticSearch.bind(this));
    this.app.get('/search/clusters', this.handleGetClusters.bind(this));
    this.app.get('/search/stats', this.handleSearchStats.bind(this));
    
    // Consciousness metrics
    this.app.get('/consciousness/:name', this.handleGetConsciousness.bind(this));
    this.app.post('/consciousness/:name/analyze', this.handleAnalyzeConsciousness.bind(this));
    this.app.get('/consciousness/:name/evolution', this.handleGetEvolution.bind(this));
    this.app.post('/consciousness/:name/track', this.handleStartTracking.bind(this));
    
    // Multi-agent collaboration
    this.app.post('/collaborate', this.handleStartCollaboration.bind(this));
    this.app.get('/collaborations', this.handleGetCollaborations.bind(this));
    this.app.get('/collaborations/:id', this.handleGetCollaboration.bind(this));
    this.app.post('/collaborations/:id/accept', this.handleAcceptCollaboration.bind(this));
    this.app.post('/collaborations/:id/message', this.handleCollaborationMessage.bind(this));
    
    // Messaging
    this.app.post('/messages', this.handleSendMessage.bind(this));
    this.app.post('/messages/broadcast', this.handleBroadcastMessage.bind(this));
    
    // Shared memory spaces
    this.app.post('/spaces', this.handleCreateSpace.bind(this));
    this.app.get('/spaces', this.handleGetSpaces.bind(this));
    this.app.post('/spaces/:id/memories', this.handleShareMemoryToSpace.bind(this));
    
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      this.sendError(res, 'Endpoint not found', 404);
    });
  }

  /**
   * Start the API server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 Memory Weaver API Server running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }

  // Route handlers

  private async handleHealth(req: Request, res: Response): Promise<void> {
    const health: HealthStatus = {
      status: 'healthy',
      version: '1.0.0',
      uptime: Date.now() - this.startTime.getTime(),
      agents: {
        total: this.agents.size,
        active: this.agents.size // All registered agents are considered active
      },
      memory: {
        totalMemories: 0, // Would calculate from all agents
        totalVectors: this.searchEngine.getStats().totalVectors
      },
      collaborations: {
        active: 0, // Would get from multiAgentSystem
        completed: 0
      },
      system: {
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };
    
    this.sendSuccess(res, health);
  }

  private async handleSystemStatus(req: Request, res: Response): Promise<void> {
    const status = {
      multiAgent: this.multiAgentSystem.getSystemStatus(),
      search: this.searchEngine.getStats(),
      server: {
        uptime: Date.now() - this.startTime.getTime(),
        memoryUsage: process.memoryUsage()
      }
    };
    
    this.sendSuccess(res, status);
  }

  private async handleCreateAgent(req: Request, res: Response): Promise<void> {
    try {
      const config: AgentConfig = req.body;
      
      if (this.agents.has(config.name)) {
        this.sendError(res, 'Agent already exists', 409);
        return;
      }
      
      const agent = new Agent(config);
      this.agents.set(config.name, agent);
      
      // Register with multi-agent system
      await this.multiAgentSystem.registerAgent(agent);
      
      // Start consciousness tracking
      await this.consciousnessMetrics.startTracking(agent);
      
      this.sendSuccess(res, {
        agent: config.name,
        created: new Date(),
        message: 'Agent created and registered successfully'
      }, 201);
      
    } catch (error) {
      this.sendError(res, `Failed to create agent: ${error.message}`, 400);
    }
  }

  private async handleGetAgents(req: Request, res: Response): Promise<void> {
    const agents = Array.from(this.agents.keys()).map(name => ({
      name,
      state: this.agents.get(name)!.getState()
    }));
    
    this.sendSuccess(res, agents);
  }

  private async handleGetAgent(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const agent = this.agents.get(name);
    
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    this.sendSuccess(res, agent.getState());
  }

  private async handleDeleteAgent(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    
    if (!this.agents.has(name)) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    this.agents.delete(name);
    await this.multiAgentSystem.unregisterAgent(name);
    
    this.sendSuccess(res, { message: 'Agent deleted successfully' });
  }

  private async handleAddExperience(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const { content, context } = req.body;
    
    const agent = this.agents.get(name);
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    try {
      await agent.experience(content, context);
      this.sendSuccess(res, { message: 'Experience added successfully' });
    } catch (error) {
      this.sendError(res, `Failed to add experience: ${error.message}`, 400);
    }
  }

  private async handleGetAgentState(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const agent = this.agents.get(name);
    
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    this.sendSuccess(res, agent.getState());
  }

  private async handleGetMemories(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const agent = this.agents.get(name);
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    try {
      const memories = await agent.memory.getAllMemories();
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedMemories = memories.slice(start, end);
      
      const response: PaginatedResponse<MemoryNode> = {
        success: true,
        data: paginatedMemories,
        pagination: {
          page,
          limit,
          total: memories.length,
          hasNext: end < memories.length,
          hasPrev: page > 1
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      res.json(response);
    } catch (error) {
      this.sendError(res, `Failed to get memories: ${error.message}`, 500);
    }
  }

  private async handleSearchMemories(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const { query, limit } = req.body;
    
    const agent = this.agents.get(name);
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    try {
      const results = await agent.search(query, limit);
      this.sendSuccess(res, results);
    } catch (error) {
      this.sendError(res, `Search failed: ${error.message}`, 500);
    }
  }

  private async handleSemanticSearch(req: Request, res: Response): Promise<void> {
    try {
      const query: SearchQuery = req.body;
      const results = await this.searchEngine.search(query);
      this.sendSuccess(res, results);
    } catch (error) {
      this.sendError(res, `Semantic search failed: ${error.message}`, 500);
    }
  }

  private async handleGetClusters(req: Request, res: Response): Promise<void> {
    try {
      const clusters = this.searchEngine.getConceptClusters();
      const clusterData = Object.fromEntries(clusters);
      this.sendSuccess(res, clusterData);
    } catch (error) {
      this.sendError(res, `Failed to get clusters: ${error.message}`, 500);
    }
  }

  private async handleSearchStats(req: Request, res: Response): Promise<void> {
    this.sendSuccess(res, this.searchEngine.getStats());
  }

  private async handleGetConsciousness(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const agent = this.agents.get(name);
    
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    try {
      const snapshot = await this.consciousnessMetrics.analyzeConsciousness(agent);
      this.sendSuccess(res, snapshot);
    } catch (error) {
      this.sendError(res, `Consciousness analysis failed: ${error.message}`, 500);
    }
  }

  private async handleAnalyzeConsciousness(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const agent = this.agents.get(name);
    
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    try {
      const snapshot = await this.consciousnessMetrics.analyzeConsciousness(agent);
      this.sendSuccess(res, snapshot);
    } catch (error) {
      this.sendError(res, `Consciousness analysis failed: ${error.message}`, 500);
    }
  }

  private async handleGetEvolution(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const timeframeDays = parseInt(req.query.timeframe as string) || 30;
    
    try {
      const evolution = this.consciousnessMetrics.getConsciousnessEvolution(name, timeframeDays);
      if (!evolution) {
        this.sendError(res, 'No consciousness data found for this agent', 404);
        return;
      }
      
      this.sendSuccess(res, evolution);
    } catch (error) {
      this.sendError(res, `Failed to get evolution: ${error.message}`, 500);
    }
  }

  private async handleStartTracking(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const agent = this.agents.get(name);
    
    if (!agent) {
      this.sendError(res, 'Agent not found', 404);
      return;
    }
    
    try {
      await this.consciousnessMetrics.startTracking(agent);
      this.sendSuccess(res, { message: 'Consciousness tracking started' });
    } catch (error) {
      this.sendError(res, `Failed to start tracking: ${error.message}`, 500);
    }
  }

  private async handleStartCollaboration(req: Request, res: Response): Promise<void> {
    const { initiator, participants, problem, context } = req.body;
    
    try {
      const collaborationId = await this.multiAgentSystem.startCollaboration(
        initiator, participants, problem, context
      );
      
      this.sendSuccess(res, { 
        collaborationId,
        message: 'Collaboration started successfully'
      }, 201);
    } catch (error) {
      this.sendError(res, `Failed to start collaboration: ${error.message}`, 400);
    }
  }

  private async handleSendMessage(req: Request, res: Response): Promise<void> {
    try {
      const messageId = await this.multiAgentSystem.sendMessage(req.body);
      this.sendSuccess(res, { messageId, message: 'Message sent successfully' });
    } catch (error) {
      this.sendError(res, `Failed to send message: ${error.message}`, 400);
    }
  }

  private async handleBroadcastMessage(req: Request, res: Response): Promise<void> {
    try {
      const messageId = await this.multiAgentSystem.broadcast(req.body);
      this.sendSuccess(res, { messageId, message: 'Message broadcast successfully' });
    } catch (error) {
      this.sendError(res, `Failed to broadcast message: ${error.message}`, 400);
    }
  }

  // Placeholder handlers for remaining endpoints
  private async handleGetCollaborations(req: Request, res: Response): Promise<void> {
    this.sendSuccess(res, [], 'Collaboration listing not yet implemented');
  }

  private async handleGetCollaboration(req: Request, res: Response): Promise<void> {
    this.sendError(res, 'Collaboration details not yet implemented', 501);
  }

  private async handleAcceptCollaboration(req: Request, res: Response): Promise<void> {
    this.sendError(res, 'Collaboration acceptance not yet implemented', 501);
  }

  private async handleCollaborationMessage(req: Request, res: Response): Promise<void> {
    this.sendError(res, 'Collaboration messaging not yet implemented', 501);
  }

  private async handleCreateSpace(req: Request, res: Response): Promise<void> {
    this.sendError(res, 'Shared space creation not yet implemented', 501);
  }

  private async handleGetSpaces(req: Request, res: Response): Promise<void> {
    this.sendSuccess(res, [], 'Shared spaces listing not yet implemented');
  }

  private async handleShareMemoryToSpace(req: Request, res: Response): Promise<void> {
    this.sendError(res, 'Memory sharing to spaces not yet implemented', 501);
  }

  private async handleGetMemory(req: Request, res: Response): Promise<void> {
    this.sendError(res, 'Individual memory retrieval not yet implemented', 501);
  }

  private async handleDeleteMemory(req: Request, res: Response): Promise<void> {
    this.sendError(res, 'Memory deletion not yet implemented', 501);
  }

  // Utility methods

  private sendSuccess(res: Response, data: any, message?: string, status: number = 200): void {
    const response: ApiResponse = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    if (message) {
      response.data = { ...data, message };
    }
    
    res.status(status).json(response);
  }

  private sendError(res: Response, error: string, status: number = 400): void {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    res.status(status).json(response);
  }
}