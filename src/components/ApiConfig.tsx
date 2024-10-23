import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { useTranslation } from 'react-i18next';

const ApiConfig: React.FC = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const savedOpenaiApiKey = localStorage.getItem('openaiApiKey');
    if (savedOpenaiApiKey) {
      setOpenaiApiKey(savedOpenaiApiKey);
      logger.log(LogLevel.INFO, 'API key loaded from localStorage');
    } else {
      logger.log(LogLevel.WARNING, 'No API key found in localStorage');
    }
  }, []);

  const handleOpenaiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
  };

  const handleSaveApiKeys = () => {
    try {
      localStorage.setItem('openaiApiKey', openaiApiKey);
      logger.log(LogLevel.INFO, 'API key saved successfully');
      setError(null);
      alert(t('apiConfig.saveSuccess'));
    } catch (err) {
      const errorMessage = t('apiConfig.saveError');
      logger.log(LogLevel.ERROR, errorMessage, { error: err });
      setError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('apiConfig.title')}</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">{t('common.error')}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="mb-4">
          {t('apiConfig.description')}
        </p>
        <div className="mb-4">
          <label htmlFor="openai-api-key" className="block text-sm font-medium text-gray-700 mb-1">
            {t('apiConfig.openaiApiKey')}
          </label>
          <input
            type="password"
            id="openai-api-key"
            value={openaiApiKey}
            onChange={handleOpenaiApiKeyChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={t('apiConfig.enterApiKey')}
          />
        </div>
        <button
          onClick={handleSaveApiKeys}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
        >
          {t('apiConfig.saveApiKey')}
        </button>
      </div>
    </div>
  );
};

export default ApiConfig;