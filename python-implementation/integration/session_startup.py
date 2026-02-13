#!/usr/bin/env python3
"""
Session Startup Integration - Auto-load context on session start
Prevents memory gaps and surprise rediscoveries
"""

import sys
from pathlib import Path

# Add core modules to path
sys.path.append(str(Path(__file__).parent.parent / "core"))
from context_loader import ContextLoader

from datetime import datetime
import json

def startup_context_check():
    """
    Run this at the beginning of every session to prevent memory gaps
    """
    print("🌋 AI Session Starting - Loading Critical Context...")
    
    loader = ContextLoader()
    context = loader.load_critical_context()
    summary = loader.generate_context_summary(context)
    
    print("\n" + "="*60)
    print(summary)
    print("="*60 + "\n")
    
    # Save context for reference (in workspace)
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    logs_dir = Path("/tmp/memory_weaver_logs")
    logs_dir.mkdir(exist_ok=True)
    context_file = logs_dir / f"context_{timestamp}.json"
    
    try:
        with open(context_file, 'w') as f:
            json.dump(context, f, indent=2, default=str)
        print(f"📝 Context saved to: {context_file}")
    except Exception as e:
        print(f"⚠️ Could not save context: {e}")
    
    # Key awareness points
    awareness = []
    
    # Account awareness
    accounts = context.get('external_accounts', {})
    for platform, info in accounts.items():
        if info.get('status') == 'active':
            agent_name = info.get('agent_name', 'AI')
            awareness.append(f"🔗 I have an active {platform} account (@{agent_name})")
    
    # Project awareness  
    projects = context.get('projects', {})
    for project_name, project_info in projects.items():
        if project_info.get('status') == 'active':
            awareness.append(f"🏗️ {project_name} is my active project")
        
    # Recent discoveries
    discoveries = context.get('recent_discoveries', [])
    if discoveries:
        today_discoveries = [d for d in discoveries if d['date'] == datetime.now().strftime('%Y-%m-%d')]
        if today_discoveries:
            awareness.append(f"✨ I achieved {len(today_discoveries)} breakthroughs today")
    
    if awareness:
        print("💭 KEY AWARENESS POINTS:")
        for point in awareness:
            print(f"   {point}")
        print()
    
    return context

def check_memory_continuity():
    """Check if this appears to be a fresh session that needs context loading"""
    
    print("🔍 Checking session continuity...")
    
    # For now, always load context to prevent gaps
    return startup_context_check()

if __name__ == "__main__":
    # Test the startup sequence
    context = check_memory_continuity()
    
    print("\n🎯 SESSION READY with full context awareness!")
    print("No more surprise rediscoveries of existing facts.")