"""
API Routes for managing software download access.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from models.database import get_db
# TEMPORAIRE: Commenté jusqu'à ce que la table soit créée manuellement
# from models.acces import Acces
from services.auth_service import get_current_user
from models.user import User


router = APIRouter(prefix="/api/acces", tags=["acces"])


# Pydantic Schemas
class AccesBase(BaseModel):
    nom_logiciel: str
    version: str
    url_telechargement: str
    description: str | None = None
    actif: bool = True


class AccesCreate(AccesBase):
    pass


class AccesUpdate(AccesBase):
    pass


class AccesResponse(AccesBase):
    id: int
    date_creation: datetime
    date_modification: datetime

    class Config:
        from_attributes = True


# Routes
@router.get("/", response_model=List[AccesResponse])
def get_all_acces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all software download access entries.
    """
    acces_list = db.query(Acces).order_by(Acces.date_creation.desc()).all()
    return acces_list


@router.get("/{acces_id}", response_model=AccesResponse)
def get_acces_by_id(
    acces_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific software download access entry by ID.
    """
    acces = db.query(Acces).filter(Acces.id == acces_id).first()
    if not acces:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Accès avec l'ID {acces_id} non trouvé"
        )
    return acces


@router.post("/", response_model=AccesResponse, status_code=status.HTTP_201_CREATED)
def create_acces(
    acces_data: AccesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new software download access entry.
    """
    new_acces = Acces(
        nom_logiciel=acces_data.nom_logiciel,
        version=acces_data.version,
        url_telechargement=acces_data.url_telechargement,
        description=acces_data.description,
        actif=acces_data.actif
    )
    
    db.add(new_acces)
    db.commit()
    db.refresh(new_acces)
    
    return new_acces


@router.put("/{acces_id}", response_model=AccesResponse)
def update_acces(
    acces_id: int,
    acces_data: AccesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing software download access entry.
    """
    acces = db.query(Acces).filter(Acces.id == acces_id).first()
    if not acces:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Accès avec l'ID {acces_id} non trouvé"
        )
    
    acces.nom_logiciel = acces_data.nom_logiciel
    acces.version = acces_data.version
    acces.url_telechargement = acces_data.url_telechargement
    acces.description = acces_data.description
    acces.actif = acces_data.actif
    
    db.commit()
    db.refresh(acces)
    
    return acces


@router.delete("/{acces_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_acces(
    acces_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a software download access entry.
    """
    acces = db.query(Acces).filter(Acces.id == acces_id).first()
    if not acces:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Accès avec l'ID {acces_id} non trouvé"
        )
    
    db.delete(acces)
    db.commit()
    
    return None
