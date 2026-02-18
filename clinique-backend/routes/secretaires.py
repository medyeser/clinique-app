"""
Secretaire (Secretary) routes for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import json

from models.database import get_db
from models.secretaire import Secretaire
from models.user import User
from schemas.secretaire import SecretaireCreate, SecretaireUpdate, SecretaireResponse
from services.auth_service import get_password_hash, get_current_active_user

router = APIRouter(prefix="/api/secretaires", tags=["Secrétaires"])


@router.post("/", response_model=SecretaireResponse, status_code=status.HTTP_201_CREATED)
def create_secretaire(
    secretaire_data: SecretaireCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new secretaire."""
    # Check if email already exists
    if db.query(Secretaire).filter(Secretaire.email == secretaire_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if db.query(Secretaire).filter(Secretaire.username == secretaire_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(secretaire_data.password)
    
    # Convert medecins_assignes list to JSON string
    medecins_json = json.dumps(secretaire_data.medecins_assignes) if secretaire_data.medecins_assignes else "[]"
    
    # Create new secretaire
    secretaire_dict = secretaire_data.model_dump(exclude={"password", "medecins_assignes"})
    new_secretaire = Secretaire(
        **secretaire_dict,
        hashed_password=hashed_password,
        medecins_assignes=medecins_json
    )
    
    try:
        db.add(new_secretaire)
        db.commit()
        db.refresh(new_secretaire)
        
        # Build response dict manually to handle NULL values
        sec_dict = {
            "id": new_secretaire.id,
            "nom": new_secretaire.nom,
            "prenom": new_secretaire.prenom,
            "date_naissance": new_secretaire.date_naissance,
            "email": new_secretaire.email,
            "telephone": new_secretaire.telephone,
            "adresse": new_secretaire.adresse,
            "username": new_secretaire.username,
            "date_embauche": new_secretaire.date_embauche,
            "role_permissions": new_secretaire.role_permissions,
            "created_at": new_secretaire.created_at,
            "updated_at": new_secretaire.updated_at,
        }
        
        # Convert JSON string back to list for response
        if new_secretaire.medecins_assignes:
            try:
                sec_dict['medecins_assignes'] = json.loads(new_secretaire.medecins_assignes)
            except (json.JSONDecodeError, TypeError):
                sec_dict['medecins_assignes'] = []
        else:
            sec_dict['medecins_assignes'] = []
        
        return SecretaireResponse(**sec_dict)
    except Exception as e:
        db.rollback()
        print(f"Error creating secretaire: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating secretaire: {str(e)}"
        )


@router.get("/", response_model=List[SecretaireResponse])
def get_secretaires(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of secretaires with pagination."""
    try:
        secretaires = db.query(Secretaire).offset(skip).limit(limit).all()
        
        # Convert JSON strings to lists for all responses
        result = []
        for sec in secretaires:
            try:
                # Build response dict manually to handle NULL values
                sec_dict = {
                    "id": sec.id,
                    "nom": sec.nom,
                    "prenom": sec.prenom,
                    "date_naissance": sec.date_naissance,
                    "email": sec.email,
                    "telephone": sec.telephone,
                    "adresse": sec.adresse,
                    "username": sec.username,
                    "date_embauche": sec.date_embauche,
                    "role_permissions": sec.role_permissions,
                    "created_at": sec.created_at,
                    "updated_at": sec.updated_at,
                }
                
                # Safely parse JSON, handle NULL/empty cases
                if sec.medecins_assignes:
                    try:
                        sec_dict['medecins_assignes'] = json.loads(sec.medecins_assignes)
                    except (json.JSONDecodeError, TypeError):
                        sec_dict['medecins_assignes'] = []
                else:
                    sec_dict['medecins_assignes'] = []
                
                result.append(SecretaireResponse(**sec_dict))
            except Exception as e:
                # Log error but continue with other records
                print(f"Error processing secretaire {sec.id}: {str(e)}")
                continue
        
        return result
    except Exception as e:
        print(f"Error in get_secretaires: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching secretaires: {str(e)}"
        )


@router.get("/search", response_model=List[SecretaireResponse])
def search_secretaires(
    q: str = Query(None, min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search secretaires by name."""
    try:
        query = db.query(Secretaire)
        
        if q:
            query = query.filter(
                (Secretaire.nom.contains(q)) |
                (Secretaire.prenom.contains(q))
            )
        
        secretaires = query.all()
        
        # Convert JSON strings to lists
        result = []
        for sec in secretaires:
            try:
                sec_dict = {
                    "id": sec.id,
                    "nom": sec.nom,
                    "prenom": sec.prenom,
                    "date_naissance": sec.date_naissance,
                    "email": sec.email,
                    "telephone": sec.telephone,
                    "adresse": sec.adresse,
                    "username": sec.username,
                    "date_embauche": sec.date_embauche,
                    "role_permissions": sec.role_permissions,
                    "created_at": sec.created_at,
                    "updated_at": sec.updated_at,
                }
                
                if sec.medecins_assignes:
                    try:
                        sec_dict['medecins_assignes'] = json.loads(sec.medecins_assignes)
                    except (json.JSONDecodeError, TypeError):
                        sec_dict['medecins_assignes'] = []
                else:
                    sec_dict['medecins_assignes'] = []
                
                result.append(SecretaireResponse(**sec_dict))
            except Exception as e:
                print(f"Error processing secretaire {sec.id}: {str(e)}")
                continue
        
        return result
    except Exception as e:
        print(f"Error in search_secretaires: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching secretaires: {str(e)}"
        )


@router.get("/{secretaire_id}", response_model=SecretaireResponse)
def get_secretaire(
    secretaire_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get secretaire by ID."""
    try:
        secretaire = db.query(Secretaire).filter(Secretaire.id == secretaire_id).first()
        if not secretaire:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Secretaire not found"
            )
        
        # Build response dict manually to handle NULL values
        sec_dict = {
            "id": secretaire.id,
            "nom": secretaire.nom,
            "prenom": secretaire.prenom,
            "date_naissance": secretaire.date_naissance,
            "email": secretaire.email,
            "telephone": secretaire.telephone,
            "adresse": secretaire.adresse,
            "username": secretaire.username,
            "date_embauche": secretaire.date_embauche,
            "role_permissions": secretaire.role_permissions,
            "created_at": secretaire.created_at,
            "updated_at": secretaire.updated_at,
        }
        
        # Convert JSON string to list
        if secretaire.medecins_assignes:
            try:
                sec_dict['medecins_assignes'] = json.loads(secretaire.medecins_assignes)
            except (json.JSONDecodeError, TypeError):
                sec_dict['medecins_assignes'] = []
        else:
            sec_dict['medecins_assignes'] = []
        
        return SecretaireResponse(**sec_dict)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_secretaire: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching secretaire: {str(e)}"
        )


@router.put("/{secretaire_id}", response_model=SecretaireResponse)
def update_secretaire(
    secretaire_id: int,
    secretaire_data: SecretaireUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update secretaire information."""
    secretaire = db.query(Secretaire).filter(Secretaire.id == secretaire_id).first()
    if not secretaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Secretaire not found"
        )
    
    # Update only provided fields
    update_data = secretaire_data.model_dump(exclude_unset=True)
    
    # Check email uniqueness if being updated
    if "email" in update_data and update_data["email"]:
        existing = db.query(Secretaire).filter(
            Secretaire.email == update_data["email"],
            Secretaire.id != secretaire_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Check username uniqueness if being updated
    if "username" in update_data and update_data["username"]:
        existing = db.query(Secretaire).filter(
            Secretaire.username == update_data["username"],
            Secretaire.id != secretaire_id
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
    
    # Convert medecins_assignes list to JSON string if provided
    if "medecins_assignes" in update_data:
        # Ensure it's a list of integers
        if update_data["medecins_assignes"] is not None:
            try:
                # Convert to list of integers if needed
                medecins_list = update_data["medecins_assignes"]
                if isinstance(medecins_list, list):
                    medecins_list = [int(m) for m in medecins_list if m is not None]
                update_data["medecins_assignes"] = json.dumps(medecins_list) if medecins_list else "[]"
            except (ValueError, TypeError) as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid medecins_assignes format: {str(e)}"
                )
        else:
            update_data["medecins_assignes"] = "[]"
    
    try:
        for key, value in update_data.items():
            setattr(secretaire, key, value)
        
        db.commit()
        db.refresh(secretaire)
        
        # Build response dict manually to handle NULL values
        sec_dict = {
            "id": secretaire.id,
            "nom": secretaire.nom,
            "prenom": secretaire.prenom,
            "date_naissance": secretaire.date_naissance,
            "email": secretaire.email,
            "telephone": secretaire.telephone,
            "adresse": secretaire.adresse,
            "username": secretaire.username,
            "date_embauche": secretaire.date_embauche,
            "role_permissions": secretaire.role_permissions,
            "created_at": secretaire.created_at,
            "updated_at": secretaire.updated_at,
        }
        
        # Convert JSON string to list for response
        if secretaire.medecins_assignes:
            try:
                sec_dict['medecins_assignes'] = json.loads(secretaire.medecins_assignes)
            except (json.JSONDecodeError, TypeError):
                sec_dict['medecins_assignes'] = []
        else:
            sec_dict['medecins_assignes'] = []
        
        return SecretaireResponse(**sec_dict)
    except Exception as e:
        db.rollback()
        print(f"Error updating secretaire: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating secretaire: {str(e)}"
        )


@router.delete("/{secretaire_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_secretaire(
    secretaire_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a secretaire."""
    secretaire = db.query(Secretaire).filter(Secretaire.id == secretaire_id).first()
    if not secretaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Secretaire not found"
        )
    
    db.delete(secretaire)
    db.commit()
    
    return None
