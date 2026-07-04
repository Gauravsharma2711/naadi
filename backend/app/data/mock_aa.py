import random
from typing import List, Dict

def generate_cashflow(volatility_level: str) -> List[Dict]:
    """
    Generates 12 months of synthetic cash inflow and outflow for an MSME.
    
    The volatility_level dictates how wildly the cashflow swings from month to month:
    - 'low': Steady business with minor month-to-month variation (up to 10% swing).
    - 'medium': Typical seasonal business with moderate variation (up to 30% swing).
    - 'high': Unpredictable cashflow with extreme variation (up to 70% swing).
    """
    cashflow = []
    
    # Base monthly revenue (inflow) between 100,000 and 1,000,000 INR
    base_inflow = random.randint(10, 100) * 10000.0
    
    # Base outflow is typically some fraction of inflow (e.g., 70-95%)
    base_margin = random.uniform(0.70, 0.95)
    base_outflow = base_inflow * base_margin
    
    swing_ranges = {
        "low": 0.10,
        "medium": 0.30,
        "high": 0.70
    }
    swing_limit = swing_ranges.get(volatility_level.lower(), 0.30)
    
    for month in range(1, 13):
        # Generate random swings within the allowed limit
        inflow_swing = random.uniform(-swing_limit, swing_limit)
        outflow_swing = random.uniform(-swing_limit, swing_limit)
        
        current_inflow = base_inflow * (1 + inflow_swing)
        current_outflow = base_outflow * (1 + outflow_swing)
        
        # Ensure values don't go negative and round to nearest whole number
        current_inflow = max(0.0, round(current_inflow))
        current_outflow = max(0.0, round(current_outflow))
        
        # Calculate net balance for the month
        net_balance = current_inflow - current_outflow
        
        cashflow.append({
            "month_index": month,
            "inflow_inr": current_inflow,
            "outflow_inr": current_outflow,
            "net_balance_inr": net_balance
        })
        
    return cashflow

if __name__ == "__main__":
    import json
    
    # Fixed seed just for reproducible sample output demonstration
    random.seed(42)
    
    print("LOW VOLATILITY:")
    print(json.dumps(generate_cashflow("low")[:3], indent=2))
    print("\nMEDIUM VOLATILITY:")
    print(json.dumps(generate_cashflow("medium")[:3], indent=2))
    print("\nHIGH VOLATILITY:")
    print(json.dumps(generate_cashflow("high")[:3], indent=2))
