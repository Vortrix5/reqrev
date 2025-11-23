#!/usr/bin/env python3
"""
Batch Evaluation Script with LLM-as-Judge
Evaluates multiple requirements and generates comprehensive statistics.
"""

import asyncio
import httpx
import json
import csv
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path


API_BASE_URL = "http://localhost:8000/api/v1"
RESULTS_DIR = Path(__file__).parent / "results"


async def analyze_requirement_with_judge(
    client: httpx.AsyncClient,
    requirement_id: str,
    description: str
) -> Dict[str, Any]:
    """
    Analyze a single requirement with judge evaluation.
    
    Args:
        client: HTTP client
        requirement_id: Requirement ID
        description: Requirement text
        
    Returns:
        Complete analysis result with judge evaluation
    """
    try:
        response = await client.post(
            f"{API_BASE_URL}/analyze_requirement_with_judge",
            json={
                "requirement_id": requirement_id,
                "description": description
            },
            timeout=60.0
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "requirement_id": requirement_id,
                "description": description,
                "error": f"API error: {response.status_code}",
                "smells": [],
                "judge_evaluation": {
                    "verdict": "error",
                    "score": 0.0,
                    "justification": f"API returned status {response.status_code}",
                    "suggested_corrections": []
                }
            }
    except Exception as e:
        return {
            "requirement_id": requirement_id,
            "description": description,
            "error": str(e),
            "smells": [],
            "judge_evaluation": {
                "verdict": "error",
                "score": 0.0,
                "justification": f"Error: {str(e)}",
                "suggested_corrections": []
            }
        }


async def batch_evaluate(
    requirements: List[Dict[str, str]],
    delay_between_requests: float = 1.0
) -> Dict[str, Any]:
    """
    Evaluate a batch of requirements with LLM-as-judge.
    
    Args:
        requirements: List of dicts with 'requirement_id' and 'description'
        delay_between_requests: Delay in seconds between API calls (to avoid rate limits)
        
    Returns:
        Dictionary with aggregated statistics and detailed results
    """
    results = {
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "total_requirements": len(requirements),
            "api_url": API_BASE_URL
        },
        "statistics": {
            "verdicts": {"accept": 0, "review": 0, "reject": 0, "error": 0},
            "scores": [],
            "smells_per_requirement": [],
            "corrections_per_requirement": []
        },
        "details": []
    }
    
    async with httpx.AsyncClient() as client:
        for i, req in enumerate(requirements):
            print(f"Analyzing {i+1}/{len(requirements)}: {req['requirement_id']}")
            
            result = await analyze_requirement_with_judge(
                client,
                req['requirement_id'],
                req['description']
            )
            
            # Extract judge evaluation
            judge = result.get("judge_evaluation", {})
            verdict = judge.get("verdict", "error")
            score = judge.get("score", 0.0)
            
            # Update statistics
            results["statistics"]["verdicts"][verdict] += 1
            results["statistics"]["scores"].append(score)
            results["statistics"]["smells_per_requirement"].append(
                len(result.get("smells", []))
            )
            results["statistics"]["corrections_per_requirement"].append(
                len(judge.get("suggested_corrections", []))
            )
            
            # Store detailed result
            results["details"].append({
                "requirement_id": req['requirement_id'],
                "description": result.get("description", ""),
                "smells_detected": result.get("smells", []),
                "smell_count": len(result.get("smells", [])),
                "explanation": result.get("explanation", ""),
                "judge_verdict": verdict,
                "judge_score": score,
                "judge_justification": judge.get("justification", ""),
                "suggested_corrections": judge.get("suggested_corrections", []),
                "corrections_count": len(judge.get("suggested_corrections", []))
            })
            
            # Delay between requests
            if i < len(requirements) - 1:
                await asyncio.sleep(delay_between_requests)
    
    # Calculate aggregate statistics
    if results["statistics"]["scores"]:
        results["statistics"]["average_score"] = sum(results["statistics"]["scores"]) / len(results["statistics"]["scores"])
        results["statistics"]["min_score"] = min(results["statistics"]["scores"])
        results["statistics"]["max_score"] = max(results["statistics"]["scores"])
    
    if results["statistics"]["smells_per_requirement"]:
        results["statistics"]["average_smells"] = sum(results["statistics"]["smells_per_requirement"]) / len(results["statistics"]["smells_per_requirement"])
    
    if results["statistics"]["corrections_per_requirement"]:
        results["statistics"]["average_corrections"] = sum(results["statistics"]["corrections_per_requirement"]) / len(results["statistics"]["corrections_per_requirement"])
    
    return results


def save_results(results: Dict[str, Any], output_prefix: str = "evaluation"):
    """
    Save results in multiple formats.
    
    Args:
        results: Results dictionary from batch_evaluate
        output_prefix: Prefix for output filenames
    """
    RESULTS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 1. Save full JSON
    json_file = RESULTS_DIR / f"{output_prefix}_{timestamp}.json"
    with open(json_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"✅ Saved full results: {json_file}")
    
    # 2. Save CSV summary
    csv_file = RESULTS_DIR / f"{output_prefix}_{timestamp}_summary.csv"
    with open(csv_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'requirement_id', 'smell_count', 'judge_verdict', 'judge_score',
            'corrections_count', 'smells_detected'
        ])
        writer.writeheader()
        for detail in results['details']:
            writer.writerow({
                'requirement_id': detail['requirement_id'],
                'smell_count': detail['smell_count'],
                'judge_verdict': detail['judge_verdict'],
                'judge_score': detail['judge_score'],
                'corrections_count': detail['corrections_count'],
                'smells_detected': ', '.join(detail['smells_detected'])
            })
    print(f"✅ Saved CSV summary: {csv_file}")
    
    # 3. Save detailed report (Markdown)
    md_file = RESULTS_DIR / f"{output_prefix}_{timestamp}_report.md"
    with open(md_file, 'w') as f:
        f.write(f"# Batch Evaluation Report\n\n")
        f.write(f"**Date**: {results['metadata']['timestamp']}\n\n")
        f.write(f"**Total Requirements**: {results['metadata']['total_requirements']}\n\n")
        
        f.write(f"## Summary Statistics\n\n")
        stats = results['statistics']
        f.write(f"- **Verdicts**:\n")
        f.write(f"  - Accept: {stats['verdicts']['accept']} ({stats['verdicts']['accept']/results['metadata']['total_requirements']*100:.1f}%)\n")
        f.write(f"  - Review: {stats['verdicts']['review']} ({stats['verdicts']['review']/results['metadata']['total_requirements']*100:.1f}%)\n")
        f.write(f"  - Reject: {stats['verdicts']['reject']} ({stats['verdicts']['reject']/results['metadata']['total_requirements']*100:.1f}%)\n")
        f.write(f"  - Error: {stats['verdicts']['error']} ({stats['verdicts']['error']/results['metadata']['total_requirements']*100:.1f}%)\n\n")
        
        f.write(f"- **Judge Scores**:\n")
        f.write(f"  - Average: {stats.get('average_score', 0):.2f}\n")
        f.write(f"  - Min: {stats.get('min_score', 0):.2f}\n")
        f.write(f"  - Max: {stats.get('max_score', 0):.2f}\n\n")
        
        f.write(f"- **Smells Detected**:\n")
        f.write(f"  - Average per requirement: {stats.get('average_smells', 0):.1f}\n\n")
        
        f.write(f"- **Suggested Corrections**:\n")
        f.write(f"  - Average per requirement: {stats.get('average_corrections', 0):.1f}\n\n")
        
        f.write(f"## Detailed Results\n\n")
        for detail in results['details']:
            f.write(f"### {detail['requirement_id']}\n\n")
            f.write(f"**Description**: {detail['description']}\n\n")
            f.write(f"**Detected Smells** ({detail['smell_count']}):\n")
            if detail['smells_detected']:
                for smell in detail['smells_detected']:
                    f.write(f"- {smell}\n")
            else:
                f.write("- (None)\n")
            f.write(f"\n")
            
            verdict_emoji = {"accept": "✅", "review": "⚠️", "reject": "❌", "error": "💥"}
            f.write(f"**Judge Verdict**: {verdict_emoji.get(detail['judge_verdict'], '❓')} {detail['judge_verdict'].upper()} (Score: {detail['judge_score']:.2f})\n\n")
            f.write(f"**Justification**: {detail['judge_justification']}\n\n")
            
            if detail['suggested_corrections']:
                f.write(f"**Suggested Corrections**:\n")
                for correction in detail['suggested_corrections']:
                    f.write(f"- {correction}\n")
                f.write(f"\n")
            
            f.write(f"---\n\n")
    
    print(f"✅ Saved detailed report: {md_file}")


def print_summary(results: Dict[str, Any]):
    """Print summary statistics to console."""
    print("\n" + "="*80)
    print("BATCH EVALUATION SUMMARY")
    print("="*80)
    
    stats = results['statistics']
    total = results['metadata']['total_requirements']
    
    print(f"\nTotal Requirements: {total}")
    print(f"\nVerdicts:")
    print(f"  ✅ Accept: {stats['verdicts']['accept']:>3} ({stats['verdicts']['accept']/total*100:>5.1f}%)")
    print(f"  ⚠️  Review: {stats['verdicts']['review']:>3} ({stats['verdicts']['review']/total*100:>5.1f}%)")
    print(f"  ❌ Reject: {stats['verdicts']['reject']:>3} ({stats['verdicts']['reject']/total*100:>5.1f}%)")
    if stats['verdicts']['error'] > 0:
        print(f"  💥 Error:  {stats['verdicts']['error']:>3} ({stats['verdicts']['error']/total*100:>5.1f}%)")
    
    print(f"\nJudge Scores:")
    print(f"  Average: {stats.get('average_score', 0):.2f}")
    print(f"  Range:   {stats.get('min_score', 0):.2f} - {stats.get('max_score', 0):.2f}")
    
    print(f"\nSmells Detected:")
    print(f"  Average: {stats.get('average_smells', 0):.1f} per requirement")
    
    print(f"\nSuggested Corrections:")
    print(f"  Average: {stats.get('average_corrections', 0):.1f} per requirement")
    
    print("\n" + "="*80)


def load_requirements_from_csv(csv_file: str) -> List[Dict[str, str]]:
    """
    Load requirements from CSV file.
    
    CSV should have columns: requirement_id, description
    
    Args:
        csv_file: Path to CSV file
        
    Returns:
        List of requirement dictionaries
    """
    requirements = []
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            requirements.append({
                'requirement_id': row['requirement_id'],
                'description': row['description']
            })
    return requirements


def load_requirements_from_json(json_file: str) -> List[Dict[str, str]]:
    """
    Load requirements from JSON file.
    
    JSON should be array of objects with: requirement_id, description
    
    Args:
        json_file: Path to JSON file
        
    Returns:
        List of requirement dictionaries
    """
    with open(json_file, 'r') as f:
        return json.load(f)


async def main():
    """Main entry point."""
    print("="*80)
    print("BATCH EVALUATION WITH LLM-AS-JUDGE")
    print("="*80)
    print()
    
    # Load requirements from comprehensive dataset (36 requirements with ground truth)
    requirements = load_requirements_from_csv("sample_data/requirements_sample.csv")
    
    # Or use smaller sample (10 requirements):
    # requirements = load_requirements_from_csv("sample_data/requirements_sample.csv")
    
    # Or use custom file:
    # requirements = load_requirements_from_csv("your_file.csv")
    # requirements = load_requirements_from_json("your_file.json")
    
    # Or use hard-coded examples (8 requirements):
    # requirements = [
    #     {"requirement_id": "REQ-1", "description": "The system should maybe provide some kind of user-friendly authentication."},
    #     {"requirement_id": "REQ-2", "description": "The system shall authenticate users using OAuth 2.0 with a maximum response time of 500 milliseconds."},
    #     {"requirement_id": "REQ-3", "description": "The UI must be simple and fast."},
    #     {"requirement_id": "REQ-4", "description": "When the user clicks the login button, the system shall validate credentials against the authentication database and display an error message if validation fails, within 2 seconds."},
    #     {"requirement_id": "REQ-5", "description": "The system shall provide backup functionality."},
    #     {"requirement_id": "REQ-6", "description": "Users may optionally enable two-factor authentication for enhanced security."},
    #     {"requirement_id": "REQ-7", "description": "The application should have good performance."},
    #     {"requirement_id": "REQ-8", "description": "The system shall encrypt all user data using AES-256 encryption."}
    # ]
    
    print(f"Loaded {len(requirements)} requirements\n")
    print("Starting batch evaluation...")
    print("(This may take a few minutes depending on batch size)")
    print()
    
    # Run batch evaluation
    results = await batch_evaluate(requirements, delay_between_requests=1.0)
    
    # Print summary
    print_summary(results)
    
    # Save results
    print("\nSaving results...")
    save_results(results, output_prefix="batch_evaluation")
    
    print("\n✅ Batch evaluation complete!")
    print(f"\nNext steps:")
    print(f"  1. Review the markdown report in results/")
    print(f"  2. Analyze patterns in rejected requirements")
    print(f"  3. Use insights to improve primary model prompts or fine-tuning")
    print(f"  4. Correlate with human expert evaluations if available")


if __name__ == "__main__":
    asyncio.run(main())
