import { logger } from '../logger';
import { LogLevel } from '../../types/logging';
import { ParsedData } from '../fileParsers';
import { getApiKey } from '../apiKeyUtil';
import { removeMarkdown } from './index';


export const generateDisclosures = async (ifrsData: ParsedData): Promise<{ standard: string; content: string }[]> => {
  logger.log(LogLevel.INFO, 'Generating IFRS disclosures', { ifrsData });

  const apiKey = getApiKey();

  const prompt = localStorage.getItem('customDisclosuresPrompt') || `
Analyze the financial statements

${JSON.stringify(ifrsData, null, 2)}

and generate disclosures for each applicable IFRS/IAS standard using this structure:

### IFRS/IAS Number - Standard Name:

1. Policy:
   - Main accounting policy
   - Any alternatives applied

2. Judgments & Estimates:
   - Key judgments
   - Critical estimates
   - Principal assumptions

3. Quantitative Disclosures:
   - Material amounts
   - Required calculations
   - Specific disclosures required by standard

4. Changes & Impacts:
   - Changes from prior period
   - Effects on financial statements

Rules for Generation:
1. Generate for all applicable standards based on the financial statements
2. Use clear, technical language
3. Include specific numbers and calculations
4. Highlight material judgments
5. Note significant changes
6. Cross-reference related disclosures
`;


logger.log(LogLevel.INFO, 'IFRS disclosure prompt', { prompt });

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
          { role: 'system', content: 'You are a financial expert specializing in IFRS disclosures.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    logger.log(LogLevel.INFO, 'IFRS disclosure raw response', { content });

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
    if (line.match(/^### IFRS \d+ - /) || line.match(/^### IAS \d+ - /)) {
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