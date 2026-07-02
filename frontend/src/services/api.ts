import axios, { AxiosError } from 'axios';
import { HealthResponse, AskResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';
const REQUEST_TIMEOUT = 180000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async (): Promise<HealthResponse | null> => {
  try {
    const response = await apiClient.get<HealthResponse>('/health', { timeout: 5000 });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const submitQuestion = async (question: string, temperature: number): Promise<AskResponse> => {
  try {
    const response = await apiClient.post<AskResponse>('/ask', {
      question: question.trim(),
      temperature,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 400) {
      const detail = (axiosError.response.data as any)?.detail || axiosError.response.data;
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    throw error;
  }
};

export const sendFeedback = async (question: string, answer: string, rating: string): Promise<boolean> => {
  try {
    const response = await apiClient.post('/feedback', {
      question,
      answer,
      rating,
    }, { timeout: 10000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};