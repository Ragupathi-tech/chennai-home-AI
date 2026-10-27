import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Optional

# Ensure ml directory is in sys.path for model unpickling
base_dir = Path(__file__).resolve().parent.parent.parent
ml_dir = base_dir / "ml"
if str(ml_dir) not in sys.path:
    sys.path.insert(0, str(ml_dir))

# Helper for Indian number formatting: 8250000 -> "₹82,50,000"
def format_indian_currency(amount: float) -> str:
    amount = round(amount)
    s = str(abs(amount))
    if len(s) <= 3:
        formatted = s
    else:
        last3 = s[-3:]
        rest = s[:-3]
        # In Indian numbering, commas are placed every 2 digits after the last 3
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.insert(0, rest)
        formatted = ",".join(groups) + "," + last3
    
    prefix = "-" if amount < 0 else ""
    return f"₹{prefix}{formatted}"

class MLService:
    def __init__(self):
        self.model = None
        self.metrics = {}
        self.locality_stats = {}
        self.residual_std = 300000.0
        self.load_artifacts()

    def load_artifacts(self):
        base_dir = Path(__file__).resolve().parent.parent.parent
        model_path = base_dir / "ml" / "model" / "model.joblib"
        metrics_path = base_dir / "ml" / "model" / "metrics.json"
        locality_path = base_dir / "ml" / "model" / "locality_stats.json"

        if model_path.exists():
            try:
                self.model = joblib.load(model_path)
                print(f"[MLService] Loaded trained model pipeline from {model_path}")
            except Exception as e:
                print(f"[MLService] Error loading model: {e}")

        if metrics_path.exists():
            try:
                with open(metrics_path, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
                    self.residual_std = self.metrics.get("residual_std", 300000.0)
            except Exception as e:
                print(f"[MLService] Error loading metrics: {e}")

        if locality_path.exists():
            try:
                with open(locality_path, "r", encoding="utf-8") as f:
                    self.locality_stats = json.load(f)
            except Exception as e:
                print(f"[MLService] Error loading locality stats: {e}")

    def predict_property(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the ML valuation on the property input."""
        # Calculate derived features
        area = payload.get("area", "Chrompet").strip()
        int_sqft = float(payload.get("int_sqft", 1200))
        n_bedroom = int(payload.get("n_bedroom", 2))
        n_bathroom = int(payload.get("n_bathroom", 2))
        n_room = int(payload.get("n_room") or (n_bedroom + n_bathroom + 1))
        dist_mainroad = float(payload.get("dist_mainroad", 50.0))
        sale_cond = payload.get("sale_cond", "Normal Sale").strip()
        park_facil = payload.get("park_facil", "Yes").strip()
        buildtype = payload.get("buildtype", "House").strip()
        utility_avail = payload.get("utility_avail", "AllPub").strip()
        street = payload.get("street", "Paved").strip()
        mzzone = payload.get("mzzone", "RL").strip()
        qs_rooms = float(payload.get("qs_rooms", 3.5))
        qs_bathroom = float(payload.get("qs_bathroom", 3.5))
        qs_bedroom = float(payload.get("qs_bedroom", 3.5))
        qs_overall = float(payload.get("qs_overall") or ((qs_rooms + qs_bathroom + qs_bedroom) / 3.0))
        building_age = int(payload.get("building_age", 10))

        # Construct DataFrame matching training feature columns
        input_data = pd.DataFrame([{
            'AREA': area,
            'INT_SQFT': int_sqft,
            'DIST_MAINROAD': dist_mainroad,
            'N_BEDROOM': n_bedroom,
            'N_BATHROOM': n_bathroom,
            'N_ROOM': n_room,
            'SALE_COND': sale_cond,
            'PARK_FACIL': park_facil,
            'BUILDTYPE': buildtype,
            'UTILITY_AVAIL': utility_avail,
            'STREET': street,
            'MZZONE': mzzone,
            'QS_ROOMS': qs_rooms,
            'QS_BATHROOM': qs_bathroom,
            'QS_BEDROOM': qs_bedroom,
            'QS_OVERALL': qs_overall,
            'BUILDING_AGE': building_age
        }])

        if self.model is not None:
            pred_log = self.model.predict(input_data)[0]
            raw_price = float(np.expm1(pred_log))
        else:
            # Fallback benchmark estimation if model still initializing
            loc_data = self.locality_stats.get(area, {"avg_sqft_price": 7500.0})
            base_sqft_rate = loc_data.get("avg_sqft_price", 7500.0)
            build_multiplier = 1.3 if buildtype == "Commercial" else (1.0 if buildtype == "House" else 0.9)
            raw_price = int_sqft * base_sqft_rate * build_multiplier

        predicted_price = max(500000.0, round(raw_price))
        price_per_sqft = round(predicted_price / max(1.0, int_sqft), 2)

        # 90% Confidence Interval (+/- 1.645 * residual_std or +/- 6% minimum)
        margin = max(predicted_price * 0.05, 1.645 * self.residual_std)
        confidence_low = max(400000.0, round(predicted_price - margin))
        confidence_high = round(predicted_price + margin)

        # Locality Average Comparison
        loc_stat = self.locality_stats.get(area, {
            "avg_price": 10500000.0,
            "avg_sqft_price": 7500.0
        })
        loc_avg_price = float(loc_stat.get("avg_price", 10500000.0))

        # Expected price for this exact size in this locality
        expected_size_price = loc_stat.get("avg_sqft_price", 7500.0) * int_sqft
        ref_price = expected_size_price if expected_size_price > 0 else loc_avg_price
        
        diff_pct = round(((predicted_price - ref_price) / ref_price) * 100, 1)
        if diff_pct < -4.0:
            status_vs_avg = "below_average"
        elif diff_pct > 4.0:
            status_vs_avg = "above_average"
        else:
            status_vs_avg = "near_average"

        price_lakhs = round(predicted_price / 100000.0, 2)
        price_crores = round(predicted_price / 10000000.0, 3)

        return {
            "area": area,
            "int_sqft": int_sqft,
            "dist_mainroad": dist_mainroad,
            "n_bedroom": n_bedroom,
            "n_bathroom": n_bathroom,
            "n_room": n_room,
            "sale_cond": sale_cond,
            "park_facil": park_facil,
            "buildtype": buildtype,
            "utility_avail": utility_avail,
            "street": street,
            "mzzone": mzzone,
            "building_age": building_age,
            "predicted_price": predicted_price,
            "price_formatted": format_indian_currency(predicted_price),
            "price_lakhs": price_lakhs,
            "price_crores": price_crores,
            "price_per_sqft": price_per_sqft,
            "confidence_low": confidence_low,
            "confidence_high": confidence_high,
            "confidence_low_formatted": format_indian_currency(confidence_low),
            "confidence_high_formatted": format_indian_currency(confidence_high),
            "locality_avg_price": loc_avg_price,
            "locality_avg_formatted": format_indian_currency(loc_avg_price),
            "diff_from_avg_pct": diff_pct,
            "status_vs_avg": status_vs_avg,
            "disclaimer": "This is an AI estimate and not a professional legal or financial valuation."
        }

ml_service = MLService()
