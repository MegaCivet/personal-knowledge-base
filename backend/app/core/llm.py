import openai
from app.core import config

# --- OpenAI/DeepSeek Client ---
# 基于配置初始化一个全局共享的异步客户端
# 这个实例将在整个应用的生命周期内被复用
async_client = openai.AsyncOpenAI(
    api_key=config.DEEPSEEK_API_KEY,
    base_url=config.DEEPSEEK_API_BASE_URL
)
