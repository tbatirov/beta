import React from 'react';

interface FinancialStatementPreviewProps {
  htmlContent: string;
  title: string;
}

const FinancialStatementPreview: React.FC<FinancialStatementPreviewProps> = ({
  htmlContent,
  title
}) => {
  return (
    <div className="financial-statement bg-white p-6 rounded-lg shadow-md w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div 
        className="overflow-auto max-h-[500px] text-sm"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
};

export default FinancialStatementPreview;