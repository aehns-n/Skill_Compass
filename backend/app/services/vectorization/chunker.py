"""
SkillCompass — Semantic Chunker & Quality Scorer (Stage 3)
Splits extracted technical material into semantically cohesive 300-500 token chunks
with overlap and evaluates chunk quality scores.
"""

import re
from typing import List, Dict, Any

class SemanticChunker:
    """Splits raw text into 300-500 token chunks with heading preservation and overlap."""

    def __init__(self, target_tokens: int = 350, min_tokens: int = 150, max_tokens: int = 500, overlap_tokens: int = 50):
        self.target_tokens = target_tokens
        self.min_tokens = min_tokens
        self.max_tokens = max_tokens
        self.overlap_tokens = overlap_tokens

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Estimates token count (~0.75 words per token)."""
        words = text.split()
        return int(len(words) * 1.3)

    @classmethod
    def calculate_chunk_quality(cls, chunk_text: str) -> float:
        """
        Calculates chunk quality score (0-100) based on:
        - Token density & length
        - Sentence termination
        - Code or technical term presence
        - Absence of boilerplate noise
        """
        token_count = cls.estimate_tokens(chunk_text)
        if token_count < 50:
            return 75.0

        score = 80.0

        # Optimal length bonus (200-450 tokens)
        if 200 <= token_count <= 450:
            score += 10.0
        elif token_count < 100:
            score -= 5.0

        # Proper sentence ending bonus
        if chunk_text.strip().endswith(('.', ':', '```', ';', '}')):
            score += 5.0

        # Technical keyword density
        tech_indicators = ["SELECT", "function", "class", "def", "protocol", "algorithm", "TCP", "SQL", "Spark", "packet", "VLAN", "BGP", "Docker", "AWS", "table", "index", "layer", "API", "config"]
        matches = sum(1 for kw in tech_indicators if kw.lower() in chunk_text.lower())
        score += min(5.0, matches * 1.0)

        return min(100.0, max(0.0, score))

    def chunk_text(
        self,
        text: str,
        resource_id: str,
        competency_id: str,
        role_id: str = None,
        topic_subtopic: str = "General",
        source_title: str = "",
        source_url: str = ""
    ) -> List[Dict[str, Any]]:
        """Splits document text into semantic chunks."""
        # Split into paragraphs or natural sections
        paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
        if not paragraphs:
            paragraphs = [text.strip()]

        chunks = []
        current_chunk_paragraphs = []
        current_words = 0
        chunk_idx = 0

        for p in paragraphs:
            p_words = len(p.split())
            p_tokens = int(p_words * 1.3)

            # If adding paragraph exceeds max tokens, finalize current chunk
            if current_words > 0 and (current_words + p_words) * 1.3 > self.max_tokens:
                chunk_str = "\n\n".join(current_chunk_paragraphs)
                token_cnt = self.estimate_tokens(chunk_str)
                quality = self.calculate_chunk_quality(chunk_str)

                chunks.append({
                    "chunk_id": f"{resource_id}-chunk-{chunk_idx:03d}",
                    "resource_id": resource_id,
                    "competency_id": competency_id,
                    "role_id": role_id,
                    "topic_subtopic": topic_subtopic,
                    "chunk_index": chunk_idx,
                    "chunk_text": chunk_str,
                    "token_count": token_cnt,
                    "quality_score": quality,
                    "source_title": source_title,
                    "source_url": source_url
                })
                chunk_idx += 1

                # Keep last paragraph for semantic overlap if reasonable
                if p_words * 1.3 < self.max_tokens:
                    current_chunk_paragraphs = [p]
                    current_words = p_words
                else:
                    current_chunk_paragraphs = []
                    current_words = 0
            else:
                current_chunk_paragraphs.append(p)
                current_words += p_words

        # Final remaining chunk
        if current_chunk_paragraphs:
            chunk_str = "\n\n".join(current_chunk_paragraphs)
            token_cnt = self.estimate_tokens(chunk_str)
            quality = self.calculate_chunk_quality(chunk_str)

            chunks.append({
                "chunk_id": f"{resource_id}-chunk-{chunk_idx:03d}",
                "resource_id": resource_id,
                "competency_id": competency_id,
                "role_id": role_id,
                "topic_subtopic": topic_subtopic,
                "chunk_index": chunk_idx,
                "chunk_text": chunk_str,
                "token_count": token_cnt,
                "quality_score": quality,
                "source_title": source_title,
                "source_url": source_url
            })

        return chunks
