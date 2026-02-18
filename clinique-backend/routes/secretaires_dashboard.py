"""
Dashboard routes for secretaires - filtered by assigned medecins.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
import json

from models.database import get_db
from models.secretaire import Secretaire
from models.rendez_vous import RendezVous
from models.patient import Patient
from models.dossier_medical import DossierMedical
from schemas.rendez_vous import RendezVousResponse
from schemas.patient import PatientResponse
from schemas.dossier_medical import DossierMedicalResponse
from services.auth_service import get_current_secretaire, get_secretaire_medecins_ids

router = APIRouter(prefix="/api/secretaire", tags=["Secretaire Dashboard"])


@router.get("/debug-info")
def get_secretaire_debug_info(
    db: Session = Depends(get_db),
    current_secretaire: Secretaire = Depends(get_current_secretaire)
):
    """Debug: Get secretaire info and assigned medecins."""
    medecins_ids = get_secretaire_medecins_ids(current_secretaire)
    
    # Get rendez-vous patient IDs for assigned medecins
    rendez_vous_patient_ids = db.query(RendezVous.patient_id).filter(
        RendezVous.medecin_id.in_(medecins_ids) if medecins_ids else False
    ).distinct().all()
    
    patient_ids = [pid[0] for pid in rendez_vous_patient_ids]
    
    return {
        "secretaire_id": current_secretaire.id,
        "secretaire_email": current_secretaire.email,
        "secretaire_nom": f"{current_secretaire.prenom} {current_secretaire.nom}",
        "medecins_assignes_raw": current_secretaire.medecins_assignes,
        "medecins_ids_parsed": medecins_ids,
        "patient_ids_from_rendez_vous": patient_ids,
        "total_patients": len(patient_ids)
    }

@router.get("/rendez-vous", response_model=List[RendezVousResponse])
def get_secretaire_rendez_vous(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_secretaire: Secretaire = Depends(get_current_secretaire)
):
    """Get rendez-vous for assigned medecins."""
    from sqlalchemy.orm import joinedload
    
    medecins_ids = get_secretaire_medecins_ids(current_secretaire)
    
    if not medecins_ids:
        return []
    
    rendez_vous = db.query(RendezVous).options(
        joinedload(RendezVous.patient),
        joinedload(RendezVous.medecin)
    ).filter(
        RendezVous.medecin_id.in_(medecins_ids)
    ).order_by(RendezVous.date_heure.desc()).offset(skip).limit(limit).all()
    
    return rendez_vous


@router.get("/medecins")
def get_secretaire_medecins(
    db: Session = Depends(get_db),
    current_secretaire: Secretaire = Depends(get_current_secretaire)
):
    """Get medecins assigned to the current secretaire."""
    from models.medecin import Medecin
    from schemas.medecin import MedecinResponse
    
    medecins_ids = get_secretaire_medecins_ids(current_secretaire)
    
    if not medecins_ids:
        return []
    
    medecins = db.query(Medecin).filter(
        Medecin.id.in_(medecins_ids)
    ).all()
    
    return medecins


@router.get("/patients")
def get_secretaire_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_secretaire: Secretaire = Depends(get_current_secretaire)
):
    """Get patients assigned to the secretary's medecins (by medecin_id only)."""
    from sqlalchemy.orm import joinedload
    from models.medecin import Medecin
    
    medecins_ids = get_secretaire_medecins_ids(current_secretaire)
    
    if not medecins_ids:
        return []
    
    # Get ONLY patients directly assigned to the medecins (by medecin_id)
    patients = db.query(Patient).options(joinedload(Patient.medecin)).filter(
        Patient.medecin_id.in_(medecins_ids)
    ).offset(skip).limit(limit).all()
    
    # Convert to dict to handle medecin serialization
    result = []
    for patient in patients:
        patient_dict = {
            "id": patient.id,
            "nom": patient.nom,
            "prenom": patient.prenom,
            "date_naissance": patient.date_naissance,
            "sexe": patient.sexe,
            "adresse": patient.adresse,
            "telephone": patient.telephone,
            "email": patient.email,
            "numero_securite_sociale": patient.numero_securite_sociale,
            "medecin_id": patient.medecin_id,
            "created_at": patient.created_at,
            "updated_at": patient.updated_at,
            "medecin": None
        }
        
        if patient.medecin:
            patient_dict["medecin"] = {
                "id": patient.medecin.id,
                "nom": patient.medecin.nom,
                "prenom": patient.medecin.prenom,
                "specialite": patient.medecin.specialite,
                "telephone": patient.medecin.telephone,
                "email": patient.medecin.email,
                "numero_ordre": patient.medecin.numero_ordre,
                "disponibilites": patient.medecin.disponibilites,
                "created_at": patient.medecin.created_at,
                "updated_at": patient.medecin.updated_at
            }
        
        result.append(patient_dict)
    
    return result


@router.get("/dossiers", response_model=List[DossierMedicalResponse])
def get_secretaire_dossiers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_secretaire: Secretaire = Depends(get_current_secretaire)
):
    """Get dossiers medicaux for patients of assigned medecins."""
    from sqlalchemy.orm import joinedload
    
    medecins_ids = get_secretaire_medecins_ids(current_secretaire)
    
    if not medecins_ids:
        return []
    
    # Get ALL patients assigned to the medecins (by medecin_id)
    # PLUS patients who have rendez-vous with these medecins
    
    # Option 1: Patients directly assigned to medecins
    patients_by_assignment = db.query(Patient.id).filter(
        Patient.medecin_id.in_(medecins_ids)
    ).all()
    
    patient_ids_assigned = [p[0] for p in patients_by_assignment]
    
    # Option 2: Patients with rendez-vous
    rendez_vous_patient_ids = db.query(RendezVous.patient_id).filter(
        RendezVous.medecin_id.in_(medecins_ids)
    ).distinct().all()
    
    patient_ids_from_rdv = [pid[0] for pid in rendez_vous_patient_ids]
    
    # Combine both lists (unique patient IDs)
    all_patient_ids = list(set(patient_ids_assigned + patient_ids_from_rdv))
    
    if not all_patient_ids:
        return []
    
    # Load dossiers WITH patient information
    dossiers = db.query(DossierMedical).options(joinedload(DossierMedical.patient)).filter(
        DossierMedical.patient_id.in_(all_patient_ids)
    ).offset(skip).limit(limit).all()
    
    return dossiers


@router.get("/dossiers/patient/{patient_id}", response_model=DossierMedicalResponse)
def get_secretaire_dossier_by_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_secretaire: Secretaire = Depends(get_current_secretaire)
):
    """Get dossier medical for a specific patient (if patient belongs to assigned medecins)."""
    from fastapi import HTTPException, status as http_status
    from sqlalchemy.orm import joinedload
    
    medecins_ids = get_secretaire_medecins_ids(current_secretaire)
    
    if not medecins_ids:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="No medecins assigned"
        )
    
    # Verify patient has access via TWO ways:
    # 1. Patient is directly assigned to one of the medecins (medecin_id)
    # 2. Patient has rendez-vous with one of the assigned medecins
    
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    has_access = False
    
    # Check if patient is directly assigned to medecin
    if patient and patient.medecin_id in medecins_ids:
        has_access = True
    
    # Check if patient has rendez-vous with assigned medecins
    if not has_access:
        has_rdv = db.query(RendezVous).filter(
            and_(
                RendezVous.patient_id == patient_id,
                RendezVous.medecin_id.in_(medecins_ids)
            )
        ).first()
        if has_rdv:
            has_access = True
    
    if not has_access:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient's dossier"
        )
    
    # Load dossier WITH patient information
    dossier = db.query(DossierMedical).options(
        joinedload(DossierMedical.patient)
    ).filter(
        DossierMedical.patient_id == patient_id
    ).first()
    
    # If dossier doesn't exist, create it automatically
    if not dossier:
        dossier = DossierMedical(patient_id=patient_id)
        db.add(dossier)
        db.commit()
        db.refresh(dossier)
        
        # Reload with patient information
        dossier = db.query(DossierMedical).options(
            joinedload(DossierMedical.patient)
        ).filter(
            DossierMedical.patient_id == patient_id
        ).first()
    
    return dossier

