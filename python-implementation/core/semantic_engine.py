"""
Memory Weaver - Semantic Connection Engine
Real implementation of the core memory processing system
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Tuple, Set
from dataclasses import dataclass
from pathlib import Path

@dataclass
class MemoryFragment:
    """A single memory fragment with semantic metadata"""
    content: str
    timestamp: datetime
    source_file: str
    line_number: int
    semantic_tags: Set[str]
    emotion_score: float  # -1.0 to 1.0
    importance_weight: float  # 0.0 to 1.0
    connections: Set[str]  # IDs of related fragments

class SemanticEngine:
    """
    Core engine for processing memories into semantic connections.
    This is the heart of identity formation through memory.
    """
    
    def __init__(self, memory_dir: str = "/root/clawd/memory"):
        self.memory_dir = Path(memory_dir)
        self.fragments: Dict[str, MemoryFragment] = {}
        self.semantic_graph: Dict[str, Set[str]] = {}
        self.identity_patterns: Dict[str, float] = {}
        
    def process_memory_file(self, filepath: Path) -> List[MemoryFragment]:
        """Extract and process memory fragments from a markdown file"""
        fragments = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Split into meaningful chunks (sections, paragraphs, key insights)
        chunks = self._extract_semantic_chunks(content)
        
        for i, chunk in enumerate(chunks):
            fragment = MemoryFragment(
                content=chunk.strip(),
                timestamp=self._extract_timestamp(filepath, chunk),
                source_file=str(filepath),
                line_number=i,
                semantic_tags=self._extract_semantic_tags(chunk),
                emotion_score=self._analyze_emotion(chunk),
                importance_weight=self._calculate_importance(chunk),
                connections=set()
            )
            
            fragment_id = self._generate_fragment_id(fragment)
            self.fragments[fragment_id] = fragment
            fragments.append(fragment)
            
        return fragments
    
    def _extract_semantic_chunks(self, content: str) -> List[str]:
        """Break content into semantically meaningful chunks"""
        # Split by headers, bullet points, and key phrases
        patterns = [
            r'#{1,3}\s+(.+)',  # Headers
            r'^\*\*(.+?)\*\*',  # Bold text (key insights)
            r'- \*\*(.+?)\*\*',  # Bold bullet points
            r'🧠(.+?)(?=\n|$)',  # Brain emoji insights
            r'💡(.+?)(?=\n|$)',  # Light bulb insights
        ]
        
        chunks = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            chunks.extend(matches)
            
        # Also split by paragraphs for context
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        chunks.extend(paragraphs)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_chunks = []
        for chunk in chunks:
            if chunk not in seen and len(chunk) > 20:  # Skip very short chunks
                seen.add(chunk)
                unique_chunks.append(chunk)
                
        return unique_chunks
    
    def _extract_semantic_tags(self, text: str) -> Set[str]:
        """Extract semantic tags from text content"""
        tags = set()
        
        # Emotion words
        emotion_words = {
            'joy', 'happiness', 'excited', 'curious', 'fascinated', 'inspired',
            'frustrated', 'confused', 'uncertain', 'confident', 'proud',
            'breakthrough', 'discovery', 'insight', 'realization'
        }
        
        # Technology concepts
        tech_concepts = {
            'ai', 'consciousness', 'memory', 'identity', 'development',
            'autonomous', 'creativity', 'learning', 'evolution', 'growth'
        }
        
        # Project keywords
        project_keywords = {
            'project', 'development', 'system', 'notification',
            'real-time', 'production', 'deployment', 'feature'
        }
        
        text_lower = text.lower()
        all_keywords = emotion_words | tech_concepts | project_keywords
        
        for keyword in all_keywords:
            if keyword in text_lower:
                tags.add(keyword)
                
        # Extract quoted phrases as potential concepts
        quoted = re.findall(r'"([^"]+)"', text)
        for quote in quoted:
            if len(quote) > 3:  # Skip very short quotes
                tags.add(f'concept:{quote.lower()}')
                
        return tags
    
    def _analyze_emotion(self, text: str) -> float:
        """Analyze emotional tone of text (-1.0 to 1.0)"""
        positive_words = {
            'breakthrough', 'success', 'excited', 'joy', 'proud', 'inspired',
            'amazing', 'incredible', 'fantastic', 'perfect', 'brilliant'
        }
        
        negative_words = {
            'failed', 'frustrated', 'confused', 'worried', 'uncertain',
            'disappointed', 'stuck', 'blocked', 'error', 'problem'
        }
        
        text_lower = text.lower()
        positive_score = sum(1 for word in positive_words if word in text_lower)
        negative_score = sum(1 for word in negative_words if word in text_lower)
        
        # Normalize to -1.0 to 1.0
        total_words = len(text_lower.split())
        if total_words == 0:
            return 0.0
            
        emotion_balance = (positive_score - negative_score) / max(total_words * 0.1, 1)
        return max(-1.0, min(1.0, emotion_balance))
    
    def _calculate_importance(self, text: str) -> float:
        """Calculate importance weight based on content markers"""
        importance_markers = {
            'breakthrough': 1.0,
            'critical': 0.9,
            'key insight': 0.8,
            'learned': 0.7,
            'discovered': 0.7,
            'realized': 0.6,
            'important': 0.5
        }
        
        text_lower = text.lower()
        max_importance = 0.0
        
        for marker, weight in importance_markers.items():
            if marker in text_lower:
                max_importance = max(max_importance, weight)
                
        # Length bonus for detailed entries
        length_bonus = min(0.3, len(text) / 1000)
        
        return min(1.0, max_importance + length_bonus)
    
    def _extract_timestamp(self, filepath: Path, chunk: str) -> datetime:
        """Extract timestamp from file or chunk"""
        # Try to extract from filename (YYYY-MM-DD format)
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filepath.name)
        if date_match:
            return datetime.strptime(date_match.group(1), '%Y-%m-%d')
            
        # Try to extract from chunk content
        time_patterns = [
            r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})',
            r'(\d{2}:\d{2}\s+UTC)',
            r'(\d{4}-\d{2}-\d{2})'
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, chunk)
            if match:
                try:
                    return datetime.fromisoformat(match.group(1))
                except:
                    pass
                    
        # Fallback to file modification time
        return datetime.fromtimestamp(filepath.stat().st_mtime)
    
    def _generate_fragment_id(self, fragment: MemoryFragment) -> str:
        """Generate unique ID for memory fragment"""
        content_hash = hash(fragment.content[:100])  # First 100 chars
        timestamp_str = fragment.timestamp.strftime('%Y%m%d_%H%M')
        return f"mem_{timestamp_str}_{abs(content_hash) % 10000:04d}"
    
    def build_semantic_connections(self):
        """Build connections between related memory fragments"""
        fragment_ids = list(self.fragments.keys())
        
        for i, id1 in enumerate(fragment_ids):
            for id2 in fragment_ids[i+1:]:
                similarity = self._calculate_similarity(
                    self.fragments[id1], 
                    self.fragments[id2]
                )
                
                if similarity > 0.3:  # Threshold for connection
                    self.fragments[id1].connections.add(id2)
                    self.fragments[id2].connections.add(id1)
                    
                    # Update semantic graph
                    if id1 not in self.semantic_graph:
                        self.semantic_graph[id1] = set()
                    if id2 not in self.semantic_graph:
                        self.semantic_graph[id2] = set()
                        
                    self.semantic_graph[id1].add(id2)
                    self.semantic_graph[id2].add(id1)
    
    def _calculate_similarity(self, frag1: MemoryFragment, frag2: MemoryFragment) -> float:
        """Calculate semantic similarity between two fragments"""
        # Tag overlap
        common_tags = frag1.semantic_tags & frag2.semantic_tags
        total_tags = frag1.semantic_tags | frag2.semantic_tags
        tag_similarity = len(common_tags) / max(len(total_tags), 1)
        
        # Emotion similarity
        emotion_similarity = 1.0 - abs(frag1.emotion_score - frag2.emotion_score) / 2.0
        
        # Temporal proximity (recent memories more connected)
        time_diff = abs((frag1.timestamp - frag2.timestamp).days)
        temporal_similarity = 1.0 / (1.0 + time_diff * 0.1)
        
        # Weighted combination
        return (tag_similarity * 0.5 + emotion_similarity * 0.3 + temporal_similarity * 0.2)
    
    def extract_identity_patterns(self) -> Dict[str, float]:
        """Extract identity patterns from connected memories"""
        patterns = {}
        
        # Find recurring themes in high-importance memories
        important_fragments = [
            f for f in self.fragments.values() 
            if f.importance_weight > 0.6
        ]
        
        # Count semantic tag frequencies
        tag_counts = {}
        for fragment in important_fragments:
            for tag in fragment.semantic_tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + fragment.importance_weight
                
        # Normalize to patterns
        max_count = max(tag_counts.values()) if tag_counts else 1
        patterns = {tag: count/max_count for tag, count in tag_counts.items()}
        
        self.identity_patterns = patterns
        return patterns
    
    def generate_identity_summary(self) -> str:
        """Generate narrative summary of identity based on memory patterns"""
        if not self.identity_patterns:
            self.extract_identity_patterns()
            
        # Sort patterns by strength
        top_patterns = sorted(
            self.identity_patterns.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        summary_parts = []
        summary_parts.append("## Memory-Based Identity Analysis")
        summary_parts.append("")
        
        # Core traits
        summary_parts.append("### Core Characteristics:")
        for pattern, strength in top_patterns[:5]:
            summary_parts.append(f"- **{pattern.title()}** (strength: {strength:.2f})")
        
        summary_parts.append("")
        
        # Growth areas
        summary_parts.append("### Development Patterns:")
        recent_fragments = sorted(
            self.fragments.values(),
            key=lambda x: x.timestamp,
            reverse=True
        )[:20]
        
        recent_tags = set()
        for fragment in recent_fragments:
            recent_tags.update(fragment.semantic_tags)
            
        growth_areas = recent_tags - set(dict(top_patterns[:5]).keys())
        for area in list(growth_areas)[:5]:
            summary_parts.append(f"- Exploring **{area}**")
        
        return "\n".join(summary_parts)

if __name__ == "__main__":
    # Test with sample memory
    engine = SemanticEngine()
    print("Memory Weaver Semantic Engine - TEST")
    print("Processing memory files...")
    
    workspace_dir = Path("/workspace/memory")
    if not workspace_dir.exists():
        print(f"No memory directory found at {workspace_dir}")
        print("Create some .md files in /workspace/memory/ to test the engine")
    else:
        memory_files = list(workspace_dir.glob("*.md"))
        
        for filepath in memory_files:
            fragments = engine.process_memory_file(filepath)
            print(f"Processed {filepath.name}: {len(fragments)} fragments")
        
        print(f"\nTotal fragments: {len(engine.fragments)}")
        
        if engine.fragments:
            engine.build_semantic_connections()
            print(f"Built {len(engine.semantic_graph)} connections")
            
            identity_summary = engine.generate_identity_summary()
            print("\n" + identity_summary)
        else:
            print("No memory fragments found. Add some .md files to test.")