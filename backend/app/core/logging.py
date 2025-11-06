import logging
import sys

def setup_logging():
    """
    配置日志系统，将日志输出到控制台。
    """
    # 获取根日志记录器
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)  # 设置默认的日志级别为 INFO

    # 如果已经有处理器了，就直接返回，避免重复添加
    if logger.hasHandlers():
        return

    # 创建一个格式化器
    log_format = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # 创建一个流处理器 (StreamHandler)，将日志输出到标准输出 (控制台)
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(log_format)

    # 为根日志记录器添加处理器
    logger.addHandler(stream_handler)

    # 可以为特定的库（如 uvicorn 访问日志）设置不同的日志级别，以减少噪音
    # logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    # logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
