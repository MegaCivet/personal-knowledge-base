from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.tag import TagResponse, TagCreate
from app.crud import crud_tag

router = APIRouter()

@router.get("/", response_model=List[TagResponse])
def read_tags(db: Session = Depends(get_db)):
    return crud_tag.get_all(db)

@router.post("/", response_model=TagResponse)
def create_tag(tag_in: TagCreate, db: Session = Depends(get_db)):
    tag = crud_tag.get_by_name(db, name=tag_in.name)
    if tag:
        raise HTTPException(status_code=400, detail="标签已存在")
    return crud_tag.create(db, tag_in=tag_in)

@router.delete("/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    crud_tag.delete(db, tag_id=tag_id)
    return {"status": "success"}