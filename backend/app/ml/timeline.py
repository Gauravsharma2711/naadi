import random
from typing import List, Dict, Optional
import sys
import os
# Ensure app/data is in python path so that mock imports in synthetic_generator function correctly
data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data"))
if data_dir not in sys.path:
    sys.path.append(data_dir)

from app.data.mock_gst import generate_gst_history
from app.data.mock_upi import generate_upi_trend
from app.data.mock_aa import generate_cashflow
from app.data.mock_epfo import generate_payroll_consistency
from app.ml.days_calibration import calculate_days_to_ready
from app.data.synthetic_generator import calculate_normalized_slope
from app.db.database import get_msme

def get_msme_historical_timeline(msme_id: str, session_id: Optional[str] = None) -> List[Dict]:
    """
    Computes a deterministic, stable 6-month history of credit-readiness days remaining
    by seeding Python's random generator with the MSME ID and re-running the scoring
    pipeline up to each month's historical snapshot.
    """
    # 1. Fetch MSME raw properties
    msme_data = get_msme(msme_id, session_id)
    if not msme_data:
        return []
        
    discipline_level = msme_data.get("discipline_level", "average")
    pattern = msme_data.get("pattern", "flat")
    volatility_level = msme_data.get("volatility_level", "medium")
    has_employees = bool(msme_data.get("has_employees", False))
    
    # 2. Seed random deterministically to make it stable across calls/restarts
    state = random.getstate()
    seed_val = sum(ord(c) for c in msme_id)
    random.seed(seed_val)
    
    # Generate full 12 months of synthetic history
    gst_history = generate_gst_history(discipline_level)
    upi_trend = generate_upi_trend(pattern)
    cashflow = generate_cashflow(volatility_level)
    epfo_history = generate_payroll_consistency(has_employees)
    
    # Restore standard random state
    random.setstate(state)
    
    # Month indices for Jan to Current/June (offsets 6 to 11 in a 12-month series)
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Current"]
    
    # Calculate actual current days remaining from active database state
    current_features = {
        'filing_on_time_rate': msme_data['filing_on_time_rate'],
        'upi_trend_slope': msme_data['upi_trend_slope'],
        'cashflow_volatility_score': msme_data['cashflow_volatility_score'],
        'top_buyer_concentration_pct': msme_data['top_buyer_concentration_pct'],
        'payroll_consistency_score': msme_data['payroll_consistency_score']
    }
    current_calib = calculate_days_to_ready(current_features, msme_id=msme_id)
    current_days_remaining = current_calib["days_to_ready"]
    
    # Calculate what the real ML model predicts for current features (without demo hardcoding)
    model_calib_current = calculate_days_to_ready(current_features, msme_id=None)
    model_days_at_12 = model_calib_current["days_to_ready"]
    
    # Determine the calibration offset (to align model scores with demo dashboard state)
    offset = current_days_remaining - model_days_at_12
    
    timeline = []
    
    for idx, month_idx in enumerate(range(6, 12)): # 6 = Jan, 11 = Current/June
        month_name = month_names[idx]
        M = month_idx + 1
        
        if month_idx == 11:
            # Current month must align perfectly with current dashboard state
            days_val = current_days_remaining
        else:
            # Reconstruct cumulative features up to Month M
            # 1. GST Rate
            gst_sub = gst_history[:M]
            filing_on_time_rate = sum(1 for x in gst_sub if x['on_time']) / len(gst_sub)
            
            # 2. UPI Trend
            upi_sub = upi_trend[:M]
            upi_amounts = [x['settlement_amount_inr'] for x in upi_sub]
            upi_trend_slope = calculate_normalized_slope(upi_amounts)
            
            # 3. Cashflow Volatility
            cf_sub = cashflow[:M]
            inflows = [x['inflow_inr'] for x in cf_sub]
            avg_inflow = sum(inflows) / len(inflows)
            if avg_inflow > 0:
                variance = sum((x - avg_inflow)**2 for x in inflows) / len(inflows)
                cashflow_volatility_score = (variance ** 0.5) / avg_inflow
            else:
                cashflow_volatility_score = 0.0
                
            # Top buyer concentration (simulated with stable variance)
            random.seed(seed_val + month_idx)
            if volatility_level == "high":
                top_buyer_concentration_pct = random.uniform(0.5, 0.9)
            else:
                top_buyer_concentration_pct = random.uniform(0.1, 0.5)
            random.setstate(state)
                
            # 4. EPFO Consistency
            if epfo_history:
                epfo_sub = epfo_history[:M]
                payroll_consistency_score = sum(1 for x in epfo_sub if x['on_time_contribution']) / len(epfo_sub)
            else:
                payroll_consistency_score = 0.5
                
            features_at_M = {
                'filing_on_time_rate': filing_on_time_rate,
                'upi_trend_slope': upi_trend_slope,
                'cashflow_volatility_score': cashflow_volatility_score,
                'top_buyer_concentration_pct': top_buyer_concentration_pct,
                'payroll_consistency_score': payroll_consistency_score
            }
            
            # Re-run ML scoring pipeline for snapshot M
            model_calib = calculate_days_to_ready(features_at_M, msme_id=None)
            model_days_at_M = model_calib["days_to_ready"]
            
            # Scale dynamically using the offset
            days_val = max(0, model_days_at_M + offset)
            
        timeline.append({
            "month": month_name,
            "days_remaining": days_val
        })
        
    return timeline
