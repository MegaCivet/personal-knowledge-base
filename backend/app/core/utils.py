import asyncio
import threading
from snowflakekit import SnowflakeGenerator, SnowflakeConfig

# 定义一个自定义的起始时间戳 (epoch), 单位为毫秒
# 这里设置为 2024-01-01 00:00:00 UTC
# 这个值一旦确定，就不能再改变，否则未来可能生成重复的ID
CUSTOM_EPOCH = 1704067200000

class IdGenerator:
    """
    一个线程安全的雪花ID生成器单例。
    使用 snowflakekit 库。
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
                    # 显式创建一个配置，并传入自定义的 epoch
                    config = SnowflakeConfig(epoch=CUSTOM_EPOCH)
                    # 初始化 snowflakekit 生成器
                    cls._instance.generator = SnowflakeGenerator(config=config)
        return cls._instance

    def generate_id(self) -> int:
        """
        生成一个新的雪花ID (同步版本)。
        
        因为 snowflakekit 的 'generate' 是一个异步方法,
        而我们的调用环境是同步的，我们使用 asyncio.run() 来运行它。
        """
        return asyncio.run(self.generator.generate())

# 创建一个全局唯一的生成器实例
id_generator = IdGenerator()

def get_snowflake_id() -> int:
    """
    一个方便调用的函数，用于获取新的雪花ID。
    """
    return id_generator.generate_id()