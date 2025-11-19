import logging
from typing import List
from sqlalchemy.orm import Session

from app.services.rag_service import query_knowledge_base
from app.crud import crud_knowledge
from app.schemas.chat import QueryRequest, QueryResponse, SourceDocument
from app.core import config
from app.core.llm import get_llm_client # 导入获取客户端的函数

# 配置日志
logger = logging.getLogger(__name__)


async def generate_answer(db: Session, request: QueryRequest) -> QueryResponse:
    """
    生成答案的协调函数

    1. 检索: 从向量数据库中检索相关文档
    2. 构建: 构建 Prompt
    3. 生成: 调用大模型生成答案
    4. 格式化: 格式化源文档信息并返回
    """
    try:
        # 获取LLM客户端实例
        async_client = get_llm_client()

        # 1. 检索
        logger.info(f"开始为问题检索相关文档: {request.query[:50]}...")
        relevant_docs = query_knowledge_base(query=request.query, n_results=4)

        # 2. 构建 Prompt
        context = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
        prompt = config.PROMPT_TEMPLATE.format(context=context, query=request.query)
        logger.debug(f"构建的 Prompt: \n{prompt}")

        # 3. 生成
        logger.info("正在调用 DeepSeek LLM API 生成答案...")
        try:
            response = await async_client.chat.completions.create(
                model=config.DEEPSEEK_MODEL_NAME,
                messages=[
                    {"role": "system", "content": config.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                stream=False
            )
            llm_answer = response.choices[0].message.content
            logger.info("成功从 DeepSeek API 获取答案。")
        except Exception as llm_error:
            logger.error(f"调用 DeepSeek API 时发生错误: {llm_error}", exc_info=True)
            llm_answer = "抱歉，调用语言模型服务时出现问题，请稍后再试。"

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
                        start_index=doc.metadata.get("start_index"),
                        tag=db_file.tag
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