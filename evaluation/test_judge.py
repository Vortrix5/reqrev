#!/usr/bin/env python3
"""
Test script for LLM-as-Judge functionality.
Demonstrates the new /analyze_requirement_with_judge endpoint.
"""

import asyncio
import httpx
import json
from typing import Dict, Any


API_BASE_URL = "http://localhost:8000/api/v1"


async def check_judge_availability() -> bool:
    """Check if judge is configured and available."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/judge_model")
            data = response.json()
            
            print("Judge Configuration:")
            print(f"  Provider: {data['provider']}")
            print(f"  Model: {data['model']}")
            print(f"  Configured: {data['configured']}")
            print(f"  Enabled: {data['enabled']}")
            print()
            
            return data['configured']
        except Exception as e:
            print(f"Error checking judge configuration: {e}")
            return False


async def analyze_with_judge(requirement_id: str, description: str) -> Dict[str, Any]:
    """Analyze a requirement with judge evaluation."""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Analyzing: {requirement_id}")
            print(f"Description: {description[:80]}...")
            print()
            
            response = await client.post(
                f"{API_BASE_URL}/analyze_requirement_with_judge",
                json={
                    "requirement_id": requirement_id,
                    "description": description
                },
                timeout=60.0  # Judge evaluation takes longer
            )
            
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                print(response.text)
                return None
            
            return response.json()
        except Exception as e:
            print(f"Error: {e}")
            return None


def print_results(result: Dict[str, Any]):
    """Pretty print analysis results with judge evaluation."""
    if not result:
        return
    
    print("=" * 80)
    print(f"REQUIREMENT: {result['requirement_id']}")
    print("=" * 80)
    
    # Primary model results
    print("\n📋 PRIMARY MODEL ANALYSIS (OpenAI):")
    print(f"  Detected Smells: {len(result['smells'])}")
    if result['smells']:
        for smell in result['smells']:
            print(f"    - {smell}")
    else:
        print("    (No smells detected)")
    
    print(f"\n  Explanation:")
    print(f"    {result['explanation']}")
    
    # Judge evaluation
    judge = result['judge_evaluation']
    verdict_emoji = {
        "accept": "✅",
        "review": "⚠️",
        "reject": "❌"
    }
    
    print("\n" + "=" * 80)
    print(f"🧑‍⚖️  JUDGE EVALUATION (OpenRouter):")
    print(f"  Verdict: {verdict_emoji.get(judge['verdict'], '❓')} {judge['verdict'].upper()}")
    print(f"  Score: {judge['score']:.2f} / 1.0")
    
    print(f"\n  Justification:")
    print(f"    {judge['justification']}")
    
    if judge['suggested_corrections']:
        print(f"\n  Suggested Corrections:")
        for correction in judge['suggested_corrections']:
            print(f"    • {correction}")
    else:
        print(f"\n  No corrections suggested")
    
    print("=" * 80)
    print()


async def main():
    """Run test examples."""
    print("=" * 80)
    print("LLM-as-Judge Test Script")
    print("=" * 80)
    print()
    
    # Check if judge is available
    if not await check_judge_availability():
        print("⚠️  Judge is not available. Please configure OPENROUTER_API_KEY.")
        print("   See docs/LLM_JUDGE.md for setup instructions.")
        return
    
    print("✅ Judge is available and configured\n")
    
    # Test cases
    test_requirements = [
        {
            "requirement_id": "REQ-1",
            "description": "The system should maybe provide some kind of user-friendly authentication."
        },
        {
            "requirement_id": "REQ-2",
            "description": "The system shall authenticate users using OAuth 2.0 with a maximum response time of 500 milliseconds."
        },
        {
            "requirement_id": "REQ-3",
            "description": "The UI must be simple and fast."
        },
        {
            "requirement_id": "REQ-4",
            "description": "When the user clicks the login button, the system shall validate credentials against the authentication database and display an error message if validation fails, within 2 seconds."
        }
    ]
    
    # Analyze each requirement
    for req in test_requirements:
        result = await analyze_with_judge(
            req["requirement_id"],
            req["description"]
        )
        
        if result:
            print_results(result)
        
        # Small delay between requests
        await asyncio.sleep(1)
    
    print("\n✅ Test complete!")
    print("\nNext steps:")
    print("  1. Review the judge evaluations")
    print("  2. Check if verdicts align with your expectations")
    print("  3. Try different judge models by changing OPENROUTER_MODEL")
    print("  4. See docs/LLM_JUDGE.md for more information")


if __name__ == "__main__":
    asyncio.run(main())
