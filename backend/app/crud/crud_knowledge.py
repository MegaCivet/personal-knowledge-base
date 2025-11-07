from sqlalchemy.orm import Session

from app.models.knowledge_file import KnowledgeFile
from app.schemas.knowledge_file import KnowledgeFileCreate
from app.core.utils import get_snowflake_id

def get(db: Session, id: int) -> KnowledgeFile | None:
    """
    根据ID查询知识库文件记录。
    """
    return db.query(KnowledgeFile).filter(KnowledgeFile.id == id).first()


def get_by_filename(db: Session, filename: str) -> KnowledgeFile | None:
    """
    根据文件名查询知识库文件记录。
    """
    return db.query(KnowledgeFile).filter(KnowledgeFile.filename == filename).first()


def create(db: Session, file_in: KnowledgeFileCreate) -> KnowledgeFile:
    """
    创建一条新的知识库文件记录。
    """
    # 创建 ORM 模型实例
    db_obj = KnowledgeFile(
        id=get_snowflake_id(),  # 使用雪花ID生成器
        filename=file_in.filename
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_all(db: Session) -> list[KnowledgeFile]:
    """
    获取所有知识库文件记录。
    """
    return db.query(KnowledgeFile).all()
