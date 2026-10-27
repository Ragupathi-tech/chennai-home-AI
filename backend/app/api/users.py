from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, LanguageUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/language", response_model=UserResponse)
def update_language(
    update_data: LanguageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.preferred_language = update_data.preferred_language
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
