import { logger } from './logger';
import { LogLevel } from '../types/logging';

const getLocalLlmApiUrl = (): string => {
  const savedApiUrl = localStorage.getItem('localLlmApiUrl');
  return savedApiUrl || 'http://localhost:5000/generate'; // Default URL if not set
};

export const generateText = async (prompt: string): Promise<string> => {
  logger.log(LogLevel.INFO, 'Starting text generation with local LLM');

  try {
    const response = await fetch(getLocalLlmApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Local LLM API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.generated_text;

    logger.log(LogLevel.INFO, 'Text generation completed successfully');
    return generatedText;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error during text generation', { error });
    throw new Error('Failed to generate text. Please try again later.');
  }
};

export const cleanData = async (content: any): Promise<string> => {
  const customPrompt = localStorage.getItem('customCleaningPrompt');
  const prompt = customPrompt
    ? customPrompt.replace('{FINANCIAL_DATA}', JSON.stringify(content, null, 2))
    : `Clean and structure the following financial data: ${JSON.stringify(content, null, 2)}`;

  return generateText(prompt);
};

export const convertToIFRS = async (content: any): Promise<string> => {
  const customPrompt = localStorage.getItem('customConversionPrompt');
  const prompt = customPrompt
    ? customPrompt.replace('{FINANCIAL_DATA}', JSON.stringify(content, null, 2))
    : `Convert the following financial data to IFRS standards: ${JSON.stringify(content, null, 2)}`;

  return generateText(prompt);
};