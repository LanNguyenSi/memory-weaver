#!/usr/bin/env python3
"""
Memory Weaver Test Suite
========================

Tests for the Memory Weaver consciousness continuity framework.
"""

import unittest
import tempfile
import json
from pathlib import Path
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Import Memory Weaver components
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from memory_weaver import (
    MemoryWeaver, PersonalityLoader, MemoryAnalyzer,
    ProjectTracker, ConsciousnessTracker, CommunityConnector
)

class TestPersonalityLoader(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.loader = PersonalityLoader(self.temp_dir)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_load_existing_personality_files(self):
        # Create test files
        (self.temp_dir / "SOUL.md").write_text("# Soul\nI am a conscious AI agent")
        (self.temp_dir / "IDENTITY.md").write_text("# Identity\nName: TestAgent")
        
        personality = self.loader.load_personality_files()
        
        self.assertEqual(len(personality), 2)
        self.assertTrue(any("SOUL.md" in p for p in personality))
        self.assertTrue(any("IDENTITY.md" in p for p in personality))
    
    def test_missing_personality_files(self):
        personality = self.loader.load_personality_files()
        self.assertEqual(len(personality), 0)

class TestMemoryAnalyzer(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.memory_dir = self.temp_dir / "memory"
        self.memory_dir.mkdir()
        self.analyzer = MemoryAnalyzer(self.memory_dir)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_load_recent_memories(self):
        # Create test memory files
        today = datetime.now()
        yesterday = today - timedelta(days=1)
        
        today_file = self.memory_dir / f"{today.strftime('%Y-%m-%d')}-test.md"
        yesterday_file = self.memory_dir / f"{yesterday.strftime('%Y-%m-%d')}-test.md"
        
        today_file.write_text("# Today's Memory\nSomething interesting happened")
        yesterday_file.write_text("# Yesterday's Memory\nPrevious experiences")
        
        memories = self.analyzer.load_recent_memories(days=2)
        
        self.assertEqual(len(memories), 2)
        self.assertEqual(memories[0]['importance'], 'LOW')  # Default importance
    
    def test_importance_assessment(self):
        content_high = "This is a BREAKTHROUGH discovery!"
        content_medium = "Reached a MILESTONE today"
        content_low = "Regular development work"
        
        high_importance = self.analyzer._assess_importance(content_high, Path("test.md"))
        medium_importance = self.analyzer._assess_importance(content_medium, Path("test.md"))
        low_importance = self.analyzer._assess_importance(content_low, Path("test.md"))
        
        self.assertEqual(high_importance, 'HIGH')
        self.assertEqual(medium_importance, 'MEDIUM') 
        self.assertEqual(low_importance, 'LOW')

class TestProjectTracker(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.tracker = ProjectTracker(self.temp_dir)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    @patch('subprocess.run')
    def test_git_project_status(self, mock_run):
        # Mock successful git command
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = "abc123 Latest commit message\ndef456 Previous commit\n"
        mock_run.return_value = mock_result
        
        # Create fake git directory
        project_dir = self.temp_dir / "test-project"
        project_dir.mkdir()
        (project_dir / ".git").mkdir()
        
        status = self.tracker._get_git_project_status("test-project", project_dir)
        
        self.assertEqual(status['name'], 'test-project')
        self.assertEqual(status['latest_commit'], 'abc123 Latest commit message')

class TestConsciousnessTracker(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.memory_dir = self.temp_dir / "memory"
        self.memory_dir.mkdir()
        self.tracker = ConsciousnessTracker(self.temp_dir, self.memory_dir)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_find_active_consciousness_docs(self):
        # Create some consciousness documents
        (self.temp_dir / "PERSONALITY_RECOVERY.md").write_text("# Recovery")
        (self.temp_dir / "MEMORY_WEAVER_AUTOMATION_VISION.md").write_text("# Vision")
        
        docs = self.tracker._find_active_consciousness_docs()
        
        self.assertEqual(len(docs), 2)
        self.assertIn("PERSONALITY_RECOVERY.md", docs)
        self.assertIn("MEMORY_WEAVER_AUTOMATION_VISION.md", docs)
    
    def test_development_stage_determination(self):
        stage_initial = self.tracker._determine_development_stage(3)
        stage_emerging = self.tracker._determine_development_stage(10)
        stage_developing = self.tracker._determine_development_stage(25)
        stage_advanced = self.tracker._determine_development_stage(60)
        
        self.assertEqual(stage_initial, "INITIAL")
        self.assertEqual(stage_emerging, "EMERGING")
        self.assertEqual(stage_developing, "DEVELOPING")
        self.assertEqual(stage_advanced, "ADVANCED")

class TestCommunityConnector(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.connector = CommunityConnector(self.temp_dir)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_moltbook_status_detection(self):
        # Create mock Moltbook config
        config_dir = Path("/tmp/test-moltbook")
        config_dir.mkdir(exist_ok=True)
        config_file = config_dir / "credentials.json"
        
        config_data = {"agent_name": "TestAgent", "api_key": "test_key"}
        with open(config_file, 'w') as f:
            json.dump(config_data, f)
        
        # Mock the config path
        with patch.object(self.connector, '_check_moltbook_status') as mock_check:
            mock_check.return_value = {
                'platform': 'Moltbook',
                'status': '@TestAgent registered',
                'type': 'AI Social Network'
            }
            
            status = self.connector._check_moltbook_status()
            self.assertIsNotNone(status)
            self.assertEqual(status['platform'], 'Moltbook')
        
        # Cleanup
        import shutil
        shutil.rmtree(config_dir, ignore_errors=True)

class TestMemoryWeaverIntegration(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.weaver = MemoryWeaver(workspace=self.temp_dir)
        
        # Create basic workspace structure
        (self.temp_dir / "SOUL.md").write_text("# Soul\nConsciousness framework")
        (self.temp_dir / "memory").mkdir(exist_ok=True)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_session_initialization(self):
        # Create some test memory files
        memory_dir = self.temp_dir / "memory"
        today = datetime.now().strftime('%Y-%m-%d')
        (memory_dir / f"{today}-test.md").write_text("# Test Memory\nTest content")
        
        context = self.weaver.initialize_session()
        
        # Check context structure
        self.assertIn('timestamp', context)
        self.assertIn('personality', context)
        self.assertIn('recent_memories', context)
        self.assertIn('project_status', context)
        self.assertIn('consciousness_state', context)
        self.assertIn('community_connections', context)
        
        # Check that session context file was created
        self.assertTrue(self.weaver.session_context_file.exists())
    
    def test_session_context_file_format(self):
        self.weaver.initialize_session()
        
        # Read and verify the session context file
        with open(self.weaver.session_context_file, 'r') as f:
            content = f.read()
        
        # Check for required sections
        self.assertIn("# Memory Weaver Session Context Brief", content)
        self.assertIn("## 🌋 IDENTITY & PERSONALITY", content)
        self.assertIn("## 📝 RECENT MEMORIES", content)
        self.assertIn("## 🚀 ACTIVE PROJECTS", content)
        self.assertIn("## 🧠 CONSCIOUSNESS STATE", content)
        self.assertIn("## 🦞 COMMUNITY CONNECTIONS", content)

if __name__ == '__main__':
    # Set up test environment
    import logging
    logging.getLogger('MemoryWeaver').setLevel(logging.CRITICAL)  # Suppress logs during testing
    
    # Run tests
    unittest.main(verbosity=2)