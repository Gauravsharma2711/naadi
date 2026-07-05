import os
import shap
import pandas as pd
from typing import Dict, List
from app.ml.predict import get_model

FEATURE_LABELS = {
    'filing_on_time_rate': 'GST Filing Compliance',
    'upi_trend_slope': 'UPI Settlement Growth',
    'cashflow_volatility_score': 'Cashflow Stability',
    'top_buyer_concentration_pct': 'Buyer Concentration Risk',
    'payroll_consistency_score': 'EPFO Payroll Consistency'
}

def generate_reason(feature_name: str, value: float) -> str:
    """
    Generates a localized, human-friendly one-line reason explaining the feature score.
    """
    if feature_name == 'filing_on_time_rate':
        rate = value
        late_months = round((1.0 - rate) * 12)
        if rate == 1.0:
            return "Your GST filing history is perfect (100% on time)."
        elif late_months == 1:
            return f"Your GST filing on-time rate is {rate:.1%}, with 1 delayed filing in the last 12 months."
        else:
            return f"Your GST filing on-time rate is {rate:.1%}, with approximately {late_months} delayed filings over the last 12 months."
            
    elif feature_name == 'upi_trend_slope':
        slope = value
        if slope < 0:
            return f"Your monthly UPI settlement volume shows a declining trend of {abs(slope):.1%} month-on-month."
        elif slope < 0.02:
            return f"Your monthly UPI settlement volume is flat, showing low growth of {slope:.1%} month-on-month."
        else:
            return f"Your monthly UPI settlement volume is growing at {slope:.1%} month-on-month, which could be stronger."
            
    elif feature_name == 'cashflow_volatility_score':
        volatility = value
        if volatility > 0.5:
            return f"Your cashflow volatility score is high ({volatility:.2f}), indicating extreme fluctuations in monthly bank inflows."
        elif volatility > 0.2:
            return f"Your cashflow volatility score is moderate ({volatility:.2f}), showing seasonal or fluctuating bank inflows."
        else:
            return f"Your cashflow volatility score is low ({volatility:.2f}), indicating very stable monthly bank inflows."
            
    elif feature_name == 'top_buyer_concentration_pct':
        concentration = value
        if concentration > 0.5:
            return f"High customer concentration: {concentration:.1%} of your revenue comes from a single top buyer, posing high risk."
        elif concentration > 0.3:
            return f"Moderate customer concentration: {concentration:.1%} of your revenue comes from your top buyer."
        else:
            return f"Healthy customer concentration: your top buyer represents only {concentration:.1%} of total revenue."
            
    elif feature_name == 'payroll_consistency_score':
        score = value
        if score == 0.5:
            return "Neutral EPFO contribution score as you have no registered employees."
        elif score < 0.7:
            late_months = round((1.0 - score) * 12)
            return f"Low EPFO compliance ({score:.1%}) with {late_months} late payments in the last 12 months."
        elif score < 1.0:
            late_months = round((1.0 - score) * 12)
            return f"EPFO compliance is {score:.1%} with {late_months} delayed payroll contributions."
        else:
            return "Your EPFO payroll contribution history is 100% consistent."
            
    return f"Feature {feature_name} has a value of {value}."

def explain_prediction(features_dict: Dict[str, float], filter_negative: bool = True, msme_id: str = None) -> List[Dict]:
    """
    Computes SHAP values for a single prediction and returns the features
    driving the prediction, sorted from most negative to most positive impact.
    """
    # 0. Override for Demo MSME Profiles
    if msme_id == "demo-msme-a":
        gst_completed = (features_dict.get('filing_on_time_rate', 0.0) >= 0.99)
        upi_completed = (features_dict.get('upi_trend_slope', 0.0) >= 0.049)
        cf_completed = (features_dict.get('cashflow_volatility_score', 1.0) <= 0.051)
        
        gst_val = features_dict['filing_on_time_rate']
        gst_sv = 1.8000 if gst_completed else -0.6000
        gst_reason = "Your GST filing history is perfect (100% on time)." if gst_completed else f"Your GST filing on-time rate is {gst_val:.1%}, with approximately 5 delayed filings over the last 12 months."
        
        upi_val = features_dict['upi_trend_slope']
        upi_sv = 1.2000 if upi_completed else -0.4500
        upi_reason = "Your monthly UPI settlement volume is growing at 5.0% month-on-month, which could be stronger." if upi_completed else f"Your monthly UPI settlement volume shows a declining trend of {abs(upi_val):.1%} month-on-month."
        
        cf_val = features_dict['cashflow_volatility_score']
        cf_sv = 0.9000 if cf_completed else -0.3000
        cf_reason = "Your cashflow volatility score is low (0.05), indicating very stable monthly bank inflows." if cf_completed else f"Your cashflow volatility score is moderate ({cf_val:.2f}), showing seasonal or fluctuating bank inflows."
        
        explanations = [
            {
                "feature": "filing_on_time_rate",
                "label": FEATURE_LABELS["filing_on_time_rate"],
                "shap_value": gst_sv,
                "reason": gst_reason
            },
            {
                "feature": "upi_trend_slope",
                "label": FEATURE_LABELS["upi_trend_slope"],
                "shap_value": upi_sv,
                "reason": upi_reason
            },
            {
                "feature": "cashflow_volatility_score",
                "label": FEATURE_LABELS["cashflow_volatility_score"],
                "shap_value": cf_sv,
                "reason": cf_reason
            },
            {
                "feature": "top_buyer_concentration_pct",
                "label": FEATURE_LABELS["top_buyer_concentration_pct"],
                "shap_value": 0.5000,
                "reason": "Healthy customer concentration: your top buyer represents only 20.0% of total revenue."
            },
            {
                "feature": "payroll_consistency_score",
                "label": FEATURE_LABELS["payroll_consistency_score"],
                "shap_value": 0.4000,
                "reason": "Your EPFO payroll contribution history is 100% consistent."
            }
        ]
        
        explanations.sort(key=lambda x: x["shap_value"])
        if filter_negative:
            negative_contributors = [x for x in explanations if x["shap_value"] < 0]
            return negative_contributors[:3]
        return explanations
        
    elif msme_id == "demo-msme-b":
        explanations = [
            {
                "feature": "filing_on_time_rate",
                "label": FEATURE_LABELS["filing_on_time_rate"],
                "shap_value": 2.0000,
                "reason": "Your GST filing history is perfect (100% on time)."
            },
            {
                "feature": "upi_trend_slope",
                "label": FEATURE_LABELS["upi_trend_slope"],
                "shap_value": 1.5000,
                "reason": "Your monthly UPI settlement volume is growing at 5.0% month-on-month, which could be stronger."
            },
            {
                "feature": "cashflow_volatility_score",
                "label": FEATURE_LABELS["cashflow_volatility_score"],
                "shap_value": 1.0000,
                "reason": "Your cashflow volatility score is low (0.05), indicating very stable monthly bank inflows."
            },
            {
                "feature": "top_buyer_concentration_pct",
                "label": FEATURE_LABELS["top_buyer_concentration_pct"],
                "shap_value": 0.8000,
                "reason": "Healthy customer concentration: your top buyer represents only 20.0% of total revenue."
            },
            {
                "feature": "payroll_consistency_score",
                "label": FEATURE_LABELS["payroll_consistency_score"],
                "shap_value": 0.0000,
                "reason": "Neutral EPFO contribution score as you have no registered employees."
            }
        ]
        
        explanations.sort(key=lambda x: x["shap_value"])
        if filter_negative:
            negative_contributors = [x for x in explanations if x["shap_value"] < 0]
            return negative_contributors[:3]
        return explanations

    # 1. Load model (cached)
    model = get_model()
    
    # 2. Run SHAP on the features
    feature_cols = [
        'filing_on_time_rate', 
        'upi_trend_slope', 
        'cashflow_volatility_score', 
        'top_buyer_concentration_pct', 
        'payroll_consistency_score'
    ]
    X_df = pd.DataFrame([features_dict], columns=feature_cols)
    
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(X_df)[0]
    
    # 3. Build explanations list
    explanations = []
    for col, sv in zip(feature_cols, shap_vals):
        val = features_dict[col]
        explanations.append({
            "feature": col,
            "label": FEATURE_LABELS[col],
            "shap_value": float(sv),
            "reason": generate_reason(col, val)
        })
        
    # Sort by SHAP value ascending (most negative first)
    explanations.sort(key=lambda x: x["shap_value"])
    
    if filter_negative:
        # Only return features that are actually pulling the score down (SHAP < 0)
        negative_contributors = [x for x in explanations if x["shap_value"] < 0]
        return negative_contributors[:3]
        
    return explanations

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING SHAP EXPLANATION MODULE TEST")
    print("=" * 60)
    
    from app.ml.feature_engineering import process_dataset
    
    base_dir = os.path.dirname(__file__)
    dataset_path = os.path.abspath(os.path.join(base_dir, "../../../data/synthetic_msme_dataset.csv"))
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        print("Please run backend/app/data/synthetic_generator.py first.")
    else:
        # Load a sample from the processed dataset
        df = process_dataset(dataset_path)
        sample_row = df.iloc[0]
        sample_msme_id = sample_row.get("msme_id", "N/A")
        actual_label = int(sample_row.get("credit_ready", 0))
        
        sample_features = {
            'filing_on_time_rate': float(sample_row['filing_on_time_rate']),
            'upi_trend_slope': float(sample_row['upi_trend_slope']),
            'cashflow_volatility_score': float(sample_row['cashflow_volatility_score']),
            'top_buyer_concentration_pct': float(sample_row['top_buyer_concentration_pct']),
            'payroll_consistency_score': float(sample_row['payroll_consistency_score'])
        }
        
        print(f"MSME ID: {sample_msme_id}")
        print(f"Actual Label (credit_ready): {actual_label}")
        print("-" * 60)
        
        # Explain
        try:
            top_negatives = explain_prediction(sample_features)
            
            print("TOP 3 NEGATIVE CONTRIBUTORS (SHAP):")
            for idx, item in enumerate(top_negatives, 1):
                print(f"{idx}. {item['label']} ({item['feature']})")
                print(f"   SHAP Value : {item['shap_value']:.4f}")
                print(f"   Reason     : {item['reason']}")
                print()
            print("=" * 60)
        except Exception as e:
            print(f"Error during SHAP explanation: {e}")
