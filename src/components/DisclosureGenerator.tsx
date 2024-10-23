import React, { useState, useCallback } from 'react';
import { generateDisclosures } from '../utils/api';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { ParsedData } from '../utils/fileParsers';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DisclosureGeneratorProps {
  statements: { name: string; ifrsData: ParsedData }[];
  onDisclosuresGenerated: (disclosures: { standard: string; content: string }[]) => void;
  onProgress: (progress: number) => void;
}

const DisclosureGenerator: React.FC<DisclosureGeneratorProps> = ({
  statements,
  onDisclosuresGenerated,
  onProgress,
}) => {
  const [disclosures, setDisclosures] = useState<{ standard: string; content: string }[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const generateIfrsDisclosures = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    onProgress(0);

    try {
      const progressInterval = setInterval(() => {
        onProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const combinedIfrsData = statements.reduce((acc, statement) => {
        return { ...acc, ...statement.ifrsData };
      }, {});

      const generatedDisclosures = await generateDisclosures(combinedIfrsData);
      
      clearInterval(progressInterval);
      onProgress(100);

      setDisclosures(generatedDisclosures);
      logger.log(LogLevel.INFO, 'Disclosures generated successfully', { disclosuresCount: generatedDisclosures.length });
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error generating disclosures', { error });
      setError(t('common.error') + ': ' + (error instanceof Error ? error.message : String(error)));
      onProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [statements, onProgress, t]);

  const renderDisclosures = () => {
    if (!disclosures) return null;
    return (
      <div className="mt-4 space-y-4">
        {disclosures.map((disclosure, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-lg mb-2">{disclosure.standard}</h3>
            <p className="text-sm whitespace-pre-wrap">{disclosure.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('disclosureGenerator.title')}</h2>
      <p className="text-sm text-gray-600 mb-4">{t('disclosureGenerator.note')}</p>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">{t('common.error')}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isGenerating ? (
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin mr-2" size={20} />
          <span>{t('disclosureGenerator.generating')}</span>
        </div>
      ) : disclosures ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('disclosureGenerator.generatedDisclosures')}:</h3>
          {renderDisclosures()}
          <button
            onClick={() => onDisclosuresGenerated(disclosures)}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
          >
            {t('common.proceedToNextStep')}
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      ) : (
        <button
          onClick={generateIfrsDisclosures}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
        >
          {t('disclosureGenerator.generateDisclosures')}
          <RefreshCw className="ml-2" size={20} />
        </button>
      )}
    </div>
  );
};

export default DisclosureGenerator;