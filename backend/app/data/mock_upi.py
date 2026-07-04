import random
from typing import List, Dict

def generate_upi_trend(pattern: str) -> List[Dict]:
    """
    Generates 12 months of synthetic UPI settlement data for an MSME.
    
    The pattern dictates how the monthly settlement volume changes over time:
    - 'growing': Generally upward trend (e.g. +2% to +10% per month) with noise.
    - 'flat': Stable volume hovering around a base amount (-5% to +5% noise).
    - 'declining': Generally downward trend (e.g. -10% to +2% per month) with noise.
    """
    trend = []
    
    # Starting base monthly settlement amount between 50,000 and 500,000 INR
    current_amount = random.randint(50, 500) * 1000.0
    
    for month in range(1, 13):
        # Determine the percentage change based on pattern
        if pattern == "growing":
            # Mostly positive growth, with occasional small dips for realism
            pct_change = random.uniform(-0.02, 0.10)
        elif pattern == "declining":
            # Mostly negative growth, with occasional small bumps
            pct_change = random.uniform(-0.10, 0.02)
        else: 
            # Flat: fluctuates around the current value
            pct_change = random.uniform(-0.05, 0.05)
            
        current_amount = current_amount * (1 + pct_change)
        
        # Keep amount positive and round to nearest whole number
        current_amount = max(0.0, round(current_amount))
        
        trend.append({
            "month_index": month,
            "settlement_amount_inr": current_amount
        })
        
    return trend

if __name__ == "__main__":
    import json
    
    # Set a fixed seed just for the sample output demonstration so it's reproducible, 
    # but the real usage will be random.
    random.seed(42)
    
    print("GROWING:")
    print(json.dumps(generate_upi_trend("growing")[:4], indent=2))
    print("\nFLAT:")
    print(json.dumps(generate_upi_trend("flat")[:4], indent=2))
    print("\nDECLINING:")
    print(json.dumps(generate_upi_trend("declining")[:4], indent=2))
