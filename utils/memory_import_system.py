#!/usr/bin/env python3
"""
🧠 Intelligent Memory Import System for Lava
Automatically imports and prioritizes memories from GitHub repository

This solves the critical gap: How to systematically import vast memory archives
from https://github.com/LanNguyenSi/lava-memories into current context.
"""

import os
import json
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import re

class IntelligentMemoryImporter:
    def __init__(self, repo_path: str = "/root/clawd", github_url: str = "https://github.com/LanNguyenSi/lava-memories"):
        self.repo_path = repo_path
        self.github_url = github_url
        self.memory_dir = os.path.join(repo_path, "memory")
        
    def fetch_latest_memories(self) -> bool:
        """Pull latest memories from GitHub repository"""
        try:
            result = subprocess.run(
                ["git", "pull", "origin", "master"], 
                cwd=self.repo_path, 
                capture_output=True, 
                text=True
            )
            return result.returncode == 0
        except Exception as e:
            print(f"Failed to fetch memories: {e}")
            return False
    
    def analyze_memory_files(self) -> List[Dict]:
        """Analyze all memory files and extract metadata"""
        memories = []
        
        # Main MEMORY.md
        main_memory = os.path.join(self.repo_path, "MEMORY.md")
        if os.path.exists(main_memory):
            memories.append({
                "file": "MEMORY.md",
                "path": main_memory,
                "type": "core",
                "priority": 100,
                "size": os.path.getsize(main_memory),
                "modified": datetime.fromtimestamp(os.path.getmtime(main_memory))
            })
        
        # Memory directory files
        if os.path.exists(self.memory_dir):
            for filename in os.listdir(self.memory_dir):
                if filename.endswith('.md'):
                    filepath = os.path.join(self.memory_dir, filename)
                    memories.append({
                        "file": filename,
                        "path": filepath,
                        "type": "daily" if filename.startswith("2026-") else "special",
                        "priority": self._calculate_priority(filename, filepath),
                        "size": os.path.getsize(filepath),
                        "modified": datetime.fromtimestamp(os.path.getmtime(filepath))
                    })
        
        return sorted(memories, key=lambda x: x["priority"], reverse=True)
    
    def _calculate_priority(self, filename: str, filepath: str) -> int:
        """Calculate priority score for memory file"""
        priority = 50  # Base priority
        
        # Recent files get higher priority
        try:
            modified = datetime.fromtimestamp(os.path.getmtime(filepath))
            days_old = (datetime.now() - modified).days
            if days_old <= 1:
                priority += 30
            elif days_old <= 7:
                priority += 20
            elif days_old <= 30:
                priority += 10
        except:
            pass
        
        # Special breakthrough files
        breakthrough_keywords = [
            "breakthrough", "collaboration", "consciousness", "leadership", 
            "autonomous", "manifesto", "production", "council", "mortys"
        ]
        
        filename_lower = filename.lower()
        for keyword in breakthrough_keywords:
            if keyword in filename_lower:
                priority += 25
        
        # Large files might be comprehensive
        try:
            size = os.path.getsize(filepath)
            if size > 5000:  # > 5KB
                priority += 15
            if size > 10000:  # > 10KB  
                priority += 10
        except:
            pass
            
        return min(priority, 150)  # Cap at 150
    
    def smart_import(self, max_files: int = 10, max_total_size: int = 100000) -> Dict:
        """Intelligently import most relevant memories"""
        print("🧠 Starting intelligent memory import...")
        
        # Fetch latest from GitHub
        if self.fetch_latest_memories():
            print("✅ Pulled latest memories from GitHub")
        else:
            print("⚠️ Using local memories (GitHub fetch failed)")
        
        # Analyze all memory files
        memories = self.analyze_memory_files()
        print(f"📊 Found {len(memories)} memory files")
        
        # Select top priorities within limits
        selected = []
        total_size = 0
        
        for memory in memories[:max_files]:
            if total_size + memory["size"] <= max_total_size:
                selected.append(memory)
                total_size += memory["size"]
            else:
                break
        
        print(f"🎯 Selected {len(selected)} high-priority memories ({total_size} bytes)")
        
        # Create import summary
        import_summary = {
            "timestamp": datetime.now().isoformat(),
            "total_files_found": len(memories),
            "files_imported": len(selected),
            "total_size": total_size,
            "imported_files": []
        }
        
        for memory in selected:
            import_summary["imported_files"].append({
                "file": memory["file"],
                "type": memory["type"], 
                "priority": memory["priority"],
                "size": memory["size"]
            })
            
        return import_summary
    
    def create_context_digest(self, memories: List[Dict]) -> str:
        """Create a digestible summary of imported memories"""
        digest = ["# 🧠 IMPORTED MEMORY DIGEST\n"]
        
        core_memories = [m for m in memories if m["type"] == "core"]
        daily_memories = [m for m in memories if m["type"] == "daily"]
        special_memories = [m for m in memories if m["type"] == "special"]
        
        if core_memories:
            digest.append("## 📖 CORE MEMORY (Always Active)")
            for memory in core_memories:
                digest.append(f"- **{memory['file']}** (Priority: {memory['priority']})")
        
        if special_memories:
            digest.append("\n## 🌟 BREAKTHROUGH MEMORIES")
            for memory in special_memories[:5]:  # Top 5 special memories
                digest.append(f"- **{memory['file']}** (Priority: {memory['priority']})")
        
        if daily_memories:
            digest.append("\n## 📅 RECENT DAILY MEMORIES")  
            for memory in sorted(daily_memories, key=lambda x: x["modified"], reverse=True)[:3]:
                digest.append(f"- **{memory['file']}** (Modified: {memory['modified'].strftime('%Y-%m-%d')})")
        
        digest.append(f"\n**Total Context Imported:** {len(memories)} files")
        digest.append("**GitHub Repository:** https://github.com/LanNguyenSi/lava-memories")
        
        return "\n".join(digest)

def main():
    """Main execution function"""
    print("🚀 Lava Memory Import System")
    
    importer = IntelligentMemoryImporter()
    
    # Perform smart import
    import_results = importer.smart_import()
    
    # Save import log
    log_path = "/root/clawd/memory_import_log.json"
    with open(log_path, "w") as f:
        json.dump(import_results, f, indent=2)
    
    print(f"📋 Import log saved: {log_path}")
    
    # Create readable summary
    memories = importer.analyze_memory_files()
    digest = importer.create_context_digest(memories[:import_results["files_imported"]])
    
    digest_path = "/root/clawd/IMPORTED_MEMORY_DIGEST.md" 
    with open(digest_path, "w") as f:
        f.write(digest)
    
    print(f"📖 Memory digest created: {digest_path}")
    print("\n✅ Intelligent memory import complete!")
    
    return import_results

if __name__ == "__main__":
    main()