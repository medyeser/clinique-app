from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import io
import textwrap
# Try importing reportlab, if fails handle gracefully or use simple generation
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
except ImportError:
    canvas = None

from fastapi.responses import StreamingResponse
import csv

from models.database import get_db
from models.consultation import Consultation
from models.dossier_medical import DossierMedical
from models.patient import Patient
from models.user import User
from schemas.consultation import ConsultationCreate, ConsultationUpdate, ConsultationResponse
from services.auth_service import get_current_active_user, get_current_user_or_secretaire

router = APIRouter(prefix="/api/consultations", tags=["Consultations"])

@router.post("/dossier/{dossier_id}", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation(
    dossier_id: int,
    consultation_data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Create a new consultation (file) for a dossier. Accessible by both admin users and secretaries."""
    dossier = db.query(DossierMedical).filter(DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier not found")

    # Get creator name based on user type
    user_obj, user_type = current_user_data
    if user_type == "secretaire":
        creator_name = f"{user_obj.prenom} {user_obj.nom} (Secrétaire)"
    elif user_type == "agent_acceuil":
        creator_name = f"{user_obj.prenom} {user_obj.nom} (Agent d'Accueil)"
    else:
        creator_name = user_obj.username

    new_consultation = Consultation(
        dossier_id=dossier_id,
        createur=creator_name,
        **consultation_data.model_dump()
    )
    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)
    return new_consultation

@router.get("/dossier/{dossier_id}", response_model=List[ConsultationResponse])
def get_consultations_by_dossier(
    dossier_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Get all consultations for a dossier. Accessible by both admin users and secretaries."""
    return db.query(Consultation).filter(Consultation.dossier_id == dossier_id).order_by(Consultation.date_creation.desc()).all()

@router.put("/{consultation_id}", response_model=ConsultationResponse)
def update_consultation(
    consultation_id: int,
    consultation_data: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Update a consultation. Accessible by both admin users and secretaries."""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    update_data = consultation_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(consultation, key, value)
    
    db.commit()
    db.refresh(consultation)
    return consultation

@router.delete("/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Delete a consultation. Accessible by both admin users and secretaries."""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    db.delete(consultation)
    db.commit()
    return None

@router.get("/{consultation_id}/pdf")
def generate_pdf(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Generate PDF for a consultation. Accessible by both admin users and secretaries."""
    if not canvas:
        raise HTTPException(status_code=501, detail="PDF generation library reportlab not installed")

    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    dossier = consultation.dossier
    patient = dossier.patient

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 50

    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, "Fiche de Consultation Médicale")
    y -= 30
    p.setFont("Helvetica", 12)
    p.drawString(50, y, f"Clinique Gestion Médicale")
    p.drawRightString(width - 50, y, f"Date: {consultation.date_creation.strftime('%d/%m/%Y %H:%M')}")
    y -= 20
    p.line(50, y, width - 50, y)
    y -= 30

    # Patient Info
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Information Patient")
    y -= 20
    p.setFont("Helvetica", 12)
    p.drawString(50, y, f"Nom: {patient.nom} {patient.prenom}")
    y -= 15
    p.drawString(50, y, f"Sexe: {patient.sexe} | Né(e) le: {patient.date_naissance}")
    y -= 15
    p.drawString(50, y, f"Groupe Sanguin: {dossier.groupe_sanguin or 'N/A'}")
    y -= 30

    # Medical Info
    def draw_section(title, content):
        nonlocal y
        if y < 100:
            p.showPage()
            y = height - 50
        
        p.setFont("Helvetica-Bold", 14)
        p.setFillColor(colors.darkblue)
        p.drawString(50, y, title)
        p.setFillColor(colors.black)
        y -= 20
        p.setFont("Helvetica", 12)
        
        text = p.beginText(50, y)
        text.setFont("Helvetica", 11)
        # Split content by newlines
        original_lines = (content or "Néant").split('\n')
        wrapped_lines = []
        for line in original_lines:
            # Wrap lines to fit page width (approx 90 chars for Helvetica 11 on A4)
            wrapped = textwrap.wrap(line, width=90)
            if not wrapped: # Handle empty lines
                wrapped_lines.append("")
            else:
                wrapped_lines.extend(wrapped)
        
        for line in wrapped_lines:
            text.textLine(line)
        p.drawText(text)
        # Approximate height usage
        y -= (len(wrapped_lines) * 15 + 20)

    draw_section("Antécédents Médicaux", consultation.antecedents_medicaux)
    draw_section("Allergies", consultation.allergies)
    draw_section("Traitements Prescrits", consultation.traitements)
    
    # Observation header
    obs_title = consultation.titre or "Observation"
    draw_section(f"Observation: {obs_title}", consultation.observation)

    # Footer
    p.showPage()
    p.save()

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=consultation_{patient.nom}_{consultation.date_creation.strftime('%Y%m%d')}.pdf"}
    )

@router.get("/dossier/{dossier_id}/export/csv")
def export_consultations_csv(
    dossier_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user_or_secretaire)
):
    """Export all consultations for a dossier as CSV. Accessible by both admin users and secretaries."""
    dossier = db.query(DossierMedical).filter(DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier not found")

    consultations = db.query(Consultation).filter(Consultation.dossier_id == dossier_id).order_by(Consultation.date_creation.desc()).all()
    patient = dossier.patient

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
    
    # Header
    writer.writerow(["ID", "Date", "Médecin/Créateur", "Titre", "Observation", "Antécédents", "Allergies", "Traitements"])
    
    # Rows
    for c in consultations:
        writer.writerow([
            c.id,
            c.date_creation.strftime("%d/%m/%Y %H:%M"),
            c.createur,
            c.titre or "",
            c.observation or "",
            c.antecedents_medicaux or "",
            c.allergies or "",
            c.traitements or ""
        ])
    
    output.seek(0)
    
    # Use utf-8-sig for Excel compatibility
    return StreamingResponse(
        iter([output.getvalue().encode('utf-8-sig')]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=historique_{patient.nom}_{patient.prenom}.csv"}
    )
