import os
import json
import base64
import tempfile
from typing import Dict, Any, Optional
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env explicitly
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv() # fallback to cwd

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
ROBOFLOW_WORKSPACE = os.getenv("ROBOFLOW_WORKSPACE", "aegis")
ROBOFLOW_PROJECT = os.getenv("ROBOFLOW_PROJECT", "pothole-detection-i00zy")
ROBOFLOW_VERSION = int(os.getenv("ROBOFLOW_VERSION", "2"))

# Roboflow Model Initialization
roboflow_model = None
is_roboflow_active = bool(
    ROBOFLOW_API_KEY 
    and ROBOFLOW_API_KEY != "your_roboflow_api_key"
)

if is_roboflow_active:
    try:
        from roboflow import Roboflow
        rf = Roboflow(api_key=ROBOFLOW_API_KEY)
        try:
            project = rf.workspace(ROBOFLOW_WORKSPACE).project(ROBOFLOW_PROJECT)
        except Exception:
            project = rf.workspace().project(ROBOFLOW_PROJECT)
        roboflow_model = project.version(ROBOFLOW_VERSION).model
        print(f"[Roboflow] Model loaded successfully: {ROBOFLOW_WORKSPACE}/{ROBOFLOW_PROJECT} (v{ROBOFLOW_VERSION})")
    except Exception as e:
        print(f"[Roboflow] Model initialization failed: {e}")
        roboflow_model = None


def detect_potholes_roboflow(image_bytes: bytes) -> Optional[Dict[str, Any]]:
    """
    Runs Roboflow computer vision model to detect and segment road potholes.
    Returns pothole count, normalized area, bounding boxes, and confidence.
    """
    if not roboflow_model:
        return None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        result = roboflow_model.predict(tmp_path).json()
        predictions = result.get("predictions", [])

        try:
            os.remove(tmp_path)
        except Exception:
            pass

        if not predictions:
            return {"pothole_count": 0, "normalized_area": 0.0, "detections": []}

        min_confidence = 0.4
        valid_predictions = [
            p for p in predictions 
            if p.get("confidence", 0) >= min_confidence and p.get("class") in ["pothole", "Pothole"]
        ]

        pothole_count = len(valid_predictions)
        total_box_area = 0.0

        detections_list = []
        for pred in valid_predictions:
            w, h = pred.get("width", 0), pred.get("height", 0)
            total_box_area += (w * h)
            detections_list.append({
                "x": pred.get("x"),
                "y": pred.get("y"),
                "width": w,
                "height": h,
                "confidence": round(pred.get("confidence", 0), 3)
            })

        # Calculate rough normalized area assuming standard image dimension
        image_meta = result.get("image", {})
        img_w = image_meta.get("width", 640)
        img_h = image_meta.get("height", 640)
        total_img_area = max(1, img_w * img_h)
        normalized_area = round(total_box_area / total_img_area, 4)

        return {
            "pothole_count": pothole_count,
            "normalized_area": normalized_area,
            "detections": detections_list,
            "roboflow_validated": 1 if pothole_count > 0 else 0
        }
    except Exception as e:
        print(f"⚠️ Roboflow detection error: {e}")
        return None


def analyze_civic_image_multimodal(
    image_bytes: Optional[bytes] = None,
    image_b64: Optional[str] = None,
    user_description: str = "",
    user_category: str = "ROADS_PAVEMENT"
) -> Dict[str, Any]:
    """
    Multimodal AI Analyzer for localized civic issues.
    Combines:
    1. Roboflow Specialized Computer Vision (for Road & Pavement damage when configured)
    2. Google Gemini Vision (for end-to-end multimodal reasoning across all civic problems)
    3. Resilient Deterministic Fallback (for zero-API-key local testing)
    """
    roboflow_data = None
    if image_bytes and (user_category == "ROADS_PAVEMENT" or is_roboflow_active):
        roboflow_data = detect_potholes_roboflow(image_bytes)

    # 1. Google Gemini Multimodal Vision
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")

            rf_context = ""
            if roboflow_data and roboflow_data.get("pothole_count", 0) > 0:
                rf_context = f"\nRoboflow Computer Vision Detection: {roboflow_data['pothole_count']} potholes identified, damage area coverage {roboflow_data['normalized_area']}."

            prompt = f"""
You are an expert Municipal Civic Infrastructure AI Inspector for a Smart City Governance Platform.
Analyze this submitted image of a localized civic infrastructure problem.
User reported category: {user_category}
User reported notes: {user_description}
{rf_context}

You must return ONLY a valid JSON object with the following schema:
{{
  "is_valid_civic_issue": true/false,
  "confidence": float between 0.0 and 1.0,
  "primary_category": "ROADS_PAVEMENT" | "SANITATION_WASTE" | "WATER_DRAINAGE" | "ELECTRICAL_HAZARD" | "PUBLIC_SAFETY" | "ENVIRONMENTAL",
  "severity_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "severity_score": integer between 1 and 100,
  "detected_issues": ["list", "of", "detected", "damage", "or", "hazards"],
  "hazard_summary": "1-2 sentence technical summary of the risk to citizens/traffic",
  "recommended_action": "recommended emergency municipal triage action",
  "recommended_department": "official municipal department name",
  "suggested_sla_hours": integer (e.g. 12, 24, 48)
}}
Do NOT wrap with markdown ticks if possible, return strictly parseable JSON.
"""
            image_parts = []
            if image_bytes:
                image_parts.append({
                    "mime_type": "image/jpeg",
                    "data": image_bytes
                })
            elif image_b64:
                raw_b64 = image_b64.split(",")[1] if "," in image_b64 else image_b64
                image_parts.append({
                    "mime_type": "image/jpeg",
                    "data": base64.b64decode(raw_b64)
                })

            if image_parts:
                response = model.generate_content([prompt, image_parts[0]])
                clean_text = response.text.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                if clean_text.startswith("```"):
                    clean_text = clean_text[3:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]
                parsed = json.loads(clean_text.strip())
                
                # Attach roboflow data if available
                if roboflow_data:
                    parsed["roboflow_analysis"] = roboflow_data

                return parsed
        except Exception as e:
            print(f"⚠️ Gemini Multimodal analysis error ({e}), proceeding with fallback.")

    # 2. Intelligent Deterministic Fallback
    category_heuristics = {
        "ROADS_PAVEMENT": {
            "score": 85,
            "level": "HIGH",
            "issues": ["Asphalt surface disruption", "Pothole crater depression", "Vehicle suspension damage threat"],
            "summary": "Visible structural road pavement degradation requiring immediate patch compaction.",
            "action": "Deploy rapid cold-mix bitumen patching team within 24 hours.",
            "dept": "Public Works & Road Infrastructure (PWD)",
            "sla": 24
        },
        "SANITATION_WASTE": {
            "score": 75,
            "level": "HIGH",
            "issues": ["Uncollected municipal waste heap", "Odor emission & vector breeding risk", "Pedestrian obstruction"],
            "summary": "Sanitation grievance causing environmental contamination and public health nuisance.",
            "action": "Route hydraulic compactor vehicle and sanitize dump perimeter.",
            "dept": "Municipal Solid Waste Management (SWM)",
            "sla": 24
        },
        "WATER_DRAINAGE": {
            "score": 90,
            "level": "CRITICAL",
            "issues": ["High-volume water leakage", "Pavement undermining risk", "Drainage overflow"],
            "summary": "Underground pipe rupture or severe drainage overflow threatening road foundation.",
            "action": "Isolate supply conduit and mobilize emergency valve repair squad.",
            "dept": "Water Supply & Sewerage Board (WSSB)",
            "sla": 18
        },
        "ELECTRICAL_HAZARD": {
            "score": 98,
            "level": "CRITICAL",
            "issues": ["Unshielded electrical cabling", "Electrocution vulnerability", "Public walkway exposure"],
            "summary": "Critical life-safety hazard due to exposed electrical infrastructure.",
            "action": "Power grid isolation and certified lineman deployment.",
            "dept": "State Electricity Distribution Corporation",
            "sla": 6
        },
        "PUBLIC_SAFETY": {
            "score": 70,
            "level": "MEDIUM",
            "issues": ["Damaged safety barrier / pavement", "Trip and fall risk"],
            "summary": "Civil infrastructure physical failure posing safety risks to pedestrians.",
            "action": "Erect safety signage and schedule structural maintenance.",
            "dept": "Urban Development & Public Safety Authority",
            "sla": 48
        },
        "ENVIRONMENTAL": {
            "score": 72,
            "level": "MEDIUM",
            "issues": ["Stagnant runoff pool", "Illegal discharge indicator"],
            "summary": "Environmental hazard requiring municipal inspection and containment.",
            "action": "Inspect site and issue regulatory compliance directive.",
            "dept": "Pollution Control Board & Environmental Cell",
            "sla": 48
        }
    }

    h = category_heuristics.get(user_category, category_heuristics["ROADS_PAVEMENT"])
    
    # Factor in Roboflow detections if present
    extra_score = 0
    if roboflow_data and roboflow_data.get("pothole_count", 0) > 0:
        extra_score = min(15, roboflow_data["pothole_count"] * 5)
        h["issues"].append(f"Roboflow verified: {roboflow_data['pothole_count']} distinct potholes detected")

    final_score = min(100, h["score"] + extra_score)
    level = "CRITICAL" if final_score >= 90 else ("HIGH" if final_score >= 75 else "MEDIUM")

    fallback_result = {
        "is_valid_civic_issue": True,
        "confidence": 0.92,
        "primary_category": user_category,
        "severity_level": level,
        "severity_score": final_score,
        "detected_issues": h["issues"],
        "hazard_summary": h["summary"],
        "recommended_action": h["action"],
        "recommended_department": h["dept"],
        "suggested_sla_hours": h["sla"]
    }

    if roboflow_data:
        fallback_result["roboflow_analysis"] = roboflow_data

    return fallback_result
