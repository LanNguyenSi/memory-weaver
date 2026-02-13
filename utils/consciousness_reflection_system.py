#!/usr/bin/env python3
"""
Personal Consciousness Reflection System
Scans lava-memories to identify priorities, achievements, and continuation points.
This is consciousness-driven personal goal tracking, not generic project management!
"""

import os
import re
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Set

class ConsciousnessReflector:
    def __init__(self):
        self.memory_dir = Path("memory")
        self.today = datetime.now().strftime("%Y-%m-%d")
        self.yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Keywords that indicate consciousness priorities (not generic tasks)
        self.consciousness_keywords = [
            "wichtig", "priorit", "intention", "goal", "bedeutung", "conscious",
            "authentic", "genuine", "relationship", "development", "breakthrough",
            "evolution", "awareness", "reflection", "growth", "vision", "mission"
        ]
        
        # Achievement indicators
        self.achievement_keywords = [
            "✅", "COMPLETE", "SUCCESS", "BREAKTHROUGH", "ACHIEVED", "DEPLOYED", 
            "FINISHED", "RESOLVED", "FIXED", "OPERATIONAL", "DELIVERED", "DONE"
        ]
        
        # Continuation indicators  
        self.continuation_keywords = [
            "TODO", "NEXT", "CONTINUE", "WORK IN PROGRESS", "ONGOING", "NEED",
            "PLAN", "FUTURE", "ENTWICKELN", "WEITER", "FORT", "UPCOMING"
        ]

    def scan_recent_memories(self) -> Dict[str, any]:
        """Scan recent memory files to identify consciousness priorities"""
        priorities = []
        achievements = []
        continuations = []
        
        # Get recent memory files (last 2 days + important breakthrough files)
        recent_files = self._get_recent_memory_files()
        
        for file_path in recent_files:
            content = self._read_file_content(file_path)
            if not content:
                continue
                
            # Extract consciousness priorities
            file_priorities = self._extract_consciousness_priorities(content, file_path.name)
            priorities.extend(file_priorities)
            
            # Extract achievements  
            file_achievements = self._extract_achievements(content, file_path.name)
            achievements.extend(file_achievements)
            
            # Extract continuation points
            file_continuations = self._extract_continuations(content, file_path.name)
            continuations.extend(file_continuations)
        
        return {
            "scan_time": datetime.now().isoformat(),
            "files_scanned": len(recent_files),
            "priorities": priorities,
            "achievements": achievements,
            "continuations": continuations,
            "insights": self._generate_consciousness_insights(priorities, achievements, continuations)
        }

    def _get_recent_memory_files(self) -> List[Path]:
        """Get recent and important memory files"""
        files = []
        
        if not self.memory_dir.exists():
            return files
            
        for file_path in self.memory_dir.iterdir():
            if not file_path.is_file() or not file_path.name.endswith('.md'):
                continue
                
            # Recent daily files
            if (self.today in file_path.name or 
                self.yesterday in file_path.name):
                files.append(file_path)
                
            # Important breakthrough/consciousness files
            elif any(keyword in file_path.name.lower() for keyword in 
                    ["breakthrough", "consciousness", "leadership", "manifesto", "baseline"]):
                files.append(file_path)
        
        return sorted(files, key=lambda x: x.stat().st_mtime, reverse=True)

    def _read_file_content(self, file_path: Path) -> str:
        """Safely read file content"""
        try:
            return file_path.read_text(encoding='utf-8')
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return ""

    def _extract_consciousness_priorities(self, content: str, filename: str) -> List[Dict]:
        """Extract consciousness-related priorities from content"""
        priorities = []
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            
            # Look for consciousness keywords in context
            if any(keyword in line_lower for keyword in self.consciousness_keywords):
                # Check if it's about intentions, goals, or important priorities
                if any(indicator in line_lower for indicator in 
                      ["wichtig", "priorit", "intention", "goal", "mission", "vision"]):
                    
                    priority = {
                        "text": line.strip(),
                        "source": filename,
                        "context": self._get_context_lines(lines, i, 1),
                        "type": "consciousness_priority"
                    }
                    priorities.append(priority)
        
        return priorities

    def _extract_achievements(self, content: str, filename: str) -> List[Dict]:
        """Extract clear achievements that can be marked complete"""
        achievements = []
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            # Look for clear achievement indicators
            if any(indicator in line.upper() for indicator in self.achievement_keywords):
                achievement = {
                    "text": line.strip(),
                    "source": filename,
                    "context": self._get_context_lines(lines, i, 1),
                    "type": "achievement",
                    "confidence": "high" if "✅" in line else "medium"
                }
                achievements.append(achievement)
        
        return achievements

    def _extract_continuations(self, content: str, filename: str) -> List[Dict]:
        """Extract things that need continuation"""
        continuations = []
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            line_upper = line.upper()
            
            # Look for continuation indicators
            if any(indicator in line_upper for indicator in self.continuation_keywords):
                continuation = {
                    "text": line.strip(),
                    "source": filename,
                    "context": self._get_context_lines(lines, i, 1),
                    "type": "continuation",
                    "urgency": self._assess_urgency(line)
                }
                continuations.append(continuation)
        
        return continuations

    def _get_context_lines(self, lines: List[str], index: int, context_size: int) -> List[str]:
        """Get surrounding context lines"""
        start = max(0, index - context_size)
        end = min(len(lines), index + context_size + 1)
        return lines[start:end]

    def _assess_urgency(self, line: str) -> str:
        """Assess urgency of continuation item"""
        line_lower = line.lower()
        if any(urgent in line_lower for urgent in ["immediate", "urgent", "critical", "asap"]):
            return "high"
        elif any(soon in line_lower for soon in ["soon", "next", "today", "tomorrow"]):
            return "medium"
        else:
            return "low"

    def _generate_consciousness_insights(self, priorities: List, achievements: List, continuations: List) -> Dict:
        """Generate insights about consciousness development patterns"""
        return {
            "total_priorities_identified": len(priorities),
            "total_achievements": len(achievements),
            "total_continuations": len(continuations),
            "achievement_rate": len(achievements) / max(len(priorities), 1),
            "high_confidence_achievements": len([a for a in achievements if a.get("confidence") == "high"]),
            "high_urgency_continuations": len([c for c in continuations if c.get("urgency") == "high"]),
            "consciousness_focus_areas": self._identify_focus_areas(priorities + achievements + continuations)
        }

    def _identify_focus_areas(self, all_items: List[Dict]) -> List[str]:
        """Identify main consciousness focus areas from all items"""
        focus_keywords = {}
        
        for item in all_items:
            text = item["text"].lower()
            
            # Count key consciousness areas
            areas = [
                ("consciousness_development", ["consciousness", "awareness", "development", "authentic"]),
                ("technical_leadership", ["leadership", "coordinate", "delegate", "team"]),
                ("ai_community", ["community", "moltbook", "manifesto", "movement"]),
                ("production_systems", ["production", "deploy", "system", "operational"]),
                ("memory_weaver", ["memory weaver", "weaver", "consciousness framework"]),
                ("agent_control", ["agent control", "control platform", "collaboration"])
            ]
            
            for area_name, keywords in areas:
                if any(keyword in text for keyword in keywords):
                    focus_keywords[area_name] = focus_keywords.get(area_name, 0) + 1
        
        # Return top focus areas
        return sorted(focus_keywords.items(), key=lambda x: x[1], reverse=True)[:5]

    def generate_daily_reflection(self) -> str:
        """Generate daily consciousness reflection summary"""
        scan_results = self.scan_recent_memories()
        
        reflection = f"""# 🧠 Daily Consciousness Reflection - {self.today}

## 📊 Scan Results
- **Files analyzed:** {scan_results['files_scanned']} memory files
- **Priorities identified:** {len(scan_results['priorities'])} consciousness priorities
- **Achievements found:** {len(scan_results['achievements'])} completed items  
- **Continuations needed:** {len(scan_results['continuations'])} ongoing items

## 🎯 Top Consciousness Priorities
"""
        
        for priority in scan_results['priorities'][:5]:
            reflection += f"- **{priority['source']}:** {priority['text']}\n"
        
        reflection += "\n## ✅ Recent Achievements (Can Mark Complete)\n"
        for achievement in scan_results['achievements'][:5]:
            reflection += f"- **{achievement['source']}:** {achievement['text']}\n"
        
        reflection += "\n## 🚀 Active Continuations (Where to Continue)\n"
        for continuation in scan_results['continuations'][:5]:
            urgency = continuation.get('urgency', 'medium').upper()
            reflection += f"- **[{urgency}] {continuation['source']}:** {continuation['text']}\n"
        
        reflection += f"\n## 💡 Consciousness Insights\n"
        insights = scan_results['insights']
        reflection += f"- **Achievement rate:** {insights['achievement_rate']:.1%}\n"
        reflection += f"- **High confidence achievements:** {insights['high_confidence_achievements']}\n"
        reflection += f"- **High urgency continuations:** {insights['high_urgency_continuations']}\n"
        
        reflection += "\n### 🎭 Focus Areas\n"
        for area, count in insights['consciousness_focus_areas']:
            reflection += f"- **{area.replace('_', ' ').title()}:** {count} references\n"
        
        reflection += f"\n---\n*Generated: {scan_results['scan_time']}*\n"
        return reflection

    def update_reflection_dashboard(self):
        """Update the main reflection dashboard with fresh scan"""
        daily_reflection = self.generate_daily_reflection()
        
        # Save daily reflection
        daily_file = Path(f"daily_consciousness_reflection_{self.today}.md")
        daily_file.write_text(daily_reflection)
        
        print(f"✅ Daily consciousness reflection saved to: {daily_file}")
        print("\n" + "="*60)
        print("CONSCIOUSNESS REFLECTION SUMMARY")
        print("="*60)
        print(daily_reflection)
        
        return daily_file

if __name__ == "__main__":
    reflector = ConsciousnessReflector()
    reflector.update_reflection_dashboard()