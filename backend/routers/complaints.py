import math
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query, BackgroundTasks
from bson import ObjectId

from backend.database import complaints_collection, resolved_complaints_collection
from backend.models import CivicCategory, SeverityLevel, ComplaintStatus, VoteRequest, ComplaintUpdate
from backend.services.vision_service import analyze_civic_image_multimodal
from backend.services.storage_service import upload_to_cloudinary
from backend.services.agent_service import run_agent_on_complaint
from backend.routers.auth import get_current_user, require_current_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to calculate distance in meters between two GPS coordinates."""
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def serialize_complaint(c: dict) -> dict:
    item = dict(c)
    if "_id" in item:
        item["id"] = str(item["_id"])
        item.pop("_id", None)
    if "created_at" in item and isinstance(item["created_at"], datetime):
        item["created_at"] = item["created_at"].isoformat()
    if "verified_at" in item and isinstance(item["verified_at"], datetime):
        item["verified_at"] = item["verified_at"].isoformat()
    if "dispatched_at" in item and isinstance(item["dispatched_at"], datetime):
        item["dispatched_at"] = item["dispatched_at"].isoformat()
    if "resolution_date" in item and isinstance(item["resolution_date"], datetime):
        item["resolution_date"] = item["resolution_date"].isoformat()
    return item


@router.get("/")
def list_complaints(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("priority"), # priority, recent, upvotes
    user: Optional[dict] = Depends(get_current_user)
):
    query = {}
    if category and category != "ALL":
        query["category"] = category
    if status and status != "ALL":
        query["status"] = status
    if severity and severity != "ALL":
        query["severity"] = severity

    all_complaints = list(complaints_collection.find(query))

    if search:
        s = search.lower()
        all_complaints = [
            c for c in all_complaints
            if s in c.get("title", "").lower()
            or s in c.get("description", "").lower()
            or s in c.get("address", "").lower()
            or s in c.get("department", "").lower()
        ]

    # Sorting
    if sort_by == "priority":
        all_complaints.sort(key=lambda x: x.get("priority", 0), reverse=True)
    elif sort_by == "recent":
        all_complaints.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
    elif sort_by == "upvotes":
        all_complaints.sort(key=lambda x: x.get("upvotes", 0), reverse=True)

    user_email = user.get("email") if user else None
    results = []
    for c in all_complaints:
        serialized = serialize_complaint(c)
        if user_email:
            if user_email in c.get("upvoted_by", []):
                serialized["user_vote"] = "up"
            elif user_email in c.get("downvoted_by", []):
                serialized["user_vote"] = "down"
            else:
                serialized["user_vote"] = None
        else:
            serialized["user_vote"] = None
        results.append(serialized)

    return results


@router.get("/map")
def get_map_markers(category: Optional[str] = None):
    query = {}
    if category and category != "ALL":
        query["category"] = category

    complaints = list(complaints_collection.find(query))
    markers = []
    for c in complaints:
        markers.append({
            "id": str(c["_id"]),
            "title": c.get("title", "Civic Grievance"),
            "category": c.get("category", "ROADS_PAVEMENT"),
            "department": c.get("department", "Municipal Services"),
            "latitude": c.get("latitude"),
            "longitude": c.get("longitude"),
            "address": c.get("address", "Civic Location"),
            "severity": c.get("severity", "MEDIUM"),
            "severity_score": c.get("severity_score", 50),
            "status": c.get("status", "VERIFIED"),
            "priority": c.get("priority", 0),
            "upvotes": c.get("upvotes", 0),
            "image_url": c.get("image_url")
        })
    return markers


@router.get("/{complaint_id}")
def get_complaint_detail(complaint_id: str, user: Optional[dict] = Depends(get_current_user)):
    try:
        c = complaints_collection.find_one({"_id": ObjectId(complaint_id)})
        if not c:
            c = resolved_complaints_collection.find_one({"_id": ObjectId(complaint_id)})
        if not c:
            raise HTTPException(status_code=404, detail="Complaint not found")

        serialized = serialize_complaint(c)
        if user:
            user_email = user.get("email")
            if user_email in c.get("upvoted_by", []):
                serialized["user_vote"] = "up"
            elif user_email in c.get("downvoted_by", []):
                serialized["user_vote"] = "down"
        return serialized
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
async def create_complaint(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    category: str = Form("ROADS_PAVEMENT"),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: Optional[str] = Form("Geo-located Location"),
    contact: Optional[str] = Form(None),
    audio_transcript: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    image_b64: Optional[str] = Form(None),
    user: Optional[dict] = Depends(get_current_user)
):
    # Check for duplicate within 15 meters
    existing = list(complaints_collection.find({"status": {"$ne": "RESOLVED"}}))
    for ex in existing:
        if "latitude" in ex and "longitude" in ex:
            dist = calculate_distance(latitude, longitude, float(ex["latitude"]), float(ex["longitude"]))
            if dist <= 15.0:
                raise HTTPException(
                    status_code=409,
                    detail=f"A similar civic issue '{ex.get('title')}' was already reported {int(dist)}m from this spot. Please upvote the existing grievance to increase municipal prioritization."
                )

    # Process image bytes & upload to Cloudinary
    image_bytes = None
    image_url = None
    if image:
        image_bytes = await image.read()
        image_url = upload_to_cloudinary(image_bytes=image_bytes)
    elif image_b64:
        image_url = upload_to_cloudinary(image_b64=image_b64)

    # If no image was attached, assign curated high-fidelity Unsplash civic images based on category
    if not image_url:
        fallbacks = {
            "ROADS_PAVEMENT": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "SANITATION_WASTE": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
            "WATER_DRAINAGE": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
            "ELECTRICAL_HAZARD": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80",
            "PUBLIC_SAFETY": "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80",
            "ENVIRONMENTAL": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80"
        }
        image_url = fallbacks.get(category, fallbacks["ROADS_PAVEMENT"])

    # Run Multimodal AI Vision Triage (Gemini 2.0 + Roboflow CV)
    combined_notes = description
    if audio_transcript:
        combined_notes += f" [Citizen Audio Note: {audio_transcript}]"

    ai_triage = analyze_civic_image_multimodal(
        image_bytes=image_bytes,
        image_b64=image_b64,
        user_description=combined_notes,
        user_category=category
    )

    sev_score = ai_triage.get("severity_score", 65)
    sev_level = ai_triage.get("severity_level", "MEDIUM")
    sla_hours = ai_triage.get("suggested_sla_hours", 24)
    recommended_dept = ai_triage.get("recommended_department", "Municipal Grievance Cell")

    # Roboflow detection details if available
    roboflow_data = ai_triage.get("roboflow_analysis", {})
    pothole_count = roboflow_data.get("pothole_count", 0)
    normalized_area = roboflow_data.get("normalized_area", 0.0)
    roboflow_validated = roboflow_data.get("roboflow_validated", 0)

    # Dynamic community priority = (SeverityScore * 1.2) + (Upvotes * 4) + (PotholeCount * 10)
    priority = int(sev_score * 1.2) + (pothole_count * 10)

    user_email = user.get("email") if user else "citizen.anonymous@civicpulse.org"

    new_complaint = {
        "_id": ObjectId(),
        "user_email": user_email,
        "title": title,
        "category": category,
        "department": recommended_dept,
        "description": description,
        "audio_transcript": audio_transcript,
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "contact": contact,
        "image_url": image_url,
        "severity": sev_level,
        "severity_score": sev_score,
        "pothole_count": pothole_count,
        "normalized_area": normalized_area,
        "roboflow_validated": roboflow_validated,
        "priority": priority,
        "upvotes": 1,
        "downvotes": 0,
        "upvoted_by": [user_email] if user_email else [],
        "downvoted_by": [],
        "status": ComplaintStatus.VERIFIED.value,
        "ai_analysis": ai_triage,
        "sla_hours": sla_hours,
        "created_at": datetime.now()
    }

    result = complaints_collection.insert_one(new_complaint)
    complaint_id = str(result.inserted_id)

    # Trigger LangGraph autonomous triage agent in background
    background_tasks.add_task(run_agent_on_complaint, complaint_id)

    return {
        "success": True,
        "message": "Civic grievance registered and triaged by AI Agent.",
        "complaint_id": complaint_id,
        "triage_summary": ai_triage
    }


@router.post("/{complaint_id}/vote")
def vote_complaint(complaint_id: str, vote_data: VoteRequest, user: dict = Depends(require_current_user)):
    user_email = user["email"]
    complaint = complaints_collection.find_one({"_id": ObjectId(complaint_id)})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    upvoted_by = complaint.get("upvoted_by", [])
    downvoted_by = complaint.get("downvoted_by", [])
    v_type = vote_data.vote_type

    if v_type == "up":
        if user_email in upvoted_by:
            # Toggle off upvote
            complaints_collection.update_one(
                {"_id": ObjectId(complaint_id)},
                {"$inc": {"upvotes": -1}, "$pull": {"upvoted_by": user_email}}
            )
        elif user_email in downvoted_by:
            # Switch from down to up
            complaints_collection.update_one(
                {"_id": ObjectId(complaint_id)},
                {"$inc": {"upvotes": 1, "downvotes": -1}, "$pull": {"downvoted_by": user_email}, "$push": {"upvoted_by": user_email}}
            )
        else:
            # New upvote
            complaints_collection.update_one(
                {"_id": ObjectId(complaint_id)},
                {"$inc": {"upvotes": 1}, "$push": {"upvoted_by": user_email}}
            )
    elif v_type == "down":
        if user_email in downvoted_by:
            # Toggle off downvote
            complaints_collection.update_one(
                {"_id": ObjectId(complaint_id)},
                {"$inc": {"downvotes": -1}, "$pull": {"downvoted_by": user_email}}
            )
        elif user_email in upvoted_by:
            # Switch from up to down
            complaints_collection.update_one(
                {"_id": ObjectId(complaint_id)},
                {"$inc": {"downvotes": 1, "upvotes": -1}, "$pull": {"upvoted_by": user_email}, "$push": {"downvoted_by": user_email}}
            )
        else:
            # New downvote
            complaints_collection.update_one(
                {"_id": ObjectId(complaint_id)},
                {"$inc": {"downvotes": 1}, "$push": {"downvoted_by": user_email}}
            )

    # Recalculate dynamic priority
    updated = complaints_collection.find_one({"_id": ObjectId(complaint_id)})
    sev_score = updated.get("severity_score", 50)
    upvotes = updated.get("upvotes", 0)
    downvotes = updated.get("downvotes", 0)
    new_priority = int(sev_score * 1.2) + (upvotes * 4) - (downvotes * 2)

    complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {"$set": {"priority": max(0, new_priority)}}
    )

    refreshed = complaints_collection.find_one({"_id": ObjectId(complaint_id)})
    return {
        "upvotes": refreshed.get("upvotes", 0),
        "downvotes": refreshed.get("downvotes", 0),
        "priority": refreshed.get("priority", 0),
        "user_vote": "up" if user_email in refreshed.get("upvoted_by", []) else ("down" if user_email in refreshed.get("downvoted_by", []) else None)
    }


@router.patch("/{complaint_id}/status")
def update_status(complaint_id: str, payload: ComplaintUpdate, user: dict = Depends(require_current_user)):
    complaint = complaints_collection.find_one({"_id": ObjectId(complaint_id)})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    new_status = payload.status.value if payload.status else complaint.get("status")

    if new_status == ComplaintStatus.RESOLVED.value:
        complaint["status"] = ComplaintStatus.RESOLVED.value
        complaint["resolution_date"] = datetime.now()
        complaint["resolution_details"] = payload.resolution_details or "Resolved by municipal field unit"
        resolved_complaints_collection.insert_one(complaint)
        complaints_collection.delete_one({"_id": ObjectId(complaint_id)})
        return {"success": True, "status": "RESOLVED"}
    elif new_status == ComplaintStatus.REJECTED.value:
        complaints_collection.delete_one({"_id": ObjectId(complaint_id)})
        return {"success": True, "status": "REJECTED"}
    else:
        complaints_collection.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$set": {"status": new_status, "admin_notes": payload.admin_notes}}
        )
        return {"success": True, "status": new_status}
