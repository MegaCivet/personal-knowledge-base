from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import SQLALCHEMY_DATABASE_URL

# 创建数据库引擎
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 创建一个数据库会话工厂
# autocommit=False: 事务需要手动提交
# autoflush=False: 在查询前不会自动刷新会话
# bind=engine: 将此会话工厂绑定到数据库引擎
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建一个 ORM 模型的基类，我们之后创建的所有模型都将继承这个类
Base = declarative_base()

# FastAPI 依赖项：获取数据库会话
def get_db():
    """
    一个 FastAPI 依赖项，用于提供数据库会话。
    它能确保数据库会话在请求处理完毕后总是被关闭，即使在处理过程中发生了错误。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
