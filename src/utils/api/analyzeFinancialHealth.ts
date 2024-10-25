import { logger } from '../logger';
import { LogLevel } from '../../types/logging';
import { ParsedData } from '../fileParsers';
import { getApiKey } from '../apiKeyUtil';
import { removeMarkdown } from './index';


export const analyzeFinancialHealth = async (ifrsData: ParsedData, language: string): Promise<{
  analysis: string;
  ratios: { [key: string]: number };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}> => {
  logger.log(LogLevel.INFO, 'Analyzing financial health', { ifrsData, language });

  const apiKey = getApiKey();

  const prompt = `
    Analyze the financial health based on the following IFRS financial data:
    ${JSON.stringify(ifrsData, null, 2)}

    Provide a comprehensive analysis in the following JSON format:
    {
      "analysis": "Detailed analysis text here...",
      "ratios": {
        "Current Ratio": 0.00,
        "Quick Ratio": 0.00,
        "Debt to Equity": 0.00,
        "Return on Assets": 0.00,
        "Return on Equity": 0.00
      },
      "strengths": [
        // "Strength point 1",
        // "Strength point 2"
      ],
      "concerns": [
        // "Concern point 1",
        // "Concern point 2"
      ],
      "recommendations": [
        // "Recommendation 1",
        // "Recommendation 2"
      ]
    }

    Please ensure:
    1. All numerical values are properly calculated
    2. The analysis is thorough and professional
    3. All strengths, concerns, and recommendations are specific and actionable
    4. The response is in the ${language} language
    5. The response must be valid JSON only
  `;

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
          {
            role: 'system',
            content: 'You are a financial analyst specializing in IFRS-based financial health assessment. Always respond with valid JSON.'
          },
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
    const content = removeMarkdown(data.choices[0].message.content);

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Failed to parse OpenAI response', { content, error });
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate and sanitize the response
    const sanitizedResult = {
      analysis: String(parsedResult.analysis || ''),
      ratios: Object.fromEntries(
        Object.entries(parsedResult.ratios || {}).map(([key, value]) => [
          key,
          typeof value === 'number' ? Number(value.toFixed(2)) : 0
        ])
      ),
      strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths.map(String) : [],
      concerns: Array.isArray(parsedResult.concerns) ? parsedResult.concerns.map(String) : [],
      recommendations: Array.isArray(parsedResult.recommendations) ? parsedResult.recommendations.map(String) : [],
    };

    logger.log(LogLevel.INFO, 'Financial health analysis completed successfully', { result: sanitizedResult });
    return sanitizedResult;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error during financial health analysis', { error });
    throw error;
  }
};