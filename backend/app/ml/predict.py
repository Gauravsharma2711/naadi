import os
import xgboost as xgb
import pandas as pd
from typing import Dict

# Global cache for the loaded model to avoid repeated disk reads
_MODEL = None

def get_model() -> xgb.XGBClassifier:
    """
    Loads and returns the trained XGBoost model from the model store.
    Caches the model in memory after the first load.
    """
    global _MODEL
    if _MODEL is None:
        base_dir = os.path.dirname(__file__)
        model_path = os.path.abspath(os.path.join(base_dir, "model_store", "xgb_model.json"))
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. "
                "Please run backend/app/ml/train_model.py first."
            )
            
        model = xgb.XGBClassifier()
        model.load_model(model_path)
        _MODEL = model
        
    return _MODEL

def predict_credit_readiness(features_dict: Dict[str, float]) -> float:
    """
    Predicts the credit readiness probability (0.0 to 1.0) for a single MSME profile.
    
    Accepts:
      - features_dict: A dictionary containing the 5 engineered feature values.
      
    Returns:
      - Probability float between 0.0 and 1.0.
    """
    # 1. Load the model (cached)
    model = get_model()
    
    # 2. Define features in the exact training order
    feature_cols = [
        'filing_on_time_rate', 
        'upi_trend_slope', 
        'cashflow_volatility_score', 
        'top_buyer_concentration_pct', 
        'payroll_consistency_score'
    ]
    
    # 3. Format input as a DataFrame
    X_df = pd.DataFrame([features_dict], columns=feature_cols)
    
    # 4. Predict probability
    # predict_proba returns a 2D array of shape [1, 2] -> [P(class_0), P(class_1)]
    probabilities = model.predict_proba(X_df)
    credit_ready_probability = float(probabilities[0][1])
    
    return credit_ready_probability

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING STANDALONE PREDICTION TEST")
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
        
        # Select the first sample
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
        
        # Print input features
        print(f"MSME ID: {sample_msme_id}")
        print("Features Input:")
        for k, v in sample_features.items():
            print(f"  - {k}: {v}")
        print(f"Actual Label (credit_ready): {actual_label}")
        
        # Predict
        try:
            prob = predict_credit_readiness(sample_features)
            predicted_class = 1 if prob >= 0.5 else 0
            
            print("-" * 60)
            print(f"Predicted Credit Readiness Probability : {prob:.4f}")
            print(f"Predicted credit_ready Class            : {predicted_class}")
            print(f"Prediction Match                        : {predicted_class == actual_label}")
            print("=" * 60)
        except Exception as e:
            print(f"Error during prediction: {e}")
