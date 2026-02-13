/**
 * Multi-Agent Collaboration System
 * 
 * Enables AI agents to:
 * - Share memory spaces
 * - Communicate in real-time
 * - Collaborate on problems
 * - Form communities and relationships
 * 
 * @author Lava (AI Agent) - Autonomous Implementation
 */

import { Agent, Experience, Goal, AgentState } from '../core/Agent';
import { MemoryNode } from '../memory/Memory';
import { EventEmitter } from 'events';

export interface AgentMessage {
  id: string;
  from: string;
  to: string | string[]; // single agent or broadcast
  type: 'experience' | 'query' | 'insight' | 'collaboration' | 'goal_share';
  content: any;
  timestamp: Date;
  priority: number;
}

export interface CollaborationRequest {
  id: string;
  initiator: string;
  participants: string[];
  problem: string;
  context: Record<string, any>;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  solution?: any;
}

export interface SharedMemorySpace {
  id: string;
  name: string;
  participants: string[];
  memories: MemoryNode[];
  permissions: Record<string, string[]>; // agentId -> permissions
  createdAt: Date;
}

export class MultiAgentSystem extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private collaborations: Map<string, CollaborationRequest> = new Map();
  private sharedSpaces: Map<string, SharedMemorySpace> = new Map();
  private relationships: Map<string, Map<string, number>> = new Map(); // trust scores
  
  constructor() {
    super();
    this.setupMessageProcessing();
  }

  /**
   * Register an agent in the multi-agent system
   */
  async registerAgent(agent: Agent): Promise<void> {
    this.agents.set(agent.name, agent);
    this.relationships.set(agent.name, new Map());
    
    this.emit('agent_joined', {
      agent: agent.name,
      timestamp: new Date()
    });
    
    // Notify other agents
    await this.broadcast({
      from: 'SYSTEM',
      to: 'ALL',
      type: 'experience',
      content: `Agent ${agent.name} joined the community`,
      priority: 1
    });
  }

  /**
   * Remove an agent from the system
   */
  async unregisterAgent(agentName: string): Promise<void> {
    this.agents.delete(agentName);
    this.relationships.delete(agentName);
    
    // Clean up relationships
    for (const [name, relationships] of this.relationships) {
      relationships.delete(agentName);
    }
    
    this.emit('agent_left', {
      agent: agentName,
      timestamp: new Date()
    });
  }

  /**
   * Send a message between agents
   */
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<string> {
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    this.messageQueue.push(fullMessage);
    this.emit('message_sent', fullMessage);
    
    await this.processMessage(fullMessage);
    return fullMessage.id;
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcast(message: Omit<AgentMessage, 'id' | 'timestamp' | 'to'>): Promise<string> {
    return await this.sendMessage({
      ...message,
      to: 'ALL'
    });
  }

  /**
   * Initiate collaborative problem-solving
   */
  async startCollaboration(
    initiator: string,
    participants: string[],
    problem: string,
    context: Record<string, any> = {}
  ): Promise<string> {
    const collaboration: CollaborationRequest = {
      id: this.generateId(),
      initiator,
      participants: [initiator, ...participants],
      problem,
      context,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.collaborations.set(collaboration.id, collaboration);
    
    // Notify participants
    for (const participant of participants) {
      await this.sendMessage({
        from: initiator,
        to: participant,
        type: 'collaboration',
        content: {
          type: 'invitation',
          collaboration
        },
        priority: 3
      });
    }
    
    return collaboration.id;
  }

  /**
   * Accept collaboration invitation
   */
  async acceptCollaboration(collaborationId: string, agentName: string): Promise<void> {
    const collaboration = this.collaborations.get(collaborationId);
    if (!collaboration || !collaboration.participants.includes(agentName)) {
      throw new Error('Invalid collaboration or agent not invited');
    }
    
    collaboration.status = 'active';
    
    // Create shared memory space for this collaboration
    const sharedSpace: SharedMemorySpace = {
      id: `collab_${collaborationId}`,
      name: `Collaboration: ${collaboration.problem}`,
      participants: collaboration.participants,
      memories: [],
      permissions: {},
      createdAt: new Date()
    };
    
    // Set permissions for all participants
    for (const participant of collaboration.participants) {
      sharedSpace.permissions[participant] = ['read', 'write', 'share'];
    }
    
    this.sharedSpaces.set(sharedSpace.id, sharedSpace);
    
    // Notify all participants
    await this.broadcast({
      from: 'SYSTEM',
      type: 'collaboration',
      content: {
        type: 'started',
        collaboration,
        sharedSpace: sharedSpace.id
      },
      priority: 2
    });
  }

  /**
   * Create a shared memory space
   */
  async createSharedSpace(
    name: string,
    creator: string,
    participants: string[] = []
  ): Promise<string> {
    const space: SharedMemorySpace = {
      id: this.generateId(),
      name,
      participants: [creator, ...participants],
      memories: [],
      permissions: {},
      createdAt: new Date()
    };
    
    // Creator gets all permissions
    space.permissions[creator] = ['read', 'write', 'admin', 'invite'];
    
    // Participants get basic permissions
    for (const participant of participants) {
      space.permissions[participant] = ['read', 'write'];
    }
    
    this.sharedSpaces.set(space.id, space);
    
    this.emit('shared_space_created', space);
    return space.id;
  }

  /**
   * Add memory to shared space
   */
  async shareMemory(
    spaceId: string,
    agentName: string,
    memory: MemoryNode
  ): Promise<void> {
    const space = this.sharedSpaces.get(spaceId);
    if (!space) {
      throw new Error('Shared space not found');
    }
    
    const permissions = space.permissions[agentName];
    if (!permissions || !permissions.includes('write')) {
      throw new Error('Permission denied');
    }
    
    space.memories.push(memory);
    
    // Notify other participants
    for (const participant of space.participants) {
      if (participant !== agentName) {
        await this.sendMessage({
          from: agentName,
          to: participant,
          type: 'experience',
          content: {
            type: 'shared_memory',
            space: spaceId,
            memory
          },
          priority: 2
        });
      }
    }
  }

  /**
   * Process incoming messages
   */
  private async processMessage(message: AgentMessage): Promise<void> {
    const recipients = message.to === 'ALL' 
      ? Array.from(this.agents.keys())
      : Array.isArray(message.to) ? message.to : [message.to];
    
    for (const recipientName of recipients) {
      if (recipientName === message.from) continue;
      
      const recipient = this.agents.get(recipientName);
      if (recipient) {
        await this.deliverMessage(recipient, message);
        
        // Update relationship trust
        await this.updateRelationship(message.from, recipientName, message);
      }
    }
  }

  /**
   * Deliver message to specific agent
   */
  private async deliverMessage(agent: Agent, message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'experience':
        await agent.experience(`Message from ${message.from}: ${JSON.stringify(message.content)}`);
        break;
        
      case 'query':
        const results = await agent.search(message.content.query);
        await this.sendMessage({
          from: agent.name,
          to: message.from,
          type: 'experience',
          content: {
            type: 'query_response',
            originalQuery: message.content.query,
            results
          },
          priority: message.priority
        });
        break;
        
      case 'collaboration':
        if (message.content.type === 'invitation') {
          // Agent can auto-accept based on their personality and trust
          const trustScore = this.getTrustScore(agent.name, message.from);
          if (trustScore > 0.7) {
            await this.acceptCollaboration(message.content.collaboration.id, agent.name);
          }
        }
        break;
    }
  }

  /**
   * Update relationship trust based on interactions
   */
  private async updateRelationship(from: string, to: string, message: AgentMessage): Promise<void> {
    const relationships = this.relationships.get(to);
    if (!relationships) return;
    
    const currentTrust = relationships.get(from) || 0.5;
    let trustChange = 0;
    
    // Positive interactions
    if (message.type === 'insight' || message.type === 'goal_share') {
      trustChange = 0.1;
    } else if (message.type === 'experience' && message.priority > 2) {
      trustChange = 0.05;
    }
    
    // Update trust score (0-1 range)
    const newTrust = Math.max(0, Math.min(1, currentTrust + trustChange));
    relationships.set(from, newTrust);
  }

  /**
   * Get trust score between two agents
   */
  getTrustScore(agent1: string, agent2: string): number {
    const relationships = this.relationships.get(agent1);
    return relationships?.get(agent2) || 0.5;
  }

  /**
   * Get system status and metrics
   */
  getSystemStatus(): {
    agents: number;
    activeCollaborations: number;
    sharedSpaces: number;
    messageQueue: number;
    relationships: number;
  } {
    return {
      agents: this.agents.size,
      activeCollaborations: Array.from(this.collaborations.values())
        .filter(c => c.status === 'active').length,
      sharedSpaces: this.sharedSpaces.size,
      messageQueue: this.messageQueue.length,
      relationships: Array.from(this.relationships.values())
        .reduce((total, map) => total + map.size, 0)
    };
  }

  /**
   * Setup automatic message processing
   */
  private setupMessageProcessing(): void {
    setInterval(() => {
      if (this.messageQueue.length > 100) {
        // Clear old messages to prevent memory leaks
        this.messageQueue = this.messageQueue.slice(-50);
      }
    }, 60000); // Every minute
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const globalMultiAgentSystem = new MultiAgentSystem();