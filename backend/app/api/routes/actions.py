from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.database import get_msme, update_msme
from app.ml.days_calibration import calculate_days_to_ready

router = APIRouter()

class ActionCompleteRequest(BaseModel):
    action_id: str

@router.post("/msme/{msme_id}/action-complete")
def complete_action(msme_id: str, payload: ActionCompleteRequest):
    """
    Marks a credit-readiness action complete for a specific MSME, updates the
    underlying feature value to simulate recovery, re-runs the scoring pipeline,
    and returns the updated (reduced) day countdown and actions list.
    """
    # 1. Fetch current MSME records
    msme_data = get_msme(msme_id)
    if not msme_data:
        raise HTTPException(status_code=404, detail=f"MSME with ID {msme_id} not found")
        
    action_id = payload.action_id
    
    # Define the optimized improvement targets for each feature action
    improvements = {
        'filing_on_time_rate': 1.0,                 # 100% filing compliance
        'upi_trend_slope': 0.05,                    # Positive 5% month-on-month volume trend
        'cashflow_volatility_score': 0.05,          # Low volatility index (highly stable)
        'top_buyer_concentration_pct': 0.20,        # Safe customer diversification (20% share)
        'payroll_consistency_score': 1.0            # 100% payroll compliance
    }
    
    if action_id not in improvements:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid action_id '{action_id}'. Valid actions are: {list(improvements.keys())}"
        )
        
    # 2. Update the corresponding feature value
    success = update_msme(msme_id, {action_id: improvements[action_id]})
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update MSME record in database")
        
    # 3. Reload updated data
    updated_msme = get_msme(msme_id)
    features = {
        'filing_on_time_rate': updated_msme['filing_on_time_rate'],
        'upi_trend_slope': updated_msme['upi_trend_slope'],
        'cashflow_volatility_score': updated_msme['cashflow_volatility_score'],
        'top_buyer_concentration_pct': updated_msme['top_buyer_concentration_pct'],
        'payroll_consistency_score': updated_msme['payroll_consistency_score']
    }
    
    # 4. Re-calculate scoring and calibration
    calibration = calculate_days_to_ready(features, msme_id=msme_id)
    
    top_3_actions = [
        {
            "action_id": rec["feature"],
            "action": rec["action"],
            "days_saved": rec["days_saved"]
        }
        for rec in calibration["recommendations"]
    ]
    
    # 5. Return updated days remaining and actions
    return {
        "days_remaining": calibration["days_to_ready"],
        "current_probability": calibration["credit_readiness_probability"],
        "top_3_actions": top_3_actions,
        "msme_data": {
            "msme_id": updated_msme["msme_id"],
            "discipline_level": updated_msme["discipline_level"],
            "has_employees": updated_msme["has_employees"],
            "filing_on_time_rate": updated_msme["filing_on_time_rate"],
            "upi_trend_slope": updated_msme["upi_trend_slope"],
            "cashflow_volatility_score": updated_msme["cashflow_volatility_score"],
            "top_buyer_concentration_pct": updated_msme["top_buyer_concentration_pct"],
            "payroll_consistency_score": updated_msme["payroll_consistency_score"]
        }
    }
