import axios from 'axios';

const API_URL = '/api/v1/chat';

export interface Source {
  filename: string;
  content: string;
  file_id: string; // 修改点：number -> string
  start_index: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
}

export const postQuery = async (query:string): Promise<QueryResponse> => {
  const response = await axios.post(`${API_URL}/query`, { query });
  return response.data;
};