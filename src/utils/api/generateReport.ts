import { logger } from '../logger';
import { LogLevel } from '../../types/logging';
import { getApiKey } from '../apiKeyUtil';
import { removeMarkdown } from './index';


export const generateReport = async (data: any): Promise<string> => {
  logger.log(LogLevel.INFO, 'Generating final report', { data });

  const apiKey = getApiKey();

  const prompt = `Generate a comprehensive IFRS-compliant financial report based on the following data:

${JSON.stringify(data, null, 2)}

The report should include:
1. Executive Summary
2. Financial Statements (Balance Sheet, Income Statement, Cash Flow Statement)
3. Notes to Financial Statements
4. Disclosures (use the provided disclosures data)
5. Financial Health Analysis (use the provided financial health analysis data)
6. Recommendations

Ensure that the disclosures and financial health analysis sections are detailed and accurately reflect the provided data. Format the report as an HTML string that can be directly rendered in a web browser. Use appropriate HTML tags for structure and styling.`;

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
          { role: 'system', content: 'You are a financial reporting expert specializing in IFRS-compliant reports.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    const content = responseData.choices[0].message.content;

    // Post-process the content to ensure proper formatting
    const formattedContent = postProcessReport(removeMarkdown(content), data);

    logger.log(LogLevel.INFO, 'Final report generation completed successfully');
    return formattedContent;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error during final report generation', { error });
    throw error;
  }
};

function postProcessReport(content: string, data: any): string {
  // Ensure disclosures are properly formatted
  if (data.disclosures) {
    let disclosuresHtml = '<h2>Disclosures</h2>';
    data.disclosures.forEach((disclosure: { standard: string; content: string }) => {
      disclosuresHtml += `
        <h3>${disclosure.standard}</h3>
        <p>${disclosure.content}</p>
      `;
    });
    content = content.replace('<h2>Disclosures</h2>', disclosuresHtml);
  }

  // Ensure financial health analysis is properly formatted
  if (data.financialHealthAnalysis) {
    let healthAnalysisHtml = '<h2>Financial Health Analysis</h2>';
    healthAnalysisHtml += `
      <p>${data.financialHealthAnalysis.analysis}</p>
      <h3>Key Financial Ratios</h3>
      <ul>
        ${Object.entries(data.financialHealthAnalysis.ratios).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
      </ul>
      <h3>Strengths</h3>
      <ul>
        ${data.financialHealthAnalysis.strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
      </ul>
      <h3>Concerns</h3>
      <ul>
        ${data.financialHealthAnalysis.concerns.map((concern: string) => `<li>${concern}</li>`).join('')}
      </ul>
      <h3>Recommendations</h3>
      <ul>
        ${data.financialHealthAnalysis.recommendations.map((recommendation: string) => `<li>${recommendation}</li>`).join('')}
      </ul>
    `;
    content = content.replace('<h2>Financial Health Analysis</h2>', healthAnalysisHtml);
  }

  return content;
}