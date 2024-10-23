import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseFile, ParsedData } from '../utils/fileParsers';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { Upload, AlertCircle, FileText } from 'lucide-react';
import JsonDisplay from './JsonDisplay';
import { useTranslation } from 'react-i18next';

interface FileParserProps {
  onParsingComplete: (parsedFiles: { name: string; data: ParsedData }[]) => void;
  onParsingError: (error: string) => void;
}

const FileParser: React.FC<FileParserProps> = ({ onParsingComplete, onParsingError }) => {
  const [parsedFiles, setParsedFiles] = useState<{ name: string; data: ParsedData }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setError(null);
    const newParsedFiles: { name: string; data: ParsedData }[] = [];

    try {
      for (const file of acceptedFiles) {
        const parsedData = await parseFile(file);
        newParsedFiles.push({ name: file.name, data: parsedData });
      }

      setParsedFiles(prevFiles => [...prevFiles, ...newParsedFiles]);
      onParsingComplete(newParsedFiles);
      logger.log(LogLevel.INFO, 'Files parsed successfully', { fileCount: acceptedFiles.length });
    } catch (error) {
      const errorMessage = `Error parsing files: ${error instanceof Error ? error.message : String(error)}`;
      setError(errorMessage);
      onParsingError(errorMessage);
      logger.log(LogLevel.ERROR, errorMessage, { error });
    } finally {
      setIsLoading(false);
    }
  }, [onParsingComplete, onParsingError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">{t('fileParser.title')}</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <p>{t('fileParser.parsing')}</p>
        ) : isDragActive ? (
          <p>{t('fileParser.dropFiles')}</p>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">{t('fileParser.dragAndDrop')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('fileParser.supportedFormats')}</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      {parsedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">{t('fileParser.parsedFiles')}:</h3>
          {parsedFiles.map((file, index) => (
            <div key={index} className="mb-6">
              <h4 className="font-medium text-primary mb-2 flex items-center">
                <FileText size={20} className="mr-2" />
                {file.name}
              </h4>
              <JsonDisplay data={file.data} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileParser;