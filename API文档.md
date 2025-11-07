# 知识库后端 API 文档

本文档为前端开发人员提供与后端API交互所需的详细信息。

## 基础信息

-   **API 根路径**: `/api/v1`
-   **Content-Type**: `application/json` (除非特别说明)

---

## 1. 知识库管理 (`/knowledge`)

### 1.1 上传知识文件

上传一个或多个 `.md` 文件到知识库进行处理和索引。

-   **Endpoint**: `POST /knowledge/upload`
-   **请求 (Request)**:
    -   **Method**: `POST`
    -   **Content-Type**: `multipart/form-data`
    -   **Body**:
        -   `files`: `List[File]` (必需)
            -   一个或多个文件。前端应使用 `files` 作为表单字段的 `name`。
            -   服务器端会校验文件扩展名，只接受 `.md` 文件。
-   **响应 (Response)**:
    -   **200 OK**: 文件处理成功。
        -   **Body**: `List[KnowledgeFileResponse]`
            ```json
            [
              {
                "filename": "example.md",
                "id": 1234567890,
                "created_at": "2025-11-07T10:00:00.000Z",
                "updated_at": "2025-11-07T10:00:00.000Z"
              }
            ]
            ```
    -   **400 Bad Request**: 请求无效（例如，没有提供文件，或文件类型不正确）。
        ```json
        {
          "detail": "没有提供任何文件"
        }
        ```
    -   **500 Internal Server Error**: 服务器内部处理失败。

---

## 2. 聊天 (`/chat`)

### 2.1 发起查询

向知识库发起一个问题，获取基于知识库内容的回答。

-   **Endpoint**: `POST /chat/query`
-   **请求 (Request)**:
    -   **Method**: `POST`
    -   **Body**: `QueryRequest`
        ```json
        {
          "query": "如何在Python中实现一个快速排序？"
        }
        ```
-   **响应 (Response)**:
    -   **200 OK**: 查询成功。
        -   **Body**: `QueryResponse`
            ```json
            {
              "answer": "根据知识库内容，快速排序的实现方式如下：\n\n```python\ndef quick_sort(arr):\n  # ...\n```\n",
              "sources": [
                {
                  "filename": "python_algorithms.md",
                  "content": "### 快速排序\n\n快速排序是一种高效的分治排序算法...",
                  "file_id": 98765,
                  "start_index": 1024
                }
              ]
            }
            ```
            -   `answer`: 模型的回答，可能包含Markdown格式（如代码块）。
            -   `sources`: 一个列表，包含本次回答所引用的所有知识来源片段。
    -   **500 Internal Server Error**: 服务器内部处理失败。
