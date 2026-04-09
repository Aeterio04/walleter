from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class PlanType(str, Enum):
    FREE = "FREE"
    PRO = "PRO"


class TransactionType(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"


# Auth Schemas
class UserSignup(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# User Schemas
class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    plan: PlanType
    emergency_fund: float
    emergency_target: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[PlanType] = None
    emergency_fund: Optional[float] = None
    emergency_target: Optional[float] = None


# Transaction Schemas
class TransactionCreate(BaseModel):
    date: date
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    category: str
    type: TransactionType


class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    type: Optional[TransactionType] = None


class TransactionResponse(BaseModel):
    id: str
    date: date
    description: str
    amount: float
    category: str
    type: TransactionType
    created_at: datetime
    
    class Config:
        from_attributes = True


# Budget Schemas
class BudgetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    icon: str
    limit_amount: float = Field(..., gt=0)
    locked: bool = False


class BudgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    icon: Optional[str] = None
    limit_amount: Optional[float] = Field(None, gt=0)
    locked: Optional[bool] = None


class BudgetResponse(BaseModel):
    id: str
    name: str
    icon: str
    limit_amount: float
    locked: bool
    spent: float = 0.0  # Computed field
    created_at: datetime
    
    class Config:
        from_attributes = True


# Investment Schemas
class InvestmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str
    value: float = Field(..., gt=0)
    notes: Optional[str] = None
    date_added: date


class InvestmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = None
    value: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None
    date_added: Optional[date] = None


class InvestmentResponse(BaseModel):
    id: str
    name: str
    type: str
    value: float
    notes: Optional[str]
    date_added: date
    created_at: datetime
    
    class Config:
        from_attributes = True


# Dashboard Summary
class DashboardSummary(BaseModel):
    total_credit: float
    total_debit: float
    balance: float
    total_invested: float
    category_spending: dict[str, float]
