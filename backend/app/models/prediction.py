from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    area = Column(String(50), nullable=False, index=True)
    int_sqft = Column(Float, nullable=False)
    dist_mainroad = Column(Float)
    n_bedroom = Column(Integer)
    n_bathroom = Column(Integer)
    n_room = Column(Integer)
    sale_cond = Column(String(50))
    park_facil = Column(String(10))
    buildtype = Column(String(50), index=True)
    utility_avail = Column(String(50))
    street = Column(String(50))
    mzzone = Column(String(10))
    qs_rooms = Column(Float)
    qs_bathroom = Column(Float)
    qs_bedroom = Column(Float)
    qs_overall = Column(Float)
    building_age = Column(Integer)
    predicted_price = Column(Float, nullable=False)
    price_per_sqft = Column(Float, nullable=False)
    confidence_low = Column(Float, nullable=False)
    confidence_high = Column(Float, nullable=False)
    locality_avg_price = Column(Float, nullable=False)
    status_vs_avg = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="predictions")
