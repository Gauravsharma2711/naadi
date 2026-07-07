import os
import sys

# Ensure backend directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.db.database import get_msme
from app.ml.days_calibration import calculate_days_to_ready
from app.ml.shap_explain import explain_prediction
from app.api.routes.report import generate_pdf_report

ARTIFACTS_DIR = r"C:\Users\DELL\.gemini\antigravity-ide\brain\d176a283-8eb1-457a-a9c4-9b31f2801da8"

def generate_report_for(msme_id, filename):
    print(f"Generating report for {msme_id}...")
    msme_data = get_msme(msme_id)
    if not msme_data:
        raise ValueError(f"MSME {msme_id} not found")
        
    features = {
        'filing_on_time_rate': msme_data['filing_on_time_rate'],
        'upi_trend_slope': msme_data['upi_trend_slope'],
        'cashflow_volatility_score': msme_data['cashflow_volatility_score'],
        'top_buyer_concentration_pct': msme_data['top_buyer_concentration_pct'],
        'payroll_consistency_score': msme_data['payroll_consistency_score']
    }
    
    calibration = calculate_days_to_ready(features, msme_id=msme_id)
    
    shap_raw = explain_prediction(features, filter_negative=False, msme_id=msme_id)
    shap_breakdown = [
        {
            "feature": item["feature"],
            "label": item["label"],
            "shap_value": item["shap_value"],
            "reason": item["reason"]
        }
        for item in shap_raw
    ]
    
    pdf_bytes = generate_pdf_report(msme_id, msme_data, calibration, shap_breakdown)
    
    output_path = os.path.join(ARTIFACTS_DIR, filename)
    with open(output_path, "wb") as f:
        f.write(pdf_bytes)
    print(f"Saved {msme_id} report to {output_path}")
    print(f"  Days remaining: {calibration['days_to_ready']}")
    print(f"  Probability: {calibration['credit_readiness_probability']}")
    print(f"  Recommendations count: {len(calibration.get('recommendations', []))}")
    print()

if __name__ == "__main__":
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    generate_report_for("demo-msme-a", "report_demo_a.pdf")
    generate_report_for("demo-msme-c", "report_demo_c.pdf")
    generate_report_for("demo-msme-d", "report_demo_d.pdf")
    print("Done generating all reports!")
