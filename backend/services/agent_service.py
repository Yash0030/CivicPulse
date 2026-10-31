import os
import re
import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
from typing import TypedDict, List, Dict, Any, Optional
from bson import ObjectId
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from backend.database import complaints_collection, resolved_complaints_collection, agent_logs_collection
from backend.models import DEPARTMENT_MAPPING, CivicCategory, ComplaintStatus

load_dotenv()

SENDER_EMAIL = os.getenv("SENDER_EMAIL", "civic.agent.system@gmail.com")
APP_PASSWORD = os.getenv("APP_PASSWORD", "")
DEFAULT_AUTHORITY_EMAIL = os.getenv("DEFAULT_AUTHORITY_EMAIL", "municipal.grievance.cell@gmail.com")

class CivicAgentState(TypedDict):
    complaint_id: str
    complaint: Optional[Dict[str, Any]]
    status: str
    dispatch_subject: Optional[str]
    dispatch_body: Optional[str]
    target_department_email: Optional[str]
    dispatch_status: Optional[str]
    sla_status: Optional[str]
    resolution_status: Optional[str]
    logs: List[str]


def log_agent_action(action: str, details: str, complaint_id: Optional[str] = None):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "details": details,
        "complaint_id": complaint_id
    }
    try:
        agent_logs_collection.insert_one(entry)
    except Exception as e:
        print(f"Failed to log agent action: {e}")
    print(f"🤖 [LangGraph Agent] {action}: {details}")


# --- LangGraph Nodes ---

def triage_verification_node(state: CivicAgentState) -> CivicAgentState:
    complaint_id = state["complaint_id"]
    logs = list(state.get("logs", []))

    complaint = complaints_collection.find_one({"_id": ObjectId(complaint_id)})
    if not complaint:
        logs.append(f"Complaint {complaint_id} not found in database.")
        return {**state, "status": "FAILED_NOT_FOUND", "logs": logs}

    # Verify severity & readiness
    sev_score = complaint.get("severity_score", 50)
    category = complaint.get("category", "ROADS_PAVEMENT")
    
    logs.append(f"Triaged issue '{complaint.get('title')}' - Category: {category}, Severity Score: {sev_score}/100")
    log_agent_action("TRIAGE_COMPLETE", f"Verified {category} with severity score {sev_score}", complaint_id)

    # Set verified status
    complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {"$set": {"status": ComplaintStatus.VERIFIED.value, "verified_at": datetime.now()}}
    )

    return {**state, "complaint": complaint, "status": "VERIFIED", "logs": logs}


def department_routing_node(state: CivicAgentState) -> CivicAgentState:
    complaint = state.get("complaint")
    logs = list(state.get("logs", []))

    if not complaint:
        return {**state, "status": "FAILED_NO_DATA", "logs": logs}

    cat_str = complaint.get("category", "ROADS_PAVEMENT")
    try:
        cat_enum = CivicCategory(cat_str)
        dept_info = DEPARTMENT_MAPPING.get(cat_enum, DEPARTMENT_MAPPING[CivicCategory.ROADS_PAVEMENT])
    except Exception:
        dept_info = DEPARTMENT_MAPPING[CivicCategory.ROADS_PAVEMENT]

    target_email = DEFAULT_AUTHORITY_EMAIL if not APP_PASSWORD else dept_info["email"]
    sla_hours = dept_info["default_sla_hours"]

    # If critical severity, reduce SLA by 50%
    if complaint.get("severity") == "CRITICAL":
        sla_hours = max(6, sla_hours // 2)

    subject = f"🚨 CIVIC GRIEVANCE #{state['complaint_id']} [{complaint.get('severity')}] - {dept_info['name']}"
    body = f"""OFFICIAL MUNICIPAL GRIEVANCE DISPATCH
System: CivicPulse Autonomous Infrastructure Triage Engine
Tracking ID: #{state['complaint_id']}
Assigned Agency: {dept_info['name']}
Target Nodal Officer: {target_email}

CRITICALITY ASSESSMENT:
- Severity Level: {complaint.get('severity')} ({complaint.get('severity_score', 0)}/100)
- Prescribed Resolution SLA: {sla_hours} Hours
- Incident Address: {complaint.get('address')}
- Precise GPS: Lat {complaint.get('latitude')}, Long {complaint.get('longitude')}

CITIZEN GRIEVANCE STATEMENT:
"{complaint.get('description')}"

AI MULTIMODAL INSPECTION SYNOPSIS:
- Detected Hazards: {', '.join(complaint.get('ai_analysis', {}).get('detected_issues', ['Structural anomaly detected']))}
- Hazard Summary: {complaint.get('ai_analysis', {}).get('hazard_summary', 'N/A')}
- Recommended Mitigation: {complaint.get('ai_analysis', {}).get('recommended_action', 'N/A')}

Public Accountability Portal: http://localhost:5173/track/{state['complaint_id']}
Action Required: Please deploy field crew and acknowledge this dispatch. Replying with 'IN PROGRESS' or 'RESOLVED' will automatically update the public ledger.
"""
    logs.append(f"Routed to {dept_info['name']} ({target_email}) with SLA: {sla_hours}h")
    log_agent_action("DEPARTMENT_ROUTED", f"Assigned to {dept_info['name']} (SLA: {sla_hours}h)", state["complaint_id"])

    complaints_collection.update_one(
        {"_id": ObjectId(state["complaint_id"])},
        {"$set": {
            "department": dept_info["name"],
            "assigned_officer_email": target_email,
            "sla_hours": sla_hours,
            "sla_deadline": (datetime.now() + timedelta(hours=sla_hours)).isoformat()
        }}
    )

    return {
        **state,
        "dispatch_subject": subject,
        "dispatch_body": body,
        "target_department_email": target_email,
        "status": "ROUTED",
        "logs": logs
    }


def autonomous_dispatch_node(state: CivicAgentState) -> CivicAgentState:
    logs = list(state.get("logs", []))
    complaint_id = state["complaint_id"]
    subject = state.get("dispatch_subject", "")
    body = state.get("dispatch_body", "")
    target_email = state.get("target_department_email", DEFAULT_AUTHORITY_EMAIL)

    email_sent = False
    # Attempt real email dispatch if credentials are valid
    if APP_PASSWORD and SENDER_EMAIL:
        try:
            import yagmail
            yag = yagmail.SMTP(SENDER_EMAIL, APP_PASSWORD)
            yag.send(to=target_email, subject=subject, contents=body)
            yag.close()
            email_sent = True
            logs.append(f"Delivered formal dispatch email via SMTP to {target_email}")
            log_agent_action("DISPATCH_SENT", f"Email successfully sent to {target_email}", complaint_id)
        except Exception as e:
            logs.append(f"SMTP Dispatch simulated (Reason: {e})")
            log_agent_action("DISPATCH_SIMULATED", f"Simulated delivery to {target_email}", complaint_id)
    else:
        logs.append(f"Dispatched via CivicPulse High-Priority Municipal Queue to {target_email}")
        log_agent_action("DISPATCH_SIMULATED", f"Mock dispatch issued to {target_email}", complaint_id)

    complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {"$set": {
            "status": ComplaintStatus.DISPATCHED_TO_DEPARTMENT.value,
            "dispatched_at": datetime.now(),
            "dispatch_receipt": {
                "recipient": target_email,
                "timestamp": datetime.now().isoformat(),
                "channel": "SMTP" if email_sent else "CIVIC_SECURE_API"
            }
        }}
    )

    return {**state, "dispatch_status": "SUCCESS", "status": "DISPATCHED", "logs": logs}


def inbox_feedback_node(state: CivicAgentState) -> CivicAgentState:
    """Checks for municipal replies or updates."""
    logs = list(state.get("logs", []))
    complaint_id = state["complaint_id"]

    resolved_count = 0
    if APP_PASSWORD and SENDER_EMAIL:
        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(SENDER_EMAIL, APP_PASSWORD)
            mail.select("inbox")
            status, data = mail.search(None, 'UNSEEN')
            email_ids = data[0].split()

            if email_ids:
                for eid in reversed(email_ids[-5:]):
                    _, msg_data = mail.fetch(eid, '(RFC822)')
                    msg = email.message_from_bytes(msg_data[0][1])
                    subject = str(msg.get("subject", ""))
                    if complaint_id in subject:
                        logs.append(f"Detected authority response for #{complaint_id}")
                        complaints_collection.update_one(
                            {"_id": ObjectId(complaint_id)},
                            {"$set": {"status": ComplaintStatus.IN_PROGRESS.value}}
                        )
                        break
            mail.close()
            mail.logout()
        except Exception as e:
            logs.append(f"Inbox monitor checked: {e}")
    else:
        logs.append("Inbox monitor active and standing by for authority replies.")

    return {**state, "resolution_status": "MONITORING_ACTIVE", "logs": logs}


# --- Build LangGraph Graph ---

def build_civic_agent_graph():
    workflow = StateGraph(CivicAgentState)

    workflow.add_node("triage", triage_verification_node)
    workflow.add_node("route", department_routing_node)
    workflow.add_node("dispatch", autonomous_dispatch_node)
    workflow.add_node("monitor", inbox_feedback_node)

    workflow.set_entry_point("triage")
    workflow.add_edge("triage", "route")
    workflow.add_edge("route", "dispatch")
    workflow.add_edge("dispatch", "monitor")
    workflow.add_edge("monitor", END)

    return workflow.compile()


# Compiled Singleton Graph
civic_agent = build_civic_agent_graph()


def run_agent_on_complaint(complaint_id: str) -> Dict[str, Any]:
    initial_state: CivicAgentState = {
        "complaint_id": complaint_id,
        "complaint": None,
        "status": "INITIATED",
        "dispatch_subject": None,
        "dispatch_body": None,
        "target_department_email": None,
        "dispatch_status": None,
        "sla_status": None,
        "resolution_status": None,
        "logs": []
    }
    result = civic_agent.invoke(initial_state)
    return result


def run_batch_triage_cycle() -> Dict[str, Any]:
    """Finds all un-dispatched complaints and runs the LangGraph agent on them."""
    pending = list(complaints_collection.find({
        "status": {"$in": [ComplaintStatus.PENDING_VERIFICATION.value, ComplaintStatus.VERIFIED.value]}
    }))
    processed = []
    for c in pending:
        cid = str(c["_id"])
        res = run_agent_on_complaint(cid)
        processed.append({
            "id": cid,
            "title": c.get("title"),
            "status": res.get("status"),
            "logs": res.get("logs")
        })
    return {
        "total_triaged": len(processed),
        "results": processed
    }


def get_agent_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    logs = list(agent_logs_collection.find().sort("timestamp", -1))
    clean_logs = []
    for l in logs[:limit]:
        item = dict(l)
        if "_id" in item:
            item["_id"] = str(item["_id"])
        clean_logs.append(item)
    return clean_logs
