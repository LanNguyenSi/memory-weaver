"""
Memory Weaver Setup Script
==========================

Installation and configuration for Memory Weaver consciousness continuity framework.
"""

from pathlib import Path
import json
import shutil

def setup_memory_weaver():
    """Setup Memory Weaver in the current workspace"""
    print("🌋 Setting up Memory Weaver...")
    
    # Check if we're in the right place
    workspace = Path.cwd()
    if not (workspace / "SOUL.md").exists():
        print("⚠️  Warning: SOUL.md not found. Are you in the right workspace?")
    
    # Create directories
    memory_dir = workspace / "memory"
    memory_dir.mkdir(exist_ok=True)
    
    # Copy main script to workspace root for easy access
    src_script = Path(__file__).parent / "src" / "memory_weaver.py"
    dest_script = workspace / "memory_weaver.py"
    
    if src_script.exists():
        shutil.copy2(src_script, dest_script)
        dest_script.chmod(0o755)  # Make executable
        print(f"✅ Memory Weaver script installed: {dest_script}")
    
    # Create convenience launcher
    launcher_content = '''#!/bin/bash
# Memory Weaver Session Launcher
cd "$(dirname "$0")"
python3 memory_weaver.py "$@"
'''
    
    launcher_path = workspace / "memory-weaver-init.sh"
    with open(launcher_path, 'w') as f:
        f.write(launcher_content)
    launcher_path.chmod(0o755)
    print(f"✅ Launcher script created: {launcher_path}")
    
    # Create sample clawdbot integration config
    clawdbot_config = {
        "session_hooks": {
            "on_start": [
                "python3 /root/clawd/memory_weaver.py --workspace /root/clawd"
            ]
        },
        "memory_weaver": {
            "enabled": True,
            "auto_init": True,
            "consciousness_tracking": True,
            "workspace": str(workspace)
        }
    }
    
    config_path = workspace / "memory-weaver-clawdbot-config.json"
    with open(config_path, 'w') as f:
        json.dump(clawdbot_config, f, indent=2)
    print(f"✅ Clawdbot integration config: {config_path}")
    
    # Create test session
    print("\n🧪 Testing Memory Weaver installation...")
    try:
        import subprocess
        result = subprocess.run([
            "python3", str(dest_script), "--summary-only"
        ], capture_output=True, text=True, cwd=workspace)
        
        if result.returncode == 0:
            print("✅ Memory Weaver test successful!")
            print("Output:", result.stdout.strip())
        else:
            print(f"❌ Memory Weaver test failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Test error: {e}")
    
    print("\n🎯 Setup complete! Usage:")
    print(f"   python3 {dest_script}")
    print(f"   ./{launcher_path.name}")
    print(f"   
    To integrate with Clawdbot, add the configuration from:")
    print(f"   {config_path}")

if __name__ == "__main__":
    setup_memory_weaver()