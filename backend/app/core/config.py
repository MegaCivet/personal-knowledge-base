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


# --- LLM (DeepSeek) API 配置 ---
# 从环境变量中获取, 如果未设置则使用默认的开放平台地址
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "your-deepseek-api-key")
DEEPSEEK_API_BASE_URL = os.getenv("DEEPSEEK_API_BASE_URL", "https://api.deepseek.com/v1")
DEEPSEEK_MODEL_NAME = os.getenv("DEEPSEEK_MODEL_NAME", "deepseek-chat")

# --- Prompt 配置 ---
# 从环境变量加载System Prompt，如果未设置则使用默认值
SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT", "你是一名知识库检索助手，来帮助用户高效地检索知识库内容。")

# 从环境变量加载Prompt模板，如果未设置则使用默认模板
PROMPT_TEMPLATE = os.getenv(
    "PROMPT_TEMPLATE",
    """
请根据以下提供的上下文信息，简洁明了地回答用户的问题。
如果上下文中没有足够的信息，请明确告知“根据现有知识无法回答该问题”，不要编造答案。

【上下文信息】
---
{context}
---

【用户问题】
{query}
"""
)


# --- MySQL数据库配置 ---
# 从环境变量中获取数据库连接信息, 如果未设置则使用默认值
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "knowledge_base")

# 构建SQLAlchemy数据库连接URL
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
