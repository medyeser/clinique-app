"""
Authentication routes for user login and registration.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from models.database import get_db
from models.user import User
from models.secretaire import Secretaire
from models.agent_acceuil import AgentAcceuil
from schemas.user import UserCreate, UserLogin, UserResponse, Token
from schemas.secretaire import SecretaireResponse
from schemas.agent_acceuil import AgentAcceuilResponse
from services.auth_service import (
    get_password_hash,
    authenticate_user,
    authenticate_secretaire,
    authenticate_agent_acceuil,
    create_access_token,
    get_current_active_user,
    get_current_secretaire,
    get_current_agent_acceuil,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        Created user object
        
    Raises:
        HTTPException: If username or email already exists
    """
    # Check if username exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login user and return JWT token.
    
    Args:
        form_data: OAuth2 form data with username and password
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    print(f"Login attempt for user: {form_data.username}")
    user = authenticate_user(db, form_data.username, form_data.password)
    print(f"User authenticated: {user is not None}")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user object
    """
    return current_user


@router.post("/secretaire/login", response_model=Token)
def secretaire_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login secretaire with email and password, return JWT token.
    
    Args:
        form_data: OAuth2 form data with email (username field) and password
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    print(f"Secretaire login attempt for email: {form_data.username}")
    secretaire = authenticate_secretaire(db, form_data.username, form_data.password)
    print(f"Secretaire authenticated: {secretaire is not None}")
    if not secretaire:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with type "secretaire"
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": secretaire.email, "type": "secretaire", "id": secretaire.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/secretaire/me", response_model=SecretaireResponse)
def get_current_secretaire_info(current_secretaire: Secretaire = Depends(get_current_secretaire)):
    """
    Get current authenticated secretaire information.
    
    Args:
        current_secretaire: Current authenticated secretaire
        
    Returns:
        Current secretaire object
    """
    import json
    # Convert JSON string to list for response
    secretaire_dict = {
        "id": current_secretaire.id,
        "nom": current_secretaire.nom,
        "prenom": current_secretaire.prenom,
        "date_naissance": current_secretaire.date_naissance,
        "email": current_secretaire.email,
        "telephone": current_secretaire.telephone,
        "adresse": current_secretaire.adresse,
        "username": current_secretaire.username,
        "date_embauche": current_secretaire.date_embauche,
        "role_permissions": current_secretaire.role_permissions,
        "created_at": current_secretaire.created_at,
        "updated_at": current_secretaire.updated_at,
    }
    
    if current_secretaire.medecins_assignes:
        try:
            secretaire_dict['medecins_assignes'] = json.loads(current_secretaire.medecins_assignes)
        except (json.JSONDecodeError, TypeError):
            secretaire_dict['medecins_assignes'] = []
    else:
        secretaire_dict['medecins_assignes'] = []
    
    return SecretaireResponse(**secretaire_dict)


@router.post("/agent-acceuil/login", response_model=Token)
def agent_acceuil_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login agent d'acceuil with email and password, return JWT token.
    
    Args:
        form_data: OAuth2 form data with email (username field) and password
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    print(f"Agent d'acceuil login attempt for email: {form_data.username}")
    agent = authenticate_agent_acceuil(db, form_data.username, form_data.password)
    print(f"Agent d'acceuil authenticated: {agent is not None}")
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with type "agent_acceuil"
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": agent.email, "type": "agent_acceuil", "id": agent.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/agent-acceuil/me", response_model=AgentAcceuilResponse)
def get_current_agent_acceuil_info(current_agent: AgentAcceuil = Depends(get_current_agent_acceuil)):
    """
    Get current authenticated agent d'acceuil information.
    
    Args:
        current_agent: Current authenticated agent d'acceuil
        
    Returns:
        Current agent d'acceuil object
    """
    return current_agent
