import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.routers import auth, complaints, analytics, agent

load_dotenv()

app = FastAPI(
    title="CivicPulse - AI Civic Grievance & Infrastructure Triage Platform",
    description="Agentic AI platform for multimodal civic reporting, autonomous severity evaluation, LangGraph department routing, and public accountability dashboards.",
    version="2.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(agent.router, prefix="/api")


@app.get("/")
def root():
    return {
        "platform": "CivicPulse - Transparent Civic Grievance & Infrastructure Triage System",
        "theme": "Theme 1: Civic Pulse, Digital Governance & Public Information",
        "version": "2.0.0",
        "docs_url": "/docs",
        "status": "operational",
        "capabilities": [
            "Multimodal Vision AI Triage (Roads, Waste, Water, Electricity, Safety)",
            "LangGraph Autonomous Municipal Dispatch Agent",
            "Dynamic Community Prioritization Engine",
            "Interactive GIS Infrastructure Heatmap",
            "Public Transparency Ledger & SLA Escalation"
        ]
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "agent": "LangGraph Active"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 Starting CivicPulse FastAPI server on http://{host}:{port}")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
