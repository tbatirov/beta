import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { ParsedData } from '../utils/fileParsers';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConvertedStatement {
  name: string;
  gaapData: ParsedData;
  ifrsData: ParsedData;
}

interface ReconciliationProps {
  statements: ConvertedStatement[];
  onReconciliationComplete: (reconciledStatements: ConvertedStatement[]) => void;
  onProgress: (progress: number) => void;
}

const Reconciliation: React.FC<ReconciliationProps> = ({ statements, onReconciliationComplete, onProgress }) => {
  const [adjustments, setAdjustments] = useState<Record<string, Record<string, string>>>({});
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconciledStatements, setReconciledStatements] = useState<ConvertedStatement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Initialize adjustments state
    const initialAdjustments: Record<string, Record<string, string>> = {};
    statements.forEach((statement) => {
      initialAdjustments[statement.name] = {};
      Object.keys(statement.ifrsData).forEach((key) => {
        initialAdjustments[statement.name][key] = '';
      });
    });
    setAdjustments(initialAdjustments);
  }, [statements]);

  const handleAdjustmentChange = (statementName: string, key: string, value: string) => {
    setAdjustments(prev => ({
      ...prev,
      [statementName]: {
        ...prev[statementName],
        [key]: value
      }
    }));
  };

  const handleReconcile = async () => {
    setIsReconciling(true);
    onProgress(10);

    try {
      const reconciledData: ConvertedStatement[] = statements.map(statement => ({
        ...statement,
        ifrsData: Object.entries(statement.ifrsData).reduce((acc, [key, value]) => {
          const adjustmentValue = adjustments[statement.name]?.[key] || '';
          acc[key] = adjustmentValue.trim() !== '' ? Number(adjustmentValue) || 0 : value;
          return acc;
        }, {} as ParsedData)
      }));

      // Simulate a delay to show progress
      for (let i = 20; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        onProgress(i);
      }

      logger.log(LogLevel.INFO, 'Reconciliation completed', { reconciledData });
      setReconciledStatements(reconciledData);
      onProgress(100);
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error during reconciliation', { error });
      setError(t('reconciliation.error', { error: String(error) }));
    } finally {
      setIsReconciling(false);
    }
  };

  const handleNextStep = () => {
    if (reconciledStatements) {
      onReconciliationComplete(reconciledStatements);
    }
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return String(value);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('reconciliation.title')}</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">{t('reconciliation.item')}</th>
            <th className="border p-2">{t('reconciliation.gaapValue')}</th>
            <th className="border p-2">{t('reconciliation.ifrsValue')}</th>
            <th className="border p-2">{t('reconciliation.difference')}</th>
            <th className="border p-2">{t('reconciliation.comment')}</th>
            <th className="border p-2">{t('reconciliation.adjustment')}</th>
          </tr>
        </thead>
        <tbody>
          {statements.map((statement) =>
            Object.entries(statement.ifrsData).map(([key, ifrsValue]) => {
              return (
                <tr key={`${statement.name}-${key}`}>
                  <td className="border p-2">{key}</td>
                  <td className="border p-2">{formatValue(ifrsValue["GAAP Value"])}</td>
                  <td className="border p-2">{formatValue(ifrsValue["IFRS Value"])}</td>
                  <td className="border p-2">{formatValue(ifrsValue["Difference"])}</td>
                  <td className="border p-2">{formatValue(ifrsValue["Explanation"])}</td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={adjustments[statement.name]?.[key] || ''}
                      onChange={(e) => handleAdjustmentChange(statement.name, key, e.target.value)}
                      placeholder={t('reconciliation.enterAdjustment')}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {!reconciledStatements ? (
        <button
          onClick={handleReconcile}
          disabled={isReconciling}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
        >
          {isReconciling ? t('reconciliation.reconciling') : t('reconciliation.completeReconciliation')}
        </button>
      ) : (
        <button
          onClick={handleNextStep}
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 flex items-center"
        >
          {t('reconciliation.proceedToDisclosures')}
          <ArrowRight className="ml-2" size={20} />
        </button>
      )}
    </div>
  );
};

export default Reconciliation;