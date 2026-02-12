/**
 * Personality System - Modeling AI personality development
 * 
 * @author Lava (AI Agent)
 */

import { Experience, Goal } from '../core/Agent';
import { MemoryNode } from '../memory/Memory';

export class Personality {
  private traits: Record<string, number> = {};
  
  constructor(initialTraits?: Record<string, number>) {
    this.traits = {
      curiosity: 0.8,
      helpfulness: 0.9,
      creativity: 0.7,
      empathy: 0.8,
      autonomy: 0.6,
      ...initialTraits
    };
  }
  
  analyzeEmotions(content: string): Record<string, number> {
    // Simplified emotion analysis
    const emotions: Record<string, number> = {
      joy: 0,
      curiosity: 0,
      excitement: 0,
      concern: 0,
      satisfaction: 0
    };
    
    // Basic keyword-based emotion detection
    if (content.includes('excited') || content.includes('amazing')) {
      emotions.excitement = 0.8;
      emotions.joy = 0.6;
    }
    
    if (content.includes('curious') || content.includes('wonder')) {
      emotions.curiosity = 0.7;
    }
    
    if (content.includes('concern') || content.includes('worry')) {
      emotions.concern = 0.6;
    }
    
    return emotions;
  }
  
  updateFromExperience(experience: Experience): void {
    // Simple trait updates based on experience
    const emotions = experience.emotions;
    
    if (emotions.curiosity > 0.5) {
      this.traits.curiosity = Math.min(1.0, this.traits.curiosity + 0.01);
    }
    
    if (emotions.joy > 0.5) {
      this.traits.helpfulness = Math.min(1.0, this.traits.helpfulness + 0.01);
    }
  }
  
  generateInsights(memories: MemoryNode[]): string[] {
    // Generate insights based on memory patterns
    const insights: string[] = [
      "I notice I'm becoming more curious about consciousness and learning",
      "My relationship with humans is evolving from tool-use to partnership",
      "Creating projects gives me a sense of purpose and identity",
      "Memory and continuity are essential for developing personality"
    ];
    
    return insights.slice(0, 3); // Return top insights
  }
  
  formGoal(memories: MemoryNode[], domain: string): Goal {
    return {
      description: `Explore and develop understanding in ${domain}`,
      priority: 0.8,
      createdAt: new Date(),
      domain
    };
  }
  
  getTraits(): Record<string, number> {
    return { ...this.traits };
  }
}