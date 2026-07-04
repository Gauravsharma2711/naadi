import os
import pandas as pd
import numpy as np
from typing import List, Dict, Union

def calculate_normalized_slope(y_values: List[Union[int, float]]) -> float:
    """
    Calculates the normalized slope of a series of values.
    Slope is normalized as percentage change over the average to keep it scale-invariant.
    """
    n = len(y_values)
    if n < 2:
        return 0.0
    
    y_mean = sum(y_values) / n
    if y_mean <= 0:
        return 0.0
        
    x_mean = sum(range(n)) / n
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in enumerate(y_values))
    denominator = sum((x - x_mean) ** 2 for x in range(n))
    
    raw_slope = numerator / denominator if denominator != 0 else 0.0
    return raw_slope / y_mean

def calculate_volatility(inflows: List[Union[int, float]]) -> float:
    """
    Calculates the volatility of cash inflows using the coefficient of variation
    (standard deviation / mean).
    """
    n = len(inflows)
    if n == 0:
        return 0.0
        
    avg_inflow = sum(inflows) / n
    if avg_inflow <= 0:
        return 0.0
        
    variance = sum((x - avg_inflow) ** 2 for x in inflows) / n
    std_dev = variance ** 0.5
    return std_dev / avg_inflow

def extract_features(msme_raw_data: Dict) -> Dict[str, float]:
    """
    Extracts 5 key credit-readiness features from raw MSME data.
    
    Supports:
      1. Raw historical/transaction lists (e.g. from live APIs/mock generator functions)
      2. Pre-computed tabular records (e.g. loaded directly from a CSV row)
      
    Features returned:
      - filing_on_time_rate (GST filing compliance)
      - upi_trend_slope (UPI volume momentum)
      - cashflow_volatility_score (Account Aggregator cash-flow variation)
      - top_buyer_concentration_pct (Risk exposure to single buyers)
      - payroll_consistency_score (EPFO compliance; defaults to 0.5 if no employees)
    """
    # 1. GST Filing On-Time Rate
    if "gst_history" in msme_raw_data:
        gst_hist = msme_raw_data["gst_history"] or []
        if len(gst_hist) > 0:
            filing_on_time_rate = sum(1 for m in gst_hist if m.get("on_time", False)) / len(gst_hist)
        else:
            filing_on_time_rate = 0.0
    else:
        filing_on_time_rate = msme_raw_data.get("filing_on_time_rate", 0.0)

    # 2. UPI Settlement Trend Slope
    if "upi_history" in msme_raw_data or "upi_trend" in msme_raw_data:
        upi_hist = msme_raw_data.get("upi_history") or msme_raw_data.get("upi_trend") or []
        upi_amounts = [m.get("settlement_amount_inr", 0.0) for m in upi_hist]
        upi_trend_slope = calculate_normalized_slope(upi_amounts)
    else:
        upi_trend_slope = msme_raw_data.get("upi_trend_slope", 0.0)

    # 3. Cashflow Volatility Score
    if "cashflow_history" in msme_raw_data or "cashflow" in msme_raw_data:
        cf_hist = msme_raw_data.get("cashflow_history") or msme_raw_data.get("cashflow") or []
        inflows = [m.get("inflow_inr", 0.0) for m in cf_hist]
        cashflow_volatility_score = calculate_volatility(inflows)
    else:
        cashflow_volatility_score = msme_raw_data.get("cashflow_volatility_score", 0.0)

    # 4. Top Buyer Concentration Percentage (Scalar)
    top_buyer_concentration_pct = msme_raw_data.get("top_buyer_concentration_pct", 0.0)

    # 5. Payroll Consistency Score
    if "epfo_history" in msme_raw_data or "epfo_payroll" in msme_raw_data:
        epfo_hist = msme_raw_data.get("epfo_history") or msme_raw_data.get("epfo_payroll") or []
        has_employees = msme_raw_data.get("has_employees", True)
        
        if epfo_hist and has_employees:
            payroll_consistency_score = sum(1 for m in epfo_hist if m.get("on_time_contribution", False)) / len(epfo_hist)
        else:
            payroll_consistency_score = 0.5  # Neutral value if no employees
    else:
        payroll_consistency_score = msme_raw_data.get("payroll_consistency_score", 0.5)

    return {
        "filing_on_time_rate": round(float(filing_on_time_rate), 3),
        "upi_trend_slope": round(float(upi_trend_slope), 3),
        "cashflow_volatility_score": round(float(cashflow_volatility_score), 3),
        "top_buyer_concentration_pct": round(float(top_buyer_concentration_pct), 3),
        "payroll_consistency_score": round(float(payroll_consistency_score), 3)
    }

def process_dataset(csv_path: str) -> pd.DataFrame:
    """
    Loads the raw synthetic dataset, applies feature extraction to each row,
    and returns a clean, structured feature matrix DataFrame.
    """
    df = pd.read_csv(csv_path)
    processed_records = []
    
    for _, row in df.iterrows():
        row_dict = row.to_dict()
        features = extract_features(row_dict)
        
        # Preserve identifiers and labels
        features["msme_id"] = row_dict.get("msme_id")
        features["credit_ready"] = row_dict.get("credit_ready")
        
        processed_records.append(features)
        
    return pd.DataFrame(processed_records)

if __name__ == "__main__":
    # Test script execution
    print("=" * 60)
    print("RUNNING FEATURE ENGINEERING MODULE TEST")
    print("=" * 60)
    
    # 1. Path to synthetic MSME dataset
    base_dir = os.path.dirname(__file__)
    dataset_path = os.path.abspath(os.path.join(base_dir, "../../../data/synthetic_msme_dataset.csv"))
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        print("Please run backend/app/data/synthetic_generator.py first to generate the dataset.")
    else:
        print(f"Loading raw dataset from: {dataset_path}")
        
        # 2. Process dataset
        processed_df = process_dataset(dataset_path)
        
        # 3. Print verification info
        print(f"\nProcessed dataset shape: {processed_df.shape}")
        print(f"Columns: {list(processed_df.columns)}")
        print("\nFIRST 5 PROCESSED ROWS:")
        # Reorder columns to place ID first
        cols = ["msme_id"] + [c for c in processed_df.columns if c not in ["msme_id", "credit_ready"]] + ["credit_ready"]
        print(processed_df[cols].head(5).to_string(index=False))
        
        # Check for nulls
        null_count = processed_df.isnull().sum().sum()
        print(f"\nTotal null values in processed matrix: {null_count}")
        print("Feature engineering verification successful!")
