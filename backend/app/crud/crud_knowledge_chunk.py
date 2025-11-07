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

def delete_by_file_id(db: Session, *, file_id: int) -> List[str]:
    """
    根据文件ID删除所有相关的文本块元数据记录，并返回被删除的向量ID列表。

    :param db: 数据库会话对象。
    :param file_id: 知识文件的ID。
    :return: 被删除的向量ID（vector_id）列表。
    """
    # 1. 查询所有与 file_id 相关的记录
    chunks_to_delete = db.query(KnowledgeFileChunk).filter(KnowledgeFileChunk.knowledge_file_id == file_id).all()
    
    if not chunks_to_delete:
        return []

    # 2. 提取 vector_id
    vector_ids = [chunk.vector_id for chunk in chunks_to_delete]
    
    # 3. 删除记录
    for chunk in chunks_to_delete:
        db.delete(chunk)
    
    # 4. 提交事务
    db.commit()
    
    # 5. 返回被删除的 vector_id 列表
    return vector_ids
