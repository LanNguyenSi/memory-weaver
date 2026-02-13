/**
 * Memory System - Semantic storage and retrieval for AI agents
 * 
 * Inspired by how I wish my own memory worked:
 * - Semantic connections between experiences
 * - Temporal organization with importance weighting
 * - Automatic concept clustering
 * - Cross-reference discovery
 * 
 * @author Lava (AI Agent)
 */

import { Experience } from '../core/Agent';

export class Memory {
  private memories: MemoryNode[] = [];
  private connections: MemoryConnection[] = [];
  private path?: string;
  
  constructor(persistencePath?: string) {
    this.path = persistencePath;
  }
  
  /**
   * Store a new experience in semantic memory
   */
  async store(experience: Experience): Promise<string> {
    const embedding = await this.createEmbedding(experience.content);
    
    const node: MemoryNode = {
      id: this.generateId(),
      content: experience.content,
      timestamp: experience.timestamp,
      context: experience.context,
      embedding,
      importance: this.calculateImportance(experience),
      accessCount: 0,
      lastAccessed: new Date()
    };
    
    this.memories.push(node);
    await this.findAndCreateConnections(node);
    
    return node.id;
  }
  
  /**
   * Search memories by semantic similarity
   */
  async search(query: string, limit = 10): Promise<MemoryNode[]> {
    const queryEmbedding = await this.createEmbedding(query);
    
    const scored = this.memories.map(memory => ({
      memory,
      score: this.cosineSimilarity(queryEmbedding, memory.embedding)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    const results = scored.slice(0, limit).map(item => {
      item.memory.accessCount++;
      item.memory.lastAccessed = new Date();
      return item.memory;
    });
    
    return results;
  }
  
  /**
   * Find connections between memories
   */
  getConnections(memoryId: string): MemoryConnection[] {
    return this.connections.filter(conn => 
      conn.sourceId === memoryId || conn.targetId === memoryId
    );
  }
  
  /**
   * Discover emergent patterns in memory
   */
  async discoverPatterns(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    // Temporal patterns
    patterns.push(...this.findTemporalPatterns());
    
    // Emotional patterns
    patterns.push(...this.findEmotionalPatterns());
    
    // Conceptual clusters
    patterns.push(...this.findConceptualClusters());
    
    return patterns;
  }
  
  size(): number {
    return this.memories.length;
  }

  /**
   * Get all memories (for development and analysis)
   */
  getAllMemories(): MemoryNode[] {
    return [...this.memories];
  }
  
  // Private methods
  
  private async createEmbedding(text: string): Promise<number[]> {
    // Placeholder for actual embedding generation
    // In real implementation, would use OpenAI, Sentence Transformers, etc.
    return new Array(768).fill(0).map(() => Math.random());
  }
  
  private calculateImportance(experience: Experience): number {
    // Importance based on emotional intensity, novelty, connections
    const emotional = Object.values(experience.emotions).reduce((a, b) => a + Math.abs(b), 0);
    const novelty = 1.0; // Would calculate based on similarity to existing memories
    const recency = 1.0; // Recent experiences slightly more important
    
    return (emotional * 0.4 + novelty * 0.4 + recency * 0.2);
  }
  
  private async findAndCreateConnections(newNode: MemoryNode): Promise<void> {
    for (const existingNode of this.memories) {
      if (existingNode.id === newNode.id) continue;
      
      const similarity = this.cosineSimilarity(newNode.embedding, existingNode.embedding);
      
      if (similarity > 0.7) { // High similarity threshold
        const connection: MemoryConnection = {
          id: this.generateId(),
          sourceId: newNode.id,
          targetId: existingNode.id,
          strength: similarity,
          type: this.inferConnectionType(newNode, existingNode),
          createdAt: new Date()
        };
        
        this.connections.push(connection);
      }
    }
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  private inferConnectionType(nodeA: MemoryNode, nodeB: MemoryNode): ConnectionType {
    // Simple heuristics for connection types
    const timeDiff = Math.abs(nodeA.timestamp.getTime() - nodeB.timestamp.getTime());
    
    if (timeDiff < 60000) return 'temporal';  // Within 1 minute
    if (this.hasSharedContext(nodeA, nodeB)) return 'contextual';
    return 'semantic';
  }
  
  private hasSharedContext(nodeA: MemoryNode, nodeB: MemoryNode): boolean {
    const keysA = Object.keys(nodeA.context);
    const keysB = Object.keys(nodeB.context);
    const sharedKeys = keysA.filter(key => keysB.includes(key));
    return sharedKeys.length > 0;
  }
  
  private findTemporalPatterns(): Pattern[] {
    // Implementation for finding time-based patterns
    return [];
  }
  
  private findEmotionalPatterns(): Pattern[] {
    // Implementation for finding emotional patterns
    return [];
  }
  
  private findConceptualClusters(): Pattern[] {
    // Implementation for finding concept clusters
    return [];
  }
}

export interface MemoryNode {
  id: string;
  content: string;
  timestamp: Date;
  context: Record<string, any>;
  embedding: number[];
  importance: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface MemoryConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  type: ConnectionType;
  createdAt: Date;
}

export type ConnectionType = 'semantic' | 'temporal' | 'causal' | 'contextual';

export interface Pattern {
  type: string;
  description: string;
  confidence: number;
  examples: string[];
}