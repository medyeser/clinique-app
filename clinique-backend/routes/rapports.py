from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from datetime import datetime

from models.database import get_db
from models.user import User
from services.auth_service import get_current_active_user
from services.rapport_service import (
    generer_rapport_global,
    generer_pdf_rapport,
    generer_excel_rapport,
    generer_rapport_patients_pdf,
    generer_rapport_patients_excel
)

router = APIRouter(prefix="/api/rapports", tags=["Rapports"])


@router.get("/global")
def get_rapport_global(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    
    return generer_rapport_global(db)


@router.get("/specialites")
def get_specialites_populaires(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):

    rapport = generer_rapport_global(db)
    return {
        "specialites": rapport["specialites_populaires"]
    }


@router.get("/export/pdf")
def export_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    
    try:
        pdf_buffer = generer_pdf_rapport(db)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=rapport_clinique_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        )


@router.get("/export/excel")
def export_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export global report as Excel.
    
    Returns an Excel file download.
    """
    try:
        excel_buffer = generer_excel_rapport(db)
        
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=rapport_clinique_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating Excel: {str(e)}"
        )


@router.get("/medecins")
def get_stats_medecins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get statistics per doctor."""
    from services.rapport_service import generer_stats_medecins
    return generer_stats_medecins(db)


@router.get("/rendez-vous")
def get_stats_rdv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get appointments analytics."""
    from services.rapport_service import generer_stats_rendez_vous
    return generer_stats_rendez_vous(db)


@router.get("/medicales")
def get_stats_medicales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get medical insights."""
    from services.rapport_service import generer_stats_medicales
    return generer_stats_medicales(db)
