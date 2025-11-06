from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func

from app.db.database import Base

class KnowledgeFile(Base):
    """
    知识库文件元数据模型
    """
    __tablename__ = "knowledge_files"

    id = Column(BigInteger, primary_key=True, index=True, comment="文件ID (雪花ID)")
    
    filename = Column(String(255), nullable=False, unique=True, comment="文件名")
    
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")

    def __repr__(self):
        return f"<KnowledgeFile(id={self.id}, filename='{self.filename}')>"
