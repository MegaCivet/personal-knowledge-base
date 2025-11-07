import axios from 'axios';

const API_URL = '/api/v1/knowledge';

export const uploadFile = async (options: any) => {
  const { onSuccess, onError, file, onProgress } = options;

  const formData = new FormData();
  // The name 'files' must match the backend endpoint parameter name.
  formData.append('files', file);

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event: any) => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        onProgress({ percent });
      },
    });
    onSuccess(response.data);
  } catch (err) {
    console.error(err);
    onError(err);
  }
};

export const getKnowledgeFiles = async () => {
  try {
    const response = await axios.get(`${API_URL}/files`);
    return response.data;
  } catch (error) {
    console.error("Error fetching knowledge files:", error);
    throw error;
  }
};
