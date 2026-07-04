import os
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from app.ml.feature_engineering import process_dataset

def train_model():
    # 1. Paths and setup
    base_dir = os.path.dirname(__file__)
    dataset_path = os.path.abspath(os.path.join(base_dir, "../../../data/synthetic_msme_dataset.csv"))
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(
            f"Dataset not found at {dataset_path}. "
            "Please run backend/app/data/synthetic_generator.py first to generate the dataset."
        )
        
    print(f"Loading feature-engineered dataset from: {dataset_path}")
    df = process_dataset(dataset_path)
    
    # 2. Split features and target
    feature_cols = [
        'filing_on_time_rate', 
        'upi_trend_slope', 
        'cashflow_volatility_score', 
        'top_buyer_concentration_pct', 
        'payroll_consistency_score'
    ]
    
    X = df[feature_cols]
    y = df['credit_ready']
    
    # 3. Train/Test Split (80/20, stratified, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training features shape: {X_train.shape}")
    print(f"Test features shape:     {X_test.shape}")
    
    # 4. Train XGBoost classifier
    print("\nTraining XGBoost classifier...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    
    # 5. Evaluate predictions
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print("=" * 60)
    print("MODEL EVALUATION METRICS ON TEST SET")
    print("=" * 60)
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    
    # 6. Feature Importances
    importances = model.feature_importances_
    feat_imp = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    
    print("\n" + "=" * 60)
    print("FEATURE IMPORTANCES")
    print("=" * 60)
    for feat, imp in feat_imp:
        print(f"{feat:<30} : {imp:.4f}")
    print("=" * 60)
    
    # 7. Save model
    model_dir = os.path.abspath(os.path.join(base_dir, "model_store"))
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "xgb_model.json")
    
    model.save_model(model_path)
    print(f"\nTrained model saved to: {model_path}\n")

if __name__ == "__main__":
    train_model()
