import { logger } from '../logger';
import { LogLevel } from '../../types/logging';
import { ParsedData } from '../fileParsers';
import { getApiKey } from '../apiKeyUtil';
import { removeMarkdown } from './index';


export const generateDisclosures = async (ifrsData: ParsedData): Promise<{ standard: string; content: string }[]> => {
  logger.log(LogLevel.INFO, 'Generating IFRS disclosures', { ifrsData });

  const apiKey = getApiKey();

  const prompt = localStorage.getItem('customDisclosuresPrompt') || `
    Generate IFRS disclosures for the following financial data:
    ${JSON.stringify(ifrsData, null, 2)}
    Provide detailed disclosures for each relevant IFRS standard, including explanations of significant accounting policies, judgments, and estimates. Format each disclosure as follows:
    
    IFRS X - Standard Name:
    [Disclosure content]

    IFRS Y - Another Standard:
    [Disclosure content]

    ...and so on for all relevant standards.
  `;

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
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response manually
    const disclosures = parseDisclosures(removeMarkdown(content));

    logger.log(LogLevel.INFO, 'IFRS disclosure generation completed successfully', { disclosures });
    return disclosures;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error during IFRS disclosure generation', { error });
    throw error;
  }
};

function parseDisclosures(content: string): { standard: string; content: string }[] {
  const disclosures: { standard: string; content: string }[] = [];
  const lines = content.split('\n');
  let currentStandard = '';
  let currentContent = '';

  for (const line of lines) {
    if (line.match(/^IFRS \d+ - /) || line.match(/^IAS \d+ - /)) {
      if (currentStandard && currentContent) {
        disclosures.push({ standard: currentStandard, content: currentContent.trim() });
      }
      currentStandard = line.trim();
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }

  if (currentStandard && currentContent) {
    disclosures.push({ standard: currentStandard, content: currentContent.trim() });
  }

  return disclosures;
}