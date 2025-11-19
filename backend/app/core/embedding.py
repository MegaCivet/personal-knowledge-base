import logging
import torch
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.config import EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

# --- 设备检测 ---
if torch.cuda.is_available():
    DEVICE = 'cuda'
    logger.info("检测到CUDA可用，将使用GPU进行嵌入计算。")
else:
    DEVICE = 'cpu'
    logger.warning("未检测到CUDA，将使用CPU进行计算。对于嵌入模型，这可能会非常慢。")

# 全局变量，用于存储嵌入模型的单例
_embedding_model_instance = None

def load_embedding_model():
    """
    初始化嵌入模型并存储在全局变量中。
    此函数应在应用启动时调用。
    """
    global _embedding_model_instance
    if _embedding_model_instance is None:
        logger.info(f"开始在应用启动时预加载嵌入模型: {EMBEDDING_MODEL_NAME} on device: {DEVICE}")
        logger.info("这可能需要一些时间，具体取决于模型大小和下载速度...")
        try:
            _embedding_model_instance = HuggingFaceEmbeddings(
                model_name=EMBEDDING_MODEL_NAME,
                model_kwargs={'device': DEVICE}
            )
            logger.info(f"嵌入模型在设备 {DEVICE} 上预加载成功。")
        except Exception as e:
            logger.critical(f"嵌入模型预加载失败! 应用无法启动。 错误: {e}", exc_info=True)
            raise

def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    获取已加载的嵌入模型的全局单例。

    如果模型尚未加载，将引发 RuntimeError。
    """
    if _embedding_model_instance is None:
        # 这个错误理论上不应该发生，因为模型应该在启动时被加载
        raise RuntimeError("嵌入模型尚未初始化。请确保在应用启动时调用 load_embedding_model()。")
    return _embedding_model_instance
