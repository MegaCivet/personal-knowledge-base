from fastapi import APIRouter

from app.api.v1.endpoints import knowledge, chat ,tags

api_router = APIRouter()
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(tags.router, prefix="/tags", tags=["Tags"])