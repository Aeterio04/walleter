from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=List[schemas.BudgetResponse])
def list_budgets(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budgets = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()
    
    # Calculate spent for each budget
    category_spending = db.query(
        models.Transaction.category,
        func.sum(models.Transaction.amount).label("total")
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == models.TransactionType.DEBIT
    ).group_by(models.Transaction.category).all()
    
    spending_dict = {cat: total for cat, total in category_spending}
    
    # Attach spent to each budget
    result = []
    for budget in budgets:
        budget_dict = schemas.BudgetResponse.model_validate(budget).model_dump()
        budget_dict["spent"] = spending_dict.get(budget.name, 0.0)
        result.append(budget_dict)
    
    return result


@router.post("", response_model=schemas.BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: schemas.BudgetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check for duplicate category name
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.name == budget_data.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Budget category already exists"
        )
    
    new_budget = models.Budget(
        user_id=current_user.id,
        **budget_data.model_dump()
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    
    # Return with spent = 0
    budget_dict = schemas.BudgetResponse.model_validate(new_budget).model_dump()
    budget_dict["spent"] = 0.0
    return budget_dict


@router.patch("/{budget_id}", response_model=schemas.BudgetResponse)
def update_budget(
    budget_id: str,
    budget_update: schemas.BudgetUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    
    # Update fields
    update_data = budget_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    
    # Calculate spent
    spent = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == models.TransactionType.DEBIT,
        models.Transaction.category == budget.name
    ).scalar() or 0.0
    
    budget_dict = schemas.BudgetResponse.model_validate(budget).model_dump()
    budget_dict["spent"] = spent
    return budget_dict


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    return None
