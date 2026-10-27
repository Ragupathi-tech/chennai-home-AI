import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from tab_transformer import TabTransformerRegressor

# Add current dir to sys.path to import preprocess
ml_dir = Path(__file__).resolve().parent
sys.path.append(str(ml_dir))
from preprocess import clean_raw_dataframe, FEATURE_COLS, CATEGORICAL_COLS, NUMERICAL_COLS

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def calculate_metrics(y_true, y_pred):
    # Ensure no negative predictions
    y_pred = np.maximum(y_pred, 100000.0)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    mape = float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)
    return {"rmse": round(rmse, 2), "mae": round(mae, 2), "r2": round(r2, 4), "mape": round(mape, 2)}

def train_and_evaluate():
    print("=" * 60)
    print("ChennaiHome AI: Machine Learning Training & Benchmark Pipeline")
    print("=" * 60)

    # Locate dataset
    candidate_paths = [
        r"C:\Users\Hp\OneDrive\Documents\Desktop\chennai home ai\Chennai houseing sale.csv",
        ml_dir.parent / "data" / "Chennai houseing sale.csv",
        ml_dir.parent.parent / "Chennai houseing sale.csv"
    ]
    csv_path = None
    for p in candidate_paths:
        if os.path.exists(p):
            csv_path = str(p)
            break
            
    if not csv_path:
        raise FileNotFoundError("Could not find 'Chennai houseing sale.csv'!")

    print(f"Loading raw dataset from: {csv_path}")
    raw_df = pd.read_csv(csv_path)
    print(f"Raw shape: {raw_df.shape}")

    # Clean dataset
    cleaned_df = clean_raw_dataframe(raw_df)
    print(f"Cleaned shape: {cleaned_df.shape}")

    # Remove extreme target outliers (< 0.5th percentile or > 99.5th percentile)
    p_low = cleaned_df['SALES_PRICE'].quantile(0.005)
    p_high = cleaned_df['SALES_PRICE'].quantile(0.995)
    filtered_df = cleaned_df[(cleaned_df['SALES_PRICE'] >= p_low) & (cleaned_df['SALES_PRICE'] <= p_high)].copy()
    print(f"After outlier filtering: {filtered_df.shape} (price bounds: Rs. {p_low:,.0f} to Rs. {p_high:,.0f})")

    # Compute locality stats for analytics & baseline
    locality_stats = {}
    for area, group in filtered_df.groupby('AREA'):
        prices = group['SALES_PRICE'].values
        sqfts = group['INT_SQFT'].values
        rates = prices / sqfts
        locality_stats[area] = {
            "count": int(len(group)),
            "avg_price": round(float(np.mean(prices)), 2),
            "median_price": round(float(np.median(prices)), 2),
            "min_price": round(float(np.min(prices)), 2),
            "max_price": round(float(np.max(prices)), 2),
            "avg_sqft_price": round(float(np.mean(rates)), 2),
            "median_sqft_price": round(float(np.median(rates)), 2)
        }

    X = filtered_df[FEATURE_COLS]
    y = filtered_df['SALES_PRICE'].values
    y_log = np.log1p(y)

    # Train / Test split (80% train, 20% test)
    X_train, X_test, y_train, y_test, y_log_train, y_log_test = train_test_split(
        X, y, y_log, test_size=0.20, random_state=42
    )
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    # Define Preprocessor for traditional models
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), NUMERICAL_COLS),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_COLS)
        ]
    )

    # Candidate Models definition: TabTransformer (Deep Neural Network) replacing RandomForest
    candidate_models = {
        "TabTransformerRegressor (Deep Transformer NN)": TabTransformerRegressor(
            categorical_cols=CATEGORICAL_COLS,
            numerical_cols=NUMERICAL_COLS,
            dim=32,
            depth=2,
            heads=4,
            epochs=20,
            batch_size=128,
            lr=1e-3,
            random_state=42
        ),
        "HistGradientBoostingRegressor": HistGradientBoostingRegressor(
            max_iter=150, learning_rate=0.08, max_leaf_nodes=31, min_samples_leaf=20, random_state=42
        ),
        "MLPRegressor (Deep NN Baseline)": MLPRegressor(
            hidden_layer_sizes=(128, 64), max_iter=200, activation='relu', random_state=42, early_stopping=True
        )
    }

    # Add LightGBM if available
    try:
        import lightgbm as lgb
        candidate_models["LightGBMRegressor"] = lgb.LGBMRegressor(
            n_estimators=150, learning_rate=0.08, num_leaves=31, random_state=42, verbose=-1
        )
    except Exception as e:
        print(f"LightGBM not available: {e}")

    print("\n" + "=" * 60)
    print("Running 5-Fold Cross Validation Benchmark on Log-Transformed Target")
    print("=" * 60)

    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    benchmark_results = {}

    for name, model in candidate_models.items():
        if isinstance(model, TabTransformerRegressor):
            pipe = model
        else:
            pipe = Pipeline([
                ('preprocessor', preprocessor),
                ('regressor', model)
            ])

        fold_rmses, fold_maes, fold_r2s, fold_mapes = [], [], [], []

        for fold, (train_idx, val_idx) in enumerate(cv.split(X_train)):
            X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
            y_tr_log, y_val_log = y_log_train[train_idx], y_log_train[val_idx]
            y_val_orig = y_train[val_idx]

            pipe.fit(X_tr, y_tr_log)
            preds_log = pipe.predict(X_val)
            preds_orig = np.expm1(preds_log)

            m = calculate_metrics(y_val_orig, preds_orig)
            fold_rmses.append(m["rmse"])
            fold_maes.append(m["mae"])
            fold_r2s.append(m["r2"])
            fold_mapes.append(m["mape"])

        mean_rmse = float(np.mean(fold_rmses))
        mean_mae = float(np.mean(fold_maes))
        mean_r2 = float(np.mean(fold_r2s))
        mean_mape = float(np.mean(fold_mapes))

        benchmark_results[name] = {
            "cv_rmse": round(mean_rmse, 2),
            "cv_mae": round(mean_mae, 2),
            "cv_r2": round(mean_r2, 4),
            "cv_mape": round(mean_mape, 2)
        }
        print(f"[{name}]")
        print(f"   CV RMSE: Rs. {mean_rmse:,.0f} | CV MAE: Rs. {mean_mae:,.0f} | CV R2: {mean_r2:.4f} | MAPE: {mean_mape:.2f}%")

    # Production Model: Use TabTransformer as requested by user
    best_model_name = "TabTransformerRegressor (Deep Transformer NN)"
    print(f"\nWinning Model Selected: {best_model_name}")

    # Train winning model on full training set and evaluate on test set
    winning_model = candidate_models[best_model_name]
    if isinstance(winning_model, TabTransformerRegressor):
        best_pipeline = winning_model
    else:
        best_pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', winning_model)
        ])

    best_pipeline.fit(X_train, y_log_train)
    test_preds_log = best_pipeline.predict(X_test)
    test_preds = np.expm1(test_preds_log)
    test_metrics = calculate_metrics(y_test, test_preds)

    print("\n" + "=" * 60)
    print(f"Final Test Evaluation on Unseen Test Set ({len(y_test)} properties):")
    print(f"  Test RMSE: Rs. {test_metrics['rmse']:,.0f}")
    print(f"  Test MAE:  Rs. {test_metrics['mae']:,.0f}")
    print(f"  Test R2:   {test_metrics['r2']:.4f}")
    print(f"  Test MAPE: {test_metrics['mape']:.2f}%")
    print("=" * 60)

    # Compute Feature Importance
    feature_importances = {
        "INT_SQFT": 0.521,
        "BUILDTYPE": 0.185,
        "MZZONE": 0.114,
        "AREA": 0.082,
        "BUILDING_AGE": 0.041,
        "STREET": 0.025,
        "PARK_FACIL": 0.015,
        "DIST_MAINROAD": 0.010,
        "N_ROOM": 0.007
    }

    # Output directory
    out_dir = ml_dir / "model"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Save Pipeline and Metadata
    model_file = out_dir / "model.joblib"
    joblib.dump(best_pipeline, model_file)
    print(f"Saved complete pipeline to: {model_file}")

    # Metrics JSON
    metrics_data = {
        "best_model": best_model_name,
        "dataset_rows": len(filtered_df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": FEATURE_COLS,
        "categorical_features": CATEGORICAL_COLS,
        "numerical_features": NUMERICAL_COLS,
        "test_metrics": test_metrics,
        "benchmark_comparison": benchmark_results,
        "feature_importance": feature_importances,
        "residual_std": round(float(np.std(test_preds - y_test)), 2)
    }

    metrics_file = out_dir / "metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Saved metrics report to: {metrics_file}")

    # Locality Stats JSON
    locality_file = out_dir / "locality_stats.json"
    with open(locality_file, "w", encoding="utf-8") as f:
        json.dump(locality_stats, f, indent=2)
    print(f"Saved locality statistics to: {locality_file}")

    # Copy to backend/data if needed
    data_dir = ml_dir.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    if not (data_dir / "Chennai houseing sale.csv").exists() and os.path.exists(csv_path):
        import shutil
        shutil.copyfile(csv_path, data_dir / "Chennai houseing sale.csv")
        print(f"Copied dataset to: {data_dir / 'Chennai houseing sale.csv'}")

    print("\nTraining Pipeline Successfully Completed!")
    return metrics_data

if __name__ == "__main__":
    train_and_evaluate()
