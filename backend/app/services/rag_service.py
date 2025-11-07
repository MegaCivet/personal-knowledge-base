import logging
from typing import List
from sqlalchemy.orm import Session
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import MarkdownTextSplitter
from langchain_core.documents import Document

from langchain_chroma import Chroma

from app.core.embedding import get_embedding_model

from app.schemas.knowledge_chunk import KnowledgeFileChunkCreate
from app.crud import crud_knowledge_chunk

from app.core.config import CHROMA_COLLECTION_NAME,CHROMA_PERSIST_DIR

# 配置日志
logger = logging.getLogger(__name__)


def _load_document(file_path: str) -> List[Document]:
    """加载文本文件内容"""
    logger.info(f"开始加载文件: {file_path}")
    try:
        loader = TextLoader(file_path, encoding="utf-8")
        documents = loader.load()
        logger.info(f"文件加载成功: {file_path}")
        return documents
    except Exception as e:
        logger.error(f"加载文件失败: {file_path}, 错误: {e}", exc_info=True)
        raise


def _split_text(documents: List[Document]) -> List[Document]:
    """将文档分割成文本块"""
    logger.info(f"开始使用 MarkdownTextSplitter 分割 {len(documents)} 个文档")
    try:
        # 使用 MarkdownTextSplitter 替代 RecursiveCharacterTextSplitter
        text_splitter = MarkdownTextSplitter(
            chunk_size=500, # 块大小
            chunk_overlap=50, # 块重叠
        )
        chunks = text_splitter.split_documents(documents)
        # 手动为块添加 start_index, 因为 MarkdownTextSplitter 不会自动添加
        for i, chunk in enumerate(chunks):
            # 模拟一个大致的起始位置，实际场景可能需要更精确的计算
            # 但对于基于内容的检索，这个元数据的重要性相对较低
            chunk.metadata["start_index"] = i * (500 - 50) 

        logger.info(f"文档成功分割成 {len(chunks)} 个文本块")
        return chunks
    except Exception as e:
        logger.error(f"分割文档失败, 错误: {e}", exc_info=True)
        raise


def _embed_and_store(db: Session, chunks: List[Document], file_id: int):
    """
    (重构后) 
    使用 LangChain VectorStore 抽象来嵌入文本块并存储到向量数据库，
    然后将元数据存储到关系数据库。
    """
    logger.info(f"开始为 {len(chunks)} 个文本块创建嵌入并存储")
    try:
        # 1. 获取已初始化的嵌入模型单例
        logger.debug("获取嵌入模型实例...")
        # (这现在将返回来自 langchain_huggingface 的模型)
        embeddings = get_embedding_model() 
        
        # 2. 准备 ChromaDB 的 ID
        # (这部分逻辑很好，保持不变)
        ids = [f"{chunk.metadata['start_index']}-{file_id}" for chunk in chunks]

        # 3. [最佳实践] 将 file_id 添加到元数据中，以便向量库存储
        #    这有助于未来进行按文件ID进行的元数据过滤
        for chunk in chunks:
            chunk.metadata["file_id"] = file_id

        # 4. 初始化 LangChain Chroma 包装器并添加文档
        #    这一个步骤 = 初始化 + 自动嵌入 + 存储
        logger.info(f"正在将 {len(chunks)} 个文本块存入ChromaDB...")
        
        # 使用从 config.py 中加载的配置
        vector_store = Chroma(
            collection_name=CHROMA_COLLECTION_NAME,
            embedding_function=embeddings,
            persist_directory=CHROMA_PERSIST_DIR
        )

        # .add_documents() 会在内部自动处理嵌入
        vector_store.add_documents(documents=chunks, ids=ids)
        logger.info("存入ChromaDB成功")

        # 5. 存储到MySQL (这部分逻辑完全不变)
        logger.info(f"正在将 {len(ids)} 条文本块元数据存入MySQL...")
        chunks_to_create = [
            KnowledgeFileChunkCreate(vector_id=id, knowledge_file_id=file_id)
            for id in ids
        ]
        crud_knowledge_chunk.create_chunks(db=db, chunks_in=chunks_to_create)
        logger.info("存入MySQL成功")

    except Exception as e:
        logger.error(f"嵌入和存储过程失败, 错误: {e}", exc_info=True)
        raise


def create_index_for_file(db: Session, file_path: str, file_id: int):
    """
    为单个文件创建RAG索引的协调函数

    :param db: 数据库会话
    :param file_path: 文件的完整路径
    :param file_id: 文件在数据库中的ID
    """
    logger.info(f"开始为文件创建索引, file_id: {file_id}, path: {file_path}")
    try:
        # 1. 加载
        documents = _load_document(file_path)
        # 2. 分割
        chunks = _split_text(documents)
        # 3. 嵌入与存储
        _embed_and_store(db=db, chunks=chunks, file_id=file_id)
        logger.info(f"文件索引创建成功, file_id: {file_id}")
    except Exception as e:
        logger.error(f"文件索引创建失败, file_id: {file_id}, 错误: {e}", exc_info=True)
        # 向上层抛出异常，以便API可以返回错误信息
        raise


def query_knowledge_base(query: str, n_results: int = 4) -> List[Document]:
    """
    在向量数据库中查询与问题相关的文本块

    :param query: 用户的问题
    :param n_results: 希望返回的相关文本块数量
    :return: 一个包含相关文本块内容的 LangChain Document 列表
    """
    logger.info(f"开始在知识库中查询: '{query[:50]}...'")
    try:
        # 1. 获取嵌入模型
        embeddings = get_embedding_model()

        # 2. 初始化 ChromaDB 客户端
        vector_store = Chroma(
            collection_name=CHROMA_COLLECTION_NAME,
            embedding_function=embeddings,
            persist_directory=CHROMA_PERSIST_DIR
        )

        # 3. 执行相似度搜索
        logger.debug(f"正在执行相似度搜索，返回 {n_results} 个结果...")
        relevant_docs = vector_store.similarity_search(query=query, k=n_results)
        
        logger.info(f"查询到 {len(relevant_docs)} 个相关文档")
        
        # 4. 返回结果
        return relevant_docs
    except Exception as e:
        logger.error(f"知识库查询失败, 错误: {e}", exc_info=True)
        raise
