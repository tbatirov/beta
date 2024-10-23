import { logger } from '../logger';
import { LogLevel } from '../../types/logging';
import { ParsedData } from '../fileParsers';
import { getApiKey } from '../apiKeyUtil';

export const convertToIFRS = async (gaapData: ParsedData): Promise<{ ifrsData: ParsedData; explanations: string[]; recommendations: string[] }> => {
  logger.log(LogLevel.INFO, 'Converting GAAP to IFRS', { gaapData });

  const apiKey = getApiKey();

  const prompt = `Convert the following GAAP financial data to IFRS:

${JSON.stringify(gaapData, null, 2)}

Provide the converted IFRS data, explanations for significant changes, and recommendations for compliance. Return the response as a JSON object with the following structure:
{
  "ifrsData": { ... },
  "explanations": [ ... ],
  "recommendations": [ ... ]
}`;

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
          { role: 'system', content: 'You are a financial expert specializing in GAAP to IFRS conversions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const result = JSON.parse(content);

    logger.log(LogLevel.INFO, 'GAAP to IFRS conversion completed successfully', { result });
    return result;} catch (error) {
    logger.log(LogLevel.ERROR, 'Error during GAAP to IFRS conversion', { error });
    throw error;
  }
};