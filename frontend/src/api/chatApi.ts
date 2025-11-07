import axios from 'axios';

const API_URL = '/api/v1/chat';

interface QueryResponse {
  answer: string;
  sources: any[]; // Define a proper type for sources later
}

export const postQuery = async (query: string): Promise<QueryResponse> => {
  const response = await axios.post(`${API_URL}/query`, { query });
  return response.data;
};
