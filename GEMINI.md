# Gemini 开发日志与行动方案

本文档由您的 AI 开发助手 Gemini 生成，用于记录项目进度和规划后续任务。

---

## ✅ 已完成的工作

### v1.2 - 后端健壮性与性能优化 (2025年11月7日)

1.  **集成真实LLM**: 
    -   将原有的模拟LLM调用替换为对DeepSeek API的真实异步调用。
    -   创建了全局共享的`AsyncOpenAI`客户端，避免了重复实例化。

2.  **配置优化**: 
    -   将`PROMPT_TEMPLATE`和`SYSTEM_PROMPT`移至配置文件和环境变量中管理，提高了灵活性。

3.  **RAG流程优化**: 
    -   将文本分割器从`RecursiveCharacterTextSplitter`更换为对Markdown语法更友好的`MarkdownTextSplitter`，显著提升了对代码块等复杂结构的处理能力。

4.  **实现文件更新逻辑**: 
    -   增加了完整的“重新索引”流程。当重复上传文件时，系统会自动清理MySQL和ChromaDB中的旧索引数据，再创建新索引，确保了数据的一致性。

5.  **应用性能优化**: 
    -   将嵌入模型和LLM客户端的初始化逻辑从“首次请求时加载”（懒加载）修改为“应用启动时加载”（预加载），消除了首次API调用的冷启动延迟。

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

---

## 🚀 后续行动方案 (Next Action Plan)

后端的核心功能已趋于完善和稳定。现在，我们的重心将全面转向前端开发，以构建一个用户可以实际操作的应用界面。

### 阶段三：前端开发 (Frontend Development)

**目标**: 构建一个功能完整、界面友好的Web应用，让用户可以方便地上传知识文件并进行问答。

1.  **项目初始化**:
    -   使用 `Vite` 或 `Create React App` 搭建 React 项目框架。
    -   安装 `antd` (UI库), `axios` (HTTP客户端), `react-markdown` (用于渲染Markdown格式的答案和来源)。

2.  **页面与组件开发**:
    -   **主页 (`HomePage.js`):** 布局页面结构，包含左侧文件列表/上传区和右侧聊天窗口。
    -   **上传组件 (`UploadArea.js`):**
        -   实现文件拖拽和选择上传功能。
        -   调用 `POST /api/v1/knowledge/upload` 接口。
        -   显示上传进度和成功/失败状态。
        -   上传成功后，应能触发文件列表的刷新。
    -   **聊天窗口 (`ChatWindow.js`):**
        -   包含一个消息输入框和消息展示区。
        -   用户输入问题后，调用 `POST /api/v1/chat/query` 接口。
        -   支持 Loading 状态，在等待后端响应时给出提示。
    -   **消息组件 (`Message.js`):**
        -   用于展示用户问题和模型的回答。
        -   模型的回答（`answer`）应使用 `react-markdown` 进行渲染，以正确显示格式。
    -   **来源列表 (`SourceList.js`):**
        -   在模型回答下方，展示引用的来源 (`sources`)。
        -   每个来源应清晰地显示其来源文件名 (`filename`) 和具体的文本块内容 (`content`)，同样使用 `react-markdown` 渲染。

3.  **状态管理**:
    -   使用 React Hooks (`useState`, `useEffect`, `useContext`) 或状态管理库（如 Zustand, Redux Toolkit）来管理聊天记录、文件列表和应用加载状态。

4.  **接口联调**:
    -   编写 `api` 模块 (`chatApi.js`, `knowledgeApi.js`)，统一管理所有对后端的HTTP请求。
    -   完成所有组件与后端接口的联调测试。
