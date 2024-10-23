import React, { useState, useCallback } from 'react';
import { analyzeFinancialHealth } from '../utils/api';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { ParsedData } from '../utils/fileParsers';
import { useTranslation } from 'react-i18next';

interface FinancialHealthAnalysisProps {
  statements: { name: string; ifrsData: ParsedData }[];
  onAnalysisComplete: (analysis: FinancialHealthData) => void;
  onProgress: (progress: number) => void;
}

interface FinancialHealthData {
  analysis: string;
  ratios: { [key: string]: number };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

const defaultAnalysis: FinancialHealthData = {
  analysis: '',
  ratios: {},
  strengths: [],
  concerns: [],
  recommendations: []
};

const FinancialHealthAnalysis: React.FC<FinancialHealthAnalysisProps> = ({
  statements,
  onAnalysisComplete,
  onProgress,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FinancialHealthData | null>(null);
  const { t, i18n } = useTranslation();

  const validateAnalysisData = (data: any): FinancialHealthData => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid analysis data structure');
    }

    return {
      analysis: typeof data.analysis === 'string' ? data.analysis : '',
      ratios: typeof data.ratios === 'object' && data.ratios ? data.ratios : {},
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      concerns: Array.isArray(data.concerns) ? data.concerns : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : []
    };
  };

  const performAnalysis = useCallback(async () => {
    if (isAnalyzing || !statements.length) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    onProgress(0);

    try {
      const progressInterval = setInterval(() => {
        onProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // Combine all IFRS data from statements
      const combinedIfrsData = statements.reduce((acc, statement) => {
        if (!statement.ifrsData || typeof statement.ifrsData !== 'object') {
          throw new Error(`Invalid IFRS data for statement: ${statement.name}`);
        }
        return { ...acc, ...statement.ifrsData };
      }, {});

      if (Object.keys(combinedIfrsData).length === 0) {
        throw new Error('No valid IFRS data found in statements');
      }

      const result = await analyzeFinancialHealth(combinedIfrsData, i18n.language);
      clearInterval(progressInterval);
      
      const validatedResult = validateAnalysisData(result);
      setAnalysis(validatedResult);
      onProgress(100);
      
      logger.log(LogLevel.INFO, 'Financial health analysis completed successfully', { 
        analysisData: validatedResult 
      });
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error analyzing financial health', { error });
      setError(t('common.error') + ': ' + (error instanceof Error ? error.message : String(error)));
      setAnalysis(defaultAnalysis);
      onProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  }, [statements, onProgress, t, i18n.language]);

  const renderRatios = () => {
    if (!analysis?.ratios || Object.keys(analysis.ratios).length === 0) {
      return null;
    }

    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('financialHealthAnalysis.keyRatios')}:</h3>
        <ul className="list-disc list-inside">
          {Object.entries(analysis.ratios).map(([key, value]) => (
            <li key={key} className="text-sm">
              {key}: {typeof value === 'number' ? value.toFixed(2) : value}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSection = (
    items: string[],
    title: string,
    translationKey: string
  ) => {
    if (!items.length) return null;

    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}:</h3>
        <ul className="list-disc list-inside">
          {items.map((item, index) => (
            <li key={index} className="text-sm">
              {t(translationKey, { [translationKey.split('.')[1]]: item })}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-4">
        {analysis.analysis && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {t('financialHealthAnalysis.analysisTitle')}:
            </h3>
            <p className="text-sm">{analysis.analysis}</p>
          </div>
        )}
        {renderRatios()}
        {renderSection(
          analysis.strengths,
          t('financialHealthAnalysis.strengths'),
          'financialHealthAnalysis.strength'
        )}
        {renderSection(
          analysis.concerns,
          t('financialHealthAnalysis.concerns'),
          'financialHealthAnalysis.concern'
        )}
        {renderSection(
          analysis.recommendations,
          t('financialHealthAnalysis.recommendations'),
          'financialHealthAnalysis.recommendation'
        )}
      </div>
    );
  };

  if (!statements.length) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-yellow-700">
          {t('financialHealthAnalysis.noStatements')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('financialHealthAnalysis.title')}</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">{t('common.error')}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isAnalyzing ? (
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin mr-2" size={20} />
          <span>{t('financialHealthAnalysis.analyzing')}</span>
        </div>
      ) : analysis ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('financialHealthAnalysis.results')}:</h3>
          {renderAnalysis()}
          <button
            onClick={() => onAnalysisComplete(analysis)}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
          >
            {t('common.proceedToNextStep')}
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      ) : (
        <button
          onClick={performAnalysis}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
        >
          {t('financialHealthAnalysis.analyze')}
          <RefreshCw className="ml-2" size={20} />
        </button>
      )}
    </div>
  );
};

export default FinancialHealthAnalysis;