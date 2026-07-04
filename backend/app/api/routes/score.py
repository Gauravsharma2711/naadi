from fastapi import APIRouter, HTTPException
from app.db.database import get_msme
from app.ml.days_calibration import calculate_days_to_ready
from app.ml.shap_explain import explain_prediction

router = APIRouter()

@router.get("/msme/{msme_id}/score")
def get_msme_score(msme_id: str):
    """
    Retrieves the credit-readiness score, SHAP explanation breakdown, 
    and prioritized recovery recommendations for a specific MSME.
    """
    # 1. Fetch MSME raw data from the database
    msme_data = get_msme(msme_id)
    if not msme_data:
        raise HTTPException(status_code=404, detail=f"MSME with ID {msme_id} not found")
        
    # Extract the active feature dictionary
    features = {
        'filing_on_time_rate': msme_data['filing_on_time_rate'],
        'upi_trend_slope': msme_data['upi_trend_slope'],
        'cashflow_volatility_score': msme_data['cashflow_volatility_score'],
        'top_buyer_concentration_pct': msme_data['top_buyer_concentration_pct'],
        'payroll_consistency_score': msme_data['payroll_consistency_score']
    }
    
    # 2. Run calibration pipeline
    calibration = calculate_days_to_ready(features)
    
    # 3. Format the top 3 actionable recommendations
    top_3_actions = [
        {
            "action_id": rec["feature"],
            "action": rec["action"],
            "days_saved": rec["days_saved"]
        }
        for rec in calibration["recommendations"]
    ]
    
    # 4. Get the complete SHAP breakdown (both positive and negative drivers)
    shap_raw = explain_prediction(features, filter_negative=False)
    shap_breakdown = [
        {
            "feature": item["feature"],
            "label": item["label"],
            "shap_value": round(item["shap_value"], 4),
            "reason": item["reason"]
        }
        for item in shap_raw
    ]
    
    # 5. Build and return the structured response
    return {
        "days_remaining": calibration["days_to_ready"],
        "current_probability": calibration["credit_readiness_probability"],
        "top_3_actions": top_3_actions,
        "shap_breakdown": shap_breakdown,
        "msme_data": {
            "msme_id": msme_data["msme_id"],
            "discipline_level": msme_data["discipline_level"],
            "has_employees": msme_data["has_employees"],
            "filing_on_time_rate": msme_data["filing_on_time_rate"],
            "upi_trend_slope": msme_data["upi_trend_slope"],
            "cashflow_volatility_score": msme_data["cashflow_volatility_score"],
            "top_buyer_concentration_pct": msme_data["top_buyer_concentration_pct"],
            "payroll_consistency_score": msme_data["payroll_consistency_score"]
        }
    }
