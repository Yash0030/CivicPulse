from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class CivicCategory(str, Enum):
    ROADS_PAVEMENT = "ROADS_PAVEMENT"
    SANITATION_WASTE = "SANITATION_WASTE"
    WATER_DRAINAGE = "WATER_DRAINAGE"
    ELECTRICAL_HAZARD = "ELECTRICAL_HAZARD"
    PUBLIC_SAFETY = "PUBLIC_SAFETY"
    ENVIRONMENTAL = "ENVIRONMENTAL"

class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ComplaintStatus(str, Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    DISPATCHED_TO_DEPARTMENT = "DISPATCHED_TO_DEPARTMENT"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

# Department mapping dictionary
DEPARTMENT_MAPPING = {
    CivicCategory.ROADS_PAVEMENT: {
        "name": "Public Works & Road Infrastructure Department (PWD)",
        "email": "pwd.roads@civicgov.in",
        "default_sla_hours": 36
    },
    CivicCategory.SANITATION_WASTE: {
        "name": "Municipal Solid Waste Management (SWM)",
        "email": "sanitation.clean@civicgov.in",
        "default_sla_hours": 24
    },
    CivicCategory.WATER_DRAINAGE: {
        "name": "Water Supply & Sewerage Board (WSSB)",
        "email": "water.emergency@civicgov.in",
        "default_sla_hours": 18
    },
    CivicCategory.ELECTRICAL_HAZARD: {
        "name": "State Electricity Distribution Corporation",
        "email": "electricity.safety@civicgov.in",
        "default_sla_hours": 12
    },
    CivicCategory.PUBLIC_SAFETY: {
        "name": "Urban Development & Public Safety Authority",
        "email": "public.safety@civicgov.in",
        "default_sla_hours": 48
    },
    CivicCategory.ENVIRONMENTAL: {
        "name": "Pollution Control Board & Environmental Cell",
        "email": "environment.enforcement@civicgov.in",
        "default_sla_hours": 48
    }
}

# User Models
class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "citizen"  # "citizen" or "admin"

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# Complaint Models
class ComplaintCreate(BaseModel):
    title: str
    category: CivicCategory
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = "Auto-detected GPS Location"
    contact: Optional[str] = None
    audio_transcript: Optional[str] = None
    image_url: Optional[str] = None

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    admin_notes: Optional[str] = None
    resolution_details: Optional[str] = None

class VoteRequest(BaseModel):
    vote_type: str  # "up" or "down"

class AgentTriggerRequest(BaseModel):
    complaint_id: Optional[str] = None
    force_all_pending: Optional[bool] = False
