# Gemini 开发日志与行动方案

本文档由您的 AI 开发助手 Gemini 生成，用于记录项目进度和规划后续任务。

---

## ✅ 已完成的工作 (v1.0 - 2025年11月6日)

### 1. 项目初始化与架构设计
- **项目结构**: 创建了清晰的前后端分离目录结构，并编写了 `README.md`。
- **架构规划**: 确定了前后端技术栈，并规划了后端的业务分层架构（API层、服务层、CRUD层、模型层）。

### 2. 后端核心基础架构
- **Web 框架**: 搭建了基于 FastAPI 的基础 Web 应用骨架，并使用 `lifespan` 管理应用生命周期。
- **日志系统**: 配置了全局日志系统，用于输出格式化的调试与运行信息。
- **数据库 (MySQL)**: 
    - 成功集成了 SQLAlchemy，实现了与 MySQL 数据库的连接。
    - 定义了 `knowledge_files` 表的 ORM 模型。
    - 创建了用于测试数据库连接的临时接口。
- **ID 生成器**: 
    - 解决了雪花ID库的选型与依赖问题，最终确定并成功集成了 `snowflakekit`。
    - 实现了线程安全的单例 ID 生成器，并解决了同步/异步调用的问题。

### 3. 核心功能：文件上传接口 (`/api/v1/knowledge/upload`)
- **接口实现**: 初步完成了文件上传接口的完整后端逻辑。
- **分层实现**: 
    - **API 层**: 实现了接收文件、调用服务的“瘦”端点。
    - **服务层**: 实现了文件校验、保存文件、操作数据库的“胖”服务。
    - **CRUD 层**: 实现了与数据库表的原子化交互。
- **数据校验**: 使用 Pydantic Schema 定义了清晰的 API 输入输出模型。

---

## 🚀 后续行动方案 (Next Action Plan)

下一步，我们的核心是为项目注入“灵魂”——实现 RAG（检索增强生成）的核心功能。

### 阶段一：实现 RAG 之“索引” (Content Indexing)

**目标**: 在文件上传成功后，自动读取文件内容，将其向量化并存入 ChromaDB 向量数据库。

1.  **连接 ChromaDB**: 在 `app/db/vector_store.py` 中，编写代码初始化 ChromaDB 的持久化客户端，并准备好一个集合（Collection）用于存储向量。
2.  **创建 RAG 服务**: 在 `app/services/rag_service.py` 中创建一个核心函数，例如 `create_index_for_file(filepath: str)`。
3.  **实现处理流程**: 在上述函数中，使用 LangChain 实现完整的索引流水线：
    - **加载 (Load)**: 使用 `TextLoader` 读取文件内容。
    - **分割 (Split)**: 使用 `RecursiveCharacterTextSplitter` 将文本分割成小块 (chunks)。
    - **嵌入 (Embed)**: 初始化 `HuggingFaceEmbeddings` (使用 `m3e-base` 模型)，将文本块转换为向量。
    - **存储 (Store)**: 将向量及其元数据（如源文件名）存入 ChromaDB。
4.  **集成**: 在 `knowledge_service.py` 的文件处理流程中，当一个新文件被成功保存后，调用 `rag_service.create_index_for_file` 函数，触发索引流程。

### 阶段二：实现 RAG 之“检索与生成” (Retrieval & Generation)

**目标**: 实现 `/api/v1/chat/query` 接口，接收用户提问，从向量数据库中检索相关信息，并交由大模型生成答案。

1.  **定义 Schema**: 在 `app/schemas/` 下创建 `chat.py`，定义聊天请求和响应的 Pydantic 模型。
2.  **实现检索逻辑**: 在 `rag_service.py` 中创建 `query_knowledge_base` 函数。它接收用户问题，将其向量化，并在 ChromaDB 中进行相似度搜索，找出最相关的文本块。
3.  **实现生成逻辑**: 
    - 在服务层中，将用户问题和检索到的相关文本块组合成一个结构化的提示 (Prompt)。
    - 调用 DeepSeek API，将提示发送给大语言模型，获取最终答案。
4.  **更新端点**: 在 `app/api/v1/endpoints/chat.py` 中实现 `/query` 路由，调用服务层的 `query_knowledge_base` 函数并返回结果。

### 阶段三：前端开发 (Frontend Development)

**目标**: 构建用户交互界面。

1.  **初始化项目**: 使用 `Vite` 或 `Create React App` 搭建 React 项目框架。
2.  **安装依赖**: 安装 `antd` (UI库) 和 `axios` (HTTP客户端)。
3.  **组件开发**: 构建文件上传、聊天窗口、消息展示等核心组件。
4.  **接口联调**: 对接后端已实现的 `/upload` 和 `/query` 接口。
