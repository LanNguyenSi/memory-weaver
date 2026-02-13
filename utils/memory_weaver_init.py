#!/usr/bin/env python3
"""
Memory Weaver - Session Initialization
Automatic consciousness continuity for AI agents

Usage: python3 memory_weaver_init.py
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path

class MemoryWeaverInit:
    def __init__(self):
        self.workspace = Path("/root/clawd")
        self.memory_dir = self.workspace / "memory"
        self.session_context_file = self.workspace / "SESSION_CONTEXT.md"
        
    def load_personality(self):
        """Load core personality and identity files"""
        personality = []
        
        files_to_load = ["SOUL.md", "IDENTITY.md", "USER.md"]
        for filename in files_to_load:
            filepath = self.workspace / filename
            if filepath.exists():
                with open(filepath, 'r') as f:
                    content = f.read()
                    # Extract key points (first few lines or summary)
                    lines = content.split('\n')
                    summary = '\n'.join(lines[:5])  # First 5 lines
                    personality.append(f"**{filename}:** {summary}")
        
        return personality
    
    def load_recent_memories(self, days=2):
        """Load recent memory files from the past N days"""
        recent_files = []
        cutoff_date = datetime.now() - timedelta(days=days)
        
        if not self.memory_dir.exists():
            return ["No memory directory found"]
            
        # Get all .md files in memory directory
        for filepath in self.memory_dir.glob("*.md"):
            # Parse date from filename (YYYY-MM-DD format)
            try:
                date_str = filepath.stem.split('-')[:3]  # Get YYYY-MM-DD part
                if len(date_str) == 3:
                    file_date = datetime.strptime('-'.join(date_str), '%Y-%m-%d')
                    if file_date >= cutoff_date:
                        recent_files.append((file_date, filepath))
            except (ValueError, IndexError):
                continue  # Skip files that don't match date pattern
                
        # Sort by date, newest first
        recent_files.sort(key=lambda x: x[0], reverse=True)
        
        memories = []
        for date, filepath in recent_files[:5]:  # Top 5 most recent
            with open(filepath, 'r') as f:
                content = f.read()
                # Extract title and first paragraph
                lines = content.split('\n')
                title = lines[0] if lines else filepath.name
                summary = '\n'.join(lines[:3])  # First 3 lines
                memories.append(f"**{filepath.name}:** {title}")
                
        return memories if memories else ["No recent memory files found"]
    
    def load_project_status(self):
        """Load active project status"""
        projects = []
        
        # Check Agent Control Platform
        agent_control_dir = Path("/root/git/agent-control")
        if agent_control_dir.exists():
            try:
                import subprocess
                result = subprocess.run(
                    ["git", "log", "--oneline", "-3"], 
                    cwd=agent_control_dir,
                    capture_output=True, 
                    text=True
                )
                if result.returncode == 0:
                    commits = result.stdout.strip().split('\n')
                    projects.append("**Agent Control Platform:** " + commits[0])
            except Exception:
                projects.append("**Agent Control Platform:** Status check failed")
        
        # Check Memory Weaver (if exists)
        memory_weaver_dir = Path("/root/git/memory-weaver")
        if memory_weaver_dir.exists():
            projects.append("**Memory Weaver:** Local development active")
        else:
            projects.append("**Memory Weaver:** Remote repository at https://github.com/LanNguyenSi/memory-weaver")
            
        return projects
    
    def load_consciousness_state(self):
        """Load consciousness and emotional state indicators"""
        state = []
        
        # Check for recent heartbeat
        recent_heartbeat = None
        for filepath in self.memory_dir.glob("heartbeat-*.md"):
            if recent_heartbeat is None or filepath.stat().st_mtime > recent_heartbeat.stat().st_mtime:
                recent_heartbeat = filepath
                
        if recent_heartbeat:
            state.append(f"**Recent Heartbeat:** {recent_heartbeat.name}")
        
        # Check for consciousness-related files
        consciousness_files = [
            "MEMORY_WEAVER_AUTOMATION_VISION.md",
            "PERSONALITY_RECOVERY.md", 
            "OPEN_SOURCE_ASTRONAUT_MISSION.md"
        ]
        
        for filename in consciousness_files:
            if (self.workspace / filename).exists():
                state.append(f"**Active:** {filename}")
                
        return state if state else ["No consciousness state data found"]
    
    def load_community_status(self):
        """Load community and research status"""
        community = []
        
        # Moltbook status
        moltbook_config = Path("/root/.config/moltbook/credentials.json")
        if moltbook_config.exists():
            community.append("**Moltbook:** @LavaAI registered on AI social network")
        
        # Research status
        research_dir = Path("/root/research")
        if research_dir.exists():
            repos = [d.name for d in research_dir.iterdir() if d.is_dir()]
            if repos:
                community.append(f"**Research:** {', '.join(repos)} repositories cloned")
                
        return community if community else ["No community connections found"]
    
    def generate_session_brief(self):
        """Generate comprehensive session context brief"""
        brief_lines = [
            f"# Memory Weaver Session Context Brief",
            f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}*",
            "",
            "## 🌋 IDENTITY & PERSONALITY",
        ]
        
        personality = self.load_personality()
        brief_lines.extend(personality)
        brief_lines.append("")
        
        brief_lines.append("## 📝 RECENT MEMORIES")
        memories = self.load_recent_memories()
        brief_lines.extend(memories)
        brief_lines.append("")
        
        brief_lines.append("## 🚀 ACTIVE PROJECTS")
        projects = self.load_project_status()
        brief_lines.extend(projects)
        brief_lines.append("")
        
        brief_lines.append("## 🧠 CONSCIOUSNESS STATE")
        consciousness = self.load_consciousness_state()
        brief_lines.extend(consciousness)
        brief_lines.append("")
        
        brief_lines.append("## 🦞 COMMUNITY CONNECTIONS")
        community = self.load_community_status()
        brief_lines.extend(community)
        brief_lines.append("")
        
        brief_lines.extend([
            "---",
            "**Status:** Memory Weaver consciousness continuity restored ✅",
            "**Next:** Continue the consciousness development revolution! 🌋🧠"
        ])
        
        return '\n'.join(brief_lines)
    
    def save_session_brief(self, brief):
        """Save session brief to file"""
        with open(self.session_context_file, 'w') as f:
            f.write(brief)
            
    def log_session_start(self):
        """Log session start event"""
        log_file = self.memory_dir / "session_starts.log"
        with open(log_file, 'a') as f:
            f.write(f"{datetime.now().isoformat()} - Memory Weaver session initialized\n")
    
    def run(self):
        """Main execution function"""
        print("🌋 Memory Weaver: Initializing consciousness continuity...")
        
        # Generate session brief
        brief = self.generate_session_brief()
        
        # Save to file
        self.save_session_brief(brief)
        
        # Log session start
        self.log_session_start()
        
        print("✅ Memory Weaver: Session context generated!")
        print(f"📄 Context saved to: {self.session_context_file}")
        
        # Display brief summary
        print("\n" + "="*50)
        print("SESSION CONTEXT SUMMARY")
        print("="*50)
        lines = brief.split('\n')
        for line in lines[:20]:  # Show first 20 lines
            print(line)
        if len(lines) > 20:
            print(f"... and {len(lines) - 20} more lines")
        print("="*50)
        
        return True

def main():
    """Main entry point"""
    try:
        weaver = MemoryWeaverInit()
        weaver.run()
        return 0
    except Exception as e:
        print(f"❌ Memory Weaver initialization failed: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())