# Gemini 开发日志与行动方案

本文档由您的 AI 开发助手 Gemini 生成，用于记录项目进度和规划后续任务。

---

## ✅ 已完成的工作

### v1.1 - RAG索引功能实现 (2025年11月7日)

1.  **数据库扩展**: 
    - 新增了 `knowledge_file_chunks` 表，用于存储文本块的元数据及其与源文件的关联。
    - 创建了相应的SQLAlchemy模型 (`knowledge_file_chunk.py`)、Pydantic Schema (`knowledge_chunk.py`) 和CRUD层 (`crud_knowledge_chunk.py`)。

2.  **RAG服务层**: 
    - 创建了模块化的 `rag_service.py`，将索引流程清晰地分解为加载、分割、嵌入和存储等多个带日志的步骤。
    - 实现了文件上传后，自动触发端到端索引的完整流程。

3.  **高效模型加载**: 
    - 创建了 `embedding.py` 模块，实现了嵌入模型的全局单例加载机制。
    - 优化了模型加载逻辑，使其优先使用GPU（CUDA），并在GPU不可用时自动回退到CPU，显著提升了性能。

4.  **环境与依赖调试**: 
    - 解决了因Python虚拟环境不匹配导致的一系列“找不到模块”问题。
    - 修正了因 `langchain` 库版本升级导致的多个模块导入路径错误，确保了应用的稳定运行。

### v1.0 项目初始化与架构设计(2025年11月6日)
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

下一步，我们的核心是实现RAG的另一半——“检索与生成”，让知识库能够真正地回答问题。

### 阶段二：实现 RAG 之“检索与生成” (Retrieval & Generation)

**目标**: 实现 `/api/v1/chat/query` 接口，接收用户提问，从向量数据库中检索相关信息，并交由大模型生成答案。

1.  **定义 Schema**: 在 `app/schemas/` 下创建 `chat.py`，用于定义聊天请求（如 `QueryRequest`）和响应（如 `QueryResponse`）的 Pydantic 模型。

2.  **实现检索逻辑**: 
    - 在 `rag_service.py` 中，创建一个新的 `query_knowledge_base` 函数。
    - 此函数将接收用户的提问字符串，使用已加载的嵌入模型将其向量化，然后在 ChromaDB 中执行相似度搜索，找出最相关的N个文本块及其内容。

3.  **实现生成服务**: 
    - 创建一个新的服务文件 `app/services/chat_service.py`。
    - 在其中创建一个 `generate_answer` 函数，它将调用 `rag_service.query_knowledge_base` 获取上下文。
    - **(关键步骤)** 此函数负责将用户的原始问题和检索到的上下文文本块组合成一个结构化的提示（Prompt）。
    - 调用一个外部大语言模型（LLM）的API（如DeepSeek），将此提示发送给它，并获取生成的答案。

4.  **创建聊天端点**: 
    - 创建 `app/api/v1/endpoints/chat.py` 文件。
    - 在其中实现 `/query` 路由，它接收来自前端的请求，调用 `chat_service.generate_answer` 函数，并将最终答案返回。

5.  **整合API路由**: 将新创建的 `chat` 路由添加到 `app/api/v1/api.py` 主API路由器中，使其在应用中生效。

### 阶段三：前端开发 (Frontend Development)

**目标**: 构建用户交互界面。

1.  **初始化项目**: 使用 `Vite` 或 `Create React App` 搭建 React 项目框架。
2.  **安装依赖**: 安装 `antd` (UI库) 和 `axios` (HTTP客户端)。
3.  **组件开发**: 构建文件上传、聊天窗口、消息展示等核心组件。
4.  **接口联调**: 对接后端已实现的 `/upload` 和 `/query` 接口。