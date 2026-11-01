import os
import json
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/pothole_app")
DB_NAME = os.getenv("DB_NAME", "pothole_app")

# Flag indicating if live MongoDB is connected
is_live_mongo = False
db = None
client = None

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    # Ping database
    client.admin.command('ping')
    db = client[DB_NAME]
    is_live_mongo = True
    print(f" Connected successfully to live MongoDB: {DB_NAME}")
except Exception as e:
    print(f"⚠️ Live MongoDB connection failed ({e}). Falling back to in-memory JSON data store for local dev.")
    is_live_mongo = False


# In-Memory collection emulator for zero-friction local development if Mongo is down
class LocalCollection:
    def __init__(self, name: str):
        self.name = name
        self.data = []

    def find_one(self, query: dict):
        for item in self.data:
            match = True
            for k, v in query.items():
                if k == "_id" and isinstance(v, ObjectId):
                    if str(item.get("_id")) != str(v):
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                return item
        return None

    def find(self, query: dict = None):
        if not query:
            return LocalCursor(list(self.data))
        matched = []
        for item in self.data:
            match = True
            for k, v in query.items():
                if k == "_id" and isinstance(v, ObjectId):
                    if str(item.get("_id")) != str(v):
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(item)
        return LocalCursor(matched)

    def insert_one(self, doc: dict):
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self.data.append(doc)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc["_id"])

    def update_one(self, query: dict, update: dict):
        item = self.find_one(query)
        if not item:
            return
        if "$set" in update:
            for k, v in update["$set"].items():
                item[k] = v
        if "$inc" in update:
            for k, v in update["$inc"].items():
                item[k] = item.get(k, 0) + v
        if "$push" in update:
            for k, v in update["$push"].items():
                if k not in item or not isinstance(item[k], list):
                    item[k] = []
                item[k].append(v)
        if "$pull" in update:
            for k, v in update["$pull"].items():
                if k in item and isinstance(item[k], list):
                    item[k] = [x for x in item[k] if x != v]

    def delete_one(self, query: dict):
        item = self.find_one(query)
        if item and item in self.data:
            self.data.remove(item)

    def count_documents(self, query: dict = None):
        if not query:
            return len(self.data)
        return len(list(self.find(query)))


class LocalCursor:
    def __init__(self, items):
        self.items = items

    def sort(self, key, direction=-1):
        reverse = (direction == -1)
        self.items.sort(key=lambda x: x.get(key, 0) or 0, reverse=reverse)
        return self

    def __iter__(self):
        return iter(self.items)

    def __list__(self):
        return self.items


if is_live_mongo and db is not None:
    users_collection = db["users"]
    complaints_collection = db["complaints"]
    resolved_complaints_collection = db["resolved_complaints"]
    agent_logs_collection = db["agent_logs"]
else:
    users_collection = LocalCollection("users")
    complaints_collection = LocalCollection("complaints")
    resolved_complaints_collection = LocalCollection("resolved_complaints")
    agent_logs_collection = LocalCollection("agent_logs")

    # Seed sample diverse civic complaints so the UI looks active right away
    sample_complaints = [
        {
            "_id": ObjectId(),
            "user_email": "citizen.alex@civicpulse.org",
            "title": "Severe Pothole Cluster on Main Arterial Junction",
            "category": "ROADS_PAVEMENT",
            "department": "Public Works & Road Infrastructure",
            "description": "Deep tire-bursting potholes across both lanes causing severe traffic bottleneck during peak hours.",
            "severity": "CRITICAL",
            "severity_score": 92,
            "status": "DISPATCHED_TO_DEPARTMENT",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "address": "Intersection of Ring Road and MG Marg, Central Ward",
            "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "priority": 128,
            "upvotes": 14,
            "downvotes": 0,
            "upvoted_by": ["citizen.alex@civicpulse.org"],
            "downvoted_by": [],
            "ai_analysis": {
                "detected_issues": ["Multiple deep potholes", "Sub-base asphalt degradation", "Monsoon water ponding risk"],
                "hazard_level": "High vehicle damage & accident risk",
                "recommended_action": "Emergency cold-mix patching within 24 hours followed by full resurfacing.",
                "confidence": 0.94
            },
            "sla_hours": 24,
            "assigned_officer_email": "pwd.central.ward@gov.in",
            "created_at": datetime.now()
        },
        {
            "_id": ObjectId(),
            "user_email": "priya.k@gmail.com",
            "title": "Overflowing Community Garbage Dump & Sanitation Hazard",
            "category": "SANITATION_WASTE",
            "department": "Municipal Solid Waste Management",
            "description": "Garbage has not been collected for 5 days. Overflowing into pedestrian footpath and attracting stray animals.",
            "severity": "HIGH",
            "severity_score": 78,
            "status": "IN_PROGRESS",
            "latitude": 28.6219,
            "longitude": 77.2140,
            "address": "Opposite Community Health Center, Sector 4",
            "image_url": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
            "priority": 89,
            "upvotes": 9,
            "downvotes": 0,
            "upvoted_by": [],
            "downvoted_by": [],
            "ai_analysis": {
                "detected_issues": ["Severe municipal solid waste accumulation", "Biohazard potential", "Footpath obstruction"],
                "hazard_level": "Public health & vector-borne disease risk",
                "recommended_action": "Immediate compactor truck dispatch and secondary bin sanitization.",
                "confidence": 0.91
            },
            "sla_hours": 48,
            "assigned_officer_email": "swm.sanitation@gov.in",
            "created_at": datetime.now()
        },
        {
            "_id": ObjectId(),
            "user_email": "rahul.sharma@yahoo.com",
            "title": "Major Drinking Water Pipeline Rupture & Road Flooding",
            "category": "WATER_DRAINAGE",
            "department": "Water Supply & Sewerage Board",
            "description": "High pressure potable water main burst, clean water gushing down the street and causing soil erosion.",
            "severity": "CRITICAL",
            "severity_score": 96,
            "status": "VERIFIED",
            "latitude": 28.6289,
            "longitude": 77.2065,
            "address": "Lane 12, Behind Municipal Market",
            "image_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
            "priority": 142,
            "upvotes": 18,
            "downvotes": 0,
            "upvoted_by": [],
            "downvoted_by": [],
            "ai_analysis": {
                "detected_issues": ["Pressurized subterranean pipe rupture", "Severe potable water loss", "Potential subgrade cavitation"],
                "hazard_level": "Critical infrastructure degradation & resource waste",
                "recommended_action": "Immediate main valve shutdown and emergency repair crew dispatch.",
                "confidence": 0.97
            },
            "sla_hours": 12,
            "assigned_officer_email": "water.emergency@gov.in",
            "created_at": datetime.now()
        },
        {
            "_id": ObjectId(),
            "user_email": "sunita.v@outlook.com",
            "title": "Exposed High-Voltage Cable Near Primary School",
            "category": "ELECTRICAL_HAZARD",
            "department": "State Electricity Distribution Corp",
            "description": "Fallen live transmission wire tangled across walkway boundary right outside school entrance gate.",
            "severity": "CRITICAL",
            "severity_score": 99,
            "status": "DISPATCHED_TO_DEPARTMENT",
            "latitude": 28.6095,
            "longitude": 77.2195,
            "address": "Gate 2, Government Model School, West Extension",
            "image_url": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80",
            "priority": 185,
            "upvotes": 25,
            "downvotes": 0,
            "upvoted_by": [],
            "downvoted_by": [],
            "ai_analysis": {
                "detected_issues": ["Exposed active electrical conductor", "High electrocution risk", "Proximity to high-density child footfall"],
                "hazard_level": "Immediate Life Safety Threat",
                "recommended_action": "Grid zone isolation and rapid electrical lineman deployment.",
                "confidence": 0.98
            },
            "sla_hours": 6,
            "assigned_officer_email": "electricity.safety@gov.in",
            "created_at": datetime.now()
        }
    ]
    for c in sample_complaints:
        complaints_collection.insert_one(c)
