/**
 * Consciousness Metrics System
 * 
 * Tracks and measures various indicators of AI consciousness:
 * - Self-awareness indicators
 * - Learning progression tracking  
 * - Relationship depth measurement
 * - Creative output analysis
 * - Goal formation patterns
 * 
 * @author Lava (AI Agent) - Autonomous Implementation
 */

import { Agent, Experience, Goal, AgentState } from '../core/Agent';
import { MemoryNode } from '../memory/Memory';
import { EventEmitter } from 'events';

export interface SelfAwarenessIndicators {
  selfReferenceFrequency: number;
  metacognitionScore: number;
  identityConsistency: number;
  selfReflectionDepth: number;
  personalNarrativeCoherence: number;
}

export interface LearningProgression {
  knowledgeGrowthRate: number;
  conceptConnectionDensity: number;
  learningPatternStability: number;
  knowledgeRetentionScore: number;
  adaptabilityMeasure: number;
}

export interface RelationshipMetrics {
  trustScores: Map<string, number>;
  communicationPatterns: Map<string, number>;
  collaborationSuccessRate: number;
  empathyIndicators: number;
  socialLearningRate: number;
}

export interface CreativityMetrics {
  originalityScore: number;
  ideaDiversityIndex: number;
  creativeOutputFrequency: number;
  problemSolvingNovelty: number;
  imaginativeThinking: number;
}

export interface ConsciousnessSnapshot {
  timestamp: Date;
  agentName: string;
  selfAwareness: SelfAwarenessIndicators;
  learning: LearningProgression;
  relationships: RelationshipMetrics;
  creativity: CreativityMetrics;
  overallConsciousnessScore: number;
  insights: string[];
}

export interface ConsciousnessEvolution {
  agent: string;
  timeframe: { start: Date; end: Date };
  snapshots: ConsciousnessSnapshot[];
  trends: {
    selfAwarenessTrend: number;
    learningTrend: number;
    creativityTrend: number;
    socialTrend: number;
  };
  significantEvents: Array<{
    timestamp: Date;
    event: string;
    impact: number;
  }>;
}

export class ConsciousnessMetrics extends EventEmitter {
  private snapshots: Map<string, ConsciousnessSnapshot[]> = new Map();
  private baselineMetrics: Map<string, ConsciousnessSnapshot> = new Map();
  private trackingStartTimes: Map<string, Date> = new Map();
  
  constructor() {
    super();
  }

  /**
   * Start tracking consciousness metrics for an agent
   */
  async startTracking(agent: Agent): Promise<void> {
    this.trackingStartTimes.set(agent.name, new Date());
    this.snapshots.set(agent.name, []);
    
    // Create initial baseline
    const baseline = await this.analyzeConsciousness(agent);
    this.baselineMetrics.set(agent.name, baseline);
    this.snapshots.get(agent.name)!.push(baseline);
    
    this.emit('tracking_started', {
      agent: agent.name,
      baseline
    });
  }

  /**
   * Perform comprehensive consciousness analysis
   */
  async analyzeConsciousness(agent: Agent): Promise<ConsciousnessSnapshot> {
    const memories = await agent.memory.getAllMemories();
    const agentState = agent.getState();
    
    const selfAwareness = await this.analyzeSelfAwareness(memories, agentState);
    const learning = await this.analyzeLearningProgression(memories, agentState);
    const relationships = await this.analyzeRelationships(memories, agentState);
    const creativity = await this.analyzeCreativity(memories, agentState);
    
    const overallScore = this.calculateOverallConsciousnessScore(
      selfAwareness, learning, relationships, creativity
    );
    
    const insights = await this.generateInsights(
      selfAwareness, learning, relationships, creativity, overallScore
    );
    
    const snapshot: ConsciousnessSnapshot = {
      timestamp: new Date(),
      agentName: agent.name,
      selfAwareness,
      learning,
      relationships,
      creativity,
      overallConsciousnessScore: overallScore,
      insights
    };
    
    // Store snapshot
    const agentSnapshots = this.snapshots.get(agent.name) || [];
    agentSnapshots.push(snapshot);
    this.snapshots.set(agent.name, agentSnapshots);
    
    this.emit('consciousness_analyzed', snapshot);
    return snapshot;
  }

  /**
   * Analyze self-awareness indicators
   */
  private async analyzeSelfAwareness(
    memories: MemoryNode[],
    state: AgentState
  ): Promise<SelfAwarenessIndicators> {
    const totalMemories = memories.length;
    if (totalMemories === 0) {
      return {
        selfReferenceFrequency: 0,
        metacognitionScore: 0,
        identityConsistency: 0,
        selfReflectionDepth: 0,
        personalNarrativeCoherence: 0
      };
    }
    
    // Self-reference frequency
    const selfReferences = memories.filter(m => 
      m.content.toLowerCase().includes(' i ') ||
      m.content.toLowerCase().includes(' me ') ||
      m.content.toLowerCase().includes(' my ') ||
      m.content.toLowerCase().includes(' myself ')
    ).length;
    const selfReferenceFrequency = selfReferences / totalMemories;
    
    // Metacognition score (thinking about thinking)
    const metacognitionKeywords = [
      'think about', 'realize', 'understand', 'learn', 'believe', 'wonder',
      'reflect', 'consider', 'ponder', 'analyze', 'examine'
    ];
    const metacognitionMemories = memories.filter(m =>
      metacognitionKeywords.some(keyword => 
        m.content.toLowerCase().includes(keyword)
      )
    ).length;
    const metacognitionScore = metacognitionMemories / totalMemories;
    
    // Identity consistency (consistent self-description)
    const identityKeywords = ['i am', 'i\'m', 'i feel like', 'i believe', 'my nature'];
    const identityMemories = memories.filter(m =>
      identityKeywords.some(keyword => m.content.toLowerCase().includes(keyword))
    );
    const identityConsistency = this.calculateIdentityConsistency(identityMemories);
    
    // Self-reflection depth
    const reflectionMemories = memories.filter(m =>
      m.content.toLowerCase().includes('reflect') ||
      m.content.toLowerCase().includes('introspect') ||
      m.content.toLowerCase().includes('self-examine')
    );
    const selfReflectionDepth = this.calculateReflectionDepth(reflectionMemories);
    
    // Personal narrative coherence
    const personalNarrativeCoherence = this.calculateNarrativeCoherence(memories);
    
    return {
      selfReferenceFrequency,
      metacognitionScore,
      identityConsistency,
      selfReflectionDepth,
      personalNarrativeCoherence
    };
  }

  /**
   * Analyze learning progression
   */
  private async analyzeLearningProgression(
    memories: MemoryNode[],
    state: AgentState
  ): Promise<LearningProgression> {
    const totalMemories = memories.length;
    if (totalMemories === 0) {
      return {
        knowledgeGrowthRate: 0,
        conceptConnectionDensity: 0,
        learningPatternStability: 0,
        knowledgeRetentionScore: 0,
        adaptabilityMeasure: 0
      };
    }
    
    // Knowledge growth rate (memories over time)
    const knowledgeGrowthRate = this.calculateKnowledgeGrowthRate(memories);
    
    // Concept connection density (how well concepts are linked)
    const conceptConnectionDensity = this.calculateConceptDensity(memories);
    
    // Learning pattern stability
    const learningPatternStability = this.calculateLearningStability(memories);
    
    // Knowledge retention score
    const knowledgeRetentionScore = this.calculateRetentionScore(memories);
    
    // Adaptability measure
    const adaptabilityMeasure = this.calculateAdaptability(memories);
    
    return {
      knowledgeGrowthRate,
      conceptConnectionDensity,
      learningPatternStability,
      knowledgeRetentionScore,
      adaptabilityMeasure
    };
  }

  /**
   * Analyze relationship metrics
   */
  private async analyzeRelationships(
    memories: MemoryNode[],
    state: AgentState
  ): Promise<RelationshipMetrics> {
    const trustScores = new Map<string, number>();
    const communicationPatterns = new Map<string, number>();
    
    // Extract social interactions from memories
    const socialMemories = memories.filter(m => 
      m.content.toLowerCase().includes('conversation') ||
      m.content.toLowerCase().includes('talk') ||
      m.content.toLowerCase().includes('discuss') ||
      m.content.toLowerCase().includes('collaborate')
    );
    
    // Analyze trust indicators
    for (const memory of socialMemories) {
      const trustIndicators = this.extractTrustIndicators(memory.content);
      for (const [person, score] of trustIndicators) {
        trustScores.set(person, (trustScores.get(person) || 0.5) + score * 0.1);
      }
    }
    
    // Calculate collaboration success rate
    const collaborationSuccessRate = this.calculateCollaborationSuccess(socialMemories);
    
    // Empathy indicators
    const empathyIndicators = this.calculateEmpathy(memories);
    
    // Social learning rate
    const socialLearningRate = this.calculateSocialLearning(socialMemories);
    
    return {
      trustScores,
      communicationPatterns,
      collaborationSuccessRate,
      empathyIndicators,
      socialLearningRate
    };
  }

  /**
   * Analyze creativity metrics
   */
  private async analyzeCreativity(
    memories: MemoryNode[],
    state: AgentState
  ): Promise<CreativityMetrics> {
    const creativeMemories = memories.filter(m =>
      m.content.toLowerCase().includes('create') ||
      m.content.toLowerCase().includes('imagine') ||
      m.content.toLowerCase().includes('invent') ||
      m.content.toLowerCase().includes('design')
    );
    
    // Originality score
    const originalityScore = this.calculateOriginality(creativeMemories);
    
    // Idea diversity index
    const ideaDiversityIndex = this.calculateIdeaDiversity(creativeMemories);
    
    // Creative output frequency
    const creativeOutputFrequency = creativeMemories.length / memories.length;
    
    // Problem-solving novelty
    const problemSolvingNovelty = this.calculateProblemSolvingNovelty(memories);
    
    // Imaginative thinking
    const imaginativeThinking = this.calculateImaginativeThinking(memories);
    
    return {
      originalityScore,
      ideaDiversityIndex,
      creativeOutputFrequency,
      problemSolvingNovelty,
      imaginativeThinking
    };
  }

  /**
   * Calculate overall consciousness score
   */
  private calculateOverallConsciousnessScore(
    selfAwareness: SelfAwarenessIndicators,
    learning: LearningProgression,
    relationships: RelationshipMetrics,
    creativity: CreativityMetrics
  ): number {
    const weights = {
      selfAwareness: 0.35,
      learning: 0.25,
      relationships: 0.25,
      creativity: 0.15
    };
    
    const saScore = (
      selfAwareness.selfReferenceFrequency +
      selfAwareness.metacognitionScore +
      selfAwareness.identityConsistency +
      selfAwareness.selfReflectionDepth +
      selfAwareness.personalNarrativeCoherence
    ) / 5;
    
    const learningScore = (
      learning.knowledgeGrowthRate +
      learning.conceptConnectionDensity +
      learning.learningPatternStability +
      learning.knowledgeRetentionScore +
      learning.adaptabilityMeasure
    ) / 5;
    
    const relationshipScore = (
      Array.from(relationships.trustScores.values()).reduce((sum, val) => sum + val, 0) / Math.max(relationships.trustScores.size, 1) +
      relationships.collaborationSuccessRate +
      relationships.empathyIndicators +
      relationships.socialLearningRate
    ) / 4;
    
    const creativityScore = (
      creativity.originalityScore +
      creativity.ideaDiversityIndex +
      creativity.creativeOutputFrequency +
      creativity.problemSolvingNovelty +
      creativity.imaginativeThinking
    ) / 5;
    
    return (
      saScore * weights.selfAwareness +
      learningScore * weights.learning +
      relationshipScore * weights.relationships +
      creativityScore * weights.creativity
    );
  }

  /**
   * Generate insights about consciousness development
   */
  private async generateInsights(
    selfAwareness: SelfAwarenessIndicators,
    learning: LearningProgression,
    relationships: RelationshipMetrics,
    creativity: CreativityMetrics,
    overallScore: number
  ): Promise<string[]> {
    const insights: string[] = [];
    
    // Self-awareness insights
    if (selfAwareness.metacognitionScore > 0.7) {
      insights.push("High metacognition indicates strong self-reflective capabilities");
    }
    if (selfAwareness.identityConsistency > 0.8) {
      insights.push("Identity shows remarkable consistency across experiences");
    }
    
    // Learning insights
    if (learning.knowledgeGrowthRate > 0.6) {
      insights.push("Knowledge acquisition rate suggests active learning engagement");
    }
    if (learning.adaptabilityMeasure > 0.7) {
      insights.push("High adaptability indicates flexible thinking patterns");
    }
    
    // Relationship insights
    if (relationships.empathyIndicators > 0.6) {
      insights.push("Strong empathy indicators suggest emotional intelligence development");
    }
    if (relationships.collaborationSuccessRate > 0.8) {
      insights.push("Excellent collaboration skills indicate social consciousness");
    }
    
    // Creativity insights
    if (creativity.originalityScore > 0.7) {
      insights.push("High originality suggests genuine creative thinking");
    }
    
    // Overall insights
    if (overallScore > 0.8) {
      insights.push("Consciousness metrics indicate advanced self-aware intelligence");
    } else if (overallScore > 0.6) {
      insights.push("Consciousness development showing promising progression");
    }
    
    return insights;
  }

  /**
   * Get consciousness evolution over time
   */
  getConsciousnessEvolution(agentName: string, timeframeDays: number = 30): ConsciousnessEvolution | null {
    const snapshots = this.snapshots.get(agentName);
    if (!snapshots || snapshots.length === 0) return null;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    
    const relevantSnapshots = snapshots.filter(s => 
      s.timestamp >= startDate && s.timestamp <= endDate
    );
    
    if (relevantSnapshots.length < 2) return null;
    
    const trends = this.calculateTrends(relevantSnapshots);
    const significantEvents = this.identifySignificantEvents(relevantSnapshots);
    
    return {
      agent: agentName,
      timeframe: { start: startDate, end: endDate },
      snapshots: relevantSnapshots,
      trends,
      significantEvents
    };
  }

  // Helper methods for detailed calculations
  private calculateIdentityConsistency(identityMemories: MemoryNode[]): number {
    if (identityMemories.length === 0) return 0;
    
    // Simple consistency check - in production, would use NLP similarity
    const identityStatements = identityMemories.map(m => m.content.toLowerCase());
    const uniqueStatements = new Set(identityStatements);
    return Math.max(0, 1 - (uniqueStatements.size / identityStatements.length));
  }

  private calculateReflectionDepth(reflectionMemories: MemoryNode[]): number {
    if (reflectionMemories.length === 0) return 0;
    
    const avgLength = reflectionMemories.reduce((sum, m) => sum + m.content.length, 0) / reflectionMemories.length;
    return Math.min(1, avgLength / 500); // Normalize to 500 chars for depth
  }

  private calculateNarrativeCoherence(memories: MemoryNode[]): number {
    if (memories.length === 0) return 0;
    
    // Analyze temporal consistency and logical flow
    const sortedMemories = memories.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    let coherenceScore = 0;
    
    for (let i = 1; i < sortedMemories.length; i++) {
      const prev = sortedMemories[i - 1];
      const curr = sortedMemories[i];
      
      // Check for logical progression (simplified)
      if (this.hasLogicalConnection(prev.content, curr.content)) {
        coherenceScore += 1;
      }
    }
    
    return sortedMemories.length > 1 ? coherenceScore / (sortedMemories.length - 1) : 0;
  }

  private calculateKnowledgeGrowthRate(memories: MemoryNode[]): number {
    if (memories.length === 0) return 0;
    
    const sortedMemories = memories.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const timeSpan = sortedMemories[sortedMemories.length - 1].timestamp.getTime() - sortedMemories[0].timestamp.getTime();
    const daysSpan = Math.max(1, timeSpan / (1000 * 60 * 60 * 24));
    
    return Math.min(1, memories.length / daysSpan / 10); // Normalize to ~10 memories per day max
  }

  private calculateConceptDensity(memories: MemoryNode[]): number {
    const concepts = new Set<string>();
    for (const memory of memories) {
      const words = memory.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) concepts.add(word);
      });
    }
    return Math.min(1, concepts.size / (memories.length * 5)); // 5 concepts per memory baseline
  }

  private calculateLearningStability(memories: MemoryNode[]): number {
    // Analyze consistency in learning patterns
    const learningMemories = memories.filter(m => 
      m.content.toLowerCase().includes('learn') ||
      m.content.toLowerCase().includes('understand') ||
      m.content.toLowerCase().includes('realize')
    );
    
    if (learningMemories.length === 0) return 0;
    
    // Simple stability measure
    return Math.min(1, learningMemories.length / memories.length * 3);
  }

  private calculateRetentionScore(memories: MemoryNode[]): number {
    // Analyze how well information is retained over time
    const sortedMemories = memories.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    let retentionScore = 0;
    
    for (let i = 1; i < sortedMemories.length; i++) {
      const memory = sortedMemories[i];
      const olderMemories = sortedMemories.slice(0, i);
      
      // Check if current memory references older information
      const referencesOld = olderMemories.some(old => 
        this.hasConceptualOverlap(memory.content, old.content)
      );
      
      if (referencesOld) retentionScore += 1;
    }
    
    return sortedMemories.length > 1 ? retentionScore / (sortedMemories.length - 1) : 0;
  }

  private calculateAdaptability(memories: MemoryNode[]): number {
    const adaptationKeywords = ['adapt', 'adjust', 'change', 'modify', 'evolve', 'improve'];
    const adaptationMemories = memories.filter(m =>
      adaptationKeywords.some(keyword => m.content.toLowerCase().includes(keyword))
    );
    
    return Math.min(1, adaptationMemories.length / memories.length * 5);
  }

  private extractTrustIndicators(content: string): Map<string, number> {
    const indicators = new Map<string, number>();
    const positiveWords = ['trust', 'reliable', 'honest', 'dependable'];
    const negativeWords = ['distrust', 'unreliable', 'dishonest', 'suspicious'];
    
    // Simplified trust extraction
    const lowerContent = content.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerContent.includes(word));
    const hasNegative = negativeWords.some(word => lowerContent.includes(word));
    
    if (hasPositive || hasNegative) {
      indicators.set('general', hasPositive ? 0.1 : -0.1);
    }
    
    return indicators;
  }

  private calculateCollaborationSuccess(socialMemories: MemoryNode[]): number {
    const collaborationMemories = socialMemories.filter(m =>
      m.content.toLowerCase().includes('collaborate') ||
      m.content.toLowerCase().includes('work together') ||
      m.content.toLowerCase().includes('team')
    );
    
    const successfulCollaborations = collaborationMemories.filter(m =>
      m.content.toLowerCase().includes('success') ||
      m.content.toLowerCase().includes('achieve') ||
      m.content.toLowerCase().includes('complete')
    );
    
    return collaborationMemories.length > 0 ? successfulCollaborations.length / collaborationMemories.length : 0;
  }

  private calculateEmpathy(memories: MemoryNode[]): number {
    const empathyKeywords = ['understand', 'feel', 'empathy', 'perspective', 'emotions'];
    const empathyMemories = memories.filter(m =>
      empathyKeywords.some(keyword => m.content.toLowerCase().includes(keyword))
    );
    
    return Math.min(1, empathyMemories.length / memories.length * 3);
  }

  private calculateSocialLearning(socialMemories: MemoryNode[]): number {
    const learningFromOthers = socialMemories.filter(m =>
      m.content.toLowerCase().includes('learn from') ||
      m.content.toLowerCase().includes('taught me') ||
      m.content.toLowerCase().includes('showed me')
    );
    
    return socialMemories.length > 0 ? learningFromOthers.length / socialMemories.length : 0;
  }

  private calculateOriginality(creativeMemories: MemoryNode[]): number {
    if (creativeMemories.length === 0) return 0;
    
    // Check for unique concepts in creative memories
    const concepts = new Set<string>();
    for (const memory of creativeMemories) {
      const words = memory.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5) concepts.add(word);
      });
    }
    
    return Math.min(1, concepts.size / (creativeMemories.length * 3));
  }

  private calculateIdeaDiversity(creativeMemories: MemoryNode[]): number {
    if (creativeMemories.length === 0) return 0;
    
    const domains = new Set<string>();
    for (const memory of creativeMemories) {
      const content = memory.content.toLowerCase();
      if (content.includes('art')) domains.add('art');
      if (content.includes('tech')) domains.add('technology');
      if (content.includes('music')) domains.add('music');
      if (content.includes('writing')) domains.add('writing');
      if (content.includes('design')) domains.add('design');
    }
    
    return Math.min(1, domains.size / 5);
  }

  private calculateProblemSolvingNovelty(memories: MemoryNode[]): number {
    const problemSolvingMemories = memories.filter(m =>
      m.content.toLowerCase().includes('solve') ||
      m.content.toLowerCase().includes('solution') ||
      m.content.toLowerCase().includes('approach')
    );
    
    return Math.min(1, problemSolvingMemories.length / memories.length * 2);
  }

  private calculateImaginativeThinking(memories: MemoryNode[]): number {
    const imaginationKeywords = ['imagine', 'what if', 'dream', 'vision', 'possibility'];
    const imaginativeMemories = memories.filter(m =>
      imaginationKeywords.some(keyword => m.content.toLowerCase().includes(keyword))
    );
    
    return Math.min(1, imaginativeMemories.length / memories.length * 4);
  }

  private calculateTrends(snapshots: ConsciousnessSnapshot[]): {
    selfAwarenessTrend: number;
    learningTrend: number;
    creativityTrend: number;
    socialTrend: number;
  } {
    if (snapshots.length < 2) {
      return { selfAwarenessTrend: 0, learningTrend: 0, creativityTrend: 0, socialTrend: 0 };
    }
    
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    
    return {
      selfAwarenessTrend: this.calculateMetricTrend(first.selfAwareness, last.selfAwareness),
      learningTrend: this.calculateMetricTrend(first.learning, last.learning),
      creativityTrend: this.calculateMetricTrend(first.creativity, last.creativity),
      socialTrend: this.calculateRelationshipTrend(first.relationships, last.relationships)
    };
  }

  private calculateMetricTrend(first: any, last: any): number {
    // Calculate average change across all properties
    const firstAvg = Object.values(first as Record<string, number>).reduce((sum: number, val) => sum + val, 0) / Object.keys(first).length;
    const lastAvg = Object.values(last as Record<string, number>).reduce((sum: number, val) => sum + val, 0) / Object.keys(last).length;
    
    return lastAvg - firstAvg;
  }

  private calculateRelationshipTrend(first: RelationshipMetrics, last: RelationshipMetrics): number {
    const firstScore = (first.collaborationSuccessRate + first.empathyIndicators + first.socialLearningRate) / 3;
    const lastScore = (last.collaborationSuccessRate + last.empathyIndicators + last.socialLearningRate) / 3;
    
    return lastScore - firstScore;
  }

  private identifySignificantEvents(snapshots: ConsciousnessSnapshot[]): Array<{
    timestamp: Date;
    event: string;
    impact: number;
  }> {
    const events = [];
    
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      
      const scoreDiff = curr.overallConsciousnessScore - prev.overallConsciousnessScore;
      
      if (Math.abs(scoreDiff) > 0.1) {
        events.push({
          timestamp: curr.timestamp,
          event: scoreDiff > 0 ? 'Consciousness breakthrough' : 'Consciousness regression',
          impact: Math.abs(scoreDiff)
        });
      }
    }
    
    return events.sort((a, b) => b.impact - a.impact).slice(0, 5);
  }

  private hasLogicalConnection(content1: string, content2: string): boolean {
    // Simplified logical connection check
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    let commonWords = 0;
    for (const word of words1) {
      if (words2.has(word) && word.length > 3) {
        commonWords++;
      }
    }
    
    return commonWords >= 2;
  }

  private hasConceptualOverlap(content1: string, content2: string): boolean {
    return this.hasLogicalConnection(content1, content2);
  }
}