import { logger } from './logger';
import { LogLevel } from '../types/logging';

export interface MappedElement {
  type: 'table' | 'header' | 'footnote' | 'paragraph' | 'list';
  content: string | string[][];
  metadata?: {
    level?: number;
    footnoteNumber?: number;
    tableCaption?: string;
  };
}

export class DocumentMapper {
  private static instance: DocumentMapper;

  private constructor() {}

  public static getInstance(): DocumentMapper {
    if (!DocumentMapper.instance) {
      DocumentMapper.instance = new DocumentMapper();
    }
    return DocumentMapper.instance;
  }

  public mapDocument(content: string): MappedElement[] {
    logger.log(LogLevel.INFO, 'Starting document mapping');
    const lines = content.split('\n');
    const mappedElements: MappedElement[] = [];

    let currentElement: MappedElement | null = null;
    let tableRows: string[][] = [];

    lines.forEach((line, index) => {
      if (this.isHeader(line)) {
        if (currentElement) mappedElements.push(currentElement);
        currentElement = this.mapHeader(line);
      } else if (this.isTableStart(line)) {
        if (currentElement) mappedElements.push(currentElement);
        currentElement = null;
        tableRows = [];
      } else if (this.isTableEnd(line, tableRows)) {
        if (tableRows.length > 0) {
          mappedElements.push(this.mapTable(tableRows));
          tableRows = [];
        }
      } else if (tableRows.length > 0 || this.isTableRow(line)) {
        tableRows.push(this.parseTableRow(line));
      } else if (this.isFootnote(line)) {
        if (currentElement) mappedElements.push(currentElement);
        currentElement = this.mapFootnote(line);
      } else {
        if (currentElement && currentElement.type === 'paragraph') {
          currentElement.content += ' ' + line.trim();
        } else {
          if (currentElement) mappedElements.push(currentElement);
          currentElement = this.mapParagraph(line);
        }
      }

      if (index === lines.length - 1) {
        if (tableRows.length > 0) {
          mappedElements.push(this.mapTable(tableRows));
        } else if (currentElement) {
          mappedElements.push(currentElement);
        }
      }
    });

    logger.log(LogLevel.INFO, 'Document mapping completed', { elementCount: mappedElements.length });
    return mappedElements;
  }

  private isHeader(line: string): boolean {
    return /^#{1,6}\s/.test(line) || /^[A-Z][\w\s]+:$/.test(line);
  }

  private isTableStart(line: string): boolean {
    return line.includes('|') && line.trim().startsWith('|');
  }

  private isTableEnd(line: string, tableRows: string[][]): boolean {
    return (line.trim() === '' || !this.isTableRow(line)) && tableRows.length > 0;
  }

  private isTableRow(line: string): boolean {
    return line.includes('|') && line.trim().startsWith('|');
  }

  private isFootnote(line: string): boolean {
    return /^\[\d+\]/.test(line);
  }

  private mapHeader(line: string): MappedElement {
    const level = (line.match(/^#+/) || [''])[0].length || 1;
    return {
      type: 'header',
      content: line.replace(/^#+\s/, '').trim(),
      metadata: { level }
    };
  }

  private mapTable(rows: string[][]): MappedElement {
    return {
      type: 'table',
      content: rows,
      metadata: { tableCaption: 'Table Caption' } // You might want to extract this from the document
    };
  }

  private parseTableRow(line: string): string[] {
    return line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
  }

  private mapFootnote(line: string): MappedElement {
    const match = line.match(/^\[(\d+)\]/);
    return {
      type: 'footnote',
      content: line.replace(/^\[\d+\]\s*/, ''),
      metadata: { footnoteNumber: match ? parseInt(match[1]) : undefined }
    };
  }

  private mapParagraph(line: string): MappedElement {
    return {
      type: 'paragraph',
      content: line.trim()
    };
  }
}

export const documentMapper = DocumentMapper.getInstance();