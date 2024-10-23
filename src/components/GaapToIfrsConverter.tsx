import React, { useState, useCallback, useEffect } from 'react';
import { ParsedData } from '../utils/fileParsers';
import { convertToIFRS } from '../utils/api';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConvertedStatement {
  name: string;
  gaapData: ParsedData;
  ifrsData: ParsedData;
}

interface GaapToIfrsConverterProps {
  statements: { name: string; gaapData: ParsedData }[];
  onConversionComplete: (convertedStatements: ConvertedStatement[], explanations: string[], recommendations: string[]) => void;
  onProgress: (progress: number) => void;
}

const GaapToIfrsConverter: React.FC<GaapToIfrsConverterProps> = ({ statements, onConversionComplete, onProgress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [convertedStatements, setConvertedStatements] = useState<ConvertedStatement[]>([]);
  const [allExplanations, setAllExplanations] = useState<string[]>([]);
  const [allRecommendations, setAllRecommendations] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();

  const handleConvert = useCallback(async () => {
    if (isConverting || currentIndex >= statements.length) return;

    setIsConverting(true);
    setError(null);
    onProgress((currentIndex / statements.length) * 100);

    try {
      const currentStatement = statements[currentIndex];
      logger.log(LogLevel.INFO, `Converting statement: ${currentStatement.name}`, { index: currentIndex, statement: currentStatement });

      const result = await convertToIFRS(currentStatement.gaapData);
      
      // Translate explanations and recommendations
      const translatedExplanations = result.explanations.map(exp => t('gaapToIfrs.explanation', { explanation: exp }));
      const translatedRecommendations = result.recommendations.map(rec => t('gaapToIfrs.recommendation', { recommendation: rec }));

      const newConvertedStatement: ConvertedStatement = {
        ...currentStatement,
        ifrsData: result.ifrsData,
      };

      setConvertedStatements(prev => [...prev, newConvertedStatement]);
      setAllExplanations(prev => [...prev, ...translatedExplanations]);
      setAllRecommendations(prev => [...prev, ...translatedRecommendations]);
      setCurrentIndex(prev => prev + 1);
      
      logger.log(LogLevel.INFO, `Converted statement: ${currentStatement.name}`, { index: currentIndex, convertedStatement: newConvertedStatement });
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error converting GAAP to IFRS', { error, statementIndex: currentIndex, statement: statements[currentIndex] });
      setError(`Failed to convert GAAP to IFRS for statement ${currentIndex + 1}. Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsConverting(false);
    }
  }, [currentIndex, statements, onProgress, t, isConverting]);

  useEffect(() => {
    if (currentIndex < statements.length && !isConverting) {
      handleConvert();
    } else if (currentIndex === statements.length && statements.length > 0) {
      logger.log(LogLevel.INFO, 'All statements converted', { convertedStatements, allExplanations, allRecommendations });
      onConversionComplete(convertedStatements, allExplanations, allRecommendations);
    }
  }, [currentIndex, statements.length, isConverting, handleConvert, convertedStatements, allExplanations, allRecommendations, onConversionComplete]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('gaapToIfrs.title')}</h2>
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">{t('common.error')}: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setCurrentIndex(0)}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <RefreshCw size={20} className="mr-2" />
            {t('gaapToIfrs.retry')}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p>{t('gaapToIfrs.progress', { current: currentIndex + 1, total: statements.length })}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(currentIndex / statements.length) * 100}%` }}></div>
            </div>
          </div>
          {isConverting ? (
            <p className="flex items-center">
              <RefreshCw size={20} className="animate-spin mr-2" />
              {t('gaapToIfrs.converting')}
            </p>
          ) : currentIndex === statements.length ? (
            <p className="text-green-600 font-semibold">{t('gaapToIfrs.complete')}</p>
          ) : null}
        </>
      )}
    </div>
  );
};

export default GaapToIfrsConverter;