"""
AgentAcceuil (Reception Agent) routes for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from models.agent_acceuil import AgentAcceuil
from models.user import User
from schemas.agent_acceuil import AgentAcceuilCreate, AgentAcceuilUpdate, AgentAcceuilResponse
from services.auth_service import get_password_hash, get_current_active_user

router = APIRouter(prefix="/api/agents-acceuil", tags=["Agents d'Acceuil"])


@router.post("/init-agent", response_model=AgentAcceuilResponse, status_code=status.HTTP_201_CREATED)
def create_initial_agent_account(db: Session = Depends(get_db)):
    """Create the initial agent d'acceuil account (no auth required)."""
    from datetime import date
    
    # Check if agent already exists
    existing_agent = db.query(AgentAcceuil).filter(
        AgentAcceuil.email == "agent@example.com"
    ).first()
    
    if existing_agent:
        return existing_agent
    
    # Create the agent
    hashed_password = get_password_hash("password123")
    new_agent = AgentAcceuil(
        nom="Dupont",
        prenom="Marie",
        date_naissance=date(1995, 5, 15),
        email="agent@example.com",
        telephone="0612345678",
        adresse="123 Rue de la Clinique, Paris",
        username="agent_marie",
        hashed_password=hashed_password,
        date_embauche=date.today(),
        role="Agent d'Accueil"
    )
    
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    
    return new_agent


@router.post("/", response_model=AgentAcceuilResponse, status_code=status.HTTP_201_CREATED)
def create_agent_acceuil(
    agent_data: AgentAcceuilCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new agent d'acceuil."""
    # Check if email already exists
    if db.query(AgentAcceuil).filter(AgentAcceuil.email == agent_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if db.query(AgentAcceuil).filter(AgentAcceuil.username == agent_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(agent_data.password)
    
    # Create new agent
    agent_dict = agent_data.model_dump(exclude={"password"})
    new_agent = AgentAcceuil(
        **agent_dict,
        hashed_password=hashed_password
    )
    
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    
    return new_agent


@router.get("/", response_model=List[AgentAcceuilResponse])
def get_agents_acceuil(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of agents d'acceuil with pagination."""
    agents = db.query(AgentAcceuil).offset(skip).limit(limit).all()
    return agents


@router.get("/search", response_model=List[AgentAcceuilResponse])
def search_agents_acceuil(
    q: str = Query(None, min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search agents d'acceuil by name."""
    query = db.query(AgentAcceuil)
    
    if q:
        query = query.filter(
            (AgentAcceuil.nom.contains(q)) |
            (AgentAcceuil.prenom.contains(q))
        )
    
    agents = query.all()
    return agents


@router.get("/{agent_id}", response_model=AgentAcceuilResponse)
def get_agent_acceuil(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get agent d'acceuil by ID."""
    agent = db.query(AgentAcceuil).filter(AgentAcceuil.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent d'acceuil not found"
        )
    return agent


@router.put("/{agent_id}", response_model=AgentAcceuilResponse)
def update_agent_acceuil(
    agent_id: int,
    agent_data: AgentAcceuilUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update agent d'acceuil information."""
    agent = db.query(AgentAcceuil).filter(AgentAcceuil.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent d'acceuil not found"
        )
    
    # Update only provided fields
    update_data = agent_data.model_dump(exclude_unset=True)
    
    # Check email uniqueness if being updated
    if "email" in update_data and update_data["email"]:
        existing = db.query(AgentAcceuil).filter(
            AgentAcceuil.email == update_data["email"],
            AgentAcceuil.id != agent_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Check username uniqueness if being updated
    if "username" in update_data and update_data["username"]:
        existing = db.query(AgentAcceuil).filter(
            AgentAcceuil.username == update_data["username"],
            AgentAcceuil.id != agent_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already in use"
            )
    
    # Hash password if being updated
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for key, value in update_data.items():
        setattr(agent, key, value)
    
    db.commit()
    db.refresh(agent)
    
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent_acceuil(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an agent d'acceuil."""
    agent = db.query(AgentAcceuil).filter(AgentAcceuil.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent d'acceuil not found"
        )
    
    db.delete(agent)
    db.commit()
    
    return None
