from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Tag(Base):
    __tablename__ = "tags"

    id = Column(BigInteger, primary_key=True, index=True, comment="标签ID")
    name = Column(String(50), unique=True, nullable=False, index=True, comment="标签名称")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")