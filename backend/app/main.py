from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import time
import logging

from app.api.v1.api import api_router
from app.db.database import engine, Base, get_db
from app.models.knowledge_file import KnowledgeFile
from app.core.logging import setup_logging
from app.core.embedding import load_embedding_model
from app.core.llm import load_llm_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时执行
    setup_logging()
    logger = logging.getLogger(__name__)
    
    logger.info("应用启动，开始执行启动任务...")
    
    # 1. 创建数据库表
    logger.info("检查并创建数据库表...")
    Base.metadata.create_all(bind=engine)
    logger.info("数据库表检查与创建完成。")

    # 2. 预加载嵌入模型
    load_embedding_model()

    # 3. 预加载LLM客户端
    logger.info("预加载LLM客户端...")
    load_llm_client()
    logger.info("LLM客户端预加载完成。")

    logger.info("所有启动任务完成，应用准备就绪。")
    yield
    # 应用关闭时执行
    logger.info("应用关闭。")


app = FastAPI(
    title="Personal Knowledge Base API",
    description="API for managing and querying a personal knowledge base.",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/", tags=["Health Check"])
def read_root():
    """Health check endpoint to confirm the server is running."""
    return {"status": "ok"}

@app.get("/api/v1/test-sql-db", tags=["Test"])
def test_sql_db(db: Session = Depends(get_db)):
    """
    测试MySQL数据库连接和读写功能。
    会创建一个测试文件记录，存入数据库，然后查询出来并返回。
    """
    try:
        # 使用时间戳模拟一个简单的雪花ID
        test_id = int(time.time() * 1000)
        test_filename = f"test_file_{test_id}.md"
        
        # 创建模型实例
        db_file = KnowledgeFile(id=test_id, filename=test_filename)
        
        # 添加到会话并提交
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        # 查询刚刚创建的记录
        queried_file = db.query(KnowledgeFile).filter(KnowledgeFile.id == test_id).first()
        
        return {
            "status": "success",
            "message": "Successfully wrote to and read from the database.",
            "data": {
                "id": queried_file.id,
                "filename": queried_file.filename,
                "created_at": queried_file.created_at
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Include the v1 API router
app.include_router(api_router, prefix="/api/v1")
