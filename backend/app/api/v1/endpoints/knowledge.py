from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form, Body
from sqlalchemy.orm import Session

from app.services import knowledge_service
from app.schemas.knowledge_file import KnowledgeFileResponse
from app.db.database import get_db
from app.db.vector_store import get_or_create_collection
from app.crud import crud_knowledge

router = APIRouter()


@router.get("/test_chroma", summary="测试 ChromaDB 连接")
async def test_chroma_connection():
    """
    一个临时端点，用于验证与 ChromaDB 的连接是否正常，
    并确认能否成功获取或创建集合。
    """
    try:
        collection = get_or_create_collection()
        return {
            "message": "成功连接到 ChromaDB 并获取/创建集合。",
            "collection_name": collection.name,
            "item_count": collection.count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"连接 ChromaDB 失败: {str(e)}")


@router.post("/upload", response_model=List[KnowledgeFileResponse])
def upload_files(
    files: List[UploadFile] = File(..., description="要上传的一个或多个 .md 文件"),
    tag: Optional[str] = Form(None, description="文件的分类标签"),
    db: Session = Depends(get_db)
):
    """
    上传一个或多个 Markdown 文件到知识库。
    """
    processed_files = knowledge_service.process_upload_files(db=db, files=files, tag=tag)
    return processed_files


@router.get("/files", response_model=List[KnowledgeFileResponse], summary="获取所有知识文件")
def get_all_files(
    db: Session = Depends(get_db)
):
    """
    获取所有已上传的知识文件列表。
    """
    return knowledge_service.get_all_knowledge_files(db=db)

@router.patch("/{file_id}/tag", response_model=KnowledgeFileResponse)
def update_file_tag(
    file_id: int,
    tag: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    return knowledge_service.update_file_tag(db=db, file_id=file_id, tag=tag)