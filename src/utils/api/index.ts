export function removeMarkdown(text: string): string {
    // Regular expression to find code block markdown signs
    const markdownRegex = /```[\w]*\n([\s\S]*?)```/g;
  
    // If the text does not contain any markdown signs, return the original text
    if (!markdownRegex.test(text)) {
      return text;
    }
  
    // Replace the markdown syntax with just the content inside
    return text.replace(markdownRegex, (_, codeContent) => {
      return codeContent.trim(); // Return only the code content
    });
  }

export { convertToIFRS } from './convertToIFRS';
export { generateDisclosures } from './generateDisclosures';
export { analyzeFinancialHealth } from './analyzeFinancialHealth';
export { chatbotQuery } from './chatbotQuery';
export { generateReport } from './generateReport';

