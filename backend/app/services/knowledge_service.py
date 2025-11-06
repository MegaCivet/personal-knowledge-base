from typing import List
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.crud import crud_knowledge
from app.services import file_service
from app.schemas.knowledge import KnowledgeFileResponse, KnowledgeFileCreate


def process_upload_files(db: Session, files: List[UploadFile]) -> List[KnowledgeFileResponse]:
    """
    处理文件上传的核心业务逻辑。

    1. 验证文件。
    2. 保存物理文件。
    3. 在数据库中创建或更新元数据记录。
    """
    if not files:
        raise HTTPException(status_code=400, detail="没有提供任何文件")

    saved_files = []
    for file in files:
        if not file.filename.endswith(".md"):
            # 在服务层抛出HTTPException也是一种选择，或者可以定义自定义异常
            raise HTTPException(
                status_code=400, 
                detail=f"文件 '{file.filename}' 不是 Markdown (.md) 文件。"
            )

        # 1. 保存物理文件
        file_service.save_upload_file(upload_file=file)

        # 2. 检查数据库中是否已有该文件的记录
        db_file = crud_knowledge.get_by_filename(db, filename=file.filename)

        if db_file:
            # 如果文件已存在，其 updated_at 会由数据库 onupdate 自动处理
            # 为了确保 onupdate 触发，可以执行一次空提交或实际更新某个字段
            # 在这里，我们信任数据库的自动更新机制，直接使用查询到的对象
            saved_files.append(db_file)
        else:
            # 3. 如果是新文件，在数据库中创建记录
            file_in = KnowledgeFileCreate(filename=file.filename)
            new_db_file = crud_knowledge.create(db, file_in=file_in)
            saved_files.append(new_db_file)
    
    # 刷新会话以获取最新的（可能由数据库自动更新的）数据
    for db_file in saved_files:
        db.refresh(db_file)

    return saved_files
