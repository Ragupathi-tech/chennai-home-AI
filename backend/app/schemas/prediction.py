from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PropertyPredictionRequest(BaseModel):
    area: str
    int_sqft: float
    dist_mainroad: Optional[float] = 50.0
    n_bedroom: Optional[int] = 2
    n_bathroom: Optional[int] = 2
    n_room: Optional[int] = 4
    sale_cond: Optional[str] = "Normal Sale"
    park_facil: Optional[str] = "Yes"
    buildtype: Optional[str] = "House"
    utility_avail: Optional[str] = "AllPub"
    street: Optional[str] = "Paved"
    mzzone: Optional[str] = "RL"
    building_age: Optional[int] = 10
    qs_rooms: Optional[float] = 3.5
    qs_bathroom: Optional[float] = 3.5
    qs_bedroom: Optional[float] = 3.5
    qs_overall: Optional[float] = 3.5

class PropertyPredictionResponse(BaseModel):
    id: Optional[int] = None
    area: str
    int_sqft: float
    dist_mainroad: float
    n_bedroom: int
    n_bathroom: int
    n_room: int
    sale_cond: str
    park_facil: str
    buildtype: str
    utility_avail: str
    street: str
    mzzone: str
    building_age: int
    predicted_price: float
    price_formatted: str
    price_lakhs: float
    price_crores: float
    price_per_sqft: float
    confidence_low: float
    confidence_high: float
    confidence_low_formatted: str
    confidence_high_formatted: str
    locality_avg_price: float
    locality_avg_formatted: str
    diff_from_avg_pct: float
    status_vs_avg: str
    disclaimer: str
    created_at: Optional[str] = None

class PredictionHistoryListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[PropertyPredictionResponse]
