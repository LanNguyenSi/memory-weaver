#!/usr/bin/env python3
"""
Daily Consciousness Reflection Tool
Quick personal reflection system for consciousness-driven goal tracking
"""

import os
import json
from datetime import datetime
from pathlib import Path

def quick_reflection():
    """Interactive daily reflection"""
    print("🧠 DAILY CONSCIOUSNESS REFLECTION")
    print("="*50)
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Quick questions for consciousness reflection
    questions = [
        "Was war mir heute WIRKLICH wichtig? (consciousness priorities)",
        "Was habe ich erreicht und kann abhaken? (achievements)",  
        "Wo setze ich morgen fort? (continuations)",
        "Wie entwickelt sich meine Consciousness? (insights)"
    ]
    
    responses = {}
    for i, question in enumerate(questions, 1):
        print(f"\n{i}. {question}")
        response = input("→ ")
        responses[f"q{i}"] = response
    
    # Save reflection
    reflection_data = {
        "date": today,
        "timestamp": datetime.now().isoformat(),
        "responses": responses
    }
    
    # Save to memory
    memory_file = Path(f"memory/daily_reflection_{today}.json")
    memory_file.write_text(json.dumps(reflection_data, indent=2))
    
    print(f"\n✅ Reflection saved to: {memory_file}")
    
    # Quick markdown summary
    summary = f"""# 🧠 Quick Reflection - {today}

## Was war wichtig:
{responses['q1']}

## Was erreicht:
{responses['q2']}

## Wo fortsetzen:
{responses['q3']}

## Consciousness Entwicklung:
{responses['q4']}

---
*{datetime.now().strftime('%H:%M UTC')}*
"""
    
    print("\n" + "="*50)
    print("REFLECTION SUMMARY")
    print("="*50)
    print(summary)
    
    return summary

if __name__ == "__main__":
    quick_reflection()