import chromadb
import os
from app.core.config import CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME

# 确保存储目录存在
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

# 初始化 ChromaDB 客户端
# 使用 config.py 中定义的持久化路径
client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)


def get_vector_db_client() -> chromadb.Client:
    """
    返回 ChromaDB 客户端实例。
    """
    return client


def get_or_create_collection(name: str = CHROMA_COLLECTION_NAME) -> chromadb.Collection:
    """
    获取或创建一个 ChromaDB 集合。
    如果未指定名称，则使用 config.py 中定义的默认集合名称。
    """
    collection = client.get_or_create_collection(name)
    return collection
