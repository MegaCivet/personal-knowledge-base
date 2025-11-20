# Gemini 开发日志与行动方案

本文档由您的 AI 开发助手 Gemini 生成，用于记录项目进度和规划后续任务。

## ✅ 已完成的工作 (Completed)

### v1.3 - 前端基础功能实现 (Frontend MVP) (2025年11月19日)

**状态**: ✅ 已完成

1. **项目脚手架**:
   - 使用 `Vite + React + TypeScript` 搭建了高性能的前端框架。
   - 配置了 `Ant Design` 作为 UI 组件库，确保了界面的专业性和美观度。
2. **核心组件开发**:
   - **`HomePage`**: 采用了左右分栏的响应式布局，左侧管理文件，右侧对话。
   - **`UploadArea`**: 实现了拖拽上传、文件列表展示、按标签分组显示以及修改标签的功能。
   - **`ChatWindow`**: 实现了类似于 ChatGPT 的对话界面，支持 Markdown 渲染和来源溯源展示。
   - **`TagManager`**: 提供了独立的标签管理模态框，支持增删标签。
3. **前后端联调**:
   - 封装了 `api/knowledgeApi.ts` 和 `api/chatApi.ts`，完成了文件上传、列表获取、标签管理和问答查询的所有接口对接。
   - 解决了跨域代理 (`vite.config.ts`) 问题。

### v1.2 - 后端健壮性与性能优化 (2025年11月7日)

**状态**: ✅ 已完成

1. **集成真实LLM**:
   - 将原有的模拟LLM调用替换为对DeepSeek API的真实异步调用。
   - 创建了全局共享的`AsyncOpenAI`客户端，避免了重复实例化。
2. **配置优化**:
   - 将`PROMPT_TEMPLATE`和`SYSTEM_PROMPT`移至配置文件和环境变量中管理。
3. **RAG流程优化**:
   - 将文本分割器更换为`MarkdownTextSplitter`，提升了代码块处理能力。
4. **实现文件更新逻辑**:
   - 增加了完整的“重新索引”流程（先删后加），确保数据一致性。
5. **应用性能优化**:
   - 实现了嵌入模型和LLM客户端的**应用启动时预加载**，消除了首屏延迟。

### v1.1 - RAG索引功能实现 (2025年11月7日)

**状态**: ✅ 已完成

1. **数据库扩展**: 新增 `knowledge_file_chunks` 表，建立元数据关联。
2. **RAG服务层**: 实现了加载 -> 分割 -> 嵌入 -> 存储 (MySQL + ChromaDB) 的完整流水线。
3. **高效模型加载**: 实现了嵌入模型的单例模式和 GPU/CPU 自动检测。

## 🚀 后续行动方案 (Next Action Plan)

为了将本项目从一个“功能原型”升级为**真正好用的个人主力知识库工具**，我们将按照以下阶段进行迭代。

### 阶段四：部署与运维 (DevOps & Deployment) —— 優先級 P0

**目标**: 实现一键启动，降低使用门槛，确保数据安全。

- [ ] **Docker 化**:
  - 编写 `backend/Dockerfile` 和 `frontend/Dockerfile`。
  - 编写 `docker-compose.yml`，编排 Backend, Frontend, MySQL 服务。
  - **目标**: 用户只需运行 `docker-compose up -d` 即可使用，无需手动配环境。
- [ ] **数据备份方案**:
  - 编写简单的 Shell 脚本，定期备份 MySQL 数据 (`sql dump`) 和 ChromaDB 文件夹。

### 阶段五：核心体验升级 (Core Experience Upgrade) —— 優先級 P1

**目标**: 解决交互上的“痛点”，让对话更自然，支持更多资料格式。

- [ ] **多轮对话 (Multi-turn Chat)**:
  - **后端**: 修改 `QueryRequest`，接收 `history` 字段；在 `chat_service` 中将历史对话拼接入 Prompt。
  - **前端**: 在 `ChatWindow` 中维护对话上下文，并在发送请求时携带。
- [ ] **PDF 支持**:
  - **后端**: 引入 `PyMuPDF` 或 `LangChain PyPDFLoader`。
  - **逻辑**: 在上传接口增加文件类型判断，针对 `.pdf` 执行特定的解析策略。
- [ ] **流式响应 (Streaming)**:
  - **后端**: 改写 `/chat/query` 接口，使用 `StreamingResponse` 和 Server-Sent Events (SSE)。
  - **前端**: 改造 `ChatWindow` 的请求逻辑，实现打字机效果，提升主观响应速度。

### 阶段六：高级功能 (Advanced Features) —— 優先級 P2

**目标**: 提升检索准确率和知识管理的便捷性。

- [ ] **混合检索 (Hybrid Search)**:
  - 引入 BM25 关键词检索，解决专有名词搜不到的问题。
- [ ] **来源预览 (Source Preview)**:
  - **前端**: 点击来源卡片时，弹出模态框。
  - **后端**: 新增接口 `GET /knowledge/{file_id}/content`，支持按需获取文件全文。
- [ ] **系统设置页**:
  - 前端增加设置页面，允许用户动态调整 LLM 的 `Temperature` 和 System Prompt。
