import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConversionRules {
  revenueRecognition: 'IFRS15' | 'IAS18';
  leases: 'IFRS16' | 'IAS17';
  financialInstruments: 'IFRS9' | 'IAS39';
}

interface ConversionSettingsProps {
  rules: ConversionRules;
  onSave: (rules: ConversionRules) => void;
  onClose: () => void;
}

const ConversionSettings: React.FC<ConversionSettingsProps> = ({ rules, onSave, onClose }) => {
  const [localRules, setLocalRules] = useState<ConversionRules>(rules);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalRules(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(localRules);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('conversionSettings.title')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('conversionSettings.revenueRecognition')}</label>
          <select
            name="revenueRecognition"
            value={localRules.revenueRecognition}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="IFRS15">IFRS 15</option>
            <option value="IAS18">IAS 18</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('conversionSettings.leases')}</label>
          <select
            name="leases"
            value={localRules.leases}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="IFRS16">IFRS 16</option>
            <option value="IAS17">IAS 17</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('conversionSettings.financialInstruments')}</label>
          <select
            name="financialInstruments"
            value={localRules.financialInstruments}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="IFRS9">IFRS 9</option>
            <option value="IAS39">IAS 39</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            {t('conversionSettings.saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionSettings;