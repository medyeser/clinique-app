"""
API Routes for managing download requests with admin approval.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os

from models.database import get_db
from models.download_request import DownloadRequest
from models.user import User
from schemas.download_request import (
    DownloadRequestCreate,
    DownloadRequestResponse,
    DownloadRequestApprove,
    CodeVerification,
    DownloadInfo,
    DownloadRequestReject
)
from services.auth_service import get_current_user
from services.email_service import EmailService, send_access_code_email_console


router = APIRouter(prefix="/api/download-requests", tags=["download-requests"])


# Clinic name mapping for display
CLINIC_NAMES = {
    'monji-slim': 'Clinique Monji Slim',
    'tawfik': 'Clinique Tawfik'
}


# ============================================================================
# PUBLIC ENDPOINTS (No authentication required)
# ============================================================================

@router.post("/", response_model=DownloadRequestResponse, status_code=status.HTTP_201_CREATED)
def create_download_request(
    request_data: DownloadRequestCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new download request (PUBLIC - no auth required).
    User submits their information and clinic selection.
    """
    # Validate clinic ID
    if request_data.clinique_id not in ['monji-slim', 'tawfik']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Clinique invalide. Choisissez 'monji-slim' ou 'tawfik'."
        )
    
    # Map clinic to database
    database_name = DownloadRequest.map_clinic_to_database(request_data.clinique_id)
    
    # Create new request
    new_request = DownloadRequest(
        nom=request_data.nom.strip(),
        prenom=request_data.prenom.strip(),
        email=request_data.email.lower().strip(),
        clinique_id=request_data.clinique_id,
        database_name=database_name,
        status='pending'
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    print(f"✅ Nouvelle demande de téléchargement créée: ID={new_request.id}, Email={new_request.email}, Clinique={request_data.clinique_id}")
    
    return new_request


@router.post("/verify-code", response_model=DownloadInfo)
def verify_access_code(
    verification: CodeVerification,
    db: Session = Depends(get_db)
):
    """
    Verify access code and return download information (PUBLIC - no auth required).
    User enters their 6-digit code to get download access.
    """
    # Find request by access code
    request = db.query(DownloadRequest).filter(
        DownloadRequest.access_code == verification.access_code,
        DownloadRequest.status == 'approved'
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code d'accès invalide ou demande non approuvée."
        )
    
    # Check if code is valid (not expired, not already used)
    if not request.is_code_valid():
        if request.downloaded_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce code a déjà été utilisé."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce code a expiré. Veuillez contacter l'administrateur."
            )
    
    # Mark as downloaded
    request.mark_as_downloaded()
    db.commit()
    
    # Get database configuration from environment
    db_host = os.getenv('MYSQL_HOST', 'localhost')
    db_port = int(os.getenv('MYSQL_PORT', '3306'))
    db_user = os.getenv('MYSQL_USER', 'root')
    
    # Get download URL from environment or use default
    download_url = os.getenv('DOWNLOAD_FILE_URL', 'https://clinique-app-p2o2.onrender.com/downloads/clinique_software.zip')
    
    print(f"✅ Code vérifié avec succès: {verification.access_code} - Téléchargement autorisé pour {request.email}")
    
    return DownloadInfo(
        download_url=download_url,
        database_name=request.database_name,
        database_host=db_host,
        database_port=db_port,
        database_user=db_user,
        message=f"Téléchargement autorisé pour {CLINIC_NAMES.get(request.clinique_id, request.clinique_id)}."
    )


# ============================================================================
# ADMIN ENDPOINTS (Authentication required)
# ============================================================================

@router.get("/", response_model=List[DownloadRequestResponse])
def get_all_download_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all download requests with optional status filter (ADMIN only).
    
    Query params:
    - status_filter: 'pending', 'approved', or 'rejected'
    """
    query = db.query(DownloadRequest)
    
    if status_filter:
        if status_filter not in ['pending', 'approved', 'rejected']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Statut invalide. Utilisez 'pending', 'approved', ou 'rejected'."
            )
        query = query.filter(DownloadRequest.status == status_filter)
    
    requests = query.order_by(DownloadRequest.created_at.desc()).all()
    return requests


@router.get("/{request_id}", response_model=DownloadRequestResponse)
def get_download_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific download request by ID (ADMIN only).
    """
    request = db.query(DownloadRequest).filter(DownloadRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demande avec l'ID {request_id} non trouvée."
        )
    
    return request


@router.put("/{request_id}/approve", response_model=DownloadRequestResponse)
def approve_download_request(
    request_id: int,
    approval_data: DownloadRequestApprove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve a download request and generate access code (ADMIN only).
    This will generate a 6-digit code and return email data for EmailJS.
    """
    request = db.query(DownloadRequest).filter(DownloadRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demande avec l'ID {request_id} non trouvée."
        )
    
    if request.status == 'approved':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette demande a déjà été approuvée."
        )
    
    # Generate access code
    access_code = request.generate_access_code(expiration_hours=approval_data.expiration_hours)
    request.status = 'approved'
    request.approved_by_user_id = current_user.id
    request.approved_at = datetime.now()
    
    db.commit()
    db.refresh(request)
    
    # Log email data (EmailJS will be called from frontend)
    clinic_name = CLINIC_NAMES.get(request.clinique_id, request.clinique_id)
    send_access_code_email_console(
        request.email,
        request.prenom,
        request.nom,
        access_code,
        clinic_name
    )
    
    print(f"✅ Demande approuvée: ID={request_id}, Code={access_code}, Email={request.email}")
    
    return request


@router.put("/{request_id}/reject", response_model=DownloadRequestResponse)
def reject_download_request(
    request_id: int,
    reject_data: DownloadRequestReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reject a download request (ADMIN only).
    """
    request = db.query(DownloadRequest).filter(DownloadRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demande avec l'ID {request_id} non trouvée."
        )
    
    if request.status == 'rejected':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette demande a déjà été rejetée."
        )
    
    request.status = 'rejected'
    request.approved_by_user_id = current_user.id
    request.approved_at = datetime.now()
    
    db.commit()
    db.refresh(request)
    
    print(f"❌ Demande rejetée: ID={request_id}, Email={request.email}")
    if reject_data.reason:
        print(f"   Raison: {reject_data.reason}")
    
    return request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_download_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a download request (ADMIN only).
    """
    request = db.query(DownloadRequest).filter(DownloadRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demande avec l'ID {request_id} non trouvée."
        )
    
    db.delete(request)
    db.commit()
    
    print(f"🗑️ Demande supprimée: ID={request_id}, Email={request.email}")
    
    return None
