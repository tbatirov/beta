import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { useTranslation } from 'react-i18next';

interface UpdatesComplianceProps {
  financialData: string | undefined;
  onComplianceComplete: (compliantData: any) => void;
}

const UpdatesCompliance: React.FC<UpdatesComplianceProps> = ({ financialData, onComplianceComplete }) => {
  const [complianceChecks, setComplianceChecks] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [parsedData, setParsedData] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (financialData) {
      generateInitialComplianceChecks(financialData);
    }
  }, [financialData]);

  const generateInitialComplianceChecks = async (data: string) => {
    logger.log(LogLevel.INFO, 'Generating initial compliance checks');
    setLoading(true);

    try {
      const parsedData = JSON.parse(data);
      setParsedData(parsedData);
      const initialChecks = await simulateComplianceChecks(parsedData);
      setComplianceChecks(initialChecks);
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error generating initial compliance checks', { error });
    } finally {
      setLoading(false);
    }
  };

  const simulateComplianceChecks = async (data: any): Promise<{ [key: string]: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    const checks: { [key: string]: boolean } = {};
    Object.keys(data).forEach(key => {
      checks[key] = Math.random() > 0.2; // 80% chance of being compliant
    });

    return checks;
  };

  const handleComplianceChange = (key: string, isCompliant: boolean) => {
    setComplianceChecks(prev => ({ ...prev, [key]: isCompliant }));
  };

  const handleSubmit = () => {
    const compliantData = Object.keys(complianceChecks).reduce((acc, key) => {
      if (complianceChecks[key]) {
        acc[key] = parsedData[key];
      }
      return acc;
    }, {} as any);

    onComplianceComplete(compliantData);
  };

  if (loading) {
    return <div>{t('updatesCompliance.loading')}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('updatesCompliance.title')}</h2>
      <p className="mb-4">
        {t('updatesCompliance.description')}
      </p>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th className="text-left">{t('updatesCompliance.item')}</th>
            <th className="text-left">{t('updatesCompliance.value')}</th>
            <th className="text-left">{t('updatesCompliance.compliant')}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(complianceChecks).map(([key, isCompliant]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{parsedData[key]}</td>
              <td>
                <input
                  type="checkbox"
                  checked={isCompliant}
                  onChange={(e) => handleComplianceChange(key, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
      >
        {t('updatesCompliance.confirmAndProceed')}
      </button>
    </div>
  );
};

export default UpdatesCompliance;