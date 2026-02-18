"""
RendezVous (Appointment) schemas for validation and serialization.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PatientNested(BaseModel):
    """Nested patient schema for rendez-vous response."""
    id: int
    nom: str
    prenom: str
    
    class Config:
        from_attributes = True


class MedecinNested(BaseModel):
    """Nested medecin schema for rendez-vous response."""
    id: int
    nom: str
    prenom: str
    specialite: Optional[str] = None
    
    class Config:
        from_attributes = True


class RendezVousBase(BaseModel):
    """Base schema for RendezVous."""
    date_heure: datetime
    patient_id: int
    medecin_id: int
    motif: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None


class RendezVousCreate(RendezVousBase):
    """Schema for creating a new rendez-vous."""
    pass


class RendezVousUpdate(BaseModel):
    """Schema for updating a rendez-vous."""
    date_heure: Optional[datetime] = None
    patient_id: Optional[int] = None
    medecin_id: Optional[int] = None
    statut: Optional[str] = Field(None, pattern="^(Planifié|Confirmé|Annulé|Terminé)$")
    motif: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None


class RendezVousResponse(RendezVousBase):
    """Schema for rendez-vous response."""
    id: int
    statut: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    patient: Optional[PatientNested] = None
    medecin: Optional[MedecinNested] = None
    
    class Config:
        from_attributes = True


class ConflitCheck(BaseModel):
    """Schema for checking appointment conflicts."""
    medecin_id: int
    date_heure: datetime
    duree_minutes: int = Field(default=30, ge=15, le=240)  # Duration between 15 and 240 minutes
