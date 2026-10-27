export interface User {
  id: number;
  name: string;
  email: string;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PropertyPredictionRequest {
  area: string;
  int_sqft: number;
  dist_mainroad: number;
  n_bedroom: number;
  n_bathroom: number;
  n_room: number;
  sale_cond: string;
  park_facil: string;
  buildtype: string;
  utility_avail: string;
  street: string;
  mzzone: string;
  building_age: number;
  qs_rooms?: number;
  qs_bathroom?: number;
  qs_bedroom?: number;
}

export interface PropertyPredictionResponse {
  id?: number;
  area: string;
  int_sqft: number;
  dist_mainroad: number;
  n_bedroom: number;
  n_bathroom: number;
  n_room: number;
  sale_cond: string;
  park_facil: string;
  buildtype: string;
  utility_avail: string;
  street: string;
  mzzone: string;
  building_age: number;
  predicted_price: number;
  price_formatted: string;
  price_lakhs: number;
  price_crores: number;
  price_per_sqft: number;
  confidence_low: number;
  confidence_high: number;
  confidence_low_formatted: string;
  confidence_high_formatted: string;
  locality_avg_price: number;
  locality_avg_formatted: string;
  diff_from_avg_pct: number;
  status_vs_avg: 'below_average' | 'near_average' | 'above_average';
  disclaimer: string;
  created_at?: string;
}

export interface PredictionHistoryListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: PropertyPredictionResponse[];
}

export interface Locality {
  area: string;
  count: number;
  avg_price: number;
  avg_price_lakhs: number;
  avg_sqft_price: number;
  min_price: number;
  max_price: number;
  latitude: number;
  longitude: number;
  has_dataset_records: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PropertyOptions {
  localities: SelectOption[];
  build_types: SelectOption[];
  sale_conditions: SelectOption[];
  parking_facilities: SelectOption[];
  utilities: SelectOption[];
  streets: SelectOption[];
  mzzones: SelectOption[];
}

export interface MarketSummary {
  total_properties: number;
  avg_price: number;
  avg_price_lakhs: number;
  median_price: number;
  avg_sqft: number;
  avg_price_per_sqft: number;
  localities: Locality[];
  buildtype_distribution: {
    type: string;
    count: number;
    percentage: number;
    avg_price_lakhs: number;
  }[];
  price_ranges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  source_note: string;
}

export interface ModelMetrics {
  best_model: string;
  dataset_rows: number;
  train_rows: number;
  test_rows: number;
  test_metrics: {
    rmse: number;
    mae: number;
    r2: number;
    mape: number;
  };
  benchmark_comparison: Record<
    string,
    {
      cv_rmse: number;
      cv_mae: number;
      cv_r2: number;
      cv_mape: number;
    }
  >;
  feature_importance: Record<string, number>;
}
