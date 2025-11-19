import axios from 'axios';

const API_URL = '/api/v1/knowledge';

// 更新类型定义，支持 tag
// 关键修复：将回调函数设为可选 (?)，以匹配 Ant Design 的 UploadRequestOption 类型
interface UploadOptions {
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
  file: File | any; // 放宽类型以兼容 RcFile
  onProgress?: (event: { percent: number }) => void;
  tag?: string; // 新增可选参数
}

export interface KnowledgeFile {
    id: number;
    filename: string;
    tag?: string; // 新增可选参数
    created_at: string;
    updated_at: string;
}

export const uploadFile = async (options: UploadOptions) => {
  const { onSuccess, onError, file, onProgress, tag } = options;

  const formData = new FormData();
  // The name 'files' must match the backend endpoint parameter name.
  formData.append('files', file);
  
  // 如果有 tag，则添加到 formData
  if (tag) {
    formData.append('tag', tag);
  }

  try {
    // --- 修改点：移除 headers 配置，让浏览器自动设置 multipart/form-data 和 boundary ---
    const response = await axios.post(`${API_URL}/upload`, formData, {
      onUploadProgress: (event: any) => {
        // 增加非空检查
        if (onProgress && event.total) {
           const percent = Math.floor((event.loaded / event.total) * 100);
           onProgress({ percent });
        }
      },
    });
    // 增加非空检查
    if (onSuccess) {
        onSuccess(response.data);
    }
  } catch (err) {
    console.error(err);
    // 增加非空检查
    if (onError) {
        onError(err);
    }
  }
};

export const getKnowledgeFiles = async (): Promise<KnowledgeFile[]> => {
  try {
    const response = await axios.get(`${API_URL}/files`);
    return response.data;
  } catch (error) {
    console.error("Error fetching knowledge files:", error);
    throw error;
  }
};