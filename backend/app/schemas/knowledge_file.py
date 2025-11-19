from pydantic import BaseModel, ConfigDict
from datetime import datetime

# --- Base Schema ---
# 包含所有模型共有的字段
class KnowledgeFileBase(BaseModel):
    filename: str


# --- Create Schema ---
# 用于创建记录时的数据模型
# 目前没有额外字段，但为了区分和未来扩展而创建
class KnowledgeFileCreate(KnowledgeFileBase):
    pass


# --- Response Schema ---
# 用于从数据库读取数据并作为API响应返回的模型
class KnowledgeFileResponse(KnowledgeFileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    # from_attributes=True 允许 Pydantic 从 ORM 对象属性中读取数据来创建模型实例
    model_config = ConfigDict(from_attributes=True)