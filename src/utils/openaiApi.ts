import { logger } from './logger';
import { LogLevel } from '../types/logging';
import { ParsedData } from './fileParsers';

// ... (keep existing functions, including convertToIFRS)

export const generateDisclosures = async (ifrsData: ParsedData): Promise<{ standard: string; content: string }[]> => {
  logger.log(LogLevel.INFO, 'Generating IFRS disclosures', { ifrsData });

  const apiKey = localStorage.getItem('openaiApiKey');

  if (!apiKey) {
    throw new Error('OpenAI API key is not set. Please configure it in the API Configuration page.');
  }

  const prompt = `Generate IFRS disclosures for the following financial data:

${JSON.stringify(ifrsData, null, 2)}

Provide detailed disclosures for each relevant IFRS standard, including explanations of significant accounting policies, judgments, and estimates. Return the response as a JSON object with the following structure:
{
  "disclosures": [
    {
      "standard": "IFRS X - Standard Name",
      "content": "Detailed disclosure content..."
    },
    ...
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
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a financial expert specializing in IFRS disclosures.' },
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

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      logger.log(LogLevel.ERROR, 'Error parsing OpenAI response', { content, parseError });
      throw new Error('Failed to parse OpenAI response. The response may not be in the expected JSON format.');
    }

    if (!Array.isArray(result.disclosures)) {
      throw new Error('OpenAI response is missing required fields');
    }

    logger.log(LogLevel.INFO, 'IFRS disclosure generation completed successfully', { disclosures: result.disclosures });
    return result.disclosures;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error during IFRS disclosure generation', { error });
    throw error;
  }
};

// ... (keep all other existing functions, including chatbotQuery)