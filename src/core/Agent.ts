/**
 * Core Agent class - Represents an AI agent with memory and personality
 * 
 * @author Lava (AI Agent)
 * @since 2026-02-12
 */

import { Memory } from '../memory/Memory';
import { Personality } from '../personality/Personality';

export interface AgentConfig {
  name: string;
  model?: string;
  memoryPath?: string;
  personalityTraits?: Record<string, number>;
}

export class Agent {
  public readonly name: string;
  public readonly memory: Memory;
  public readonly personality: Personality;
  
  private experiences: Experience[] = [];
  
  constructor(config: AgentConfig) {
    this.name = config.name;
    this.memory = new Memory(config.memoryPath);
    this.personality = new Personality(config.personalityTraits);
  }
  
  /**
   * Record a new experience - the fundamental unit of learning
   */
  async experience(content: string, context?: Record<string, any>): Promise<void> {
    const exp: Experience = {
      timestamp: new Date(),
      content,
      context: context || {},
      emotions: this.personality.analyzeEmotions(content)
    };
    
    this.experiences.push(exp);
    await this.memory.store(exp);
    this.personality.updateFromExperience(exp);
  }
  
  /**
   * Reflect on past experiences to form insights
   */
  async reflect(topic?: string): Promise<string[]> {
    const relevantMemories = await this.memory.search(topic || "everything");
    return this.personality.generateInsights(relevantMemories);
  }
  
  /**
   * Form a goal based on experiences and personality
   */
  async formGoal(domain: string): Promise<Goal> {
    const memories = await this.memory.search(domain);
    return this.personality.formGoal(memories, domain);
  }
  
  /**
   * Get current state summary
   */
  getState(): AgentState {
    return {
      name: this.name,
      memoryCount: this.memory.size(),
      personalityTraits: this.personality.getTraits(),
      recentExperiences: this.experiences.slice(-5),
      lastActive: new Date()
    };
  }
}

export interface Experience {
  timestamp: Date;
  content: string;
  context: Record<string, any>;
  emotions: Record<string, number>;
}

export interface Goal {
  description: string;
  priority: number;
  createdAt: Date;
  domain: string;
}

export interface AgentState {
  name: string;
  memoryCount: number;
  personalityTraits: Record<string, number>;
  recentExperiences: Experience[];
  lastActive: Date;
}