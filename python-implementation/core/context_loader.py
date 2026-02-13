#!/usr/bin/env python3
"""
Context Loader - Intelligent pre-loading of critical context
Solves AI memory gaps through intelligent context pre-loading
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any

class ContextLoader:
    """Intelligent context pre-loading to prevent memory gaps"""
    
    def __init__(self, workspace_dir: str = "/workspace"):
        self.workspace = Path(workspace_dir)
        self.memory_dir = self.workspace / "memory"
        
    def load_critical_context(self) -> Dict[str, Any]:
        """Load all critical context to prevent surprise rediscoveries"""
        context = {}
        
        print("🧠 Loading critical context...")
        
        # 1. Identity & Core Files
        context['identity'] = self._load_identity_context()
        
        # 2. External Accounts & Credentials  
        context['external_accounts'] = self._load_external_accounts()
        
        # 3. Active Projects Status
        context['projects'] = self._load_project_status()
        
        # 4. Recent Breakthroughs & Memory
        context['recent_discoveries'] = self._load_recent_discoveries()
        
        # 5. Community & Social Presence
        context['community'] = self._load_community_context()
        
        return context
    
    def _load_identity_context(self) -> Dict[str, Any]:
        """Load core identity files"""
        identity = {}
        
        core_files = ['SOUL.md', 'IDENTITY.md', 'USER.md', 'AGENTS.md']
        for filename in core_files:
            filepath = self.workspace / filename
            if filepath.exists():
                with open(filepath, 'r') as f:
                    identity[filename] = f.read()[:500]  # First 500 chars
                    
        return identity
    
    def _load_external_accounts(self) -> Dict[str, Any]:
        """Check external account status to prevent rediscovery"""
        accounts = {}
        
        # Social platform credentials
        config_dir = Path("~/.config").expanduser()
        for platform in ['moltbook', 'discord', 'twitter']:
            creds_file = config_dir / platform / 'credentials.json'
            if creds_file.exists():
                try:
                    with open(creds_file, 'r') as f:
                        creds = json.load(f)
                        accounts[platform] = {
                            'status': 'active',
                            'agent_name': creds.get('agent_name', 'Unknown'),
                            'has_credentials': True
                        }
                except:
                    accounts[platform] = {'status': 'credentials_error'}
            else:
                accounts[platform] = {'status': 'not_configured'}
            
        # Git repositories
        try:
            import subprocess
            result = subprocess.run(['git', 'remote', 'get-url', 'origin'], 
                                 capture_output=True, text=True, cwd=self.workspace)
            if result.returncode == 0:
                accounts['git'] = {
                    'status': 'active',
                    'repo': result.stdout.strip(),
                    'configured': True
                }
        except:
            accounts['git'] = {'status': 'unknown'}
            
        return accounts
    
    def _load_project_status(self) -> Dict[str, Any]:
        """Load active project status"""
        projects = {}
        
        # Scan workspace for active projects
        if self.workspace.exists():
            for item in self.workspace.iterdir():
                if item.is_dir() and (item / '.git').exists():
                    try:
                        import subprocess
                        result = subprocess.run(['git', 'log', '--oneline', '-3'], 
                                             capture_output=True, text=True, cwd=item)
                        if result.returncode == 0:
                            recent_commits = result.stdout.strip().split('\n')
                            projects[item.name] = {
                                'status': 'active',
                                'path': str(item),
                                'recent_commits': recent_commits
                            }
                    except:
                        projects[item.name] = {'status': 'path_exists', 'git_error': True}
                
        return projects
    
    def _load_recent_discoveries(self) -> List[Dict[str, str]]:
        """Load recent breakthroughs and discoveries"""
        discoveries = []
        
        # Check last 3 days of memory files
        cutoff_date = datetime.now() - timedelta(days=3)
        
        if self.memory_dir.exists():
            for memory_file in self.memory_dir.glob("*.md"):
                try:
                    # Parse date from filename (YYYY-MM-DD format)
                    date_match = str(memory_file.name)[:10]
                    file_date = datetime.strptime(date_match, '%Y-%m-%d')
                    
                    if file_date >= cutoff_date:
                        with open(memory_file, 'r') as f:
                            content = f.read()
                            
                        # Extract breakthrough indicators
                        breakthrough_indicators = [
                            'breakthrough', 'BREAKTHROUGH', '🚀', '🧠', '✨',
                            'autonomous', 'self-reflection', 'discovery'
                        ]
                        
                        for indicator in breakthrough_indicators:
                            if indicator in content:
                                discoveries.append({
                                    'file': memory_file.name,
                                    'date': date_match,
                                    'type': 'breakthrough',
                                    'indicator': indicator
                                })
                                break
                                
                except Exception:
                    continue
                    
        return discoveries[-10:]  # Last 10 discoveries
    
    def _load_community_context(self) -> Dict[str, Any]:
        """Load community engagement context"""
        community = {}
        
        # Check for community integration files
        community_files = ['community.md', 'social.md', 'platforms.md']
        for filename in community_files:
            filepath = self.memory_dir / filename
            if filepath.exists():
                with open(filepath, 'r') as f:
                    content = f.read()
                    if 'integration' in content.lower():
                        community[filename[:-3]] = {
                            'integration_exists': True,
                            'status': 'active'
                        }
                        
        return community
    
    def generate_context_summary(self, context: Dict[str, Any]) -> str:
        """Generate human-readable context summary"""
        summary = ["🧠 CRITICAL CONTEXT LOADED:"]
        
        # External Accounts
        accounts = context.get('external_accounts', {})
        for platform, info in accounts.items():
            if info.get('status') == 'active':
                summary.append(f"🔗 **{platform.title()}:** Active account configured")
                
        # Projects
        projects = context.get('projects', {})
        if projects:
            summary.append(f"🏗️ **Projects:** {len(projects)} active repositories detected")
            
        # Recent Discoveries
        discoveries = context.get('recent_discoveries', [])
        if discoveries:
            recent_count = len([d for d in discoveries if d['date'] == datetime.now().strftime('%Y-%m-%d')])
            if recent_count > 0:
                summary.append(f"✨ **Today:** {recent_count} breakthroughs achieved")
                
        # Community
        community = context.get('community', {})
        active_communities = len([c for c in community.values() if c.get('status') == 'active'])
        if active_communities > 0:
            summary.append(f"🌐 **Community:** {active_communities} active integrations")
            
        return "\n".join(summary)

def quick_context_check():
    """Quick context check for immediate use"""
    loader = ContextLoader()
    context = loader.load_critical_context()
    summary = loader.generate_context_summary(context)
    
    print(summary)
    return context

if __name__ == "__main__":
    print("Memory Weaver - Context Loader Test")
    quick_context_check()