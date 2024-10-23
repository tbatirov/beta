import { logger } from './logger';
import { LogLevel } from '../types/logging';

const UNSTRUCTURED_API_URL = 'https://api.unstructured.io/general/v0/general';

export const sendToUnstructured = async (file: File): Promise<any> => {
  const apiKey = localStorage.getItem('unstructuredApiKey');

  if (!apiKey) {
    throw new Error('Unstructured.io API key is not set. Please configure it in the API Configuration page.');
  }

  const formData = new FormData();
  formData.append('files', file);
  formData.append('output_format', 'json');

  try {
    const response = await fetch(UNSTRUCTURED_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'unstructured-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Unstructured.io API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return processUnstructuredResponse(data);
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error sending file to Unstructured.io', { error });
    throw new Error('Failed to process file with Unstructured.io. Please try again later.');
  }
};

const processUnstructuredResponse = (data: any[]): any => {
  const processedData: { [key: string]: string | number } = {};

  data.forEach((item: any) => {
    if (item.type === 'table' && item.data) {
      item.data.forEach((row: string[], index: number) => {
        if (index === 0) return; // Skip header row
        if (row.length >= 2) {
          const key = row[0].trim();
          const value = row[1].trim();
          processedData[key] = isNaN(Number(value)) ? value : Number(value);
        }
      });
    } else if (item.type === 'key_value' && item.data) {
      const key = item.data.key?.trim();
      const value = item.data.value?.trim();
      if (key && value) {
        processedData[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    // Note: We're not processing 'narrative' type in this version
  });

  logger.log(LogLevel.INFO, 'Processed Unstructured.io response', { dataKeys: Object.keys(processedData) });
  return processedData;
};