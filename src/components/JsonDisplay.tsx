import React from 'react';

interface JsonDisplayProps {
  data: any;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  const renderFinancialData = (data: any): JSX.Element => {
    const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));

    return (
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Item</th>
            <th className="border border-gray-300 p-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map(([key, value], index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="border border-gray-300 p-2 font-medium">{key}</td>
              <td className="border border-gray-300 p-2 text-right">
                {typeof value === 'number' 
                  ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
                  : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md shadow overflow-x-auto max-h-96">
      {renderFinancialData(data)}
    </div>
  );
};

export default JsonDisplay;