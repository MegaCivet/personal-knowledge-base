from sqlalchemy import Column, String, ForeignKey, BigInteger
from sqlalchemy.orm import relationship

from app.db.database import Base


class KnowledgeFileChunk(Base):
    __tablename__ = "knowledge_file_chunks"

    id = Column(BigInteger, primary_key=True, index=True, comment="分片ID (雪花ID)")
    vector_id = Column(String(36), nullable=False, unique=True, index=True, comment="向量数据库中的向量ID")
    knowledge_file_id = Column(BigInteger, ForeignKey("knowledge_files.id"), nullable=False, index=True)

    # 建立与 KnowledgeFile 模型的关联
    knowledge_file = relationship("KnowledgeFile", back_populates="chunks")