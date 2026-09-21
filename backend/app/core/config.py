"""
SkillCompass — Centralized System Configuration & Scoring Mechanics
Contains all deterministic mathematical constants, weights, tiers, thresholds, and guard rules.
"""

from typing import Dict, Literal

# Deterministic difficulty weights for assessment scoring: L1..L5
DIFFICULTY_WEIGHTS: Dict[int, float] = {
    1: 1.0,
    2: 1.5,
    3: 2.0,
    4: 2.5,
    5: 3.0,
}

# Qualitative capability tier boundaries (continuous score 0.0 - 100.0)
TIER_BOUNDARIES = [
    ("MASTER", 90.0, 100.0),
    ("PROFICIENT", 70.0, 89.99),
    ("DEVELOPING", 40.0, 69.99),
    ("NOVICE", 0.0, 39.99),
]

def score_to_tier(score: float) -> Literal["NOVICE", "DEVELOPING", "PROFICIENT", "MASTER"]:
    """Deterministically map a numerical score to a capability tier."""
    if score >= 90.0:
        return "MASTER"
    elif score >= 70.0:
        return "PROFICIENT"
    elif score >= 40.0:
        return "DEVELOPING"
    else:
        return "NOVICE"

def rank_to_priority(rank: int) -> Literal["HIGH", "MEDIUM", "LOW"]:
    """Derive benchmark requirement priority from source rank."""
    if rank <= 2:
        return "HIGH"
    elif rank <= 4:
        return "MEDIUM"
    else:
        return "LOW"

# Target difficulty distribution mixes keyed to competency target thresholds
DIFFICULTY_DISTRIBUTIONS = {
    "high": {"L1_2": 0.20, "L3": 0.50, "L4_5": 0.30},    # For target >= 80.0
    "medium": {"L1_2": 0.20, "L3": 0.50, "L4_5": 0.30},  # For target == 75.0
    "balanced": {"L1_2": 0.30, "L3": 0.50, "L4_5": 0.20},# For target <= 70.0
}

# Adaptive Loop Parameters
MATERIALS_TO_REASSESS_THRESHOLD: int = 3   # Number of completed modules required for auto-reassessment
MIN_PASSING_PREREQUISITE_SCORE: float = 70.0 # Min score on prerequisite before locked competency opens
WEAK_TOPIC_ACCURACY_THRESHOLD: float = 0.60  # Below 60% accuracy marks topic as weak
WEAK_TOPIC_MIN_QUESTIONS: int = 2           # Min question sample count to flag weak topic
PLATEAU_CYCLE_THRESHOLD: int = 3            # Consecutive cycles without >5% improvement triggers plateau alert
PLATEAU_DELTA_THRESHOLD: float = 5.0        # Min score increase % to avoid plateau flag
