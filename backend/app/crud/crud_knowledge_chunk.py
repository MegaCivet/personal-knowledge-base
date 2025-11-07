from typing import List
from sqlalchemy.orm import Session

from app.models.knowledge_file_chunk import KnowledgeFileChunk
from app.schemas.knowledge_chunk import KnowledgeFileChunkCreate
from app.core.utils import get_snowflake_id

def create_chunks(db: Session, *, chunks_in: List[KnowledgeFileChunkCreate]) -> List[KnowledgeFileChunk]:
    """
    批量创建知识文件文本块的元数据记录。

    :param db: 数据库会话对象。
    :param chunks_in: 包含多个文本块信息的Pydantic模型列表。
    :return: 创建成功后的ORM对象列表。
    """
    db_chunks = []
    for chunk_in in chunks_in:
        # 为每个文本块创建一个ORM模型实例
        db_chunk = KnowledgeFileChunk(
            id=get_snowflake_id(),  # 使用雪花算法生成ID
            vector_id=chunk_in.vector_id,
            knowledge_file_id=chunk_in.knowledge_file_id
        )
        db_chunks.append(db_chunk)
    
    # 一次性将所有新的文本块记录添加到会话中
    db.add_all(db_chunks)
    # 提交事务，将数据写入数据库
    db.commit()
    
    # 刷新每个对象，以从数据库中获取最新状态（如果需要的话）
    for db_chunk in db_chunks:
        db.refresh(db_chunk)
        
    return db_chunks
