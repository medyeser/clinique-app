"""
Revenue tracking routes for viewing historical revenue data and exports.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta, date
from typing import Optional

from models.database import get_db
from models.user import User
from models.consultation import Consultation
from models.medecin import Medecin
from models.patient import Patient
from services.auth_service import get_current_active_user

router = APIRouter(prefix="/api/revenus", tags=["Revenus"])

# Fixed consultation price
CONSULTATION_PRICE = 50


@router.get("/daily")
def get_daily_revenue(
    date_param: Optional[str] = Query(None, description="Date au format YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get revenue for a specific day.
    If no date provided, returns today's revenue.
    """
    if date_param:
        try:
            target_date = datetime.strptime(date_param, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format de date invalide. Utilisez YYYY-MM-DD"
            )
    else:
        target_date = datetime.now().date()
    
    # Get consultations for the day
    consultations = db.query(Consultation).filter(
        func.date(Consultation.date_creation) == target_date
    ).all()
    
    # Calculate revenue by doctor
    medecin_revenues = {}
    for cons in consultations:
        if cons.medecin_id:
            if cons.medecin_id not in medecin_revenues:
                medecin = db.query(Medecin).filter(Medecin.id == cons.medecin_id).first()
                medecin_revenues[cons.medecin_id] = {
                    "medecin_id": cons.medecin_id,
                    "medecin_nom": f"Dr. {medecin.nom} {medecin.prenom}" if medecin else "Inconnu",
                    "specialite": medecin.specialite if medecin else "",
                    "nb_consultations": 0,
                    "revenue": 0
                }
            medecin_revenues[cons.medecin_id]["nb_consultations"] += 1
            medecin_revenues[cons.medecin_id]["revenue"] += CONSULTATION_PRICE
    
    total_revenue = sum(m["revenue"] for m in medecin_revenues.values())
    total_consultations = sum(m["nb_consultations"] for m in medecin_revenues.values())
    
    return {
        "date": str(target_date),
        "total_revenue": total_revenue,
        "total_consultations": total_consultations,
        "medecins": list(medecin_revenues.values())
    }


@router.get("/weekly")
def get_weekly_revenue(
    date_param: Optional[str] = Query(None, description="Date dans la semaine (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get revenue for a specific week.
    If no date provided, returns current week's revenue.
    """
    if date_param:
        try:
            reference_date = datetime.strptime(date_param, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format de date invalide. Utilisez YYYY-MM-DD"
            )
    else:
        reference_date = datetime.now().date()
    
    # Calculate week start (Monday) and end (Sunday)
    week_start = reference_date - timedelta(days=reference_date.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Get consultations for the week
    consultations = db.query(Consultation).filter(
        and_(
            func.date(Consultation.date_creation) >= week_start,
            func.date(Consultation.date_creation) <= week_end
        )
    ).all()
    
    # Calculate daily revenue for the week
    daily_revenues = {}
    current_day = week_start
    while current_day <= week_end:
        daily_revenues[str(current_day)] = {
            "date": str(current_day),
            "day_name": current_day.strftime("%A"),
            "nb_consultations": 0,
            "revenue": 0
        }
        current_day += timedelta(days=1)
    
    for cons in consultations:
        cons_date = str(cons.date_creation.date())
        if cons_date in daily_revenues:
            daily_revenues[cons_date]["nb_consultations"] += 1
            daily_revenues[cons_date]["revenue"] += CONSULTATION_PRICE
    
    total_revenue = sum(d["revenue"] for d in daily_revenues.values())
    total_consultations = sum(d["nb_consultations"] for d in daily_revenues.values())
    
    return {
        "week_start": str(week_start),
        "week_end": str(week_end),
        "total_revenue": total_revenue,
        "total_consultations": total_consultations,
        "daily_breakdown": list(daily_revenues.values())
    }


@router.get("/monthly")
def get_monthly_revenue(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get revenue for a specific month.
    If no year/month provided, returns current month's revenue.
    """
    if year and month:
        target_year = year
        target_month = month
    else:
        now = datetime.now()
        target_year = now.year
        target_month = now.month
    
    # Validate month
    if not (1 <= target_month <= 12):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le mois doit être entre 1 et 12"
        )
    
    # Get consultations for the month
    consultations = db.query(Consultation).filter(
        and_(
            extract('year', Consultation.date_creation) == target_year,
            extract('month', Consultation.date_creation) == target_month
        )
    ).all()
    
    # Calculate daily revenue for the month
    from calendar import monthrange
    days_in_month = monthrange(target_year, target_month)[1]
    
    daily_revenues = {}
    for day in range(1, days_in_month + 1):
        day_date = date(target_year, target_month, day)
        daily_revenues[str(day_date)] = {
            "date": str(day_date),
            "day": day,
            "nb_consultations": 0,
            "revenue": 0
        }
    
    for cons in consultations:
        cons_date = str(cons.date_creation.date())
        if cons_date in daily_revenues:
            daily_revenues[cons_date]["nb_consultations"] += 1
            daily_revenues[cons_date]["revenue"] += CONSULTATION_PRICE
    
    total_revenue = sum(d["revenue"] for d in daily_revenues.values())
    total_consultations = sum(d["nb_consultations"] for d in daily_revenues.values())
    
    return {
        "year": target_year,
        "month": target_month,
        "month_name": date(target_year, target_month, 1).strftime("%B"),
        "total_revenue": total_revenue,
        "total_consultations": total_consultations,
        "daily_breakdown": list(daily_revenues.values())
    }


@router.get("/history")
def get_revenue_history(
    start_date: str = Query(..., description="Date de début (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Date de fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get revenue history between two dates.
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de date invalide. Utilisez YYYY-MM-DD"
        )
    
    if start > end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La date de début doit être antérieure à la date de fin"
        )
    
    # Get consultations in the date range
    consultations = db.query(Consultation).filter(
        and_(
            func.date(Consultation.date_creation) >= start,
            func.date(Consultation.date_creation) <= end
        )
    ).order_by(Consultation.date_creation.desc()).all()
    
    # Build detailed history
    history = []
    for cons in consultations:
        medecin = db.query(Medecin).filter(Medecin.id == cons.medecin_id).first() if cons.medecin_id else None
        patient_dossier = db.query(Patient).join(
            Consultation,
            Consultation.dossier_id == Patient.id
        ).filter(Consultation.id == cons.id).first()
        
        history.append({
            "id": cons.id,
            "date": str(cons.date_creation.date()),
            "heure": cons.date_creation.strftime("%H:%M"),
            "medecin": f"Dr. {medecin.nom} {medecin.prenom}" if medecin else "Non assigné",
            "specialite": medecin.specialite if medecin else "",
            "patient": f"{patient_dossier.nom} {patient_dossier.prenom}" if patient_dossier else "Inconnu",
            "titre": cons.titre or "Consultation",
            "revenue": CONSULTATION_PRICE
        })
    
    total_revenue = len(history) * CONSULTATION_PRICE
    
    return {
        "start_date": str(start),
        "end_date": str(end),
        "total_consultations": len(history),
        "total_revenue": total_revenue,
        "history": history
    }


@router.get("/export/pdf")
def export_revenue_pdf(
    start_date: str = Query(...),
    end_date: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export revenue report as PDF.
    """
    from services.revenus_service import generer_rapport_revenus_pdf
    
    try:
        pdf_buffer = generer_rapport_revenus_pdf(db, start_date, end_date)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=rapport_revenus_{start_date}_{end_date}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération du PDF: {str(e)}"
        )


@router.get("/export/excel")
def export_revenue_excel(
    start_date: str = Query(...),
    end_date: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export revenue report as Excel.
    """
    from services.revenus_service import generer_rapport_revenus_excel
    
    try:
        excel_buffer = generer_rapport_revenus_excel(db, start_date, end_date)
        
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=rapport_revenus_{start_date}_{end_date}.xlsx"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération d'Excel: {str(e)}"
        )
