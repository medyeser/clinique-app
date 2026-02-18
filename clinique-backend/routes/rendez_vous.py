"""
RendezVous (Appointment) routes for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List
from datetime import datetime, timedelta

from models.database import get_db
from models.rendez_vous import RendezVous, StatutRendezVous
from models.patient import Patient
from models.medecin import Medecin
from models.user import User
from schemas.rendez_vous import RendezVousCreate, RendezVousUpdate, RendezVousResponse, ConflitCheck
from services.auth_service import get_current_active_user, get_current_user_or_secretaire

router = APIRouter(prefix="/api/rendez-vous", tags=["Rendez-vous"])


def check_appointment_conflict(db: Session, medecin_id: int, date_heure: datetime, duree_minutes: int = 30, exclude_id: int = None) -> bool:
    """
    Check if there's a conflict with existing appointments.
    
    Args:
        db: Database session
        medecin_id: Doctor ID
        date_heure: Appointment datetime
        duree_minutes: Appointment duration in minutes
        exclude_id: Appointment ID to exclude from check (for updates)
        
    Returns:
        True if conflict exists, False otherwise
    """
    end_time = date_heure + timedelta(minutes=duree_minutes)
    
    query = db.query(RendezVous).filter(
        and_(
            RendezVous.medecin_id == medecin_id,
            RendezVous.statut != StatutRendezVous.ANNULE,
            RendezVous.date_heure < end_time,
            RendezVous.date_heure >= date_heure - timedelta(minutes=duree_minutes)
        )
    )
    
    if exclude_id:
        query = query.filter(RendezVous.id != exclude_id)
    
    return query.first() is not None


@router.post("/verifier-conflit")
def verify_conflict(
    conflit_data: ConflitCheck,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Check if there's a conflict for a potential appointment. Accessible by both admin users and secretaries."""
    has_conflict = check_appointment_conflict(
        db,
        conflit_data.medecin_id,
        conflit_data.date_heure,
        conflit_data.duree_minutes
    )
    
    return {
        "has_conflict": has_conflict,
        "message": "Conflit détecté" if has_conflict else "Aucun conflit"
    }


@router.post("/", response_model=RendezVousResponse, status_code=status.HTTP_201_CREATED)
def create_rendez_vous(
    rdv_data: RendezVousCreate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Create a new rendez-vous. Accessible by both admin users and secretaries."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == rdv_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify medecin exists
    medecin = db.query(Medecin).filter(Medecin.id == rdv_data.medecin_id).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medecin not found"
        )
    
    # Check for conflicts
    if check_appointment_conflict(db, rdv_data.medecin_id, rdv_data.date_heure):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Le médecin a déjà un rendez-vous à cette heure"
        )
    
    new_rdv = RendezVous(**rdv_data.model_dump())
    db.add(new_rdv)
    db.commit()
    db.refresh(new_rdv)
    
    return new_rdv


@router.get("/", response_model=List[RendezVousResponse])
def get_rendez_vous(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Get list of rendez-vous with pagination. Accessible by both admin users and secretaries."""
    rendez_vous = db.query(RendezVous).options(
        joinedload(RendezVous.patient),
        joinedload(RendezVous.medecin)
    ).offset(skip).limit(limit).all()
    return rendez_vous


@router.get("/jour/{date}", response_model=List[RendezVousResponse])
def get_rendez_vous_by_day(
    date: str,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Get rendez-vous for a specific day (format: YYYY-MM-DD). Accessible by both admin users and secretaries."""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    rendez_vous = db.query(RendezVous).filter(
        and_(
            RendezVous.date_heure >= datetime.combine(target_date, datetime.min.time()),
            RendezVous.date_heure < datetime.combine(target_date, datetime.max.time())
        )
    ).all()
    
    return rendez_vous


@router.get("/patient/{patient_id}", response_model=List[RendezVousResponse])
def get_rendez_vous_by_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Get all rendez-vous for a specific patient. Accessible by both admin users and secretaries."""
    rendez_vous = db.query(RendezVous).filter(
        RendezVous.patient_id == patient_id
    ).order_by(RendezVous.date_heure.desc()).all()
    
    return rendez_vous


@router.get("/{rdv_id}", response_model=RendezVousResponse)
def get_rendez_vous_by_id(
    rdv_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Get rendez-vous by ID. Accessible by both admin users and secretaries."""
    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()
    if not rdv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous not found"
        )
    return rdv


@router.put("/{rdv_id}", response_model=RendezVousResponse)
def update_rendez_vous(
    rdv_id: int,
    rdv_data: RendezVousUpdate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Update rendez-vous information. Accessible by both admin users and secretaries."""
    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()
    if not rdv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous not found"
        )
    
    update_data = rdv_data.model_dump(exclude_unset=True)
    
    # If updating date_heure or medecin_id, check for conflicts
    if "date_heure" in update_data or "medecin_id" in update_data:
        new_date = update_data.get("date_heure", rdv.date_heure)
        new_medecin_id = update_data.get("medecin_id", rdv.medecin_id)
        
        if check_appointment_conflict(db, new_medecin_id, new_date, exclude_id=rdv_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Le médecin a déjà un rendez-vous à cette heure"
            )
    
    for key, value in update_data.items():
        setattr(rdv, key, value)
    
    db.commit()
    db.refresh(rdv)
    
    return rdv


@router.delete("/{rdv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rendez_vous(
    rdv_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Delete a rendez-vous. Accessible by admin users, secretaries, and agents."""
    from sqlalchemy.exc import IntegrityError
    
    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()
    if not rdv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous not found"
        )
    
    try:
        db.delete(rdv)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Impossible de supprimer ce rendez-vous car il a des données associées. Détails: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
    
    return None

