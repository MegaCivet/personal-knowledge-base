from sqlalchemy.orm import Session
from app.models.tag import Tag
from app.schemas.tag import TagCreate
from app.core.utils import get_snowflake_id

def get_by_name(db: Session, name: str):
    return db.query(Tag).filter(Tag.name == name).first()

def get_all(db: Session):
    return db.query(Tag).all()

def create(db: Session, tag_in: TagCreate):
    db_tag = Tag(
        id=get_snowflake_id(),
        name=tag_in.name
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def delete(db: Session, tag_id: int):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if tag:
        db.delete(tag)
        db.commit()
    return tag