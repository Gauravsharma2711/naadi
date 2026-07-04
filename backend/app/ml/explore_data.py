import os
import pandas as pd
from sklearn.model_selection import train_test_split

def explore_data():
    # 1. Load data
    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/synthetic_msme_dataset.csv"))
    df = pd.read_csv(data_path)
    
    # 2. Print shape, column names and dtypes, and first 5 rows
    print("=" * 60)
    print(f"DATASET SHAPE: {df.shape}")
    print("\nCOLUMNS AND DTYPES:")
    print(df.dtypes)
    print("\nFIRST 5 ROWS:")
    print(df.head().to_string())
    
    # 3. Print class balance
    print("\n" + "=" * 60)
    print("CLASS BALANCE (credit_ready):")
    counts = df['credit_ready'].value_counts()
    pcts = df['credit_ready'].value_counts(normalize=True) * 100
    balance_df = pd.DataFrame({'Count': counts, 'Percentage (%)': pcts.round(2)})
    print(balance_df.to_string())
    
    # 4. Summary statistics
    print("\n" + "=" * 60)
    print("SUMMARY STATISTICS (Numeric Features):")
    numeric_features = [
        'filing_on_time_rate', 'upi_trend_slope', 
        'cashflow_volatility_score', 'top_buyer_concentration_pct', 
        'payroll_consistency_score'
    ]
    print(df[numeric_features].describe().round(3).to_string())
    
    # 5. Correlation with credit_ready
    print("\n" + "=" * 60)
    print("CORRELATION WITH credit_ready (Strongest to Weakest):")
    corr_matrix = df[numeric_features + ['credit_ready']].corr()
    corr_with_target = corr_matrix['credit_ready'].drop('credit_ready')
    corr_sorted = corr_with_target.sort_values(key=abs, ascending=False)
    print(corr_sorted.round(3).to_string())
    
    # 6. Check missing/null values
    print("\n" + "=" * 60)
    print("MISSING/NULL VALUES PER COLUMN:")
    print(df.isnull().sum().to_string())
    
    # 7. Train/test split
    print("\n" + "=" * 60)
    print("TRAIN/TEST SPLIT (80/20):")
    X = df[numeric_features]
    y = df['credit_ready']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"X_train shape: {X_train.shape}")
    print(f"X_test shape:  {X_test.shape}")
    print(f"y_train shape: {y_train.shape}")
    print(f"y_test shape:  {y_test.shape}")
    print("=" * 60)
    print("Data is clean and ready for training!")

if __name__ == "__main__":
    explore_data()
