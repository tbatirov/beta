import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { logger } from './logger';
import { LogLevel } from '../types/logging';

export interface ParsedData {
  [key: string]: string | number;
}

export const parseCSV = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const data: ParsedData = {};
        results.data.forEach((row: any, rowIndex: number) => {
          Object.entries(row).forEach(([key, value], colIndex) => {
            if (key.trim() !== '') {
              data[`${key}_${rowIndex}`] = value;
            }
          });
        });
        logger.log(LogLevel.INFO, 'CSV parsing complete', { fileName: file.name, rowCount: results.data.length });
        resolve(data);
      },
      error: (error) => {
        logger.log(LogLevel.ERROR, 'Error parsing CSV', { fileName: file.name, error });
        reject(new Error(`Failed to parse CSV: ${error}`));
      },
    });
  });
};

export const parseXLSX = async (file: File): Promise<ParsedData> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet(1);
    const data: ParsedData = {};

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const columnName = worksheet.getCell(1, colNumber).value?.toString() || `Column${colNumber}`;
        const key = `${columnName}_${rowNumber - 2}`; // Subtract 2 to start from 0 and account for header
        const value = cell.value;
        if (rowNumber > 1 && key.trim() !== '') { // Skip header row
          data[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        }
      });
    });

    logger.log(LogLevel.INFO, 'XLSX parsing complete', { fileName: file.name, rowCount: worksheet.rowCount });
    return data;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error parsing XLSX', { fileName: file.name, error });
    throw new Error(`Failed to parse XLSX: ${error}`);
  }
};

export const parsePDF = (file: File): Promise<ParsedData> => {
  // PDF parsing is more complex and requires a dedicated library
  // For now, we'll return a placeholder implementation
  return new Promise((resolve, reject) => {
    logger.log(LogLevel.WARNING, 'PDF parsing not implemented', { fileName: file.name });
    reject(new Error('PDF parsing is not implemented yet'));
  });
};

const convertMatrixToFlatTable = (data: any[][]): ParsedData => {
  const flatData: ParsedData = {};
  const headers = data[0];

  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const key = `${headers[colIndex]}_${rowIndex - 1}`;
      flatData[key] = row[colIndex];
    }
  }

  return flatData;
};

export const parseFile = async (file: File): Promise<ParsedData> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  let parsedData: ParsedData;

  switch (fileType) {
    case 'csv':
      parsedData = await parseCSV(file);
      break;
    case 'xlsx':
      parsedData = await parseXLSX(file);
      break;
    case 'pdf':
      parsedData = await parsePDF(file);
      break;
    default:
      throw new Error('Unsupported file type');
  }

  // Check if the parsed data is in matrix format
  if (Array.isArray(parsedData) && parsedData.every(Array.isArray)) {
    return convertMatrixToFlatTable(parsedData);
  }

  return parsedData;
};