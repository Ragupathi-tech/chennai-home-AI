import axios from 'axios';
import type {
  TokenResponse,
  User,
  PropertyPredictionRequest,
  PropertyPredictionResponse,
  PredictionHistoryListResponse,
  Locality,
  PropertyOptions,
  MarketSummary,
  ModelMetrics,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization Bearer token to all requests if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('chennaihome_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authApi = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/login', { email, password });
    return res.data;
  },

  async register(
    name: string,
    email: string,
    password: string,
    preferred_language = 'en'
  ): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/register', {
      name,
      email,
      password,
      preferred_language,
    });
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  async updateLanguage(lang: string): Promise<User> {
    const res = await apiClient.put<User>('/users/language', {
      preferred_language: lang,
    });
    return res.data;
  },
};

// Prediction endpoints
export const predictionApi = {
  async predict(data: PropertyPredictionRequest): Promise<PropertyPredictionResponse> {
    const res = await apiClient.post<PropertyPredictionResponse>('/predict', data);
    return res.data;
  },

  async getHistory(params?: {
    search?: string;
    area?: string;
    buildtype?: string;
    sort_by?: string;
    page?: number;
    page_size?: number;
  }): Promise<PredictionHistoryListResponse> {
    const res = await apiClient.get<PredictionHistoryListResponse>('/predictions', {
      params,
    });
    return res.data;
  },

  async getById(id: number): Promise<PropertyPredictionResponse> {
    const res = await apiClient.get<PropertyPredictionResponse>(`/predictions/${id}`);
    return res.data;
  },

  async deleteById(id: number): Promise<{ message: string; id: number }> {
    const res = await apiClient.delete<{ message: string; id: number }>(`/predictions/${id}`);
    return res.data;
  },
};

// Insights, Market & Options endpoints
export const insightsApi = {
  async getLocalities(): Promise<Locality[]> {
    const res = await apiClient.get<Locality[]>('/localities');
    return res.data;
  },

  async getPropertyOptions(): Promise<PropertyOptions> {
    const res = await apiClient.get<PropertyOptions>('/property-options');
    return res.data;
  },

  async getMarketSummary(): Promise<MarketSummary> {
    const res = await apiClient.get<MarketSummary>('/insights/market-summary');
    return res.data;
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await apiClient.get<ModelMetrics>('/model/metrics');
    return res.data;
  },

  async getHealth(): Promise<{ status: string; model_loaded: boolean }> {
    const res = await apiClient.get<{ status: string; model_loaded: boolean }>('/health');
    return res.data;
  },
};
