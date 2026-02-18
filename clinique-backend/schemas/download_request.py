"""
Pydantic schemas for download request API validation.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class DownloadRequestCreate(BaseModel):
    """Schema for creating a new download request."""
    nom: str = Field(..., min_length=2, max_length=100, description="Nom de famille")
    prenom: str = Field(..., min_length=2, max_length=100, description="Prénom")
    email: EmailStr = Field(..., description="Adresse email")
    clinique_id: str = Field(..., description="ID de la clinique (monji-slim ou tawfik)")

    class Config:
        json_schema_extra = {
            "example": {
                "nom": "Dupont",
                "prenom": "Jean",
                "email": "jean.dupont@example.com",
                "clinique_id": "monji-slim"
            }
        }


class DownloadRequestResponse(BaseModel):
    """Schema for download request response."""
    id: int
    nom: str
    prenom: str
    email: str
    clinique_id: str
    database_name: str
    status: str
    access_code: Optional[str] = None
    code_expires_at: Optional[datetime] = None
    approved_by_user_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    downloaded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DownloadRequestApprove(BaseModel):
    """Schema for approving a download request."""
    expiration_hours: int = Field(default=24, ge=1, le=168, description="Heures avant expiration du code (1-168)")


class CodeVerification(BaseModel):
    """Schema for verifying an access code."""
    access_code: str = Field(..., min_length=6, max_length=6, description="Code d'accès à 6 chiffres")

    class Config:
        json_schema_extra = {
            "example": {
                "access_code": "123456"
            }
        }


class DownloadInfo(BaseModel):
    """Schema for download information response."""
    download_url: str
    database_name: str
    database_host: str
    database_port: int
    database_user: str
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "download_url": "https://example.com/clinique-software.exe",
                "database_name": "clinique_monji_slim",
                "database_host": "localhost",
                "database_port": 3306,
                "database_user": "root",
                "message": "Téléchargement autorisé. Votre logiciel va démarrer le téléchargement."
            }
        }


class DownloadRequestReject(BaseModel):
    """Schema for rejecting a download request."""
    reason: Optional[str] = Field(None, max_length=500, description="Raison du rejet (optionnel)")
