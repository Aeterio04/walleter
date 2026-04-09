from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import models
import schemas
from database import get_db
from auth import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email})
    refresh_token_str, refresh_expires = create_refresh_token(data={"sub": new_user.id})
    
    # Store refresh token
    refresh_token_record = models.RefreshToken(
        user_id=new_user.id,
        token=refresh_token_str,
        expires_at=refresh_expires
    )
    db.add(refresh_token_record)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer"
    }


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token_str, refresh_expires = create_refresh_token(data={"sub": user.id})
    
    # Store refresh token
    refresh_token_record = models.RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=refresh_expires
    )
    db.add(refresh_token_record)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=schemas.AccessToken)
def refresh_access_token(token_data: schemas.TokenRefresh, db: Session = Depends(get_db)):
    # Decode refresh token
    payload = decode_token(token_data.refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id = payload.get("sub")
    
    # Verify refresh token exists in DB
    refresh_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token_data.refresh_token,
        models.RefreshToken.user_id == user_id
    ).first()
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Check expiration
    if refresh_token.expires_at < datetime.utcnow():
        db.delete(refresh_token)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    
    # Create new access token
    user = db.query(models.User).filter(models.User.id == user_id).first()
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token_data: schemas.TokenRefresh, db: Session = Depends(get_db)):
    # Delete refresh token from DB
    refresh_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token_data.refresh_token
    ).first()
    
    if refresh_token:
        db.delete(refresh_token)
        db.commit()
    
    return None
