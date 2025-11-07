import os
from dotenv import load_dotenv

# 从 .env 文件加载环境变量
load_dotenv()

# --- 路径配置 ---
# 项目根目录 (backend/app/core/config.py -> backend/..)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ChromaDB持久化存储路径
CHROMA_PERSIST_DIR = os.path.join(PROJECT_ROOT, "data", "chroma_db")

# 上传文件的存储路径
UPLOADS_DIR = os.path.join(PROJECT_ROOT, "data", "uploads")


# --- 模型与集合配置 ---
# ChromaDB中的集合名称
CHROMA_COLLECTION_NAME = "personal_knowledge_base"

# 使用的开源嵌入模型名称, 例如: 'm3e-base' 或 'bge-m3'
EMBEDDING_MODEL_NAME = "moka-ai/m3e-base"


# --- MySQL数据库配置 ---
# 从环境变量中获取数据库连接信息, 如果未设置则使用默认值
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "knowledge_base")

# 构建SQLAlchemy数据库连接URL
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
