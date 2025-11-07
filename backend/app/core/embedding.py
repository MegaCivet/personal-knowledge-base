import logging
import torch
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.config import EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

# --- 设备检测 ---
# 检测系统中是否有可用的CUDA设备（NVIDIA GPU）
if torch.cuda.is_available():
    DEVICE = 'cuda'
    logger.info("检测到CUDA可用，将使用GPU进行嵌入计算。")
else:
    DEVICE = 'cpu'
    logger.warning("未检测到CUDA，将使用CPU进行计算。对于嵌入模型，这可能会非常慢。")

# 全局变量，用于存储嵌入模型的单例
_embedding_model_instance = None

def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    获取嵌入模型的全局单例。

    在首次调用时，会根据检测到的设备（优先GPU）初始化模型实例。
    后续调用将直接返回已创建的实例。
    """
    global _embedding_model_instance
    if _embedding_model_instance is None:
        logger.info(f"开始初始化嵌入模型: {EMBEDDING_MODEL_NAME} on device: {DEVICE}")
        logger.info("这可能需要一些时间，具体取决于模型大小和下载速度...")
        try:
            _embedding_model_instance = HuggingFaceEmbeddings(
                model_name=EMBEDDING_MODEL_NAME,
                model_kwargs={'device': DEVICE}
            )
            logger.info(f"嵌入模型在设备 {DEVICE} 上初始化成功。")
        except Exception as e:
            logger.critical(f"嵌入模型初始化失败! 错误: {e}", exc_info=True)
            raise
    return _embedding_model_instance
