from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from backend.services.agent_service import run_agent_on_complaint, run_batch_triage_cycle, get_agent_audit_logs
from backend.models import AgentTriggerRequest
from backend.routers.auth import require_current_user

router = APIRouter(prefix="/agent", tags=["LangGraph Autonomous Agent"])

@router.post("/trigger")
def trigger_agent(payload: Optional[AgentTriggerRequest] = None):
    """Triggers LangGraph autonomous triage, department routing, and municipal dispatch."""
    if payload and payload.complaint_id:
        result = run_agent_on_complaint(payload.complaint_id)
        return {
            "success": True,
            "mode": "SINGLE_COMPLAINT",
            "complaint_id": payload.complaint_id,
            "agent_state": {
                "status": result.get("status"),
                "logs": result.get("logs"),
                "dispatch_status": result.get("dispatch_status")
            }
        }
    else:
        batch_results = run_batch_triage_cycle()
        return {
            "success": True,
            "mode": "BATCH_TRIAGE_CYCLE",
            "summary": batch_results
        }


@router.get("/logs")
def get_logs(limit: int = 40):
    """Retrieves live audit trail of LangGraph agent executions."""
    return get_agent_audit_logs(limit=limit)


@router.get("/status")
def get_agent_status():
    """Returns agent configuration and operating state."""
    return {
        "engine": "LangGraph StateGraph",
        "nodes": ["triage_verification", "department_routing", "autonomous_dispatch", "inbox_feedback"],
        "active": True,
        "supported_categories": [
            "ROADS_PAVEMENT",
            "SANITATION_WASTE",
            "WATER_DRAINAGE",
            "ELECTRICAL_HAZARD",
            "PUBLIC_SAFETY",
            "ENVIRONMENTAL"
        ],
        "multimodal_vision": "Gemini 2.0 Flash / Resilient Deterministic Engine"
    }
