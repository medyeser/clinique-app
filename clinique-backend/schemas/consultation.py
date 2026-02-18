from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConsultationBase(BaseModel):
    antecedents_medicaux: Optional[str] = None
    allergies: Optional[str] = None
    traitements: Optional[str] = None
    titre: Optional[str] = None
    observation: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationUpdate(ConsultationBase):
    pass

class ConsultationResponse(ConsultationBase):
    id: int
    dossier_id: int
    medecin_id: Optional[int]
    createur: Optional[str]
    date_creation: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
