import { logger } from './logger';
import { LogLevel } from '../types/logging';

export const convertToIFRS = async (content: any): Promise<string> => {
  logger.log(LogLevel.INFO, 'Starting IFRS conversion');

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock conversion process
  const convertedHTML = `
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2">Item</th>
          <th class="border border-gray-300 p-2">Original Value</th>
          <th class="border border-gray-300 p-2">IFRS Value</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(content).map(([key, value]) => `
          <tr>
            <td class="border border-gray-300 p-2">${key}</td>
            <td class="border border-gray-300 p-2">${value}</td>
            <td class="border border-gray-300 p-2">${Number(value) * 1.1}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  logger.log(LogLevel.INFO, 'IFRS conversion completed');
  return convertedHTML;
};