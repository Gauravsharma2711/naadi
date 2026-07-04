import random
from datetime import date, timedelta
from typing import List, Dict

def generate_gst_history(discipline_level: str) -> List[Dict]:
    """
    Generates 12 months of synthetic GST filing history.
    
    The standard GST filing deadline in India is the 20th of the subsequent month.
    Based on the discipline_level, we adjust the probability of filing on time:
    - 'good': 90% chance of being on time. When late, it's a minor delay (1-5 days).
    - 'average': 60% chance of being on time. When late, it's a moderate delay (1-15 days).
    - 'poor': 20% chance of being on time. When late, it's a significant delay (5-30 days).
    """
    history = []
    
    probs = {
        "good": 0.9,
        "average": 0.6,
        "poor": 0.2
    }
    
    on_time_prob = probs.get(discipline_level.lower(), 0.6)
    
    # We generate data for the trailing 12 months. 
    # For consistency, let's start from July 2025 through June 2026.
    start_date = date(2025, 7, 1)
    
    for month_offset in range(12):
        target_month = (start_date.month - 1 + month_offset) % 12 + 1
        target_year = start_date.year + (start_date.month - 1 + month_offset) // 12
        
        # Deadline is the 20th of the following month
        deadline_month = target_month % 12 + 1
        deadline_year = target_year if target_month != 12 else target_year + 1
        deadline_date = date(deadline_year, deadline_month, 20)
        
        is_on_time = random.random() < on_time_prob
        
        if is_on_time:
            # Filed sometime between the 1st and the 20th of the deadline month
            days_before = random.randint(0, 19)
            filing_date = deadline_date - timedelta(days=days_before)
        else:
            # Filed late
            if discipline_level == "good":
                days_late = random.randint(1, 5)
            elif discipline_level == "poor":
                days_late = random.randint(5, 30)
            else: # average
                days_late = random.randint(1, 15)
                
            filing_date = deadline_date + timedelta(days=days_late)
            
        history.append({
            "target_month": f"{target_year}-{target_month:02d}",
            "filing_date": filing_date.isoformat(),
            "on_time": is_on_time
        })
        
    return history

if __name__ == "__main__":
    import json
    print("GOOD:")
    print(json.dumps(generate_gst_history("good")[:3], indent=2))
    print("\nAVERAGE:")
    print(json.dumps(generate_gst_history("average")[:3], indent=2))
    print("\nPOOR:")
    print(json.dumps(generate_gst_history("poor")[:3], indent=2))
