import pandas as pd
import random
import uuid
import os

from mock_gst import generate_gst_history
from mock_upi import generate_upi_trend
from mock_aa import generate_cashflow
from mock_epfo import generate_payroll_consistency

def calculate_normalized_slope(y_values):
    n = len(y_values)
    if n < 2: return 0.0
    x_mean = sum(range(n)) / n
    y_mean = sum(y_values) / n
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in enumerate(y_values))
    denominator = sum((x - x_mean)**2 for x in range(n))
    raw_slope = numerator / denominator if denominator != 0 else 0.0
    # Normalize slope roughly as % change over average to keep it comparable
    return raw_slope / y_mean if y_mean > 0 else 0.0

def generate_dataset(num_profiles=300):
    records = []
    
    for _ in range(num_profiles):
        msme_id = str(uuid.uuid4())[:8]
        discipline_level = random.choice(["good", "average", "poor"])
        pattern = random.choice(["growing", "flat", "declining"])
        volatility_level = random.choice(["low", "medium", "high"])
        has_employees = random.choice([True, False])
        
        # 1. GST History
        gst_history = generate_gst_history(discipline_level)
        filing_on_time_rate = sum(1 for m in gst_history if m['on_time']) / len(gst_history)
        
        # 2. UPI Trend
        upi_trend = generate_upi_trend(pattern)
        upi_amounts = [m['settlement_amount_inr'] for m in upi_trend]
        upi_trend_slope = calculate_normalized_slope(upi_amounts)
        
        # 3. Account Aggregator Cashflow
        cashflow = generate_cashflow(volatility_level)
        inflows = [m['inflow_inr'] for m in cashflow]
        avg_inflow = sum(inflows) / len(inflows)
        # Volatility score = standard deviation / mean (coefficient of variation)
        if avg_inflow > 0:
            variance = sum((x - avg_inflow)**2 for x in inflows) / len(inflows)
            cashflow_volatility_score = (variance ** 0.5) / avg_inflow
        else:
            cashflow_volatility_score = 0.0
            
        # Top buyer concentration pct
        if volatility_level == "high":
            top_buyer_concentration_pct = random.uniform(0.5, 0.9)
        else:
            top_buyer_concentration_pct = random.uniform(0.1, 0.5)
            
        # 4. EPFO Payroll
        epfo_history = generate_payroll_consistency(has_employees)
        if epfo_history:
            payroll_consistency_score = sum(1 for m in epfo_history if m['on_time_contribution']) / len(epfo_history)
        else:
            # Neutral score if no employees
            payroll_consistency_score = 0.5
            
        # 5. Label Assignment
        # Weights:
        # GST filing (0.35): Strongest indicator of financial discipline
        # UPI trend (0.25): High growth indicates momentum and ability to repay
        # Cashflow stability (0.20): Predictable cashflows mean lower default risk
        # Payroll consistency (0.10): Formalized business structure
        # Low concentration (0.10): High concentration is risky if a buyer leaves
        
        # Normalize UPI slope for scoring (cap between -0.10 and 0.10)
        norm_upi = max(min(upi_trend_slope, 0.10), -0.10) * 10
        
        score = (
            (filing_on_time_rate * 0.35) + 
            (norm_upi * 0.25) + 
            ((1.0 - min(cashflow_volatility_score, 1.0)) * 0.20) + 
            (payroll_consistency_score * 0.10) + 
            ((1.0 - top_buyer_concentration_pct) * 0.10)
        )
        
        # Add random noise (-10% to +10%) so it's not perfectly linearly separable
        score += random.uniform(-0.1, 0.1)
        
        credit_ready = 1 if score > 0.55 else 0
        
        records.append({
            "msme_id": msme_id,
            "discipline_level": discipline_level,
            "pattern": pattern,
            "volatility_level": volatility_level,
            "has_employees": has_employees,
            "filing_on_time_rate": round(filing_on_time_rate, 3),
            "upi_trend_slope": round(upi_trend_slope, 3),
            "cashflow_volatility_score": round(cashflow_volatility_score, 3),
            "top_buyer_concentration_pct": round(top_buyer_concentration_pct, 3),
            "payroll_consistency_score": round(payroll_consistency_score, 3),
            "credit_ready": credit_ready
        })
        
    # Append the two permanent demo profiles to ensure they are always present
    records.append({
        "msme_id": "demo-msme-a",
        "discipline_level": "average",
        "pattern": "declining",
        "volatility_level": "high",
        "has_employees": True,
        "filing_on_time_rate": 0.583,
        "upi_trend_slope": -0.039,
        "cashflow_volatility_score": 0.282,
        "top_buyer_concentration_pct": 0.712,
        "payroll_consistency_score": 0.667,
        "credit_ready": 0
    })
    records.append({
        "msme_id": "demo-msme-b",
        "discipline_level": "good",
        "pattern": "growing",
        "volatility_level": "low",
        "has_employees": False,
        "filing_on_time_rate": 1.0,
        "upi_trend_slope": 0.05,
        "cashflow_volatility_score": 0.05,
        "top_buyer_concentration_pct": 0.20,
        "payroll_consistency_score": 0.5,
        "credit_ready": 1
    })
        
    df = pd.DataFrame(records)
    
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "synthetic_msme_dataset.csv")
    
    df.to_csv(output_path, index=False)
    
    print("Class Balance:")
    print(df['credit_ready'].value_counts(normalize=True))
    print("\nFirst 10 Rows:")
    print(df.head(10).to_string())
    
if __name__ == "__main__":
    generate_dataset(300)
