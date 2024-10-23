import { logger } from '../logger';
import { LogLevel } from '../../types/logging';

export const chatbotQuery = async (question: string, context: string): Promise<string> => {
  logger.log(LogLevel.INFO, 'Processing chatbot query', { question, context });

  const apiKey = localStorage.getItem('openaiApiKey');

  if (!apiKey) {
    throw new Error('OpenAI API key is not set. Please configure it in the API Configuration page.');
  }

  const prompt = `Given the following context:

${context}

Answer the following question:

${question}

Provide a concise and relevant answer based on the given context.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant specializing in IFRS and financial reporting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    logger.log(LogLevel.INFO, 'Chatbot query processed successfully');
    return content;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error processing chatbot query', { error });
    throw error;
  }
};