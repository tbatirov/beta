import { logger } from './logger';
import { LogLevel } from '../types/logging';

export const safeJsonParse = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error parsing JSON', { error, jsonString });
    return null;
  }
};

export const formatJsonOutput = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error formatting JSON', { error, data });
    return String(data);
  }
};