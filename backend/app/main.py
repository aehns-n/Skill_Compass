"""
SkillCompass — FastAPI Application Entrypoint
Mounts pipeline & loop routers, provides health check and interactive Swagger documentation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.pipeline_router import router as pipeline_router
from app.api.loop_router import router as loop_router

app = FastAPI(
    title="SkillCompass API — Competency Intelligence & Adaptive Learning Engine",
    description="Deterministic skill-gap measurement, DAG prerequisite gating, grounded RAG question generation, and full loop orchestration (SIH26101 / MoSPI).",
    version="2.0.0"
)

# CORS middleware configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(loop_router)
app.include_router(pipeline_router)

@app.get("/")
def root():
    return {
        "platform": "SkillCompass",
        "version": "2.0.0",
        "service": "Competency Intelligence & Adaptive Learning Engine",
        "docs_url": "/docs",
        "health": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
