from typing import List
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.services import knowledge_service
from app.schemas.knowledge import KnowledgeFileResponse
from app.db.database import get_db

router = APIRouter()

@router.post("/upload", response_model=List[KnowledgeFileResponse])
def upload_files(
    files: List[UploadFile] = File(..., description="要上传的一个或多个 .md 文件"),
    db: Session = Depends(get_db)
):
    """
    上传一个或多个 Markdown 文件到知识库。

    此端点接收文件并将其传递给服务层进行处理。
    - **文件存储**: 文件将被保存到服务器。
    - **元数据**: 文件的元数据将被记录到数据库。
    - **覆盖逻辑**: 如果上传了同名文件，现有文件将被覆盖。
    - **TODO**: 此接口后续需要触发对文件的RAG索引流程。
    """
    processed_files = knowledge_service.process_upload_files(db=db, files=files)
    return processed_files