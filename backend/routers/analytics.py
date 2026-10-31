from fastapi import APIRouter
from backend.database import complaints_collection, resolved_complaints_collection, users_collection
from backend.models import CivicCategory

router = APIRouter(prefix="/analytics", tags=["Analytics & Civic Pulse"])

@router.get("/summary")
def get_civic_pulse_summary():
    active_complaints = list(complaints_collection.find())
    resolved_complaints = list(resolved_complaints_collection.find())

    total_active = len(active_complaints)
    total_resolved = len(resolved_complaints)
    total_grievances = total_active + total_resolved

    resolution_rate = round((total_resolved / total_grievances * 100), 1) if total_grievances > 0 else 0.0

    critical_count = sum(1 for c in active_complaints if c.get("severity") == "CRITICAL")
    dispatched_count = sum(1 for c in active_complaints if c.get("status") in ["DISPATCHED_TO_DEPARTMENT", "IN_PROGRESS"])

    # Category counts
    category_counts = {cat.value: 0 for cat in CivicCategory}
    for c in active_complaints + resolved_complaints:
        cat = c.get("category")
        if cat in category_counts:
            category_counts[cat] += 1

    # Severity distribution
    severity_distribution = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for c in active_complaints:
        sev = c.get("severity", "MEDIUM")
        if sev in severity_distribution:
            severity_distribution[sev] += 1

    # High-risk hot spots (top 5 by priority)
    top_priorities = sorted(active_complaints, key=lambda x: x.get("priority", 0), reverse=True)[:5]
    hotspots = []
    for p in top_priorities:
        hotspots.append({
            "id": str(p["_id"]),
            "title": p.get("title"),
            "category": p.get("category"),
            "address": p.get("address"),
            "severity": p.get("severity"),
            "priority": p.get("priority"),
            "upvotes": p.get("upvotes", 0)
        })

    return {
        "total_grievances": total_grievances,
        "active_complaints": total_active,
        "resolved_complaints": total_resolved,
        "critical_active": critical_count,
        "dispatched_to_departments": dispatched_count,
        "resolution_rate_percent": resolution_rate,
        "average_sla_hours": 24,
        "category_breakdown": category_counts,
        "severity_distribution": severity_distribution,
        "critical_hotspots": hotspots
    }
