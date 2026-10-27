from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional
import math
from app.database.session import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.prediction import (
    PropertyPredictionRequest,
    PropertyPredictionResponse,
    PredictionHistoryListResponse
)
from app.api.deps import get_current_user
from app.services.ml_service import ml_service, format_indian_currency

router = APIRouter(tags=["Predictions"])

def _format_prediction_item(item: Prediction) -> PropertyPredictionResponse:
    price = item.predicted_price
    price_lakhs = round(price / 100000.0, 2)
    price_crores = round(price / 10000000.0, 3)
    
    loc_avg = item.locality_avg_price or 10000000.0
    ref_price = (item.price_per_sqft * item.int_sqft) if item.price_per_sqft else loc_avg
    diff_pct = round(((price - ref_price) / ref_price) * 100, 1) if ref_price else 0.0

    return PropertyPredictionResponse(
        id=item.id,
        area=item.area,
        int_sqft=item.int_sqft,
        dist_mainroad=item.dist_mainroad or 50.0,
        n_bedroom=item.n_bedroom or 2,
        n_bathroom=item.n_bathroom or 2,
        n_room=item.n_room or 4,
        sale_cond=item.sale_cond or "Normal Sale",
        park_facil=item.park_facil or "Yes",
        buildtype=item.buildtype or "House",
        utility_avail=item.utility_avail or "AllPub",
        street=item.street or "Paved",
        mzzone=item.mzzone or "RL",
        building_age=item.building_age or 10,
        predicted_price=price,
        price_formatted=format_indian_currency(price),
        price_lakhs=price_lakhs,
        price_crores=price_crores,
        price_per_sqft=item.price_per_sqft,
        confidence_low=item.confidence_low,
        confidence_high=item.confidence_high,
        confidence_low_formatted=format_indian_currency(item.confidence_low),
        confidence_high_formatted=format_indian_currency(item.confidence_high),
        locality_avg_price=loc_avg,
        locality_avg_formatted=format_indian_currency(loc_avg),
        diff_from_avg_pct=diff_pct,
        status_vs_avg=item.status_vs_avg or "near_average",
        disclaimer="This is an AI estimate and not a professional legal or financial valuation.",
        created_at=item.created_at.isoformat() if item.created_at else None
    )

def create_prediction(
    req: PropertyPredictionRequest,
    current_user: User,
    db: Session
) -> PropertyPredictionResponse:
    pred_res = ml_service.predict_property(req.model_dump())
    
    new_pred = Prediction(
        user_id=current_user.id,
        area=pred_res["area"],
        int_sqft=pred_res["int_sqft"],
        dist_mainroad=pred_res.get("dist_mainroad", 50.0),
        n_bedroom=pred_res.get("n_bedroom", 2),
        n_bathroom=pred_res.get("n_bathroom", 2),
        n_room=pred_res.get("n_room", 4),
        sale_cond=pred_res.get("sale_cond", "Normal Sale"),
        park_facil=pred_res.get("park_facil", "Yes"),
        buildtype=pred_res.get("buildtype", "House"),
        utility_avail=pred_res.get("utility_avail", "AllPub"),
        street=pred_res.get("street", "Paved"),
        mzzone=pred_res.get("mzzone", "RL"),
        qs_rooms=req.qs_rooms or 3.5,
        qs_bathroom=req.qs_bathroom or 3.5,
        qs_bedroom=req.qs_bedroom or 3.5,
        qs_overall=req.qs_overall or 3.5,
        building_age=pred_res.get("building_age", 10),
        predicted_price=pred_res["predicted_price"],
        price_per_sqft=pred_res["price_per_sqft"],
        confidence_low=pred_res["confidence_low"],
        confidence_high=pred_res["confidence_high"],
        locality_avg_price=pred_res["locality_avg_price"],
        status_vs_avg=pred_res["status_vs_avg"]
    )
    db.add(new_pred)
    db.commit()
    db.refresh(new_pred)

    pred_res["id"] = new_pred.id
    pred_res["created_at"] = new_pred.created_at.isoformat()
    return PropertyPredictionResponse(**pred_res)

@router.post("/predictions", response_model=PropertyPredictionResponse)
def post_prediction(
    req: PropertyPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_prediction(req, current_user, db)

@router.get("/predictions", response_model=PredictionHistoryListResponse)
def list_predictions(
    search: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    buildtype: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)
    
    if current_user:
        query = query.filter(Prediction.user_id == current_user.id)

    if area and area.strip() and area != "All":
        query = query.filter(Prediction.area.ilike(f"%{area.strip()}%"))

    if buildtype and buildtype.strip() and buildtype != "All":
        query = query.filter(Prediction.buildtype.ilike(f"%{buildtype.strip()}%"))

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter((Prediction.area.ilike(s)) | (Prediction.buildtype.ilike(s)))

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(asc(Prediction.created_at))
    elif sort_by == "price_high":
        query = query.order_by(desc(Prediction.predicted_price))
    elif sort_by == "price_low":
        query = query.order_by(asc(Prediction.predicted_price))
    else:
        query = query.order_by(desc(Prediction.created_at))

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PredictionHistoryListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=[_format_prediction_item(item) for item in items]
    )

@router.get("/predictions/{prediction_id}", response_model=PropertyPredictionResponse)
def get_prediction_by_id(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return _format_prediction_item(item)

@router.delete("/predictions/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(item)
    db.commit()
    return {"message": "Prediction deleted successfully", "id": prediction_id}
