import { logger } from './logger';
import { LogLevel } from '../types/logging';

export const getApiKey = (): string => {
  const apiKey = localStorage.getItem('openaiApiKey');
  if (!apiKey) {
    logger.log(LogLevel.ERROR, 'OpenAI API key is not set');
    throw new Error('OpenAI API key is not set. Please configure it in the API Configuration page.');
  }
  return apiKey;
};