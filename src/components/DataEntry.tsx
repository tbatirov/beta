import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface FinancialEntry {
  account: string;
  value: string;
}

interface CountryTemplate {
  [key: string]: FinancialEntry[];
}

interface DataEntryProps {
  onSubmit: (entries: FinancialEntry[]) => void;
}

const cisCountries = [
  'Armenia', 'Azerbaijan', 'Belarus', 'Kazakhstan', 'Kyrgyzstan',
  'Moldova', 'Russia', 'Tajikistan', 'Uzbekistan'
];

const countryTemplates: CountryTemplate = {
  Armenia: [
    { account: 'Revenue', value: '' },
    { account: 'Cost of Sales', value: '' },
    { account: 'Gross Profit', value: '' },
    { account: 'Operating Expenses', value: '' },
    { account: 'Net Income', value: '' },
  ],
  // Add templates for other countries here
};

const defaultTemplate: FinancialEntry[] = [
  { account: 'Assets', value: '' },
  { account: 'Liabilities', value: '' },
  { account: 'Equity', value: '' },
  { account: 'Revenue', value: '' },
  { account: 'Expenses', value: '' },
];

const DataEntry: React.FC<DataEntryProps> = ({ onSubmit }) => {
  const [selectedCountry, setSelectedCountry] = useState('Armenia');
  const [entries, setEntries] = useState<FinancialEntry[]>(countryTemplates[selectedCountry] || defaultTemplate);

  useEffect(() => {
    setEntries(countryTemplates[selectedCountry] || defaultTemplate);
  }, [selectedCountry]);

  const addEntry = () => {
    setEntries([...entries, { account: '', value: '' }]);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const updateEntry = (index: number, field: 'account' | 'value', value: string) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(entries);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Manual Data Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Select Country
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {cisCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={entry.account}
              onChange={(e) => updateEntry(index, 'account', e.target.value)}
              placeholder="Account"
              className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              value={entry.value}
              onChange={(e) => updateEntry(index, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => removeEntry(index)}
              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addEntry}
          className="mt-2 flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
        >
          <Plus size={20} className="mr-2" />
          Add Entry
        </button>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default DataEntry;