import React from 'react';

interface DataPreviewProps {
  data: any;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  return (
    <div className="mt-4 bg-gray-100 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Data Preview</h3>
      <pre className="whitespace-pre-wrap overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default DataPreview;