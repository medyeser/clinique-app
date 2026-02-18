"""
Patient schemas for validation and serialization.
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Any, Dict
from datetime import date, datetime


class PatientBase(BaseModel):
    """Base schema for Patient."""
    nom: str = Field(..., min_length=1, max_length=100)
    prenom: str = Field(..., min_length=1, max_length=100)
    date_naissance: date
    sexe: str = Field(..., pattern="^(Homme|Femme|Autre)$")
    adresse: Optional[str] = Field(None, max_length=255)
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    numero_securite_sociale: Optional[str] = Field(None, max_length=15)
    medecin_id: Optional[int] = None


class PatientCreate(PatientBase):
    """Schema for creating a new patient."""
    pass


class PatientUpdate(BaseModel):
    """Schema for updating a patient."""
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    prenom: Optional[str] = Field(None, min_length=1, max_length=100)
    date_naissance: Optional[date] = None
    sexe: Optional[str] = Field(None, pattern="^(Homme|Femme|Autre)$")
    adresse: Optional[str] = Field(None, max_length=255)
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    numero_securite_sociale: Optional[str] = Field(None, max_length=15)
    medecin_id: Optional[int] = None


class PatientResponse(PatientBase):
    """Schema for patient response."""
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    
    id: int
    medecin: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
