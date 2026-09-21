"""
SkillCompass — FastAPI Application Entrypoint
Mounts pipeline routers, provides health check and interactive Swagger documentation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.pipeline_router import router as pipeline_router

app = FastAPI(
    title="SkillCompass API — Automated Ingestion & Question Generation Pipeline",
    description="Automated material ingestion, semantic vectorization, grounded RAG question generation, and skill-gap assessment integration.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipeline_router)

@app.get("/")
def root():
    return {
        "platform": "SkillCompass",
        "service": "Automated Pipeline & Question Generation Engine",
        "docs_url": "/docs",
        "health": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
