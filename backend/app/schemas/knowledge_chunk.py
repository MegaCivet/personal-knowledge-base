from pydantic import BaseModel, ConfigDict

# --- Schemas for KnowledgeFileChunk ---

class KnowledgeFileChunkBase(BaseModel):
    """文本块的基础模型，包含关联信息"""
    vector_id: str
    knowledge_file_id: int


class KnowledgeFileChunkCreate(KnowledgeFileChunkBase):
    """用于创建文本块记录的模型"""
    pass


class KnowledgeFileChunkResponse(KnowledgeFileChunkBase):
    """用于API响应的文本块模型"""
    id: int

    model_config = ConfigDict(from_attributes=True)
