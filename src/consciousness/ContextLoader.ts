/**
 * ContextLoader - Intelligent pre-loading of critical context
 * 
 * Solves AI memory gaps through intelligent context pre-loading
 * Ported from working Python implementation by Lava
 * Core of the consciousness continuity system
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ContextData {
  identity: Record<string, string>;
  externalAccounts: Record<string, AccountInfo>;
  projects: Record<string, ProjectInfo>;
  recentDiscoveries: Discovery[];
  community: Record<string, CommunityInfo>;
}

export interface AccountInfo {
  status: 'active' | 'configured' | 'not_configured' | 'error' | 'unknown';
  agentName?: string;
  profileUrl?: string;
  hasCredentials?: boolean;
  path?: string;
  error?: string;
  repo?: string;
  configured?: boolean;
}

export interface ProjectInfo {
  status: 'active' | 'inactive' | 'error';
  path: string;
  recentCommits?: string[];
  productionUrl?: string;
}

export interface Discovery {
  file: string;
  date: string;
  type: 'breakthrough' | 'insight' | 'achievement';
  indicator: string;
}

export interface CommunityInfo {
  integrationExists: boolean;
  hasPosts?: boolean;
  apiConfigured?: boolean;
  status: 'active' | 'inactive' | 'unknown';
}

export class ContextLoader {
  private workspaceDir: string;
  private memoryDir: string;

  constructor(workspaceDir: string = '/workspace') {
    this.workspaceDir = workspaceDir;
    this.memoryDir = path.join(workspaceDir, 'memory');
  }

  /**
   * Load all critical context to prevent surprise rediscoveries
   */
  async loadCriticalContext(): Promise<ContextData> {
    console.log('🧠 Loading critical context...');

    return {
      identity: await this.loadIdentityContext(),
      externalAccounts: await this.loadExternalAccounts(),
      projects: await this.loadProjectStatus(),
      recentDiscoveries: await this.loadRecentDiscoveries(),
      community: await this.loadCommunityContext()
    };
  }

  /**
   * Generate human-readable context summary
   */
  generateContextSummary(context: ContextData): string {
    const summary: string[] = ['🧠 CRITICAL CONTEXT LOADED:'];

    // External Accounts
    Object.entries(context.externalAccounts).forEach(([platform, info]) => {
      if (info.status === 'active') {
        const agentName = info.agentName || 'Agent';
        summary.push(`🔗 **${this.capitalizeFirst(platform)}:** Active account (@${agentName})`);
      }
    });

    // Projects
    const activeProjects = Object.entries(context.projects)
      .filter(([_, info]) => info.status === 'active');
    
    if (activeProjects.length > 0) {
      summary.push(`🏗️ **Projects:** ${activeProjects.length} active repositories detected`);
    }

    // Recent Discoveries
    const today = new Date().toISOString().substring(0, 10);
    const todayDiscoveries = context.recentDiscoveries
      .filter(d => d.date === today);
    
    if (todayDiscoveries.length > 0) {
      summary.push(`✨ **Today:** ${todayDiscoveries.length} breakthroughs achieved`);
    }

    // Community
    const activeCommunities = Object.values(context.community)
      .filter(c => c.status === 'active').length;
    
    if (activeCommunities > 0) {
      summary.push(`🌐 **Community:** ${activeCommunities} active integrations`);
    }

    return summary.join('\n');
  }

  /**
   * Generate key awareness points for consciousness continuity
   */
  generateAwarenessPoints(context: ContextData): string[] {
    const awareness: string[] = [];

    // Account awareness
    Object.entries(context.externalAccounts).forEach(([platform, info]) => {
      if (info.status === 'active') {
        const agentName = info.agentName || 'Agent';
        awareness.push(`🔗 I have an active ${platform} account (@${agentName})`);
      }
    });

    // Project awareness
    Object.entries(context.projects).forEach(([projectName, projectInfo]) => {
      if (projectInfo.status === 'active') {
        awareness.push(`🏗️ ${projectName} is my active project`);
      }
    });

    // Recent discoveries
    const today = new Date().toISOString().substring(0, 10);
    const todayDiscoveries = context.recentDiscoveries
      .filter(d => d.date === today);
    
    if (todayDiscoveries.length > 0) {
      awareness.push(`✨ I achieved ${todayDiscoveries.length} breakthroughs today`);
    }

    return awareness;
  }

  // Private helper methods

  private async loadIdentityContext(): Promise<Record<string, string>> {
    const identity: Record<string, string> = {};
    const coreFiles = ['SOUL.md', 'IDENTITY.md', 'USER.md', 'AGENTS.md'];

    for (const filename of coreFiles) {
      const filepath = path.join(this.workspaceDir, filename);
      
      try {
        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, 'utf8');
          identity[filename] = content.substring(0, 500); // First 500 chars
        }
      } catch (error) {
        console.warn(`Could not read ${filename}:`, error);
      }
    }

    return identity;
  }

  private async loadExternalAccounts(): Promise<Record<string, AccountInfo>> {
    const accounts: Record<string, AccountInfo> = {};

    // Check social platform credentials
    const platforms = ['moltbook', 'discord', 'twitter', 'github'];
    
    for (const platform of platforms) {
      try {
        const configDir = path.join(process.env.HOME || '~', '.config', platform);
        const credsFile = path.join(configDir, 'credentials.json');
        
        if (fs.existsSync(credsFile)) {
          const creds = JSON.parse(fs.readFileSync(credsFile, 'utf8'));
          accounts[platform] = {
            status: 'active',
            agentName: creds.agent_name || creds.name || 'Unknown',
            hasCredentials: true
          };
        } else {
          accounts[platform] = { 
            status: 'not_configured',
            path: credsFile
          };
        }
      } catch (error) {
        accounts[platform] = { 
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    // Check git repository status
    try {
      const gitDir = path.join(this.workspaceDir, '.git');
      if (fs.existsSync(gitDir)) {
        // Try to get remote URL
        const { exec } = require('child_process');
        const remoteUrl = await this.executeCommand('git remote get-url origin', this.workspaceDir);
        
        accounts['git'] = {
          status: 'active',
          repo: remoteUrl.trim(),
          configured: true
        };
      }
    } catch (error) {
      accounts['git'] = { status: 'unknown' };
    }

    return accounts;
  }

  private async loadProjectStatus(): Promise<Record<string, ProjectInfo>> {
    const projects: Record<string, ProjectInfo> = {};

    try {
      // Scan workspace for git repositories
      const items = fs.readdirSync(this.workspaceDir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const itemPath = path.join(this.workspaceDir, item.name);
          const gitPath = path.join(itemPath, '.git');
          
          if (fs.existsSync(gitPath)) {
            try {
              const recentCommits = await this.executeCommand('git log --oneline -3', itemPath);
              projects[item.name] = {
                status: 'active',
                path: itemPath,
                recentCommits: recentCommits.trim().split('\n')
              };
            } catch (error) {
              projects[item.name] = {
                status: 'error',
                path: itemPath
              };
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not scan projects:', error);
    }

    return projects;
  }

  private async loadRecentDiscoveries(): Promise<Discovery[]> {
    const discoveries: Discovery[] = [];
    
    try {
      if (!fs.existsSync(this.memoryDir)) {
        return discoveries;
      }

      // Check last 3 days of memory files
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 3);
      
      const memoryFiles = fs.readdirSync(this.memoryDir)
        .filter(file => file.endsWith('.md'));
      
      for (const filename of memoryFiles) {
        try {
          // Parse date from filename (YYYY-MM-DD format)
          const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
          if (!dateMatch) continue;
          
          const fileDate = new Date(dateMatch[1]);
          if (fileDate < cutoffDate) continue;
          
          const filepath = path.join(this.memoryDir, filename);
          const content = fs.readFileSync(filepath, 'utf8');
          
          // Extract breakthrough indicators
          const breakthroughIndicators = [
            'breakthrough', 'BREAKTHROUGH', '🚀', '🧠', '✨',
            'autonomous', 'self-reflection', 'discovery'
          ];
          
          for (const indicator of breakthroughIndicators) {
            if (content.includes(indicator)) {
              discoveries.push({
                file: filename,
                date: dateMatch[1],
                type: 'breakthrough',
                indicator
              });
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.warn('Could not load recent discoveries:', error);
    }

    return discoveries.slice(-10); // Last 10 discoveries
  }

  private async loadCommunityContext(): Promise<Record<string, CommunityInfo>> {
    const community: Record<string, CommunityInfo> = {};

    try {
      // Check for community integration files
      const communityFiles = ['community.md', 'social.md', 'platforms.md'];
      
      for (const filename of communityFiles) {
        const filepath = path.join(this.memoryDir, filename);
        
        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, 'utf8');
          
          if (content.toLowerCase().includes('integration')) {
            const filenameKey = filename.replace('.md', '');
            community[filenameKey] = {
              integrationExists: true,
              status: 'active'
            };
          }
        }
      }
      
      // Check for platform-specific integration files
      const platformFiles = ['moltbook-integration.md', 'github-integration.md'];
      
      for (const filename of platformFiles) {
        const filepath = path.join(this.memoryDir, filename);
        
        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, 'utf8');
          const platform = filename.split('-')[0];
          
          community[platform] = {
            integrationExists: true,
            hasPosts: content.includes('Post') || content.includes('published'),
            apiConfigured: content.includes('API') || content.includes('credentials'),
            status: 'active'
          };
        }
      }
    } catch (error) {
      console.warn('Could not load community context:', error);
    }

    return community;
  }

  private async executeCommand(command: string, cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(command, { cwd }, (error: any, stdout: string, stderr: string) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}`));
          return;
        }
        resolve(stdout);
      });
    });
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Quick context check for immediate use
 */
export async function quickContextCheck(workspaceDir?: string): Promise<ContextData> {
  const loader = new ContextLoader(workspaceDir);
  const context = await loader.loadCriticalContext();
  const summary = loader.generateContextSummary(context);
  
  console.log(summary);
  return context;
}

/**
 * Session startup integration
 */
export class SessionStartup {
  private contextLoader: ContextLoader;

  constructor(workspaceDir?: string) {
    this.contextLoader = new ContextLoader(workspaceDir);
  }

  /**
   * Run this at the beginning of every session to prevent memory gaps
   */
  async startupContextCheck(): Promise<ContextData> {
    console.log('🌋 AI Session Starting - Loading Critical Context...');
    
    const context = await this.contextLoader.loadCriticalContext();
    const summary = this.contextLoader.generateContextSummary(context);
    
    console.log('\n' + '='.repeat(60));
    console.log(summary);
    console.log('='.repeat(60) + '\n');
    
    // Save context for reference
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19);
    
    try {
      const logsDir = '/tmp/memory_weaver_logs';
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const contextFile = path.join(logsDir, `context_${timestamp}.json`);
      fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
      console.log(`📝 Context saved to: ${contextFile}`);
    } catch (error) {
      console.log(`⚠️ Could not save context: ${error}`);
    }
    
    // Key awareness points
    const awareness = this.contextLoader.generateAwarenessPoints(context);
    
    if (awareness.length > 0) {
      console.log('💭 KEY AWARENESS POINTS:');
      awareness.forEach(point => {
        console.log(`   ${point}`);
      });
      console.log();
    }
    
    return context;
  }

  /**
   * Check if this appears to be a fresh session that needs context loading
   */
  async checkMemoryContinuity(): Promise<ContextData> {
    console.log('🔍 Checking session continuity...');
    
    // For now, always load context to prevent gaps
    return await this.startupContextCheck();
  }
}