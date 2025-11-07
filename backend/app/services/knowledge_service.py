import logging
from typing import List
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.crud import crud_knowledge
from app.services import file_service, rag_service
from app.schemas.knowledge_file import KnowledgeFileResponse, KnowledgeFileCreate

logger = logging.getLogger(__name__)


def process_upload_files(db: Session, files: List[UploadFile]) -> List[KnowledgeFileResponse]:
    """
    处理文件上传的核心业务逻辑。

    1. 验证文件。
    2. 保存物理文件。
    3. 在数据库中创建或更新元数据记录。
    4. 触发对新文件的RAG索引。
    """
    if not files:
        raise HTTPException(status_code=400, detail="没有提供任何文件")

    processed_files = []
    for file in files:
        if not file.filename.endswith(".md"):
            raise HTTPException(
                status_code=400, 
                detail=f"文件 '{file.filename}' 不是 Markdown (.md) 文件。"
            )

        # 1. 保存物理文件并获取路径
        saved_path = file_service.save_upload_file(upload_file=file)

        # 2. 检查数据库中是否已有该文件的记录
        db_file = crud_knowledge.get_by_filename(db, filename=file.filename)

        if db_file:
            processed_files.append(db_file)
            # TODO: 此处可以添加逻辑，检查文件内容是否有变化，以决定是否需要重新索引
            logger.info(f"文件 '{file.filename}' 已存在，跳过数据库记录创建。")
        else:
            # 3. 如果是新文件，在数据库中创建记录
            file_in = KnowledgeFileCreate(filename=file.filename)
            new_db_file = crud_knowledge.create(db, file_in=file_in)
            processed_files.append(new_db_file)
            db_file = new_db_file # 统一变量名以便后续使用

        # 4. 触发RAG索引流程
        try:
            logger.info(f"准备为文件 '{db_file.filename}' (ID: {db_file.id}) 创建索引...")
            rag_service.create_index_for_file(db=db, file_path=saved_path, file_id=db_file.id)
        except Exception as e:
            # 如果索引失败，只记录错误，不中断整个上传流程
            logger.error(
                f"为文件 '{db_file.filename}' (ID: {db_file.id}) 创建索引失败。" \
                f"错误: {e}", 
                exc_info=True
            )
    
    # 刷新会话以获取最新的（可能由数据库自动更新的）数据
    for db_file in processed_files:
        db.refresh(db_file)

    return processed_files
