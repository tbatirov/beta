import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ComparisonViewProps {
  originalContent: string;
  convertedContent: string;
}

interface FinancialStatement {
  [key: string]: number | string | FinancialStatement;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ originalContent, convertedContent }) => {
  const [originalStatement, setOriginalStatement] = useState<FinancialStatement>({});
  const [convertedStatement, setConvertedStatement] = useState<FinancialStatement>({});
  const [differences, setDifferences] = useState<string[]>([]);
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const parsedOriginal = JSON.parse(originalContent);
      const parsedConverted = JSON.parse(convertedContent);
      setOriginalStatement(parsedOriginal);
      setConvertedStatement(parsedConverted);
      setDifferences(findDifferences(parsedOriginal, parsedConverted));
      setError(null);
    } catch (err) {
      setError(t('comparisonView.parseError'));
    }
  }, [originalContent, convertedContent, t]);

  const findDifferences = (original: FinancialStatement, converted: FinancialStatement, path: string = ''): string[] => {
    const diffs: string[] = [];
    for (const key in original) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof original[key] === 'object' && typeof converted[key] === 'object') {
        diffs.push(...findDifferences(original[key] as FinancialStatement, converted[key] as FinancialStatement, currentPath));
      } else if (original[key] !== converted[key]) {
        diffs.push(currentPath);
      }
    }
    return diffs;
  };

  const handlePrevDiff = () => {
    setCurrentDiffIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextDiff = () => {
    setCurrentDiffIndex((prev) => (prev < differences.length - 1 ? prev + 1 : prev));
  };

  const renderFinancialStatement = (statement: FinancialStatement, isOriginal: boolean) => {
    const renderItem = (key: string, value: number | string | FinancialStatement, depth: number = 0): JSX.Element => {
      const isCurrentDiff = differences[currentDiffIndex] === key;
      const style = isCurrentDiff
        ? isOriginal
          ? 'bg-red-100'
          : 'bg-green-100'
        : depth === 0
        ? 'font-bold'
        : '';

      if (typeof value === 'object') {
        return (
          <React.Fragment key={key}>
            <tr className={`${style} bg-gray-100`}>
              <td colSpan={2} className="py-2 px-4 font-semibold" style={{ paddingLeft: `${depth * 20 + 16}px` }}>
                {key}
              </td>
            </tr>
            {Object.entries(value).map(([subKey, subValue]) => renderItem(`${key}.${subKey}`, subValue, depth + 1))}
          </React.Fragment>
        );
      } else {
        return (
          <tr key={key} className={style}>
            <td className="py-2 px-4" style={{ paddingLeft: `${depth * 20 + 16}px` }}>
              {key}
            </td>
            <td className="py-2 px-4 text-right">
              {typeof value === 'number'
                ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                : value}
            </td>
          </tr>
        );
      }
    };

    return (
      <table className="w-full border-collapse">
        <tbody>{Object.entries(statement).map(([key, value]) => renderItem(key, value))}</tbody>
      </table>
    );
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
        <strong className="font-bold">{t('common.error')}: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-4">{t('comparisonView.title')}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold mb-2">{t('comparisonView.originalStatement')}</h4>
          <div className="border rounded-md overflow-auto max-h-96">
            {renderFinancialStatement(originalStatement, true)}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">{t('comparisonView.convertedStatement')}</h4>
          <div className="border rounded-md overflow-auto max-h-96">
            {renderFinancialStatement(convertedStatement, false)}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold mb-2">{t('comparisonView.differences')}</h4>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handlePrevDiff}
            disabled={currentDiffIndex === 0}
            className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span>
            {t('comparisonView.differenceCount', { current: currentDiffIndex + 1, total: differences.length })}
          </span>
          <button
            onClick={handleNextDiff}
            disabled={currentDiffIndex === differences.length - 1}
            className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {differences.length > 0 && (
          <div className="bg-yellow-100 p-4 rounded-md">
            <p className="font-semibold">{t('comparisonView.differenceIn', { field: differences[currentDiffIndex] })}</p>
            <p className="text-red-500">
              {t('comparisonView.original')}: {JSON.stringify(getNestedValue(originalStatement, differences[currentDiffIndex]))}
            </p>
            <p className="text-green-500">
              {t('comparisonView.converted')}: {JSON.stringify(getNestedValue(convertedStatement, differences[currentDiffIndex]))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const getNestedValue = (obj: FinancialStatement, path: string): any => {
  return path.split('.').reduce((acc: any, part: string) => acc && acc[part], obj);
};

export default ComparisonView;