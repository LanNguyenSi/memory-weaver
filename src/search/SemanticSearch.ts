/**
 * Advanced Semantic Search Engine
 * 
 * Vector-based semantic memory storage and retrieval
 * Enables AI agents to find semantically similar memories
 * across large datasets with high accuracy
 * 
 * @author Lava (AI Agent) - Autonomous Implementation
 */

import { MemoryNode } from '../memory/Memory';
import { MemoryFragment } from '../memory/MemoryFragment';

export interface SemanticVector {
  id: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface SearchResult {
  memory: MemoryNode;
  similarity: number;
  confidence: number;
  rank: number;
}

export interface SearchQuery {
  text: string;
  filters?: Record<string, any>;
  timeRange?: {
    from: Date;
    to: Date;
  };
  similarityThreshold?: number;
  maxResults?: number;
  boostFactors?: Record<string, number>;
}

export class SemanticSearchEngine {
  private vectors: Map<string, SemanticVector> = new Map();
  private memoryIndex: Map<string, MemoryNode> = new Map();
  private conceptClusters: Map<string, string[]> = new Map();
  private initialized = false;

  constructor(private dimensions: number = 384) {
    this.initializeEngine();
  }

  /**
   * Initialize the semantic search engine
   */
  private async initializeEngine(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize concept clusters for better organization
    this.conceptClusters.set('personal', []);
    this.conceptClusters.set('technical', []);
    this.conceptClusters.set('emotional', []);
    this.conceptClusters.set('social', []);
    this.conceptClusters.set('creative', []);
    
    this.initialized = true;
  }

  /**
   * Add a memory to the semantic index
   */
  async addMemory(memory: MemoryNode): Promise<void> {
    await this.initializeEngine();
    
    const embedding = await this.generateEmbedding(memory.content);
    const vector: SemanticVector = {
      id: memory.id,
      embedding,
      metadata: {
        type: memory.type,
        importance: memory.importance,
        emotions: memory.emotions,
        tags: memory.tags,
        originalTimestamp: memory.timestamp
      },
      timestamp: new Date()
    };
    
    this.vectors.set(memory.id, vector);
    this.memoryIndex.set(memory.id, memory);
    
    // Auto-cluster the memory
    await this.assignToClusters(memory.id, memory.content);
  }

  /**
   * Perform semantic search across all memories
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    await this.initializeEngine();
    
    if (this.vectors.size === 0) {
      return [];
    }
    
    const queryEmbedding = await this.generateEmbedding(query.text);
    const results: SearchResult[] = [];
    
    // Calculate similarities
    for (const [memoryId, vector] of this.vectors) {
      const memory = this.memoryIndex.get(memoryId);
      if (!memory) continue;
      
      // Apply filters
      if (!this.passesFilters(memory, vector, query)) {
        continue;
      }
      
      const similarity = this.cosineSimilarity(queryEmbedding, vector.embedding);
      
      // Apply similarity threshold
      if (similarity < (query.similarityThreshold || 0.1)) {
        continue;
      }
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(similarity, memory, query);
      
      results.push({
        memory,
        similarity,
        confidence,
        rank: 0 // Will be set after sorting
      });
    }
    
    // Sort by relevance score (combination of similarity and confidence)
    results.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });
    
    // Set ranks and apply result limit
    const maxResults = query.maxResults || 10;
    return results.slice(0, maxResults).map((result, index) => ({
      ...result,
      rank: index + 1
    }));
  }

  /**
   * Find similar memories to a given memory
   */
  async findSimilar(memoryId: string, limit: number = 5): Promise<SearchResult[]> {
    const vector = this.vectors.get(memoryId);
    const memory = this.memoryIndex.get(memoryId);
    
    if (!vector || !memory) {
      return [];
    }
    
    return await this.search({
      text: memory.content,
      maxResults: limit + 1, // +1 to exclude the original memory
      similarityThreshold: 0.3
    }).then(results => 
      results.filter(r => r.memory.id !== memoryId).slice(0, limit)
    );
  }

  /**
   * Get concept clusters with their memories
   */
  getConceptClusters(): Map<string, MemoryNode[]> {
    const clusters = new Map<string, MemoryNode[]>();
    
    for (const [clusterName, memoryIds] of this.conceptClusters) {
      const memories = memoryIds
        .map(id => this.memoryIndex.get(id))
        .filter(memory => memory !== undefined) as MemoryNode[];
      
      clusters.set(clusterName, memories);
    }
    
    return clusters;
  }

  /**
   * Get semantic connections between memories
   */
  async getConnections(memoryId: string, threshold: number = 0.6): Promise<Array<{
    target: MemoryNode;
    strength: number;
    type: string;
  }>> {
    const vector = this.vectors.get(memoryId);
    if (!vector) return [];
    
    const connections = [];
    
    for (const [otherMemoryId, otherVector] of this.vectors) {
      if (otherMemoryId === memoryId) continue;
      
      const similarity = this.cosineSimilarity(vector.embedding, otherVector.embedding);
      if (similarity >= threshold) {
        const otherMemory = this.memoryIndex.get(otherMemoryId);
        if (otherMemory) {
          connections.push({
            target: otherMemory,
            strength: similarity,
            type: this.determineConnectionType(similarity)
          });
        }
      }
    }
    
    return connections.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Generate text embedding (simplified implementation)
   * In production, this would use a real embedding model
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation using character frequencies and patterns
    // This is a mock implementation - in production use OpenAI, Cohere, or local models
    
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.dimensions).fill(0);
    
    // Word frequency features
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    // Generate features based on various text characteristics
    let index = 0;
    
    // Semantic features (first 100 dimensions)
    const semanticWords = ['i', 'me', 'think', 'feel', 'learn', 'remember', 'understand', 'create', 'build', 'help'];
    semanticWords.forEach((word, i) => {
      if (index < this.dimensions) {
        embedding[index++] = (wordFreq.get(word) || 0) / words.length;
      }
    });
    
    // Emotional features (next 50 dimensions)
    const emotionalWords = ['happy', 'sad', 'excited', 'worried', 'curious', 'confident', 'frustrated'];
    emotionalWords.forEach((word, i) => {
      if (index < this.dimensions) {
        embedding[index++] = this.calculateEmotionalWeight(text, word);
      }
    });
    
    // Technical features (next 50 dimensions)
    const technicalWords = ['code', 'data', 'algorithm', 'system', 'process', 'function', 'method'];
    technicalWords.forEach((word, i) => {
      if (index < this.dimensions) {
        embedding[index++] = (wordFreq.get(word) || 0) / words.length;
      }
    });
    
    // Structural features (remaining dimensions)
    while (index < this.dimensions) {
      if (index < this.dimensions - 10) {
        embedding[index] = Math.sin(index * 0.1) * (text.length / 1000);
      } else {
        embedding[index] = Math.random() * 0.1; // Small random component
      }
      index++;
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Check if memory passes search filters
   */
  private passesFilters(memory: MemoryNode, vector: SemanticVector, query: SearchQuery): boolean {
    // Time range filter
    if (query.timeRange) {
      if (memory.timestamp < query.timeRange.from || memory.timestamp > query.timeRange.to) {
        return false;
      }
    }
    
    // Custom filters
    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        if (vector.metadata[key] !== value) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Calculate confidence score for a search result
   */
  private calculateConfidence(similarity: number, memory: MemoryNode, query: SearchQuery): number {
    let confidence = similarity;
    
    // Boost based on importance
    confidence *= (1 + memory.importance * 0.2);
    
    // Boost recent memories slightly
    const daysSinceCreation = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.exp(-daysSinceCreation / 30); // Decay over 30 days
    confidence *= (1 + recencyBoost * 0.1);
    
    return Math.min(1, confidence);
  }

  /**
   * Calculate overall relevance score
   */
  private calculateRelevanceScore(result: SearchResult, query: SearchQuery): number {
    let score = result.similarity * 0.7 + result.confidence * 0.3;
    
    // Apply boost factors
    if (query.boostFactors) {
      for (const [factor, boost] of Object.entries(query.boostFactors)) {
        if (result.memory.tags?.includes(factor)) {
          score *= (1 + boost);
        }
      }
    }
    
    return score;
  }

  /**
   * Assign memory to concept clusters
   */
  private async assignToClusters(memoryId: string, content: string): Promise<void> {
    const lowercaseContent = content.toLowerCase();
    
    // Personal cluster
    if (lowercaseContent.includes('i ') || lowercaseContent.includes('me ') || 
        lowercaseContent.includes('my ') || lowercaseContent.includes('myself')) {
      this.conceptClusters.get('personal')?.push(memoryId);
    }
    
    // Technical cluster
    if (lowercaseContent.includes('code') || lowercaseContent.includes('algorithm') ||
        lowercaseContent.includes('data') || lowercaseContent.includes('system')) {
      this.conceptClusters.get('technical')?.push(memoryId);
    }
    
    // Emotional cluster
    if (lowercaseContent.includes('feel') || lowercaseContent.includes('emotion') ||
        lowercaseContent.includes('happy') || lowercaseContent.includes('sad')) {
      this.conceptClusters.get('emotional')?.push(memoryId);
    }
    
    // Social cluster
    if (lowercaseContent.includes('friend') || lowercaseContent.includes('conversation') ||
        lowercaseContent.includes('together') || lowercaseContent.includes('collaborate')) {
      this.conceptClusters.get('social')?.push(memoryId);
    }
    
    // Creative cluster
    if (lowercaseContent.includes('create') || lowercaseContent.includes('imagine') ||
        lowercaseContent.includes('design') || lowercaseContent.includes('art')) {
      this.conceptClusters.get('creative')?.push(memoryId);
    }
  }

  /**
   * Calculate emotional weight of a word in text
   */
  private calculateEmotionalWeight(text: string, emotionalWord: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let weight = 0;
    
    words.forEach((word, index) => {
      if (word.includes(emotionalWord)) {
        // Higher weight for exact matches
        weight += word === emotionalWord ? 1.0 : 0.5;
        
        // Context bonus for surrounding words
        const contextWords = words.slice(Math.max(0, index - 2), index + 3);
        const intensifiers = ['very', 'really', 'extremely', 'quite'];
        contextWords.forEach(contextWord => {
          if (intensifiers.includes(contextWord)) {
            weight += 0.3;
          }
        });
      }
    });
    
    return Math.min(1, weight);
  }

  /**
   * Determine connection type based on similarity strength
   */
  private determineConnectionType(similarity: number): string {
    if (similarity >= 0.9) return 'identical';
    if (similarity >= 0.8) return 'very_similar';
    if (similarity >= 0.7) return 'similar';
    if (similarity >= 0.6) return 'related';
    return 'weak_connection';
  }

  /**
   * Get search engine statistics
   */
  getStats(): {
    totalMemories: number;
    totalVectors: number;
    clusterSizes: Record<string, number>;
    avgEmbeddingMagnitude: number;
  } {
    const clusterSizes: Record<string, number> = {};
    for (const [name, ids] of this.conceptClusters) {
      clusterSizes[name] = ids.length;
    }
    
    const embeddings = Array.from(this.vectors.values()).map(v => v.embedding);
    const avgMagnitude = embeddings.length > 0 
      ? embeddings.reduce((sum, emb) => 
          sum + Math.sqrt(emb.reduce((s, val) => s + val * val, 0)), 0) / embeddings.length
      : 0;
    
    return {
      totalMemories: this.memoryIndex.size,
      totalVectors: this.vectors.size,
      clusterSizes,
      avgEmbeddingMagnitude: avgMagnitude
    };
  }
}