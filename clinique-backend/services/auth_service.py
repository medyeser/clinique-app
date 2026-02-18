"""
Authentication service for JWT token management and password hashing.
"""
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from models.database import get_db
from models.user import User
from models.secretaire import Secretaire
from models.agent_acceuil import AgentAcceuil
from schemas.user import TokenData
import json

# Load environment variables
load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing the data to encode in the token
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from the JWT token.
    
    Args:
        token: JWT token from the request
        db: Database session
        
    Returns:
        User object
        
    Raises:
        HTTPException: If credentials are invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get the current active user.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        User object if active
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user by username/email and password.

    Args:
        db: Database session
        username: Username or email
        password: Plain password

    Returns:
        User object if authentication successful, None otherwise
    """
    # Check if username contains @, treat as email
    if "@" in username:
        user = db.query(User).filter(User.email == username).first()
    else:
        user = db.query(User).filter(User.username == username).first()

    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def authenticate_secretaire(db: Session, email: str, password: str) -> Optional[Secretaire]:
    """
    Authenticate a secretaire by email and password.

    Args:
        db: Database session
        email: Email address
        password: Plain password

    Returns:
        Secretaire object if authentication successful, None otherwise
    """
    secretaire = db.query(Secretaire).filter(Secretaire.email == email).first()
    
    if not secretaire:
        return None
    if not verify_password(password, secretaire.hashed_password):
        return None
    return secretaire


def get_current_secretaire(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Secretaire:
    """
    Get the current authenticated secretaire from the JWT token.
    
    Args:
        token: JWT token from the request
        db: Database session
        
    Returns:
        Secretaire object
        
    Raises:
        HTTPException: If credentials are invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_type: str = payload.get("type", "user")
        
        if email is None or user_type != "secretaire":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    secretaire = db.query(Secretaire).filter(Secretaire.email == email).first()
    if secretaire is None:
        raise credentials_exception
    
    return secretaire


def authenticate_agent_acceuil(db: Session, email: str, password: str) -> Optional[AgentAcceuil]:
    """
    Authenticate an agent d'acceuil by email and password.

    Args:
        db: Database session
        email: Email address
        password: Plain password

    Returns:
        AgentAcceuil object if authentication successful, None otherwise
    """
    agent = db.query(AgentAcceuil).filter(AgentAcceuil.email == email).first()
    
    if not agent:
        return None
    if not verify_password(password, agent.hashed_password):
        return None
    return agent


def get_current_agent_acceuil(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> AgentAcceuil:
    """
    Get the current authenticated agent d'acceuil from the JWT token.
    
    Args:
        token: JWT token from the request
        db: Database session
        
    Returns:
        AgentAcceuil object
        
    Raises:
        HTTPException: If credentials are invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_type: str = payload.get("type", "user")
        
        if email is None or user_type != "agent_acceuil":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    agent = db.query(AgentAcceuil).filter(AgentAcceuil.email == email).first()
    if agent is None:
        raise credentials_exception
    
    return agent


def get_secretaire_medecins_ids(secretaire: Secretaire) -> List[int]:
    """
    Get list of medecin IDs assigned to a secretaire.
    
    Args:
        secretaire: Secretaire object
        
    Returns:
        List of medecin IDs
    """
    if not secretaire.medecins_assignes:
        return []
    
    try:
        medecins_ids = json.loads(secretaire.medecins_assignes)
        if isinstance(medecins_ids, list):
            return [int(mid) for mid in medecins_ids if isinstance(mid, (int, str)) and str(mid).isdigit()]
        return []
    except (json.JSONDecodeError, ValueError, TypeError):
        return []


def get_current_user_or_secretaire(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Get the current authenticated user (either User or Secretaire).
    This allows endpoints to accept both admin users and secretaries.
    
    Args:
        token: JWT token from the request
        db: Database session
        
    Returns:
        Tuple of (user_object, user_type) where user_type is 'user' or 'secretaire'
        
    Raises:
        HTTPException: If credentials are invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get("sub")
        user_type: str = payload.get("type", "user")
        
        if identifier is None:
            raise credentials_exception
            
        # Try to get user based on type
        if user_type == "secretaire":
            secretaire = db.query(Secretaire).filter(Secretaire.email == identifier).first()
            if secretaire is None:
                raise credentials_exception
            return secretaire, "secretaire"
        elif user_type == "agent_acceuil":
            agent = db.query(AgentAcceuil).filter(AgentAcceuil.email == identifier).first()
            if agent is None:
                raise credentials_exception
            return agent, "agent_acceuil"
        else:
            user = db.query(User).filter(User.username == identifier).first()
            if user is None:
                raise credentials_exception
            if not user.is_active:
                raise HTTPException(status_code=400, detail="Inactive user")
            return user, "user"
            
    except JWTError:
        raise credentials_exception

