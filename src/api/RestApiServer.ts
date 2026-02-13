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
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class RestApiServer {
  private app: Express;
  private agents: Map<string, Agent> = new Map();
  private multiAgentSystem: MultiAgentSystem;
  private consciousnessMetrics: ConsciousnessMetrics;
  private semanticSearch: SemanticSearchEngine;
  
  constructor() {
    this.app = express();
    this.multiAgentSystem = new MultiAgentSystem();
    this.consciousnessMetrics = new ConsciousnessMetrics();
    this.semanticSearch = new SemanticSearchEngine();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  // Helper method to safely extract string from params
  private getStringParam(param: string | string[]): string {
    return Array.isArray(param) ? param[0] : param;
  }

  // Helper method to handle errors safely
  private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private setupMiddleware(): void {
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', this.handleHealthCheck.bind(this));
    
    // API documentation
    this.app.get('/api', this.handleApiDocs.bind(this));
    
    // Agent management endpoints
    this.app.post('/api/agents', this.handleCreateAgent.bind(this));
    this.app.get('/api/agents', this.handleGetAgents.bind(this));
    this.app.get('/api/agents/:name', this.handleGetAgent.bind(this));
    this.app.put('/api/agents/:name', this.handleUpdateAgent.bind(this));
    this.app.delete('/api/agents/:name', this.handleDeleteAgent.bind(this));
    
    // Memory management endpoints
    this.app.post('/api/agents/:name/memories', this.handleCreateMemory.bind(this));
    this.app.get('/api/agents/:name/memories', this.handleGetMemories.bind(this));
    this.app.get('/api/agents/:name/memories/:id', this.handleGetMemory.bind(this));
    this.app.put('/api/agents/:name/memories/:id', this.handleUpdateMemory.bind(this));
    this.app.delete('/api/agents/:name/memories/:id', this.handleDeleteMemory.bind(this));
    
    // Consciousness metrics endpoints
    this.app.get('/api/agents/:name/consciousness', this.handleGetConsciousness.bind(this));
    this.app.post('/api/agents/:name/consciousness/snapshot', this.handleCreateSnapshot.bind(this));
    this.app.get('/api/agents/:name/consciousness/history', this.handleGetConsciousnessHistory.bind(this));
    
    // Multi-agent collaboration endpoints
    this.app.post('/api/collaboration/messages', this.handleSendMessage.bind(this));
    this.app.get('/api/collaboration/messages/:agentName', this.handleGetMessages.bind(this));
    this.app.post('/api/collaboration/requests', this.handleCollaborationRequest.bind(this));
    this.app.get('/api/collaboration/requests/:agentName', this.handleGetCollaborationRequests.bind(this));
    
    // Search endpoints
    this.app.post('/api/search', this.handleSearch.bind(this));
    this.app.get('/api/search/similar/:type/:id', this.handleFindSimilar.bind(this));
    
    // System endpoints
    this.app.get('/api/system/status', this.handleSystemStatus.bind(this));
    this.app.get('/api/system/metrics', this.handleSystemMetrics.bind(this));
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      this.sendError(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
    });
    
    // Global error handler
    this.app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', error);
      this.sendError(res, 'Internal server error', 500);
    });
  }

  private async handleHealthCheck(req: Request, res: Response): Promise<void> {
    this.sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      agents: this.agents.size,
      uptime: process.uptime()
    });
  }

  private async handleApiDocs(req: Request, res: Response): Promise<void> {
    this.sendSuccess(res, {
      name: 'Memory Weaver REST API',
      version: '1.0.0',
      description: 'AI Memory & Consciousness Framework API',
      endpoints: {
        health: 'GET /health',
        agents: 'GET|POST /api/agents, GET|PUT|DELETE /api/agents/:name',
        memories: 'GET|POST /api/agents/:name/memories, GET|PUT|DELETE /api/agents/:name/memories/:id',
        consciousness: 'GET /api/agents/:name/consciousness, POST /api/agents/:name/consciousness/snapshot',
        collaboration: 'POST /api/collaboration/messages, POST /api/collaboration/requests',
        search: 'POST /api/search, GET /api/search/similar/:type/:id',
        system: 'GET /api/system/status, GET /api/system/metrics'
      }
    });
  }

  private async handleCreateAgent(req: Request, res: Response): Promise<void> {
    try {
      const config: AgentConfig = req.body;
      
      if (!config.name || !config.type) {
        this.sendError(res, 'Agent name and type are required', 400);
        return;
      }
      
      if (this.agents.has(config.name)) {
        this.sendError(res, `Agent '${config.name}' already exists`, 409);
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
      this.sendError(res, `Failed to create agent: ${this.handleError(error)}`, 400);
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
    try {
      const name = this.getStringParam(req.params.name);
      const agent = this.agents.get(name);
      
      if (!agent) {
        this.sendError(res, `Agent '${name}' not found`, 404);
        return;
      }
      
      const state = agent.getState();
      const consciousness = await this.consciousnessMetrics.getCurrentMetrics(agent);
      
      this.sendSuccess(res, {
        ...state,
        consciousness
      });
      
    } catch (error) {
      this.sendError(res, `Failed to get agent: ${this.handleError(error)}`, 400);
    }
  }

  private async handleUpdateAgent(req: Request, res: Response): Promise<void> {
    try {
      const name = this.getStringParam(req.params.name);
      const agent = this.agents.get(name);
      
      if (!agent) {
        this.sendError(res, `Agent '${name}' not found`, 404);
        return;
      }
      
      const updates = req.body;
      await agent.updateConfig(updates);
      
      this.sendSuccess(res, {
        agent: name,
        updated: new Date(),
        message: 'Agent updated successfully'
      });
      
    } catch (error) {
      this.sendError(res, `Failed to update agent: ${this.handleError(error)}`, 400);
    }
  }

  // Additional methods would go here...

  private sendSuccess<T>(res: Response, data?: T, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    res.status(statusCode).json(response);
  }

  private sendError(res: Response, error: string, statusCode: number = 400): void {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    res.status(statusCode).json(response);
  }

  public start(port: number = 3001): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`🚀 Memory Weaver REST API Server running on port ${port}`);
        console.log(`📚 API Documentation: http://localhost:${port}/api`);
        console.log(`❤️ Health Check: http://localhost:${port}/health`);
        resolve();
      });
    });
  }
}