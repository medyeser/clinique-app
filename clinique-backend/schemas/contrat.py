"""
Pydantic schemas for Contrat operations.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ContratBase(BaseModel):
    nom_employe: str
    poste: str
    type_contrat: str
    date_debut: date
    date_fin: date
    salaire: float
    missions: str
    horaires: str
    statut_contrat: str = "Brouillon"
    signature_employeur: Optional[datetime] = None
    signature_employe: Optional[datetime] = None

class ContratCreate(ContratBase):
    """Schema for creating a contract."""
    pass

class ContratUpdate(BaseModel):
    """Schema for updating a contract."""
    nom_employe: Optional[str] = None
    poste: Optional[str] = None
    type_contrat: Optional[str] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    salaire: Optional[float] = None
    missions: Optional[str] = None
    horaires: Optional[str] = None
    statut_contrat: Optional[str] = None
    signature_employeur: Optional[datetime] = None
    signature_employe: Optional[datetime] = None

class ContratResponse(ContratBase):
    """Schema for reading a contract."""
    id: int
    date_creation: datetime

    class Config:
        from_attributes = True
