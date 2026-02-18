"""
Medecin (Doctor) routes for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from models.medecin import Medecin
from models.user import User
from schemas.medecin import MedecinCreate, MedecinUpdate, MedecinResponse
from services.auth_service import get_current_active_user, get_current_user_or_secretaire, get_password_hash

router = APIRouter(prefix="/api/medecins", tags=["Médecins"])


@router.post("/", response_model=MedecinResponse, status_code=status.HTTP_201_CREATED)
def create_medecin(
    medecin_data: MedecinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new medecin."""
    # Check if email already exists
    if medecin_data.email:
        existing = db.query(Medecin).filter(Medecin.email == medecin_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if numero_ordre already exists
    existing = db.query(Medecin).filter(
        Medecin.numero_ordre == medecin_data.numero_ordre
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Numéro d'ordre already registered"
        )
    
    medecin_dict = medecin_data.model_dump(exclude={"password"})
    
    # If password is provided, hash it and add to medecin model
    if medecin_data.password:
        medecin_dict["hashed_password"] = get_password_hash(medecin_data.password)

    new_medecin = Medecin(**medecin_dict)
    db.add(new_medecin)
    db.commit()
    db.refresh(new_medecin)

    # Create User account if password is provided and email is present (Sync mechanism)
    if medecin_data.email and medecin_data.password:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == medecin_data.email).first()
        if not existing_user:
            # Password already hashed above, but let's be safe and re-hash or reuse
            # get_password_hash is deterministic for same input? No, salt.
            # But we can store different hashes, it's fine.
            hashed_pw = get_password_hash(medecin_data.password)
            new_user = User(
                username=medecin_data.email.split('@')[0], # Generate username from email part
                email=medecin_data.email,
                hashed_password=hashed_pw,
                role="medecin",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
    
    return new_medecin



@router.get("/", response_model=List[MedecinResponse])
def get_medecins(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Get list of medecins with pagination. Accessible by both admin users and secretaries."""
    medecins = db.query(Medecin).offset(skip).limit(limit).all()
    return medecins


@router.get("/search", response_model=List[MedecinResponse])
def search_medecins(
    q: str = Query(None, min_length=1),
    specialite: str = Query(None, min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search medecins by name or specialty."""
    query = db.query(Medecin)
    
    if specialite:
        query = query.filter(Medecin.specialite.contains(specialite))
    
    if q:
        query = query.filter(
            (Medecin.nom.contains(q)) |
            (Medecin.prenom.contains(q))
        )
    
    medecins = query.all()
    return medecins


@router.get("/{medecin_id}", response_model=MedecinResponse)
def get_medecin(
    medecin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get medecin by ID."""
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medecin not found"
        )
    return medecin


@router.put("/{medecin_id}", response_model=MedecinResponse)
def update_medecin(
    medecin_id: int,
    medecin_data: MedecinUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update medecin information."""
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medecin not found"
        )
    
    # Update only provided fields
    update_data = medecin_data.model_dump(exclude_unset=True)
    
    # Check email uniqueness if being updated
    if "email" in update_data and update_data["email"]:
        existing = db.query(Medecin).filter(
            Medecin.email == update_data["email"],
            Medecin.id != medecin_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Check numero_ordre uniqueness if being updated
    if "numero_ordre" in update_data:
        existing = db.query(Medecin).filter(
            Medecin.numero_ordre == update_data["numero_ordre"],
            Medecin.id != medecin_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Numéro d'ordre already in use"
            )
    
    for key, value in update_data.items():
        if key != "password":
            setattr(medecin, key, value)
    
    # Update password if provided
    if "password" in update_data and update_data["password"]:
         medecin.hashed_password = get_password_hash(update_data["password"])

    db.commit()
    db.refresh(medecin)

    # Update User password if provided (Sync mechanism)
    if "password" in update_data and update_data["password"] and medecin.email:
        user = db.query(User).filter(User.email == medecin.email).first()
        if user:
            user.hashed_password = get_password_hash(update_data["password"])
            db.commit()
        else:
            # Create user if not exists (migrating old medecin)
            hashed_pw = get_password_hash(update_data["password"])
            new_user = User(
                username=medecin.email.split('@')[0],
                email=medecin.email,
                hashed_password=hashed_pw,
                role="medecin",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
    
    return medecin


@router.delete("/{medecin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medecin(
    medecin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a medecin."""
    medecin = db.query(Medecin).filter(Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medecin not found"
        )
    
    db.delete(medecin)
    db.commit()
    
    return None
