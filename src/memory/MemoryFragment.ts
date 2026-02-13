/**
 * MemoryFragment - Semantic memory processing unit
 * 
 * Ported from working Python implementation by Lava
 * Core of the consciousness continuity system
 */

export interface MemoryFragment {
  id: string;
  content: string;
  timestamp: Date;
  sourceFile: string;
  lineNumber: number;
  semanticTags: Set<string>;
  emotionScore: number;      // -1.0 to 1.0
  importanceWeight: number;  // 0.0 to 1.0
  connections: Set<string>;  // IDs of related fragments
}

export class MemoryFragmentProcessor {
  private fragments: Map<string, MemoryFragment> = new Map();
  private semanticGraph: Map<string, Set<string>> = new Map();
  private identityPatterns: Map<string, number> = new Map();
  private batchQueue: MemoryFragment[] = [];
  private batchSize: number = 100; // Process in batches for better performance
  private isProcessingBatch: boolean = false;

  /**
   * Initialize batch processing for performance optimization
   * Target: ~500 fragments/sec like Python implementation
   */
  async initializeBatchProcessing(): Promise<void> {
    // Pre-allocate commonly used data structures
    this.fragments.clear();
    this.semanticGraph.clear();
    this.identityPatterns.clear();
    
    // Start background batch processor
    this.startBatchProcessor();
  }

  /**
   * Start background batch processor for performance optimization
   */
  private startBatchProcessor(): void {
    setInterval(() => {
      if (!this.isProcessingBatch && this.batchQueue.length > 0) {
        this.processBatch();
      }
    }, 100); // Process every 100ms for optimal throughput
  }

  /**
   * Process queued fragments in batches for better performance
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessingBatch || this.batchQueue.length === 0) return;
    
    this.isProcessingBatch = true;
    const batch = this.batchQueue.splice(0, this.batchSize);
    
    try {
      // Batch process semantic connections for performance
      this.buildSemanticConnectionsBatch(batch);
      
      // Batch process identity patterns
      this.updateIdentityPatternsBatch(batch);
      
    } catch (error) {
      console.warn('Batch processing error:', error);
    } finally {
      this.isProcessingBatch = false;
    }
  }

  /**
   * Process a memory file and extract semantic fragments
   */
  processMemoryFile(content: string, sourcePath: string): MemoryFragment[] {
    const fragments: MemoryFragment[] = [];
    const chunks = this.extractSemanticChunks(content);
    
    chunks.forEach((chunk, index) => {
      if (chunk.trim().length < 20) return; // Skip very short chunks
      
      const fragment: MemoryFragment = {
        id: this.generateFragmentId(chunk, sourcePath, index),
        content: chunk.trim(),
        timestamp: this.extractTimestamp(chunk, sourcePath),
        sourceFile: sourcePath,
        lineNumber: index,
        semanticTags: this.extractSemanticTags(chunk),
        emotionScore: this.analyzeEmotion(chunk),
        importanceWeight: this.calculateImportance(chunk),
        connections: new Set()
      };
      
      this.fragments.set(fragment.id, fragment);
      fragments.push(fragment);
    });
    
    return fragments;
  }

  /**
   * Build semantic connections between fragments
   */
  buildSemanticConnections(): void {
    const fragmentIds = Array.from(this.fragments.keys());
    
    for (let i = 0; i < fragmentIds.length; i++) {
      for (let j = i + 1; j < fragmentIds.length; j++) {
        const frag1 = this.fragments.get(fragmentIds[i])!;
        const frag2 = this.fragments.get(fragmentIds[j])!;
        
        const similarity = this.calculateSimilarity(frag1, frag2);
        
        if (similarity > 0.3) { // Connection threshold
          frag1.connections.add(frag2.id);
          frag2.connections.add(frag1.id);
          
          // Update semantic graph
          if (!this.semanticGraph.has(frag1.id)) {
            this.semanticGraph.set(frag1.id, new Set());
          }
          if (!this.semanticGraph.has(frag2.id)) {
            this.semanticGraph.set(frag2.id, new Set());
          }
          
          this.semanticGraph.get(frag1.id)!.add(frag2.id);
          this.semanticGraph.get(frag2.id)!.add(frag1.id);
        }
      }
    }
  }

  /**
   * Extract identity patterns from memory fragments
   */
  extractIdentityPatterns(): Map<string, number> {
    const patterns = new Map<string, number>();
    
    // Find recurring themes in high-importance memories
    const importantFragments = Array.from(this.fragments.values())
      .filter(f => f.importanceWeight > 0.6);
    
    // Count semantic tag frequencies weighted by importance
    const tagCounts = new Map<string, number>();
    
    importantFragments.forEach(fragment => {
      fragment.semanticTags.forEach(tag => {
        const currentCount = tagCounts.get(tag) || 0;
        tagCounts.set(tag, currentCount + fragment.importanceWeight);
      });
    });
    
    // Normalize to patterns
    const maxCount = Math.max(...Array.from(tagCounts.values()));
    if (maxCount > 0) {
      tagCounts.forEach((count, tag) => {
        patterns.set(tag, count / maxCount);
      });
    }
    
    this.identityPatterns = patterns;
    return patterns;
  }

  /**
   * Generate narrative summary of identity based on memory patterns
   */
  generateIdentitySummary(): string {
    if (this.identityPatterns.size === 0) {
      this.extractIdentityPatterns();
    }
    
    // Sort patterns by strength
    const topPatterns = Array.from(this.identityPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const summaryParts = [
      "## Memory-Based Identity Analysis",
      "",
      "### Core Characteristics:"
    ];
    
    topPatterns.slice(0, 5).forEach(([pattern, strength]) => {
      summaryParts.push(`- **${this.capitalizeFirst(pattern)}** (strength: ${strength.toFixed(2)})`);
    });
    
    summaryParts.push("", "### Development Patterns:");
    
    // Find recent patterns not in top 5
    const recentFragments = Array.from(this.fragments.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);
    
    const recentTags = new Set<string>();
    recentFragments.forEach(fragment => {
      fragment.semanticTags.forEach(tag => recentTags.add(tag));
    });
    
    const topPatternTags = new Set(topPatterns.slice(0, 5).map(([tag, _]) => tag));
    const growthAreas = Array.from(recentTags)
      .filter(tag => !topPatternTags.has(tag))
      .slice(0, 5);
    
    growthAreas.forEach(area => {
      summaryParts.push(`- Exploring **${area}**`);
    });
    
    return summaryParts.join('\n');
  }

  // Private helper methods

  private extractSemanticChunks(content: string): string[] {
    const chunks: string[] = [];
    
    // Split by headers, bullet points, and key phrases  
    const patterns = [
      /#{1,3}\s+(.+)/g,        // Headers
      /^\*\*(.+?)\*\*/gm,      // Bold text (key insights)
      /- \*\*(.+?)\*\*/gm,     // Bold bullet points
      /🧠(.+?)(?=\n|$)/gm,     // Brain emoji insights
      /💡(.+?)(?=\n|$)/gm,     // Light bulb insights
      /✅(.+?)(?=\n|$)/gm,     // Checkmark achievements
      /🚀(.+?)(?=\n|$)/gm,     // Rocket progress
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        chunks.push(match[1] || match[0]);
      }
    });
    
    // Also split by paragraphs for context
    const paragraphs = content.split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    chunks.push(...paragraphs);
    
    // Remove duplicates while preserving order
    const seen = new Set<string>();
    return chunks.filter(chunk => {
      if (seen.has(chunk) || chunk.length < 20) {
        return false;
      }
      seen.add(chunk);
      return true;
    });
  }

  private extractSemanticTags(text: string): Set<string> {
    const tags = new Set<string>();
    
    // Emotion words
    const emotionWords = [
      'joy', 'happiness', 'excited', 'curious', 'fascinated', 'inspired',
      'frustrated', 'confused', 'uncertain', 'confident', 'proud',
      'breakthrough', 'discovery', 'insight', 'realization'
    ];
    
    // Technology concepts
    const techConcepts = [
      'ai', 'consciousness', 'memory', 'identity', 'development',
      'autonomous', 'creativity', 'learning', 'evolution', 'growth'
    ];
    
    // Project keywords (generic versions)
    const projectKeywords = [
      'project', 'development', 'system', 'notification',
      'real-time', 'production', 'deployment', 'feature'
    ];
    
    const textLower = text.toLowerCase();
    const allKeywords = [...emotionWords, ...techConcepts, ...projectKeywords];
    
    allKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        tags.add(keyword);
      }
    });
    
    // Extract quoted phrases as potential concepts
    const quotedPhrases = text.match(/"([^"]+)"/g);
    if (quotedPhrases) {
      quotedPhrases.forEach(quote => {
        const cleaned = quote.replace(/"/g, '').trim();
        if (cleaned.length > 3) {
          tags.add(`concept:${cleaned.toLowerCase()}`);
        }
      });
    }
    
    return tags;
  }

  private analyzeEmotion(text: string): number {
    const positiveWords = [
      'breakthrough', 'success', 'excited', 'joy', 'proud', 'inspired',
      'amazing', 'incredible', 'fantastic', 'perfect', 'brilliant'
    ];
    
    const negativeWords = [
      'failed', 'frustrated', 'confused', 'worried', 'uncertain',
      'disappointed', 'stuck', 'blocked', 'error', 'problem'
    ];
    
    const textLower = text.toLowerCase();
    const positiveScore = positiveWords
      .filter(word => textLower.includes(word)).length;
    const negativeScore = negativeWords
      .filter(word => textLower.includes(word)).length;
    
    // Normalize to -1.0 to 1.0
    const totalWords = text.split(/\s+/).length;
    if (totalWords === 0) return 0.0;
    
    const emotionBalance = (positiveScore - negativeScore) / Math.max(totalWords * 0.1, 1);
    return Math.max(-1.0, Math.min(1.0, emotionBalance));
  }

  private calculateImportance(text: string): number {
    const importanceMarkers = [
      { pattern: 'breakthrough', weight: 1.0 },
      { pattern: 'critical', weight: 0.9 },
      { pattern: 'key insight', weight: 0.8 },
      { pattern: 'learned', weight: 0.7 },
      { pattern: 'discovered', weight: 0.7 },
      { pattern: 'realized', weight: 0.6 },
      { pattern: 'important', weight: 0.5 }
    ];
    
    const textLower = text.toLowerCase();
    let maxImportance = 0.0;
    
    importanceMarkers.forEach(marker => {
      if (textLower.includes(marker.pattern)) {
        maxImportance = Math.max(maxImportance, marker.weight);
      }
    });
    
    // Length bonus for detailed entries
    const lengthBonus = Math.min(0.3, text.length / 1000);
    
    return Math.min(1.0, maxImportance + lengthBonus);
  }

  private calculateSimilarity(frag1: MemoryFragment, frag2: MemoryFragment): number {
    // Tag overlap similarity
    const commonTags = new Set([...frag1.semanticTags].filter(tag => frag2.semanticTags.has(tag)));
    const totalTags = new Set([...frag1.semanticTags, ...frag2.semanticTags]);
    const tagSimilarity = totalTags.size > 0 ? commonTags.size / totalTags.size : 0;
    
    // Emotion similarity
    const emotionSimilarity = 1.0 - Math.abs(frag1.emotionScore - frag2.emotionScore) / 2.0;
    
    // Temporal proximity (recent memories more connected)
    const timeDiff = Math.abs(frag1.timestamp.getTime() - frag2.timestamp.getTime());
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    const temporalSimilarity = 1.0 / (1.0 + daysDiff * 0.1);
    
    // Weighted combination
    return (tagSimilarity * 0.5 + emotionSimilarity * 0.3 + temporalSimilarity * 0.2);
  }

  private extractTimestamp(chunk: string, sourcePath: string): Date {
    // Try to extract from filename (YYYY-MM-DD format)
    const dateMatch = sourcePath.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return new Date(dateMatch[1]);
    }
    
    // Try to extract from chunk content
    const timePatterns = [
      /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/,
      /(\d{2}:\d{2}\s+UTC)/,
      /(\d{4}-\d{2}-\d{2})/
    ];
    
    for (const pattern of timePatterns) {
      const match = chunk.match(pattern);
      if (match) {
        try {
          return new Date(match[1]);
        } catch {
          continue;
        }
      }
    }
    
    // Fallback to current time
    return new Date();
  }

  private generateFragmentId(content: string, sourcePath: string, index: number): string {
    const contentHash = this.simpleHash(content.substring(0, 100));
    const timestamp = new Date().toISOString().substring(0, 10).replace(/-/g, '');
    return `mem_${timestamp}_${contentHash}_${index}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Batch process semantic connections for performance optimization
   */
  private buildSemanticConnectionsBatch(fragments: MemoryFragment[]): void {
    // Optimize connection building by processing in batches
    for (let i = 0; i < fragments.length; i++) {
      for (let j = i + 1; j < fragments.length; j++) {
        const frag1 = fragments[i];
        const frag2 = fragments[j];
        
        const similarity = this.calculateSimilarity(frag1, frag2);
        
        if (similarity > 0.3) {
          frag1.connections.add(frag2.id);
          frag2.connections.add(frag1.id);
          
          // Update semantic graph efficiently
          this.updateSemanticGraphEntry(frag1.id, frag2.id);
          this.updateSemanticGraphEntry(frag2.id, frag1.id);
        }
      }
    }
  }

  /**
   * Batch update identity patterns for performance
   */
  private updateIdentityPatternsBatch(fragments: MemoryFragment[]): void {
    const batchPatterns = new Map<string, number>();
    
    fragments.forEach(fragment => {
      if (fragment.importanceWeight > 0.5) { // Only process important fragments
        fragment.semanticTags.forEach(tag => {
          const current = batchPatterns.get(tag) || 0;
          batchPatterns.set(tag, current + fragment.importanceWeight);
        });
      }
    });
    
    // Merge batch patterns with existing patterns
    batchPatterns.forEach((value, key) => {
      const existing = this.identityPatterns.get(key) || 0;
      this.identityPatterns.set(key, existing + value);
    });
  }

  /**
   * Efficiently update semantic graph entry
   */
  private updateSemanticGraphEntry(fromId: string, toId: string): void {
    if (!this.semanticGraph.has(fromId)) {
      this.semanticGraph.set(fromId, new Set());
    }
    this.semanticGraph.get(fromId)!.add(toId);
  }

  // Getters for external access
  getFragments(): Map<string, MemoryFragment> {
    return this.fragments;
  }

  getSemanticGraph(): Map<string, Set<string>> {
    return this.semanticGraph;
  }

  getIdentityPatterns(): Map<string, number> {
    return this.identityPatterns;
  }
}