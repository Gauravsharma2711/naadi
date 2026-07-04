import os
import pandas as pd
from typing import Dict, Optional

# Resolve the absolute path to the dataset CSV file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../data/synthetic_msme_dataset.csv"))

# In-memory database cache
_msme_db: Dict[str, Dict] = {}

def load_db() -> Dict[str, Dict]:
    """
    Loads the MSME data from the CSV file into an in-memory dictionary on demand.
    Caches the data in memory for fast retrieval.
    """
    global _msme_db
    if not _msme_db:
        if not os.path.exists(CSV_PATH):
            raise FileNotFoundError(f"Database CSV not found at: {CSV_PATH}")
            
        df = pd.read_csv(CSV_PATH)
        for _, row in df.iterrows():
            row_dict = row.to_dict()
            msme_id = str(row_dict["msme_id"])
            
            # Cast features to correct python types
            row_dict["has_employees"] = bool(row_dict["has_employees"])
            row_dict["filing_on_time_rate"] = float(row_dict["filing_on_time_rate"])
            row_dict["upi_trend_slope"] = float(row_dict["upi_trend_slope"])
            row_dict["cashflow_volatility_score"] = float(row_dict["cashflow_volatility_score"])
            row_dict["top_buyer_concentration_pct"] = float(row_dict["top_buyer_concentration_pct"])
            row_dict["payroll_consistency_score"] = float(row_dict["payroll_consistency_score"])
            row_dict["credit_ready"] = int(row_dict["credit_ready"])
            
            _msme_db[msme_id] = row_dict
            
    return _msme_db

def get_msme(msme_id: str) -> Optional[Dict]:
    """
    Retrieves the raw feature data for a specific MSME by its ID.
    Returns None if the MSME does not exist.
    """
    db = load_db()
    return db.get(msme_id)

def update_msme(msme_id: str, updated_data: Dict) -> bool:
    """
    Updates the in-memory state of an MSME and flushes the entire database
    back to the CSV file to persist changes.
    """
    db = load_db()
    if msme_id not in db:
        return False
        
    db[msme_id].update(updated_data)
    
    # Compile all records back to DataFrame
    records = list(db.values())
    df = pd.DataFrame(records)
    
    # Save back to CSV
    df.to_csv(CSV_PATH, index=False)
    return True
