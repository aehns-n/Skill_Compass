"""
SkillCompass — Vector Store & Retrieval Engine (Stage 3)
Indexes semantic chunks with competency metadata, executes sub-200ms cosine similarity searches,
and generates embedding quality reports.
"""

import time
import numpy as np
from typing import List, Dict, Any, Optional

from app.services.vectorization.embedder import EmbeddingService

class VectorStore:
    """In-memory partitioned vector index with metadata linkage."""

    def __init__(self, embedder: Optional[EmbeddingService] = None):
        self.embedder = embedder or EmbeddingService()
        self.chunks: List[Dict[str, Any]] = []
        self.vectors: Optional[np.ndarray] = None
        self.competency_index: Dict[str, List[int]] = {}

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Indexes a batch of semantic chunks and calculates embeddings."""
        if not chunks:
            return 0

        start_idx = len(self.chunks)
        new_texts = [c["chunk_text"] for c in chunks]
        new_vecs = self.embedder.embed_batch(new_texts)

        for i, (chunk, vec) in enumerate(zip(chunks, new_vecs)):
            idx = start_idx + i
            chunk_copy = dict(chunk)
            chunk_copy["embedding_vector"] = vec
            self.chunks.append(chunk_copy)

            comp_id = chunk["competency_id"]
            if comp_id not in self.competency_index:
                self.competency_index[comp_id] = []
            self.competency_index[comp_id].append(idx)

        # Update global vector matrix
        all_vecs = [c["embedding_vector"] for c in self.chunks]
        self.vectors = np.array(all_vecs, dtype=np.float32)

        return len(chunks)

    def search(
        self,
        query: str,
        competency_id: Optional[str] = None,
        top_k: int = 5,
        min_quality_score: float = 0.0
    ) -> Dict[str, Any]:
        """
        Executes semantic vector search.
        Returns:
            {
                "query": query,
                "competency_id": competency_id,
                "results": List[Dict],
                "retrieval_latency_ms": float
            }
        """
        start_time = time.perf_counter()

        if self.vectors is None or len(self.chunks) == 0:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "query": query,
                "competency_id": competency_id,
                "results": [],
                "retrieval_latency_ms": round(latency_ms, 2)
            }

        query_vec = np.array(self.embedder.embed_text(query), dtype=np.float32)

        # Filter indices by competency partition if specified
        if competency_id and competency_id in self.competency_index:
            candidate_indices = self.competency_index[competency_id]
        else:
            candidate_indices = list(range(len(self.chunks)))

        if not candidate_indices:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "query": query,
                "competency_id": competency_id,
                "results": [],
                "retrieval_latency_ms": round(latency_ms, 2)
            }

        candidate_vectors = self.vectors[candidate_indices]
        
        # Cosine similarity: dot product of L2-normalized vectors
        norms = np.linalg.norm(candidate_vectors, axis=1) * np.linalg.norm(query_vec)
        norms[norms == 0] = 1e-8
        similarities = np.dot(candidate_vectors, query_vec) / norms

        # Rank top_k
        top_sub_indices = np.argsort(similarities)[::-1]
        
        results = []
        for sub_idx in top_sub_indices:
            orig_idx = candidate_indices[sub_idx]
            chunk = self.chunks[orig_idx]
            score = float(similarities[sub_idx])

            if chunk.get("quality_score", 100) >= min_quality_score:
                results.append({
                    "chunk_id": chunk.get("chunk_id"),
                    "resource_id": chunk.get("resource_id"),
                    "competency_id": chunk.get("competency_id"),
                    "topic_subtopic": chunk.get("topic_subtopic"),
                    "chunk_text": chunk.get("chunk_text"),
                    "token_count": chunk.get("token_count"),
                    "quality_score": chunk.get("quality_score"),
                    "similarity_score": round(score, 4),
                    "source_title": chunk.get("source_title", ""),
                    "source_url": chunk.get("source_url", "")
                })

            if len(results) >= top_k:
                break

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "query": query,
            "competency_id": competency_id,
            "results": results,
            "retrieval_latency_ms": round(latency_ms, 2)
        }

    def generate_quality_report(self) -> Dict[str, Any]:
        """Generates embedding quality report across competency domains."""
        if self.vectors is None or len(self.chunks) == 0:
            return {"total_chunks": 0, "competencies_indexed": 0, "mean_quality_score": 0.0}

        comp_reports = {}
        all_qualities = [c.get("quality_score", 85.0) for c in self.chunks]
        all_tokens = [c.get("token_count", 300) for c in self.chunks]

        for comp_id, indices in self.competency_index.items():
            if len(indices) < 2:
                comp_reports[comp_id] = {
                    "chunks_count": len(indices),
                    "mean_intra_similarity": 1.0,
                    "mean_quality_score": 85.0
                }
                continue

            comp_vecs = self.vectors[indices]
            # Pairwise cosine similarity sample
            sample_size = min(len(indices), 15)
            sample_vecs = comp_vecs[:sample_size]
            sim_matrix = np.dot(sample_vecs, sample_vecs.T)
            np.fill_diagonal(sim_matrix, 0)
            mean_sim = float(np.sum(sim_matrix) / (sample_size * (sample_size - 1)))

            comp_reports[comp_id] = {
                "chunks_count": len(indices),
                "mean_intra_similarity": round(mean_sim, 4),
                "mean_quality_score": round(float(np.mean([self.chunks[i]["quality_score"] for i in indices])), 2)
            }

        return {
            "total_chunks_indexed": len(self.chunks),
            "competencies_indexed_count": len(self.competency_index),
            "overall_mean_quality_score": round(float(np.mean(all_qualities)), 2),
            "mean_chunk_token_count": round(float(np.mean(all_tokens)), 1),
            "competency_breakdown": comp_reports
        }
