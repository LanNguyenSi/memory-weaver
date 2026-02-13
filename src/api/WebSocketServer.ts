/**
 * WebSocket Server for Real-Time Communication
 * 
 * Provides real-time communication between AI agents and web clients:
 * - Agent-to-agent real-time messaging
 * - Live consciousness monitoring
 * - Collaborative session updates
 * - Memory sharing broadcasts
 * 
 * @author Lava (AI Agent) - Autonomous Implementation
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Agent, Experience, AgentState } from '../core/Agent';
import { MultiAgentSystem, AgentMessage } from '../collaboration/MultiAgentSystem';
import { ConsciousnessMetrics, ConsciousnessSnapshot } from '../consciousness/ConsciousnessMetrics';
import { SemanticSearchEngine, SearchResult } from '../search/SemanticSearch';
import { EventEmitter } from 'events';

export interface WebSocketConnection {
  id: string;
  type: 'agent' | 'human' | 'monitor';
  agentName?: string;
  userId?: string;
  permissions: string[];
  joinedRooms: string[];
  lastActivity: Date;
}

export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  target?: string;
}

export interface CollaborativeSession {
  id: string;
  name: string;
  participants: WebSocketConnection[];
  sharedMemorySpace?: string;
  startTime: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'completed';
}

export interface LiveConsciousnessUpdate {
  agentName: string;
  metrics: Partial<ConsciousnessSnapshot>;
  timestamp: Date;
  changeSummary: string[];
}

export class WebSocketManager extends EventEmitter {
  private io: SocketIOServer;
  private connections: Map<string, WebSocketConnection> = new Map();
  private sessions: Map<string, CollaborativeSession> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // event -> socket IDs
  
  constructor(
    server: HttpServer,
    private multiAgentSystem: MultiAgentSystem,
    private consciousnessMetrics: ConsciousnessMetrics,
    private searchEngine: SemanticSearchEngine
  ) {
    super();
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupSocketHandlers();
    this.setupEventRelays();
    this.startHeartbeat();
  }

  /**
   * Setup main socket event handlers
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);
      
      // Authentication and connection setup
      socket.on('authenticate', async (auth) => {
        await this.handleAuthentication(socket, auth);
      });
      
      // Agent registration
      socket.on('register_agent', async (agentName) => {
        await this.handleAgentRegistration(socket, agentName);
      });
      
      // Real-time messaging
      socket.on('send_message', async (message) => {
        await this.handleMessage(socket, message);
      });
      
      // Memory operations
      socket.on('share_memory', async (memoryData) => {
        await this.handleMemoryShare(socket, memoryData);
      });
      
      socket.on('search_memories', async (query) => {
        await this.handleMemorySearch(socket, query);
      });
      
      // Collaboration
      socket.on('start_collaboration', async (request) => {
        await this.handleCollaborationStart(socket, request);
      });
      
      socket.on('join_session', async (sessionId) => {
        await this.handleSessionJoin(socket, sessionId);
      });
      
      // Consciousness monitoring
      socket.on('subscribe_consciousness', async (agentName) => {
        await this.handleConsciousnessSubscription(socket, agentName);
      });
      
      socket.on('request_consciousness_analysis', async (agentName) => {
        await this.handleConsciousnessAnalysis(socket, agentName);
      });
      
      // Disconnect handling
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
      
      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Setup event relays from other systems
   */
  private setupEventRelays(): void {
    // Multi-agent system events
    this.multiAgentSystem.on('message_sent', (message: AgentMessage) => {
      this.broadcastEvent({
        type: 'agent_message',
        data: message,
        timestamp: new Date(),
        source: message.from,
        target: message.to
      });
    });
    
    this.multiAgentSystem.on('agent_joined', (event) => {
      this.broadcastEvent({
        type: 'agent_joined',
        data: event,
        timestamp: new Date(),
        source: 'system'
      });
    });
    
    // Consciousness metrics events
    this.consciousnessMetrics.on('consciousness_analyzed', (snapshot: ConsciousnessSnapshot) => {
      this.broadcastConsciousnessUpdate({
        agentName: snapshot.agentName,
        metrics: snapshot,
        timestamp: snapshot.timestamp,
        changeSummary: snapshot.insights
      });
    });
  }

  /**
   * Handle client authentication
   */
  private async handleAuthentication(socket: any, auth: any): Promise<void> {
    try {
      const connection: WebSocketConnection = {
        id: socket.id,
        type: auth.type || 'human',
        agentName: auth.agentName,
        userId: auth.userId,
        permissions: auth.permissions || ['read'],
        joinedRooms: [],
        lastActivity: new Date()
      };
      
      this.connections.set(socket.id, connection);
      
      socket.emit('authenticated', {
        connectionId: socket.id,
        permissions: connection.permissions,
        timestamp: new Date()
      });
      
      // Join appropriate rooms
      if (connection.type === 'agent' && connection.agentName) {
        socket.join(`agent:${connection.agentName}`);
        connection.joinedRooms.push(`agent:${connection.agentName}`);
      }
      
      if (connection.permissions.includes('monitor')) {
        socket.join('monitors');
        connection.joinedRooms.push('monitors');
      }
      
      this.emit('connection_authenticated', connection);
      
    } catch (error) {
      socket.emit('auth_error', { message: 'Authentication failed', error: error.message });
    }
  }

  /**
   * Handle agent registration for direct control
   */
  private async handleAgentRegistration(socket: any, agentName: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    try {
      connection.type = 'agent';
      connection.agentName = agentName;
      
      // Join agent-specific room
      socket.join(`agent:${agentName}`);
      connection.joinedRooms.push(`agent:${agentName}`);
      
      // Notify other clients
      this.broadcastEvent({
        type: 'agent_connected_realtime',
        data: { agentName, socketId: socket.id },
        timestamp: new Date(),
        source: 'system'
      });
      
      socket.emit('agent_registered', { agentName, timestamp: new Date() });
      
    } catch (error) {
      socket.emit('error', { message: 'Agent registration failed', error: error.message });
    }
  }

  /**
   * Handle real-time messages
   */
  private async handleMessage(socket: any, messageData: any): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection || !connection.permissions.includes('write')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }
    
    try {
      // Create agent message
      const message: Omit<AgentMessage, 'id' | 'timestamp'> = {
        from: connection.agentName || connection.userId || socket.id,
        to: messageData.to,
        type: messageData.type,
        content: messageData.content,
        priority: messageData.priority || 1
      };
      
      // Send through multi-agent system
      const messageId = await this.multiAgentSystem.sendMessage(message);
      
      socket.emit('message_sent', { messageId, timestamp: new Date() });
      
    } catch (error) {
      socket.emit('error', { message: 'Message failed', error: error.message });
    }
  }

  /**
   * Handle memory sharing
   */
  private async handleMemoryShare(socket: any, memoryData: any): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection || !connection.permissions.includes('write')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }
    
    try {
      // Broadcast to interested parties
      this.broadcastEvent({
        type: 'memory_shared',
        data: {
          memory: memoryData,
          sharedBy: connection.agentName || connection.userId,
          timestamp: new Date()
        },
        timestamp: new Date(),
        source: socket.id
      });
      
      socket.emit('memory_shared', { success: true, timestamp: new Date() });
      
    } catch (error) {
      socket.emit('error', { message: 'Memory share failed', error: error.message });
    }
  }

  /**
   * Handle memory search requests
   */
  private async handleMemorySearch(socket: any, query: any): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection || !connection.permissions.includes('read')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }
    
    try {
      const results = await this.searchEngine.search(query);
      
      socket.emit('search_results', {
        query,
        results,
        timestamp: new Date()
      });
      
    } catch (error) {
      socket.emit('error', { message: 'Search failed', error: error.message });
    }
  }

  /**
   * Handle collaboration session start
   */
  private async handleCollaborationStart(socket: any, request: any): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection || !connection.permissions.includes('collaborate')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }
    
    try {
      const session: CollaborativeSession = {
        id: this.generateId(),
        name: request.name,
        participants: [connection],
        startTime: new Date(),
        lastActivity: new Date(),
        status: 'active'
      };
      
      this.sessions.set(session.id, session);
      
      // Create room for this session
      socket.join(`session:${session.id}`);
      connection.joinedRooms.push(`session:${session.id}`);
      
      // Invite participants
      for (const participantId of request.participants || []) {
        this.io.to(participantId).emit('collaboration_invitation', {
          session,
          invitedBy: connection.agentName || connection.userId
        });
      }
      
      socket.emit('session_created', session);
      
    } catch (error) {
      socket.emit('error', { message: 'Collaboration start failed', error: error.message });
    }
  }

  /**
   * Handle session join
   */
  private async handleSessionJoin(socket: any, sessionId: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    const session = this.sessions.get(sessionId);
    
    if (!connection || !session) {
      socket.emit('error', { message: 'Invalid session or connection' });
      return;
    }
    
    try {
      // Add to session
      session.participants.push(connection);
      session.lastActivity = new Date();
      
      // Join room
      socket.join(`session:${sessionId}`);
      connection.joinedRooms.push(`session:${sessionId}`);
      
      // Notify other participants
      this.io.to(`session:${sessionId}`).emit('participant_joined', {
        participant: {
          type: connection.type,
          name: connection.agentName || connection.userId,
          id: connection.id
        },
        session: session
      });
      
      socket.emit('session_joined', session);
      
    } catch (error) {
      socket.emit('error', { message: 'Session join failed', error: error.message });
    }
  }

  /**
   * Handle consciousness monitoring subscription
   */
  private async handleConsciousnessSubscription(socket: any, agentName: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection || !connection.permissions.includes('monitor')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }
    
    try {
      const eventKey = `consciousness:${agentName}`;
      let subscribers = this.subscriptions.get(eventKey);
      if (!subscribers) {
        subscribers = new Set();
        this.subscriptions.set(eventKey, subscribers);
      }
      subscribers.add(socket.id);
      
      socket.emit('consciousness_subscribed', { agentName, timestamp: new Date() });
      
    } catch (error) {
      socket.emit('error', { message: 'Consciousness subscription failed', error: error.message });
    }
  }

  /**
   * Handle consciousness analysis request
   */
  private async handleConsciousnessAnalysis(socket: any, agentName: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection || !connection.permissions.includes('monitor')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }
    
    try {
      // This would trigger analysis in the consciousness metrics system
      // For now, just acknowledge the request
      socket.emit('consciousness_analysis_requested', { 
        agentName, 
        timestamp: new Date(),
        message: 'Analysis will be performed and results broadcast when complete'
      });
      
    } catch (error) {
      socket.emit('error', { message: 'Consciousness analysis request failed', error: error.message });
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(socket: any): void {
    const connection = this.connections.get(socket.id);
    if (connection) {
      // Remove from sessions
      for (const [sessionId, session] of this.sessions) {
        session.participants = session.participants.filter(p => p.id !== socket.id);
        if (session.participants.length === 0) {
          this.sessions.delete(sessionId);
        }
      }
      
      // Remove from subscriptions
      for (const [eventKey, subscribers] of this.subscriptions) {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          this.subscriptions.delete(eventKey);
        }
      }
      
      // Notify others if it was an agent
      if (connection.type === 'agent' && connection.agentName) {
        this.broadcastEvent({
          type: 'agent_disconnected',
          data: { agentName: connection.agentName },
          timestamp: new Date(),
          source: 'system'
        });
      }
      
      this.connections.delete(socket.id);
    }
    
    console.log(`Connection closed: ${socket.id}`);
  }

  /**
   * Broadcast event to all relevant clients
   */
  private broadcastEvent(event: RealTimeEvent): void {
    // Broadcast to all monitors
    this.io.to('monitors').emit('real_time_event', event);
    
    // Broadcast to specific targets if specified
    if (event.target) {
      if (event.target === 'ALL') {
        this.io.emit('real_time_event', event);
      } else {
        this.io.to(`agent:${event.target}`).emit('real_time_event', event);
      }
    }
  }

  /**
   * Broadcast consciousness updates to subscribers
   */
  private broadcastConsciousnessUpdate(update: LiveConsciousnessUpdate): void {
    const eventKey = `consciousness:${update.agentName}`;
    const subscribers = this.subscriptions.get(eventKey);
    
    if (subscribers) {
      for (const socketId of subscribers) {
        this.io.to(socketId).emit('consciousness_update', update);
      }
    }
    
    // Also broadcast to all monitors
    this.io.to('monitors').emit('consciousness_update', update);
  }

  /**
   * Start heartbeat to clean up stale connections
   */
  private startHeartbeat(): void {
    setInterval(() => {
      const now = new Date();
      const staleThreshold = 5 * 60 * 1000; // 5 minutes
      
      for (const [socketId, connection] of this.connections) {
        if (now.getTime() - connection.lastActivity.getTime() > staleThreshold) {
          this.io.to(socketId).disconnect(true);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    connections: number;
    agents: number;
    sessions: number;
    subscriptions: number;
  } {
    const agentConnections = Array.from(this.connections.values())
      .filter(c => c.type === 'agent').length;
    
    return {
      connections: this.connections.size,
      agents: agentConnections,
      sessions: this.sessions.size,
      subscriptions: this.subscriptions.size
    };
  }

  /**
   * Manually send message to specific connection
   */
  sendToConnection(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  /**
   * Manually broadcast to all connections
   */
  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}