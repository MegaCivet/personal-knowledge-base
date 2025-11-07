import logging
from typing import List
from sqlalchemy.orm import Session

from app.services.rag_service import query_knowledge_base
from app.crud import crud_knowledge
from app.schemas.chat import QueryRequest, QueryResponse, SourceDocument

# 配置日志
logger = logging.getLogger(__name__)

# --- Prompt Template ---
# 使用 f-string 定义一个清晰的模板
PROMPT_TEMPLATE = """
请根据以下提供的上下文信息，简洁明了地回答用户的问题。
如果上下文中没有足够的信息，请明确告知“根据现有知识无法回答该问题”，不要编造答案。

【上下文信息】
---
{context}
---

【用户问题】
{query}
"""


async def generate_answer(db: Session, request: QueryRequest) -> QueryResponse:
    """
    生成答案的协调函数

    1. 检索: 从向量数据库中检索相关文档
    2. 构建: 构建 Prompt
    3. 生成: (模拟)调用大模型生成答案
    4. 格式化: 格式化源文档信息并返回
    """
    try:
        # 1. 检索
        logger.info( f"开始为问题检索相关文档: {request.query[:50]}..." )
        relevant_docs = query_knowledge_base(query=request.query, n_results=4)

        # 2. 构建 Prompt
        # 将检索到的文档内容拼接成上下文
        context = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
        
        # 使用模板构建最终的 prompt
        prompt = PROMPT_TEMPLATE.format(context=context, query=request.query)
        logger.debug(f"构建的 Prompt: \n{prompt}")

        # 3. (模拟) 生成
        # 在这里，我们将来会调用一个真正的大语言模型API (例如 DeepSeek, OpenAI)
        # 目前，我们使用一个占位符来模拟这个过程
        logger.info("正在调用 LLM 生成答案 (当前为模拟)...")
        # TODO: 替换为真实的 LLM API 调用
        llm_answer = f"这是一个根据您的问题 '{request.query}' 生成的模拟答案。\n" \
                     f"它基于 {len(relevant_docs)} 个相关的知识片段。"

        # 4. 格式化源文档
        sources = []
        if relevant_docs:
            logger.info(f"正在格式化 {len(relevant_docs)} 个源文档...")
            for doc in relevant_docs:
                file_id = doc.metadata.get("file_id")
                db_file = crud_knowledge.get(db, id=file_id)
                if db_file:
                    source = SourceDocument(
                        filename=db_file.filename,
                        content=doc.page_content,
                        file_id=file_id,
                        start_index=doc.metadata.get("start_index")
                    )
                    sources.append(source)
                else:
                    logger.warning(f"未在数据库中找到 file_id 为 {file_id} 的文件记录")

        logger.info("答案生成和格式化完成。")
        return QueryResponse(answer=llm_answer, sources=sources)

    except Exception as e:
        logger.error(f"生成答案过程中发生错误: {e}", exc_info=True)
        # 在真实应用中，这里可能需要一个更具体的异常类型
        raise