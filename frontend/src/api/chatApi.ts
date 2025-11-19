import axios from 'axios';
import type { QueryResponse } from '../types/api';

const API_URL = '/api/v1/chat';

export const postQuery = async (query:string): Promise<QueryResponse> => {
  const response = await axios.post(`${API_URL}/query`, { query });
  return response.data;
};