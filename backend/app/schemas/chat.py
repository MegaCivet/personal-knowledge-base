from pydantic import BaseModel, field_validator
from typing import List, Optional

# --- Schemas for Chat ---

class QueryRequest(BaseModel):
    """
    用户查询请求模型
    """
    query: str


class SourceDocument(BaseModel):
    """
    引用的源文档模型
    """
    filename: str
    content: str
    # 可以选择性地包含其他元数据
    file_id: Optional[str] = None
    start_index: Optional[int] = None

    @field_validator("file_id", mode="before")
    def _file_id_to_str(cls, v):
        return str(v) if v is not None else None


class QueryResponse(BaseModel):
    """
    聊天查询的响应模型
    """
    answer: str
    sources: List[SourceDocument]
