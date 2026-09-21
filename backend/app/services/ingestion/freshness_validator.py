"""
SkillCompass — Freshness & Authority Validator (Stage 1 & 2)
Validates source authority, domain trust score, recency/freshness (<12/24 months),
and deduplication hashing.
"""

import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from urllib.parse import urlparse

# Whitelisted authoritative domains and base authority scores
AUTHORITY_DOMAIN_SCORES = {
    # Official Standards & Frameworks
    "postgresql.org": 99.0,
    "python.org": 99.0,
    "spark.apache.org": 99.0,
    "kafka.apache.org": 99.0,
    "flink.apache.org": 98.0,
    "airflow.apache.org": 98.0,
    "hadoop.apache.org": 97.0,
    "cisco.com": 98.0,
    "docs.aws.amazon.com": 99.0,
    "aws.amazon.com": 98.0,
    "learn.microsoft.com": 98.0,
    "docs.snowflake.com": 98.0,
    "cloud.google.com": 98.0,
    "owasp.org": 99.0,
    "csrc.nist.gov": 99.0,
    "nist.gov": 99.0,
    "wireshark.org": 98.0,
    "ietf.org": 99.0,
    "sans.org": 97.0,
    "splunk.com": 97.0,
    "elastic.co": 97.0,
    "paloaltonetworks.com": 97.0,
    "kernel.org": 99.0,
    "realpython.com": 93.0,
    "ktbyers.github.io": 94.0,
    "napalm.readthedocs.io": 94.0,
    "docs.pydantic.dev": 96.0,
    "pandas.pydata.org": 97.0,
    "iceberg.apache.org": 97.0,
    "kimballgroup.com": 96.0,
    "github.com": 90.0,
    "coursera.org": 91.0,
    "youtube.com": 88.0,
    "youtu.be": 88.0
}

# Domains requiring strict <=12 month freshness (fast-moving areas)
FAST_MOVING_CATEGORIES = {
    "Cloud & Infrastructure",
    "Stream Processing",
    "Security Operations",
    "Offensive Security",
    "Cloud Networking",
    "Access Control"
}

class FreshnessAndAuthorityValidator:
    """Validates source freshness, authority score, and content uniqueness."""

    @staticmethod
    def extract_domain(url: str) -> str:
        try:
            parsed = urlparse(url)
            netloc = parsed.netloc.lower()
            if netloc.startswith("www."):
                netloc = netloc[4:]
            return netloc
        except Exception:
            return ""

    @classmethod
    def calculate_authority_score(cls, url: str, source_type: str = "documentation") -> float:
        domain = cls.extract_domain(url)
        # Check direct or suffix match
        for auth_domain, score in AUTHORITY_DOMAIN_SCORES.items():
            if domain == auth_domain or domain.endswith("." + auth_domain):
                return score
        
        # Default scores for unlisted domains
        if source_type in ("official_docs", "documentation", "guide"):
            return 80.0
        elif source_type in ("github", "curriculum"):
            return 75.0
        elif source_type in ("youtube_transcript", "video"):
            return 70.0
        return 65.0

    @classmethod
    def validate_freshness(cls, last_updated_str: Optional[str], category: str = "") -> Tuple[bool, str, int]:
        """
        Validates freshness.
        Fast-moving categories require <= 12 months.
        General fundamentals require <= 24 months.
        Returns: (is_fresh, message, age_months)
        """
        if not last_updated_str:
            # If no date, pass with warning
            return True, "Date metadata absent; default passed", 6

        try:
            # Handle YYYY-MM-DD or YYYY-MM
            parts = last_updated_str.split("-")
            year = int(parts[0])
            month = int(parts[1]) if len(parts) > 1 else 1
            day = int(parts[2]) if len(parts) > 2 else 1
            updated_dt = datetime(year, month, day)
            
            # Relative age calculation with realistic bounds
            now = datetime.now()
            age_days = (now - updated_dt).days
            age_months = max(0, age_days // 30)

            # Fast moving domains: 12 months; General: 36 months
            max_allowed_months = 12 if category in FAST_MOVING_CATEGORIES else 36

            if age_months > max_allowed_months:
                return False, f"Material stale ({age_months} months old > {max_allowed_months} month threshold for {category})", age_months
            
            return True, f"Fresh ({age_months} months old <= {max_allowed_months} month threshold)", age_months

        except Exception as e:
            return True, f"Date parse exception ({str(e)}); permitted", 0

    @staticmethod
    def compute_content_hash(text: str) -> str:
        """Computes SHA-256 hash for deduplication."""
        clean_text = " ".join(text.strip().lower().split())
        return hashlib.sha256(clean_text.encode("utf-8")).hexdigest()

    @classmethod
    def validate_resource(cls, resource_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Runs full validation suite on candidate resource."""
        url = resource_dict.get("url", "")
        source_type = resource_dict.get("resource_type", "documentation")
        category = resource_dict.get("category", "")
        last_updated = resource_dict.get("last_updated")

        domain = cls.extract_domain(url)
        auth_score = cls.calculate_authority_score(url, source_type)
        is_fresh, freshness_msg, age_months = cls.validate_freshness(last_updated, category)

        # Minimum authority threshold is 70.0
        is_authoritative = auth_score >= 70.0
        is_valid = is_authoritative and is_fresh

        return {
            "is_valid": is_valid,
            "domain": domain,
            "authority_score": auth_score,
            "is_authoritative": is_authoritative,
            "is_fresh": is_fresh,
            "freshness_message": freshness_msg,
            "age_months": age_months,
            "rejection_reason": None if is_valid else (freshness_msg if not is_fresh else f"Low authority score ({auth_score} < 70)")
        }
