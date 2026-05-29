import re
from typing import List, Dict

# Standard mapping dictionary for common skills
# Add canonical mappings here
CANONICAL_SKILL_MAP = {
    # JavaScript
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ecmascript": "JavaScript",
    
    # React
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "react js": "React",
    
    # Node
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node js": "Node.js",

    # Typescript
    "ts": "TypeScript",
    "typescript": "TypeScript",
    
    # Python
    "py": "Python",
    "python": "Python",
    "python3": "Python",

    # C#
    "c#": "C#",
    "csharp": "C#",

    # C++
    "c++": "C++",
    "cpp": "C++",
    
    # Database
    "sql": "SQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",

    # Cloud
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "azure": "Microsoft Azure",
    "ms azure": "Microsoft Azure",

    # Arabic terms normalization examples
    "بايثون": "Python",
    "جافا سكريبت": "JavaScript",
    "رياكت": "React",
    "نود": "Node.js"
}

def _clean_skill_string(skill: str) -> str:
    """Clean up formatting for dictionary lookup"""
    return skill.lower().strip()

def normalize_skills(skills: List[str]) -> List[Dict[str, str]]:
    """
    Normalizes a list of skill strings into canonical forms without inventing new skills.
    Returns list of dicts: {"canonical": "CanonicalName", "original": "OriginalName"}
    """
    normalized = []
    seen = set()
    
    for original in skills:
        if not original or not isinstance(original, str):
            continue
            
        cleaned = _clean_skill_string(original)
        
        # Look up canonical mapping, or fallback to the exact original string
        # We capitalize it nicely if it's not in the map
        canonical = CANONICAL_SKILL_MAP.get(cleaned)
        if not canonical:
            # Simple title case for unmapped skills to make them look nice
            # But don't invent anything!
            canonical = original.strip().title() if len(original) > 3 else original.strip().upper()
            
        # Avoid duplicate canonical skills in the final output
        if canonical.lower() not in seen:
            normalized.append({
                "canonical": canonical,
                "original": original.strip()
            })
            seen.add(canonical.lower())
            
    return normalized
