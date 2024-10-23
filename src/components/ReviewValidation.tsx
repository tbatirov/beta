import React, { useState, useEffect } from 'react';
import { ParsedData } from '../utils/fileParsers';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';

interface ReviewValidationProps {
  financialData: ParsedData;
  disclosures: string;
  onValidationComplete: () => void;
  onProgress: (progress: number) => void;
}

const ReviewValidation: React.FC<ReviewValidationProps> = ({ financialData, disclosures, onValidationComplete, onProgress }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  useEffect(() => {
    performValidation();
  }, [financialData, disclosures]);

  const performValidation = async () => {
    setIsValidating(true);
    onProgress(0);

    try {
      // Simulate progress
      for (let i = 10; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        onProgress(i);
      }

      // In a real-world scenario, you would perform actual validation here
      const results = {
        financialStatements: { valid: true, issues: [] },
        disclosures: { valid: true, issues: [] },
      };

      setValidationResults(results);
      onProgress(100);
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error performing validation', { error });
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidationComplete = () => {
    onValidationComplete();
  };

  if (isValidating) {
    return <div>Performing IFRS compliance checks...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">IFRS Compliance Review</h2>
      
      {validationResults && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Financial Statements</h3>
            <p className={`font-bold ${validationResults.financialStatements.valid ? 'text-green-500' : 'text-red-500'}`}>
              {validationResults.financialStatements.valid ? 'Valid' : 'Issues Found'}
            </p>
            {validationResults.financialStatements.issues.map((issue: string, index: number) => (
              <p key={index} className="text-red-500">{issue}</p>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">Disclosures</h3>
            <p className={`font-bold ${validationResults.disclosures.valid ? 'text-green-500' : 'text-red-500'}`}>
              {validationResults.disclosures.valid ? 'Valid' : 'Issues Found'}
            </p>
            {validationResults.disclosures.issues.map((issue: string, index: number) => (
              <p key={index} className="text-red-500">{issue}</p>
            ))}
          </div>

          <button
            onClick={handleValidationComplete}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
            disabled={!validationResults.financialStatements.valid || !validationResults.disclosures.valid}
          >
            {validationResults.financialStatements.valid && validationResults.disclosures.valid
              ? 'Confirm and Proceed'
              : 'Please Resolve Issues Before Proceeding'}
          </button>
        </>
      )}
    </div>
  );
};

export default ReviewValidation;