import sys
from pathlib import Path

# Ensure backend directory is in sys.path when running from workspace root
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import Base, engine
from app.api import auth, users, predictions, insights
from app.schemas.prediction import PropertyPredictionRequest, PropertyPredictionResponse
from app.models.user import User
from app.api.deps import get_current_user
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.ml_service import ml_service

# Ensure database tables exist on module import and startup
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database tables on startup
    Base.metadata.create_all(bind=engine)
    # Ensure ML artifacts are loaded
    ml_service.load_artifacts()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered Chennai property price prediction and valuation platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Direct Predict endpoint matching prompt POST /predict
@app.post("/api/predict", response_model=PropertyPredictionResponse, tags=["Predictions"])
@app.post("/predict", response_model=PropertyPredictionResponse, tags=["Predictions"])
def predict_property_direct(
    req: PropertyPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return predictions.create_prediction(req, current_user, db)

# Mount API Routers under /api (recommended) and root for flexibility
for prefix in ["/api", ""]:
    app.include_router(auth.router, prefix=prefix)
    app.include_router(users.router, prefix=prefix)
    app.include_router(predictions.router, prefix=prefix)
    app.include_router(insights.router, prefix=prefix)

@app.get("/")
def root():
    return {
        "platform": "ChennaiHome AI",
        "description": "AI-Powered Chennai Real Estate Price Valuation Engine",
        "docs": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
