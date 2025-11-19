import axios from 'axios';
import type { UploadOptions, KnowledgeFile, TagItem } from '../types/api';

const API_URL = '/api/v1';

// types moved to ../types/api

// --- Knowledge API ---

export const uploadFile = async (options: UploadOptions) => {
  const { onSuccess, onError, file, onProgress, tag } = options;
  const formData = new FormData();
  formData.append('files', file);
  if (tag) formData.append('tag', tag);

  try {
    const response = await axios.post(`${API_URL}/knowledge/upload`, formData, {
      onUploadProgress: (event: any) => {
        if (onProgress && event.total) {
           const percent = Math.floor((event.loaded / event.total) * 100);
           onProgress({ percent });
        }
      },
    });
    if (onSuccess) onSuccess(response.data);
  } catch (err) {
    console.error(err);
    if (onError) onError(err);
  }
};

export const getKnowledgeFiles = async (): Promise<KnowledgeFile[]> => {
  const response = await axios.get(`${API_URL}/knowledge/files`);
  return response.data;
};

// 修改点：fileId 参数类型改为 string
export const updateFileTag = async (fileId: string, newTag: string): Promise<KnowledgeFile> => {
  const response = await axios.patch(`${API_URL}/knowledge/${fileId}/tag`, { tag: newTag });
  return response.data;
};

// --- Tag API ---

export const getTags = async (): Promise<TagItem[]> => {
    const response = await axios.get(`${API_URL}/tags/`);
    return response.data;
};

export const createTag = async (name: string): Promise<TagItem> => {
    const response = await axios.post(`${API_URL}/tags/`, { name });
    return response.data;
};

// 修改点：id 参数类型改为 string
export const deleteTag = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/tags/${id}`);
};