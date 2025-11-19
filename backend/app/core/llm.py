import openai
from app.core import config

# 全局变量，用于存储LLM客户端的单例
_llm_client_instance: openai.AsyncOpenAI | None = None

def load_llm_client():
    """
    初始化LLM客户端并存储在全局变量中。
    此函数应在应用启动时调用。
    """
    global _llm_client_instance
    if _llm_client_instance is None:
        _llm_client_instance = openai.AsyncOpenAI(
            api_key=config.DEEPSEEK_API_KEY,
            base_url=config.DEEPSEEK_API_BASE_URL
        )

def get_llm_client() -> openai.AsyncOpenAI:
    """
    获取已加载的LLM客户端的全局单例。

    如果客户端尚未加载，将引发 RuntimeError。
    """
    if _llm_client_instance is None:
        raise RuntimeError("LLM客户端尚未初始化。请确保在应用启动时调用 load_llm_client()。")
    return _llm_client_instance
