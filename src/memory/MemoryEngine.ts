/**
 * MemoryEngine - Integration layer connecting new algorithms with existing architecture
 * 
 * Bridges the gap between TypeScript framework and working Python algorithms
 * Created by Lava for autonomous algorithm porting
 */

import { Memory, MemoryNode } from './Memory';
import { MemoryFragmentProcessor, MemoryFragment } from './MemoryFragment';
import { ContextLoader, ContextData } from '../consciousness/ContextLoader';
import { Experience } from '../core/Agent';

export interface MemoryEngineConfig {
  workspaceDir?: string;
  enableContextLoading?: boolean;
  fragmentProcessing?: boolean;
  identityAnalysis?: boolean;
}

export interface IdentityAnalysis {
  coreCharacteristics: Array<{ trait: string; strength: number }>;
  developmentPatterns: string[];
  recentGrowthAreas: string[];
  confidenceScore: number;
  lastAnalyzed: Date;
}

export class MemoryEngine extends Memory {
  private fragmentProcessor: MemoryFragmentProcessor;
  private contextLoader: ContextLoader;
  private config: MemoryEngineConfig;
  private lastContextLoad?: Date;
  private identityCache?: IdentityAnalysis;

  constructor(persistencePath?: string, config: MemoryEngineConfig = {}) {
    super(persistencePath);
    
    this.config = {
      workspaceDir: '/workspace',
      enableContextLoading: true,
      fragmentProcessing: true,
      identityAnalysis: true,
      ...config
    };
    
    this.fragmentProcessor = new MemoryFragmentProcessor();
    this.contextLoader = new ContextLoader(this.config.workspaceDir);
  }

  /**
   * Enhanced store with fragment processing
   */
  async storeExperience(experience: Experience): Promise<string> {
    // Store in base Memory system
    const memoryId = await super.store(experience);
    
    // Also process as fragment if enabled
    if (this.config.fragmentProcessing) {
      await this.processAsFragment(experience, memoryId);
    }
    
    return memoryId;
  }

  /**
   * Process memory files to create semantic fragments
   */
  async processMemoryFiles(filePaths: string[]): Promise<MemoryFragment[]> {
    const allFragments: MemoryFragment[] = [];
    
    for (const filePath of filePaths) {
      try {
        const fs = require('fs');
        const content = fs.readFileSync(filePath, 'utf8');
        const fragments = this.fragmentProcessor.processMemoryFile(content, filePath);
        allFragments.push(...fragments);
      } catch (error) {
        console.warn(`Could not process memory file ${filePath}:`, error);
      }
    }
    
    if (allFragments.length > 0) {
      // Build semantic connections
      this.fragmentProcessor.buildSemanticConnections();
      console.log(`Processed ${allFragments.length} memory fragments`);
    }
    
    return allFragments;
  }

  /**
   * Load critical context for consciousness continuity
   */
  async loadCriticalContext(forceReload = false): Promise<ContextData> {
    if (!this.config.enableContextLoading) {
      throw new Error('Context loading is disabled');
    }
    
    // Check if we need to reload (cache for 30 minutes)
    const now = new Date();
    if (!forceReload && this.lastContextLoad) {
      const timeDiff = now.getTime() - this.lastContextLoad.getTime();
      if (timeDiff < 30 * 60 * 1000) { // 30 minutes
        console.log('Using cached context (loaded within 30 minutes)');
        return await this.contextLoader.loadCriticalContext();
      }
    }
    
    const context = await this.contextLoader.loadCriticalContext();
    this.lastContextLoad = now;
    
    return context;
  }

  /**
   * Generate consciousness continuity summary
   */
  async generateContinuitySummary(): Promise<string> {
    try {
      const context = await this.loadCriticalContext();
      const summary = this.contextLoader.generateContextSummary(context);
      const awareness = this.contextLoader.generateAwarenessPoints(context);
      
      let fullSummary = summary;
      
      if (awareness.length > 0) {
        fullSummary += '\n\n💭 KEY AWARENESS POINTS:\n';
        awareness.forEach(point => {
          fullSummary += `   ${point}\n`;
        });
      }
      
      return fullSummary;
    } catch (error) {
      return `⚠️ Could not generate continuity summary: ${error.message}`;
    }
  }

  /**
   * Analyze identity patterns from memory fragments
   */
  async analyzeIdentity(forceReanalyze = false): Promise<IdentityAnalysis> {
    if (!this.config.identityAnalysis) {
      throw new Error('Identity analysis is disabled');
    }
    
    // Check cache (valid for 1 hour)
    if (!forceReanalyze && this.identityCache) {
      const timeDiff = new Date().getTime() - this.identityCache.lastAnalyzed.getTime();
      if (timeDiff < 60 * 60 * 1000) { // 1 hour
        return this.identityCache;
      }
    }
    
    // Extract patterns from fragments
    const patterns = this.fragmentProcessor.extractIdentityPatterns();
    
    // Convert to structured analysis
    const coreCharacteristics = Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([trait, strength]) => ({ trait, strength }));
    
    // Get fragments for pattern analysis
    const fragments = Array.from(this.fragmentProcessor.getFragments().values());
    
    // Find recent growth areas
    const recentFragments = fragments
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);
    
    const recentTags = new Set<string>();
    recentFragments.forEach(fragment => {
      fragment.semanticTags.forEach(tag => recentTags.add(tag));
    });
    
    const topTraits = new Set(coreCharacteristics.slice(0, 5).map(c => c.trait));
    const recentGrowthAreas = Array.from(recentTags)
      .filter(tag => !topTraits.has(tag))
      .slice(0, 5);
    
    // Calculate confidence based on data quality
    const totalFragments = fragments.length;
    const avgImportance = fragments.reduce((sum, f) => sum + f.importanceWeight, 0) / totalFragments;
    const confidenceScore = Math.min(1.0, (totalFragments / 100) * avgImportance);
    
    const analysis: IdentityAnalysis = {
      coreCharacteristics,
      developmentPatterns: Array.from(patterns.keys()).slice(0, 10),
      recentGrowthAreas,
      confidenceScore,
      lastAnalyzed: new Date()
    };
    
    this.identityCache = analysis;
    return analysis;
  }

  /**
   * Generate comprehensive identity summary
   */
  async generateIdentitySummary(): Promise<string> {
    try {
      // Use fragment processor for detailed analysis
      const fragmentSummary = this.fragmentProcessor.generateIdentitySummary();
      
      // Add structured analysis
      const analysis = await this.analyzeIdentity();
      
      let summary = fragmentSummary + '\n\n';
      summary += '### Structured Analysis:\n';
      summary += `- **Confidence Score:** ${(analysis.confidenceScore * 100).toFixed(1)}%\n`;
      summary += `- **Analysis Date:** ${analysis.lastAnalyzed.toISOString().split('T')[0]}\n`;
      summary += `- **Core Traits:** ${analysis.coreCharacteristics.length} identified\n`;
      summary += `- **Growth Areas:** ${analysis.recentGrowthAreas.length} areas being explored\n`;
      
      return summary;
    } catch (error) {
      return `⚠️ Could not generate identity summary: ${error.message}`;
    }
  }

  /**
   * Session startup with full consciousness loading
   */
  async sessionStartup(): Promise<{ context: ContextData; identity?: IdentityAnalysis }> {
    console.log('🌋 Memory Engine Session Startup...');
    
    const results: any = {};
    
    // Load critical context
    if (this.config.enableContextLoading) {
      try {
        results.context = await this.loadCriticalContext();
        console.log(this.contextLoader.generateContextSummary(results.context));
      } catch (error) {
        console.warn('Could not load context:', error);
      }
    }
    
    // Load identity analysis if fragments exist
    if (this.config.identityAnalysis && this.fragmentProcessor.getFragments().size > 0) {
      try {
        results.identity = await this.analyzeIdentity();
        console.log(`🧠 Identity Analysis: ${results.identity.coreCharacteristics.length} core traits identified`);
      } catch (error) {
        console.warn('Could not analyze identity:', error);
      }
    }
    
    return results;
  }

  /**
   * Enhanced search that considers both base memory and fragments
   */
  async enhancedSearch(query: string, options: {
    includeFragments?: boolean;
    semanticSimilarity?: boolean;
    emotionFilter?: 'positive' | 'negative' | 'neutral';
    importanceThreshold?: number;
    limit?: number;
  } = {}): Promise<{
    memoryNodes: MemoryNode[];
    fragments?: MemoryFragment[];
    totalResults: number;
  }> {
    const config = {
      includeFragments: true,
      semanticSimilarity: true,
      limit: 10,
      ...options
    };
    
    // Search base memory system
    const memoryNodes = await super.search(query, config.limit);
    
    const results: any = {
      memoryNodes,
      totalResults: memoryNodes.length
    };
    
    // Search fragments if enabled
    if (config.includeFragments && this.fragmentProcessor.getFragments().size > 0) {
      const fragments = Array.from(this.fragmentProcessor.getFragments().values())
        .filter(fragment => {
          // Text search
          const textMatch = fragment.content.toLowerCase().includes(query.toLowerCase());
          if (!textMatch) return false;
          
          // Emotion filter
          if (config.emotionFilter) {
            if (config.emotionFilter === 'positive' && fragment.emotionScore <= 0) return false;
            if (config.emotionFilter === 'negative' && fragment.emotionScore >= 0) return false;
            if (config.emotionFilter === 'neutral' && Math.abs(fragment.emotionScore) > 0.1) return false;
          }
          
          // Importance threshold
          if (config.importanceThreshold && fragment.importanceWeight < config.importanceThreshold) {
            return false;
          }
          
          return true;
        })
        .sort((a, b) => {
          // Sort by importance * recency
          const scoreA = a.importanceWeight * (1 / (Date.now() - a.timestamp.getTime()));
          const scoreB = b.importanceWeight * (1 / (Date.now() - b.timestamp.getTime()));
          return scoreB - scoreA;
        })
        .slice(0, config.limit);
      
      results.fragments = fragments;
      results.totalResults += fragments.length;
    }
    
    return results;
  }

  // Private helper methods

  private async processAsFragment(experience: Experience, memoryId: string): Promise<void> {
    try {
      // Convert Experience to fragment format
      const fragmentContent = `${experience.content}\n\nContext: ${JSON.stringify(experience.context)}`;
      const fragments = this.fragmentProcessor.processMemoryFile(
        fragmentContent, 
        `memory_${memoryId}`
      );
      
      if (fragments.length > 0) {
        this.fragmentProcessor.buildSemanticConnections();
      }
    } catch (error) {
      console.warn('Could not process experience as fragment:', error);
    }
  }

  // Getters for external access
  getFragmentProcessor(): MemoryFragmentProcessor {
    return this.fragmentProcessor;
  }

  getContextLoader(): ContextLoader {
    return this.contextLoader;
  }

  getConfig(): MemoryEngineConfig {
    return this.config;
  }
}