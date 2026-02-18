"""
Dashboard routes for Medecin (Doctor) users.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta, date

from models.database import get_db
from models.user import User
from models.medecin import Medecin
from models.consultation import Consultation
from models.rendez_vous import RendezVous
from services.auth_service import get_current_active_user

router = APIRouter(prefix="/api/medecin/dashboard", tags=["Medecin Dashboard"])

def get_current_medecin(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Medecin:
    """
    Get the Medecin record associated with the current user.
    """
    if current_user.role != "medecin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. User is not a medecin."
        )
    
    # Link via email
    medecin = db.query(Medecin).filter(Medecin.email == current_user.email).first()
    if not medecin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medecin profile not found for this user."
        )
    return medecin

@router.get("/stats")
def get_medecin_stats(
    medecin: Medecin = Depends(get_current_medecin),
    db: Session = Depends(get_db)
):
    """
    Get statistics for the medecin dashboard.
    """
    now = datetime.now()
    today = now.date()
    start_of_week = today - timedelta(days=today.weekday())
    start_of_month = today.replace(day=1)

    # Consultations counts
    total_consultations = db.query(Consultation).filter(Consultation.medecin_id == medecin.id).count()
    
    today_consultations = db.query(Consultation).filter(
        and_(
            Consultation.medecin_id == medecin.id,
            func.date(Consultation.date_creation) == today
        )
    ).count()

    week_consultations = db.query(Consultation).filter(
        and_(
            Consultation.medecin_id == medecin.id,
            func.date(Consultation.date_creation) >= start_of_week
        )
    ).count()

    month_consultations = db.query(Consultation).filter(
        and_(
            Consultation.medecin_id == medecin.id,
            func.date(Consultation.date_creation) >= start_of_month
        )
    ).count()

    # Earnings (Fixed 50 DT per consultation)
    CONSULTATION_PRICE = 50

    return {
        "consultations": {
            "total": total_consultations,
            "today": today_consultations,
            "week": week_consultations,
            "month": month_consultations
        },
        "earnings": {
            "total": total_consultations * CONSULTATION_PRICE,
            "today": today_consultations * CONSULTATION_PRICE,
            "week": week_consultations * CONSULTATION_PRICE,
            "month": month_consultations * CONSULTATION_PRICE
        }
    }

@router.get("/graph")
def get_earnings_graph(
    medecin: Medecin = Depends(get_current_medecin),
    db: Session = Depends(get_db)
):
    """
    Get daily earnings for the last 7 days.
    """
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=6)
    CONSULTATION_PRICE = 50

    # Initialize all days with 0
    days_data = {}
    current_d = start_date
    while current_d <= end_date:
        days_data[current_d.strftime("%Y-%m-%d")] = 0
        current_d += timedelta(days=1)

    # Query counts per day
    results = db.query(
        func.date(Consultation.date_creation).label('day'),
        func.count(Consultation.id).label('count')
    ).filter(
        and_(
            Consultation.medecin_id == medecin.id,
            func.date(Consultation.date_creation) >= start_date
        )
    ).group_by('day').all()

    # Fill data
    for r in results:
        day_str = str(r.day)
        if day_str in days_data:
            days_data[day_str] = r.count * CONSULTATION_PRICE

    # Format for frontend
    formatted_data = [
        {"day": day, "amount": amount} 
        for day, amount in days_data.items()
    ]
    formatted_data.sort(key=lambda x: x["day"])

    return formatted_data

@router.get("/appointments")
def get_medecin_appointments(
    medecin: Medecin = Depends(get_current_medecin),
    db: Session = Depends(get_db)
):
    """
    Get recent appointments for the medecin.
    """
    today = datetime.now().date()
    
    # Get today's appointments
    today_rdvs = db.query(RendezVous).filter(
        and_(
            RendezVous.medecin_id == medecin.id,
            func.date(RendezVous.date_heure) == today
        )
    ).order_by(RendezVous.date_heure).all()

    # Get this week's appointments (excluding today just for distinction if needed, but let's just get upcoming)
    # Actually user asked for "today and this week, with history". 
    # Let's return a list ensuring we populate patient names.
    
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    week_rdvs = db.query(RendezVous).filter(
        and_(
            RendezVous.medecin_id == medecin.id,
            func.date(RendezVous.date_heure) >= week_start,
            func.date(RendezVous.date_heure) <= week_end
        )
    ).order_by(RendezVous.date_heure).all()

    def format_rdv(rdv):
        return {
            "id": rdv.id,
            "patient_name": f"{rdv.patient.prenom} {rdv.patient.nom}" if rdv.patient else "Inconnu",
            "date": rdv.date_heure.strftime("%Y-%m-%d"),
            "time": rdv.date_heure.strftime("%H:%M"),
            "status": rdv.statut, # Enum might need .value if it's an object, but checking model it seems to be String default "Planifié" or Enum object.
            # Convert status to string if it's enum
            "motif": rdv.motif
        }

    return {
        "today": [format_rdv(r) for r in today_rdvs],
        "week": [format_rdv(r) for r in week_rdvs]
    }
