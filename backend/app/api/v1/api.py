from fastapi import APIRouter

from app.api.v1.endpoints import knowledge, chat

api_router = APIRouter()
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
