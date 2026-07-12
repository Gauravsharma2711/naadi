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
            
            # Add sector field from CSV if exists, else assign default/hash-based sector
            if "sector" in row_dict and pd.notna(row_dict["sector"]):
                row_dict["sector"] = str(row_dict["sector"])
            else:
                # Deterministic fallback assignments based on stable ID character code sum
                sectors = ["Retail", "Manufacturing", "Services"]
                row_dict["sector"] = sectors[sum(ord(c) for c in msme_id) % 3]
            
            _msme_db[msme_id] = row_dict
            
        # Ensure permanent demo profiles are always set to their clean initial starting states
        _msme_db["demo-msme-a"] = {
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
            "credit_ready": 0,
            "sector": "Retail"
        }
        _msme_db["demo-msme-b"] = {
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
            "credit_ready": 1,
            "sector": "Services"
        }
        _msme_db["demo-msme-c"] = {
            "msme_id": "demo-msme-c",
            "discipline_level": "poor",
            "pattern": "declining",
            "volatility_level": "high",
            "has_employees": True,
            "filing_on_time_rate": 0.583,
            "upi_trend_slope": 0.01,
            "cashflow_volatility_score": 0.25,
            "top_buyer_concentration_pct": 0.80,
            "payroll_consistency_score": 0.5,
            "credit_ready": 0,
            "sector": "Services"
        }
        _msme_db["demo-msme-d"] = {
            "msme_id": "demo-msme-d",
            "discipline_level": "good",
            "pattern": "growing",
            "volatility_level": "low",
            "has_employees": False,
            "filing_on_time_rate": 0.917,
            "upi_trend_slope": 0.038,
            "cashflow_volatility_score": 0.09,
            "top_buyer_concentration_pct": 0.32,
            "payroll_consistency_score": 0.5,
            "credit_ready": 0,
            "sector": "Manufacturing"
        }
        _msme_db["demo-msme-e"] = {
            "msme_id": "demo-msme-e",
            "discipline_level": "good",
            "pattern": "flat",
            "volatility_level": "low",
            "has_employees": True,
            "filing_on_time_rate": 0.917,
            "upi_trend_slope": 0.042,
            "cashflow_volatility_score": 0.07,
            "top_buyer_concentration_pct": 0.68,
            "payroll_consistency_score": 0.917,
            "credit_ready": 0,
            "sector": "Services"
        }
        _msme_db["demo-msme-f"] = {
            "msme_id": "demo-msme-f",
            "discipline_level": "average",
            "pattern": "growing",
            "volatility_level": "high",
            "has_employees": True,
            "filing_on_time_rate": 0.833,
            "upi_trend_slope": 0.035,
            "cashflow_volatility_score": 0.48,
            "top_buyer_concentration_pct": 0.25,
            "payroll_consistency_score": 0.75,
            "credit_ready": 0,
            "sector": "Retail"
        }
            
    return _msme_db

# In-memory session completed actions store
# Format: { session_id: { msme_id: { action_id: timestamp_iso_str } } }
_session_completed_actions: Dict[str, Dict[str, dict]] = {}

def add_session_completed_action(session_id: str, msme_id: str, action_id: str):
    """
    Registers a completed action with its timestamp for a specific session and MSME.
    """
    from datetime import datetime, timezone
    global _session_completed_actions
    if session_id not in _session_completed_actions:
        _session_completed_actions[session_id] = {}
    if msme_id not in _session_completed_actions[session_id]:
        _session_completed_actions[session_id][msme_id] = {}
    
    # Store timestamp only if the action was not already completed (preserving the original completion time)
    if action_id not in _session_completed_actions[session_id][msme_id]:
        _session_completed_actions[session_id][msme_id][action_id] = datetime.now(timezone.utc).isoformat()

def get_session_completed_actions(session_id: str, msme_id: str) -> dict:
    """
    Returns a dictionary of completed action_id -> completed_at timestamp for a specific session and MSME.
    """
    return _session_completed_actions.get(session_id, {}).get(msme_id, {})

def get_msme(msme_id: str, session_id: Optional[str] = None) -> Optional[Dict]:
    """
    Retrieves the raw feature data for a specific MSME by its ID.
    If a session_id is provided, applies any session-completed actions on top of the baseline.
    """
    db = load_db()
    msme_data = db.get(msme_id)
    if not msme_data:
        return None
        
    # Always copy the baseline data to prevent accidental in-memory modifications to global cache
    msme_copy = msme_data.copy()
    
    if session_id:
        completed = get_session_completed_actions(session_id, msme_id)
        improvements = {
            'filing_on_time_rate': 1.0,                 # 100% filing compliance
            'upi_trend_slope': 0.05,                    # Positive 5% MoM volume trend
            'cashflow_volatility_score': 0.05,          # Low volatility index (highly stable)
            'top_buyer_concentration_pct': 0.20,        # Safe customer diversification (20% share)
            'payroll_consistency_score': 1.0            # 100% payroll compliance
        }
        for action_id in completed:
            if action_id in improvements:
                msme_copy[action_id] = improvements[action_id]
                
    return msme_copy

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
