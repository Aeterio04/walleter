from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/investments", tags=["investments"])


@router.get("", response_model=List[schemas.InvestmentResponse])
def list_investments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).order_by(models.Investment.date_added.desc()).all()
    return investments


@router.post("", response_model=schemas.InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(
    investment_data: schemas.InvestmentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_investment = models.Investment(
        user_id=current_user.id,
        **investment_data.model_dump()
    )
    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)
    return new_investment


@router.patch("/{investment_id}", response_model=schemas.InvestmentResponse)
def update_investment(
    investment_id: str,
    investment_update: schemas.InvestmentUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()
    
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    
    # Update fields
    update_data = investment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(investment, field, value)
    
    db.commit()
    db.refresh(investment)
    return investment


@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(
    investment_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()
    
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    
    db.delete(investment)
    db.commit()
    return None
