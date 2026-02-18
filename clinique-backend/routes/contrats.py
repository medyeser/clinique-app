"""
API endpoints for managing contracts.
"""
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db
from models.contrat import Contrat
from schemas.contrat import ContratCreate, ContratResponse, ContratUpdate
from services.contrat_service import ContratService

router = APIRouter(prefix="/api/contrats", tags=["contrats"])

@router.post("/", response_model=ContratResponse)
def create_contrat(contrat: ContratCreate, db: Session = Depends(get_db)):
    db_contrat = Contrat(**contrat.model_dump())
    db.add(db_contrat)
    db.commit()
    db.refresh(db_contrat)
    return db_contrat

@router.get("/", response_model=List[ContratResponse])
def read_contrats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    contrats = db.query(Contrat).offset(skip).limit(limit).all()
    return contrats

@router.get("/{contrat_id}", response_model=ContratResponse)
def read_contrat(contrat_id: int, db: Session = Depends(get_db)):
    db_contrat = db.query(Contrat).filter(Contrat.id == contrat_id).first()
    if db_contrat is None:
        raise HTTPException(status_code=404, detail="Contrat not found")
    return db_contrat

@router.put("/{contrat_id}", response_model=ContratResponse)
def update_contrat(contrat_id: int, contrat_update: ContratUpdate, db: Session = Depends(get_db)):
    db_contrat = db.query(Contrat).filter(Contrat.id == contrat_id).first()
    if db_contrat is None:
        raise HTTPException(status_code=404, detail="Contrat not found")
    
    update_data = contrat_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contrat, key, value)
    
    db.commit()
    db.refresh(db_contrat)
    return db_contrat

@router.delete("/{contrat_id}")
def delete_contrat(contrat_id: int, db: Session = Depends(get_db)):
    db_contrat = db.query(Contrat).filter(Contrat.id == contrat_id).first()
    if db_contrat is None:
        raise HTTPException(status_code=404, detail="Contrat not found")
    
    db.delete(db_contrat)
    db.commit()
    return {"message": "Contrat deleted successfully"}

@router.get("/{contrat_id}/pdf")
def generate_contrat_pdf(contrat_id: int, db: Session = Depends(get_db)):
    db_contrat = db.query(Contrat).filter(Contrat.id == contrat_id).first()
    if db_contrat is None:
        raise HTTPException(status_code=404, detail="Contrat not found")
    
    pdf_buffer = ContratService.generate_pdf(db_contrat)
    
    headers = {
        'Content-Disposition': f'attachment; filename="contrat_{db_contrat.nom_employe}_{db_contrat.id}.pdf"'
    }
    return Response(content=pdf_buffer.getvalue(), media_type="application/pdf", headers=headers)
