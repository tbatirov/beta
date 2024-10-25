import { logger } from '../logger';
import { LogLevel } from '../../types/logging';
import { ParsedData } from '../fileParsers';
import { getApiKey } from '../apiKeyUtil';
import { removeMarkdown } from './index';


export const convertToIFRS = async (gaapData: ParsedData): Promise<{ ifrsData: ParsedData; explanations: string[]; recommendations: string[] }> => {
  logger.log(LogLevel.INFO, 'Converting GAAP to IFRS', { gaapData });

  const apiKey = getApiKey();

  const prompt = `Convert the following GAAP financial data to IFRS:

${JSON.stringify(gaapData, null, 2)}

Provide the converted IFRS data, explanations for significant changes, and recommendations for compliance. Return the response as a JSON object with the following structure and dont include any other text, codeblock or markdown sign other than the JSON response:
{
  "ifrsData": {     
    // "IFRS Value": converted value or number,
    // "GAAP Value": original value or number,
    // "Difference": value or number,
    // "Explanation": Explanation by IFRS even if no significant changes applied
  },
  "explanations": [
    // Array of explanation strings
  ],
  "recommendations": [
    // Array of recommendation strings
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a financial expert specializing in GAAP to IFRS conversions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const result = removeMarkdown(JSON.parse(content));

    logger.log(LogLevel.INFO, 'GAAP to IFRS conversion completed successfully', { result });
    return result;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error during GAAP to IFRS conversion', { error });
    throw error;
  }
};