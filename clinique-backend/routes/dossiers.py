"""
DossierMedical (Medical Record) routes for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json

from models.database import get_db
from models.dossier_medical import DossierMedical
from models.patient import Patient
from models.user import User
from schemas.dossier_medical import (
    DossierMedicalCreate,
    DossierMedicalUpdate,
    DossierMedicalResponse,
    ObservationAdd
)
from services.auth_service import get_current_active_user, get_current_user_or_secretaire

router = APIRouter(prefix="/api/dossiers", tags=["Dossiers Médicaux"])


@router.post("/", response_model=DossierMedicalResponse, status_code=status.HTTP_201_CREATED)
def create_dossier_medical(
    dossier_data: DossierMedicalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new medical record."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == dossier_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check if dossier already exists for this patient
    existing = db.query(DossierMedical).filter(
        DossierMedical.patient_id == dossier_data.patient_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medical record already exists for this patient"
        )
    
    new_dossier = DossierMedical(**dossier_data.model_dump())
    db.add(new_dossier)
    db.commit()
    db.refresh(new_dossier)
    
    return new_dossier


@router.get("/patient/{patient_id}", response_model=DossierMedicalResponse)
def get_dossier_by_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get medical record for a specific patient."""
    dossier = db.query(DossierMedical).filter(
        DossierMedical.patient_id == patient_id
    ).first()
    
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found for this patient"
        )
    
    return dossier


@router.get("/{dossier_id}", response_model=DossierMedicalResponse)
def get_dossier(
    dossier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get medical record by ID."""
    dossier = db.query(DossierMedical).filter(DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    return dossier


@router.put("/{dossier_id}", response_model=DossierMedicalResponse)
def update_dossier(
    dossier_id: int,
    dossier_data: DossierMedicalUpdate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Update medical record. Accessible by both admin users and secretaries."""
    dossier = db.query(DossierMedical).filter(DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    update_data = dossier_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(dossier, key, value)
    
    db.commit()
    db.refresh(dossier)
    
    return dossier


@router.post("/{dossier_id}/observations")
def add_observation(
    dossier_id: int,
    observation_data: ObservationAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add an observation to a medical record."""
    dossier = db.query(DossierMedical).filter(DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Parse existing historique or create new
    try:
        historique = json.loads(dossier.historique_consultations) if dossier.historique_consultations else []
    except json.JSONDecodeError:
        historique = []
    
    # Add new observation
    new_entry = {
        "date": (observation_data.date_observation or datetime.now()).isoformat(),
        "titre": observation_data.titre,
        "observation": observation_data.observation,
        "medecin": current_user.username
    }
    historique.append(new_entry)
    
    # Update dossier
    dossier.historique_consultations = json.dumps(historique, ensure_ascii=False)
    db.commit()
    
    return {
        "message": "Observation added successfully",
        "observation": new_entry
    }


@router.get("/{dossier_id}/historique")
def get_historique(
    dossier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get complete consultation history for a medical record."""
    dossier = db.query(DossierMedical).filter(DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    try:
        historique = json.loads(dossier.historique_consultations) if dossier.historique_consultations else []
    except json.JSONDecodeError:
        historique = []
    
    return {
        "patient_id": dossier.patient_id,
        "historique": historique
    }
