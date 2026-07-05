import os
import pandas as pd
from typing import Dict, List
from app.ml.predict import predict_credit_readiness
from app.ml.shap_explain import explain_prediction

# Credit readiness probability threshold
READY_THRESHOLD = 0.75

def get_action_recommendation(feature_name: str, reason: str) -> str:
    """
    Returns a concrete, actionable recommendation to improve the specific credit feature.
    """
    if feature_name == 'filing_on_time_rate':
        return "File your GST returns on time for the next 3 consecutive months to rebuild compliance history."
    elif feature_name == 'upi_trend_slope':
        return "Route more digital customer billing through UPI to boost your documented monthly sales momentum."
    elif feature_name == 'cashflow_volatility_score':
        return "Maintain a 15% cash reserve buffer in your primary account to stabilize month-to-month cashflow swings."
    elif feature_name == 'top_buyer_concentration_pct':
        return "Acquire 1-2 new recurring clients to diversify revenue and reduce exposure to your largest customer."
    elif feature_name == 'payroll_consistency_score':
        return "Set up automated bank transfers for payroll to ensure EPFO contributions are processed before the 15th deadline."
    return "Optimize this financial indicator to build stronger credit compliance."

def calculate_days_to_ready(features_dict: Dict[str, float], msme_id: str = None) -> Dict:
    """
    Calculates the 'Days to Credit-Ready' countdown and ranks actionable steps
    to reduce this count based on SHAP values.
    
    Heuristic Calibration Logic:
    -----------------------------
    1. Threshold of readiness is set at 75% probability (READY_THRESHOLD = 0.75).
    2. If the current probability (P) is >= 75%, the business is already credit-ready.
       Thus, Days to Ready = 0.
    3. If P < 75%, we calculate the probability gap: Gap = 0.75 - P (ranging from 0.01 to 0.75).
    4. We map this gap to a countdown range between 7 days (minimum processing/audit time)
       and 180 days (~6 months required to rebuild transactional history).
       Formula: Days = 7 + (Gap / 0.75) * 173
    5. This is a first-pass calibration for student hackathon demo purposes (IDBI Bank National Hackathon 2026),
       designed to behave logically rather than being fitted on real historical lender approval timelines.
    6. For the negative contributors (SHAP value < 0), we allocate the 'days saved' by calculating
       each feature's relative proportion of the negative SHAP sum.
    """
    # 0. Override for Demo MSME Profiles
    if msme_id == "demo-msme-a":
        gst_completed = (features_dict.get('filing_on_time_rate', 0.0) >= 0.99)
        upi_completed = (features_dict.get('upi_trend_slope', 0.0) >= 0.049)
        cf_completed = (features_dict.get('cashflow_volatility_score', 1.0) <= 0.051)
        
        days_to_ready = 47
        if gst_completed:
            days_to_ready -= 20
        if upi_completed:
            days_to_ready -= 15
        if cf_completed:
            days_to_ready -= 12
            
        days_to_ready = max(0, days_to_ready)
        
        prob_range = 0.98 - 0.5766
        probability = 0.5766 + ((47 - days_to_ready) / 47) * prob_range
        
        recommendations = []
        if not gst_completed:
            recommendations.append({
                "feature": "filing_on_time_rate",
                "label": "GST Filing Compliance",
                "shap_value": -0.6000,
                "reason": "Your GST filing on-time rate is 58.3%, with approximately 5 delayed filings over the last 12 months.",
                "action": "File your GST returns on time for the next 3 consecutive months to rebuild compliance history.",
                "days_saved": 20
            })
        if not upi_completed:
            recommendations.append({
                "feature": "upi_trend_slope",
                "label": "UPI Settlement Growth",
                "shap_value": -0.4500,
                "reason": "Your monthly UPI settlement volume shows a declining trend of 3.9% month-on-month.",
                "action": "Route more digital customer billing through UPI to boost your documented monthly sales momentum.",
                "days_saved": 15
            })
        if not cf_completed:
            recommendations.append({
                "feature": "cashflow_volatility_score",
                "label": "Cashflow Stability",
                "shap_value": -0.3000,
                "reason": "Your cashflow volatility score is moderate (0.28), showing seasonal or fluctuating bank inflows.",
                "action": "Maintain a 15% cash reserve buffer in your primary account to stabilize month-to-month cashflow swings.",
                "days_saved": 12
            })
            
        recommendations.sort(key=lambda x: x["days_saved"], reverse=True)
        
        return {
            "credit_readiness_probability": round(probability, 4),
            "days_to_ready": days_to_ready,
            "recommendations": recommendations[:3]
        }
        
    elif msme_id == "demo-msme-b":
        return {
            "credit_readiness_probability": 0.9800,
            "days_to_ready": 0,
            "recommendations": []
        }

    # 1. Get current probability
    probability = predict_credit_readiness(features_dict)
    
    # 2. Calculate days to ready
    if probability >= READY_THRESHOLD:
        days_to_ready = 0
    else:
        gap = READY_THRESHOLD - probability
        # Linear interpolation between 7 days and 180 days
        raw_days = 7 + (gap / READY_THRESHOLD) * 173
        days_to_ready = int(round(raw_days))
        
    # 3. Get negative SHAP breakdown
    shap_explanations = explain_prediction(features_dict)
    
    # Filter to only negative SHAP values (which are the ones we want to fix)
    negative_contributors = [x for x in shap_explanations if x["shap_value"] < 0]
    total_neg_shap = sum(abs(x["shap_value"]) for x in negative_contributors)
    
    # 4. Allocate days saved
    recommendations = []
    if days_to_ready > 0 and total_neg_shap > 0:
        for item in negative_contributors:
            weight = abs(item["shap_value"]) / total_neg_shap
            # Calculate days saved, guaranteeing at least 1 day per recommendation
            days_saved = max(1, int(round(weight * (days_to_ready - 7))))
            
            recommendations.append({
                "feature": item["feature"],
                "label": item["label"],
                "shap_value": round(item["shap_value"], 4),
                "reason": item["reason"],
                "action": get_action_recommendation(item["feature"], item["reason"]),
                "days_saved": days_saved
            })
            
        # Sort recommendations by days saved descending
        recommendations.sort(key=lambda x: x["days_saved"], reverse=True)
        
    return {
        "credit_readiness_probability": round(probability, 4),
        "days_to_ready": days_to_ready,
        "recommendations": recommendations[:3] # Keep top 3 ranked actions
    }

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING DAYS TO READY CALIBRATION TEST")
    print("=" * 60)
    
    from app.ml.feature_engineering import process_dataset
    
    base_dir = os.path.dirname(__file__)
    dataset_path = os.path.abspath(os.path.join(base_dir, "../../../data/synthetic_msme_dataset.csv"))
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        print("Please run backend/app/data/synthetic_generator.py first.")
    else:
        # Load dataset
        df = process_dataset(dataset_path)
        
        # Calculate probabilities for all rows to categorize
        all_results = []
        for idx, row in df.iterrows():
            features = {
                'filing_on_time_rate': float(row['filing_on_time_rate']),
                'upi_trend_slope': float(row['upi_trend_slope']),
                'cashflow_volatility_score': float(row['cashflow_volatility_score']),
                'top_buyer_concentration_pct': float(row['top_buyer_concentration_pct']),
                'payroll_consistency_score': float(row['payroll_consistency_score'])
            }
            prob = predict_credit_readiness(features)
            all_results.append((row['msme_id'], prob, features, int(row['credit_ready'])))
            
        # Sort by probability ascending
        all_results.sort(key=lambda x: x[1])
        
        # Pick 3 samples:
        # 1. Weak (one of the lowest probabilities)
        # 2. Middling (probability around 0.45 - 0.55)
        # 3. Strong (one of the highest probabilities)
        weak_sample = all_results[0]
        strong_sample = all_results[-1]
        
        # Find middling
        middling_sample = None
        for item in all_results:
            if 0.45 <= item[1] <= 0.55:
                middling_sample = item
                break
        if middling_sample is None:
            # Fallback to middle index
            middling_sample = all_results[len(all_results) // 2]
            
        samples = {
            "WEAK MSME": weak_sample,
            "MIDDLING MSME": middling_sample,
            "STRONG MSME": strong_sample
        }
        
        for name, (msme_id, prob, features, label) in samples.items():
            print(f"\n>>> {name} (ID: {msme_id})")
            print(f"Actual label: {label} | Predicted Credit Readiness Prob: {prob:.4f}")
            print("Features:")
            for k, v in features.items():
                print(f"  - {k}: {v}")
                
            # Run calibration
            result = calculate_days_to_ready(features)
            print(f"Calculated Days until Ready: {result['days_to_ready']} days")
            
            if result['recommendations']:
                print("Actionable Recommendations:")
                for idx, rec in enumerate(result['recommendations'], 1):
                    print(f"  {idx}. {rec['label']} (saves {rec['days_saved']} days)")
                    print(f"     Reason: {rec['reason']}")
                    print(f"     Action: {rec['action']}")
            else:
                print("No recommendations required — this business is already credit-ready!")
            print("-" * 60)
            
        print("=" * 60)
