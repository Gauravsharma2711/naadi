import random
from datetime import date, timedelta
from typing import List, Dict, Optional

def generate_payroll_consistency(has_employees: bool) -> Optional[List[Dict]]:
    """
    Generates 12 months of synthetic EPFO payroll contribution history for an MSME.
    
    If has_employees is False, returns None (meaning they have no formal payroll).
    If True, it simulates 12 months of contribution dates. The deadline is usually 
    the 15th of the following month. We assume an average 70% compliance rate, 
    with minor fluctuations in the employee count month-to-month.
    """
    if not has_employees:
        return None
        
    history = []
    
    # We generate data for the trailing 12 months.
    # Start from July 2025 through June 2026 for consistency with other mocks.
    start_date = date(2025, 7, 1)
    
    on_time_prob = 0.70
    
    # Initial employee count between 5 and 50
    employee_count = random.randint(5, 50)
    
    for month_offset in range(12):
        target_month = (start_date.month - 1 + month_offset) % 12 + 1
        target_year = start_date.year + (start_date.month - 1 + month_offset) // 12
        
        # Deadline is the 15th of the following month
        deadline_month = target_month % 12 + 1
        deadline_year = target_year if target_month != 12 else target_year + 1
        deadline_date = date(deadline_year, deadline_month, 15)
        
        is_on_time = random.random() < on_time_prob
        
        if is_on_time:
            # Paid between the 1st and 15th of the deadline month
            days_before = random.randint(0, 14)
            payment_date = deadline_date - timedelta(days=days_before)
        else:
            # Paid late, anywhere from 1 to 20 days late
            days_late = random.randint(1, 20)
            payment_date = deadline_date + timedelta(days=days_late)
            
        # Simulating minor fluctuations in employee headcount month to month
        employee_count = max(1, employee_count + random.randint(-2, 2))
            
        history.append({
            "target_month": f"{target_year}-{target_month:02d}",
            "payment_date": payment_date.isoformat(),
            "employee_count": employee_count,
            "on_time_contribution": is_on_time
        })
        
    return history

if __name__ == "__main__":
    import json
    
    # Fixed seed just for reproducible sample output demonstration
    random.seed(42)
    
    print("WITH EMPLOYEES (has_employees=True):")
    print(json.dumps(generate_payroll_consistency(True)[:3], indent=2))
    
    print("\nWITHOUT EMPLOYEES (has_employees=False):")
    print(json.dumps(generate_payroll_consistency(False), indent=2))
