"""
Patient routes for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from models.database import get_db
from models.patient import Patient
from models.medecin import Medecin
from models.user import User
from schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from services.auth_service import get_current_active_user, get_current_user_or_secretaire

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Create a new patient. Accessible by admin users, secretaries, and agents."""
    user, user_type = current_user_data
    
    # Check if email already exists
    if patient_data.email:
        existing = db.query(Patient).filter(Patient.email == patient_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if numero_securite_sociale already exists
    if patient_data.numero_securite_sociale:
        existing = db.query(Patient).filter(
            Patient.numero_securite_sociale == patient_data.numero_securite_sociale
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Numéro de sécurité sociale already registered"
            )
    
    # Verify medecin exists if medecin_id is provided
    if patient_data.medecin_id:
        medecin = db.query(Medecin).filter(Medecin.id == patient_data.medecin_id).first()
        if not medecin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medecin not found"
            )
    
    # Create patient with agent ID if created by an agent
    patient_dict_data = patient_data.model_dump()
    if user_type == "agent_acceuil":
        patient_dict_data["created_by_agent_id"] = user.id
    
    new_patient = Patient(**patient_dict_data)
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    # Load medecin if needed and serialize
    if new_patient.medecin_id:
        new_patient.medecin = db.query(Medecin).filter(Medecin.id == new_patient.medecin_id).first()
    
    patient_dict = {
        "id": new_patient.id,
        "nom": new_patient.nom,
        "prenom": new_patient.prenom,
        "date_naissance": new_patient.date_naissance,
        "sexe": new_patient.sexe,
        "adresse": new_patient.adresse,
        "telephone": new_patient.telephone,
        "email": new_patient.email,
        "numero_securite_sociale": new_patient.numero_securite_sociale,
        "medecin_id": new_patient.medecin_id,
        "created_by_agent_id": new_patient.created_by_agent_id,
        "created_at": new_patient.created_at,
        "updated_at": new_patient.updated_at,
        "medecin": None
    }
    
    if new_patient.medecin:
        patient_dict["medecin"] = {
            "id": new_patient.medecin.id,
            "nom": new_patient.medecin.nom,
            "prenom": new_patient.medecin.prenom,
            "specialite": new_patient.medecin.specialite,
            "telephone": new_patient.medecin.telephone,
            "email": new_patient.medecin.email,
            "numero_ordre": new_patient.medecin.numero_ordre,
            "disponibilites": new_patient.medecin.disponibilites,
            "created_at": new_patient.medecin.created_at,
            "updated_at": new_patient.medecin.updated_at
        }
    
    return patient_dict


@router.get("/")
def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Get list of patients with pagination. Accessible by both admin users and secretaries."""
    user, user_type = current_user_data
    
    query = db.query(Patient).options(joinedload(Patient.medecin))

    # If the user is a doctor, only show their patients
    if user_type == "user" and user.role == "medecin":
        from models.medecin import Medecin
        # Find the doctor profile associated with this user account
        medecin = db.query(Medecin).filter(Medecin.email == user.email).first()
        if medecin:
            query = query.filter(Patient.medecin_id == medecin.id)
    
    patients = query.offset(skip).limit(limit).all()
    
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
            "created_by_agent_id": patient.created_by_agent_id,
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


@router.get("/search")
def search_patients(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search patients by name or ID."""
    patients = db.query(Patient).options(joinedload(Patient.medecin)).filter(
        (Patient.nom.ilike(f"%{q}%")) |
        (Patient.prenom.ilike(f"%{q}%")) |
        (Patient.telephone.ilike(f"%{q}%") if q else False) |
        (Patient.email.ilike(f"%{q}%") if q else False)
    ).all()
    
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
            "created_by_agent_id": patient.created_by_agent_id,
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


@router.get("/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get patient by ID."""
    patient = db.query(Patient).options(joinedload(Patient.medecin)).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
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
        "created_by_agent_id": patient.created_by_agent_id,
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
    
    return patient_dict


@router.put("/{patient_id}")
def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Update patient information. Agents can only update patients they created."""
    user, user_type = current_user_data
    
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check if agent is allowed to edit this patient
    if user_type == "agent_acceuil":
        if patient.created_by_agent_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez modifier que les patients que vous avez créés"
            )
    
    # Update only provided fields
    update_data = patient_data.model_dump(exclude_unset=True)
    
    # Check email uniqueness if being updated
    if "email" in update_data and update_data["email"]:
        existing = db.query(Patient).filter(
            Patient.email == update_data["email"],
            Patient.id != patient_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Verify medecin exists if medecin_id is being updated
    if "medecin_id" in update_data and update_data["medecin_id"]:
        medecin = db.query(Medecin).filter(Medecin.id == update_data["medecin_id"]).first()
        if not medecin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medecin not found"
            )
    
    for key, value in update_data.items():
        setattr(patient, key, value)
    
    db.commit()
    db.refresh(patient)
    
    # Load medecin if needed and serialize
    if patient.medecin_id:
        patient.medecin = db.query(Medecin).filter(Medecin.id == patient.medecin_id).first()
    
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
        "created_by_agent_id": patient.created_by_agent_id,
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
    
    return patient_dict


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Delete a patient and all associated records (rendez-vous, dossiers, etc.)."""
    from sqlalchemy.exc import IntegrityError
    
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    try:
        # Delete the patient (cascade will handle related records)
        db.delete(patient)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Impossible de supprimer ce patient car il a des données associées. Détails: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
    
    return None


@router.get("/export/pdf")
def export_patients_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export patients list to PDF."""
    from fastapi.responses import StreamingResponse
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet
    import io
    
    patients = db.query(Patient).options(joinedload(Patient.medecin)).all()
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    elements = []
    
    # Title
    styles = getSampleStyleSheet()
    title = Paragraph("Liste des Patients", styles['Title'])
    elements.append(title)
    elements.append(Paragraph("<br/><br/>", styles['Normal']))
    
    # Table data
    data = [['ID', 'Nom', 'Prénom', 'Date Naissance', 'Sexe', 'Téléphone', 'Email', 'Médecin']]
    
    for patient in patients:
        medecin_name = f"Dr. {patient.medecin.prenom} {patient.medecin.nom}" if patient.medecin else "N/A"
        data.append([
            str(patient.id),
            patient.nom or '',
            patient.prenom or '',
            str(patient.date_naissance) if patient.date_naissance else '',
            patient.sexe or '',
            patient.telephone or '',
            patient.email or '',
            medecin_name
        ])
    
    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=patients.pdf"}
    )


@router.get("/export/excel")
def export_patients_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export patients list to Excel (CSV)."""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    patients = db.query(Patient).options(joinedload(Patient.medecin)).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
    
    # Header
    writer.writerow(['ID', 'Nom', 'Prénom', 'Date Naissance', 'Sexe', 'Téléphone', 'Email', 'Médecin', 'Numéro Sécurité Sociale'])
    
    # Data
    for patient in patients:
        medecin_name = f"Dr. {patient.medecin.prenom} {patient.medecin.nom}" if patient.medecin else "N/A"
        writer.writerow([
            patient.id,
            patient.nom or '',
            patient.prenom or '',
            str(patient.date_naissance) if patient.date_naissance else '',
            patient.sexe or '',
            patient.telephone or '',
            patient.email or '',
            medecin_name,
            patient.numero_securite_sociale or ''
        ])
    
    output.seek(0)
    
    # Use utf-8-sig for Excel compatibility
    return StreamingResponse(
        iter([output.getvalue().encode('utf-8-sig')]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=patients.csv"}
    )
