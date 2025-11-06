# 个人语义化知识库

本项目是一个私有的、智能的知识库系统。用户可以上传自己的 Markdown 笔记，并通过自然语言提问，系统能够基于笔记内容提供精准、可溯源的答案。

## 项目结构

这是本项目的规划目录结构。

### 后端 (`backend/`)

后端是一个 Python FastAPI 应用，负责处理 RAG 流程、API 接口和数据持久化。

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── knowledge.py   # 用于文件上传和管理的 API
│   │       │   └── chat.py        # 用于聊天问答的 API
│   │       └── api.py             # 聚合所有 v1 版本的 API 路由
│   ├── core/
│   │   ├── config.py              # 处理配置和密钥
│   │   └── logging.py             # 日志设置
│   ├── services/
│   │   ├── rag_service.py         # 核心 RAG 流程逻辑
│   │   └── file_service.py        # 处理文件读写
│   ├── models/
│   │   ├── chat.py                # 用于聊天的 Pydantic 模型
│   │   └── knowledge.py           # 用于知识库的 Pydantic 模型
│   ├── db/
│   │   └── vector_store.py        # ChromaDB 的初始化与交互
│   └── main.py                    # FastAPI 应用入口
├── data/
│   ├── uploads/                   # 存放用户上传的 .md 文件
│   └── chroma_db/                 # 持久化的 ChromaDB 数据
├── .gitignore
├── requirements.txt               # Python 依赖
└── run.py                         # 启动服务器的脚本
```

### 前端 (`frontend/`)

前端是一个 React 单页应用，提供文件上传和聊天交互的用户界面。

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── knowledgeApi.js        # 知识库管理的 API 调用
│   │   └── chatApi.js             # 聊天功能的 API 调用
│   ├── components/
│   │   ├── UploadArea/            # 文件上传组件
│   │   ├── ChatWindow/            # 主聊天界面
│   │   ├── Message/               # 单条聊天消息气泡
│   │   └── SourceList/            # 显示答案的溯源文档
│   ├── hooks/
│   │   └── useChat.js             # 封装聊天逻辑的自定义 Hook
│   ├── pages/
│   │   └── HomePage.js            # 应用的主页面
│   ├── styles/
│   │   └── App.css                # 全局样式
│   ├── App.js                     # React 根组件
│   └── index.js                   # React 应用入口
├── .gitignore
└── package.json                   # NPM 依赖
```
