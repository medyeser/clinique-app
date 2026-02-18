"""
Medecin (Doctor) schemas for validation and serialization.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class MedecinBase(BaseModel):
    """Base schema for Medecin."""
    nom: str = Field(..., min_length=1, max_length=100)
    prenom: str = Field(..., min_length=1, max_length=100)
    specialite: str = Field(..., min_length=1, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    numero_ordre: str = Field(..., min_length=1, max_length=50)
    disponibilites: Optional[str] = None


class MedecinCreate(MedecinBase):
    """Schema for creating a new medecin."""
    password: Optional[str] = Field(None, min_length=6)


class MedecinUpdate(BaseModel):
    """Schema for updating a medecin."""
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    prenom: Optional[str] = Field(None, min_length=1, max_length=100)
    specialite: Optional[str] = Field(None, min_length=1, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    numero_ordre: Optional[str] = Field(None, min_length=1, max_length=50)
    disponibilites: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)


class MedecinResponse(MedecinBase):
    """Schema for medecin response."""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
