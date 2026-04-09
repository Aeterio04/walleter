from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserProfile)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserProfile)
def update_user_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update fields if provided
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.plan is not None:
        current_user.plan = user_update.plan
    if user_update.emergency_fund is not None:
        current_user.emergency_fund = user_update.emergency_fund
    if user_update.emergency_target is not None:
        current_user.emergency_target = user_update.emergency_target
    
    db.commit()
    db.refresh(current_user)
    return current_user
