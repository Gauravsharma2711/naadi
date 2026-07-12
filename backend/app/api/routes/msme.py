from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.database import get_msme
from app.ml.days_calibration import calculate_days_to_ready
from app.ml.shap_explain import explain_prediction
from app.ml.story_generator import generate_financial_story

router = APIRouter()

class ConnectRequest(BaseModel):
    msme_id: str
    sources: list[str]  # e.g. ["gst", "upi", "bank", "epfo"]

class ConnectResponse(BaseModel):
    msme_id: str
    connected_sources: list[str]
    business_name: str
    discipline_level: str
    has_employees: bool

@router.post("/msme/connect", response_model=ConnectResponse)
def connect_msme(payload: ConnectRequest):
    """
    Validates that the given MSME exists in our database and 'connects'
    the requested data sources. In production this would trigger real
    OAuth/AA consent flows; for the hackathon demo it validates the ID
    and returns confirmation with basic business metadata.
    """
    msme_id = payload.msme_id.strip()
    if not msme_id:
        raise HTTPException(status_code=400, detail="msme_id is required")

    msme_data = get_msme(msme_id)
    if not msme_data:
        raise HTTPException(
            status_code=404,
            detail=f"No business found with ID '{msme_id}'. Check the ID and try again."
        )

    valid_sources = {"gst", "upi", "bank", "epfo"}
    requested = [s.lower().strip() for s in payload.sources]
    invalid = [s for s in requested if s not in valid_sources]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown data sources: {invalid}. Valid sources are: {sorted(valid_sources)}"
        )

    return ConnectResponse(
        msme_id=msme_id,
        connected_sources=requested,
        business_name=f"MSME {msme_id[:8]}",
        discipline_level=msme_data.get("discipline_level", "unknown"),
        has_employees=msme_data.get("has_employees", False),
    )

@router.get("/msme/{msme_id}/story")
def get_msme_story(msme_id: str, session_id: Optional[str] = None):
    """
    Generates a financial story paragraph using Amazon Bedrock.
    Falls back gracefully to returning None if the Bedrock call fails, times out, or has an expired token.
    """
    msme_data = get_msme(msme_id, session_id)
    if not msme_data:
        raise HTTPException(status_code=404, detail=f"MSME with ID {msme_id} not found")
        
    features = {
        'filing_on_time_rate': msme_data['filing_on_time_rate'],
        'upi_trend_slope': msme_data['upi_trend_slope'],
        'cashflow_volatility_score': msme_data['cashflow_volatility_score'],
        'top_buyer_concentration_pct': msme_data['top_buyer_concentration_pct'],
        'payroll_consistency_score': msme_data['payroll_consistency_score']
    }
    
    calibration = calculate_days_to_ready(features, msme_id=msme_id)
    days_remaining = calibration["days_to_ready"]
    
    shap_raw = explain_prediction(features, filter_negative=False, msme_id=msme_id)
    shap_breakdown = [
        {
            "feature": item["feature"],
            "label": item["label"],
            "shap_value": round(item["shap_value"], 4),
            "reason": item["reason"]
        }
        for item in shap_raw
    ]
    
    try:
        story = generate_financial_story(shap_breakdown, days_remaining)
        return {
            "story": story,
            "fallback": False
        }
    except Exception as e:
        print(f"[Bedrock Fallback Triggered] Error generating story: {str(e)}")
        return {
            "story": None,
            "fallback": True,
            "error_msg": str(e)
        }

