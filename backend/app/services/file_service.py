import os
import shutil
from fastapi import UploadFile

from app.core.config import UPLOADS_DIR

def save_upload_file(upload_file: UploadFile) -> str:
    """
    将上传的文件保存到本地磁盘。

    :param upload_file: FastAPI 的 UploadFile 对象。
    :return: 保存的文件路径。
    """
    # 确保上传目录存在
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    # 构建文件的完整保存路径
    file_path = os.path.join(UPLOADS_DIR, upload_file.filename)

    # 将文件内容写入磁盘
    # 使用 shutil.copyfileobj 可以高效地处理大文件
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path
