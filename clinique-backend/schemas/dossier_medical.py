"""
DossierMedical (Medical Record) schemas for validation and serialization.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DossierMedicalBase(BaseModel):
    """Base schema for DossierMedical."""
    patient_id: int
    antecedents_medicaux: Optional[str] = None
    allergies: Optional[str] = None
    groupe_sanguin: Optional[str] = Field(None, pattern="^(A\\+|A-|B\\+|B-|AB\\+|AB-|O\\+|O-)?$")
    historique_consultations: Optional[str] = None
    observations: Optional[str] = None
    traitements: Optional[str] = None


class DossierMedicalCreate(DossierMedicalBase):
    """Schema for creating a new dossier medical."""
    pass


class DossierMedicalUpdate(BaseModel):
    """Schema for updating a dossier medical."""
    antecedents_medicaux: Optional[str] = None
    allergies: Optional[str] = None
    groupe_sanguin: Optional[str] = Field(None, pattern="^(A\\+|A-|B\\+|B-|AB\\+|AB-|O\\+|O-)?$")
    historique_consultations: Optional[str] = None
    observations: Optional[str] = None
    traitements: Optional[str] = None


class DossierMedicalResponse(DossierMedicalBase):
    """Schema for dossier medical response."""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ObservationAdd(BaseModel):
    """Schema for adding an observation to a medical record."""
    titre: Optional[str] = None
    observation: str = Field(..., min_length=1)
    date_observation: Optional[datetime] = None
