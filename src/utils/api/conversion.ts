import api from './client';

export const startConversion = async (projectId: string, fileId: string) => {
  const response = await api.post('/api/conversions/start', { projectId, fileId });
  return response.data;
};

export const updateConversionStep = async (
  stepId: string,
  data: {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    data?: any;
    error?: string;
  }
) => {
  const response = await api.put(`/api/conversions/step/${stepId}`, data);
  return response.data;
};

export const getConversion = async (id: string) => {
  const response = await api.get(`/api/conversions/${id}`);
  return response.data;
};

export const updateConversion = async (
  id: string,
  data: {
    originalData?: any;
    convertedData?: any;
    explanations?: string[];
    recommendations?: string[];
  }
) => {
  const response = await api.put(`/api/conversions/${id}`, data);
  return response.data;
};