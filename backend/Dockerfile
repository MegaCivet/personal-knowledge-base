# 使用轻量级的 Python 3.10 镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖（构建某些 Python 库可能需要）
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
# 使用阿里云镜像源加速下载（可选，视网络情况而定）
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 复制项目代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令：先执行数据库迁移，再启动 FastAPI 服务
# 注意：在生产环境中不使用 --reload
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000"]