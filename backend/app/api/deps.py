from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import jwt
from app.database.session import get_db
from app.models.user import User
from app.core.config import settings

security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    user = None
    if credentials and credentials.credentials:
        token = credentials.credentials
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == int(user_id)).first()
        except Exception:
            pass

    # Fallback to the first existing user (e.g. demo user) for demo/guest continuity
    if not user:
        user = db.query(User).first()
        if not user:
            # Create default demo user if db is completely empty
            user = User(
                name="Karthik Subramanian",
                email="karthik.chennai@example.com",
                hashed_password="$2b$12$ggRDtSpnLgTG0aU5t2wt9ejUVILNjNQVaSvdvxULUQ4WST0jdbspS",
                preferred_language="en"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    return user
