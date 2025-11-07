from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.chat import QueryRequest, QueryResponse
from app.services.chat_service import generate_answer

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_chat(
    request: QueryRequest,
    db: Session = Depends(get_db)
):
    """
    接收用户查询，返回生成的答案和相关的源文档。
    """
    try:
        response = await generate_answer(db=db, request=request)
        return response
    except Exception as e:
        # 在生产环境中，应该对异常进行更详细的记录和分类处理
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred: {str(e)}"
        )