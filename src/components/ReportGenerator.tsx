import React, { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import { ParsedData } from '../utils/fileParsers';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ReportChatbot from './ReportChatbot';
import { generateReport } from '../utils/api';
import { useTranslation } from 'react-i18next';

interface ConvertedStatement {
  name: string;
  gaapData: ParsedData;
  ifrsData: ParsedData;
}

interface ReportGeneratorProps {
  statements: ConvertedStatement[];
  disclosures: { standard: string; content: string }[];
  explanations: string[];
  recommendations: string[];
  financialHealthAnalysis: {
    analysis: string;
    ratios: { [key: string]: number };
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  onProgress: (progress: number) => void;
  onReportGenerated: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  statements,
  disclosures,
  explanations,
  recommendations,
  financialHealthAnalysis,
  onProgress,
  onReportGenerated,
}) => {
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState<string>('');
  const [additionalDocuments, setAdditionalDocuments] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    generateReportContent();
  }, [statements, disclosures, explanations, recommendations, financialHealthAnalysis]);

  const generateReportContent = async () => {
    setGeneratingReport(true);
    onProgress(0);
    logger.log(LogLevel.INFO, 'Generating report content');

    try {
      const data = {
        statements,
        disclosures,
        explanations,
        recommendations,
        financialHealthAnalysis,
      };

      const content = await generateReport(data);
      setReportContent(content);
      onProgress(100);
      logger.log(LogLevel.INFO, 'Report content generated successfully');
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error generating report content', { error });
      setReportContent(t('reportGenerator.error'));
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownload = (format: 'pdf' | 'excel' | 'html') => {
    switch (format) {
      case 'pdf':
        generatePDF();
        break;
      case 'excel':
        generateExcel();
        break;
      case 'html':
        generateHTML();
        break;
    }
    onReportGenerated();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.html(reportContent, {
      callback: function (doc) {
        doc.save('IFRS_Report.pdf');
      },
      x: 10,
      y: 10,
    });
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(statements);
    XLSX.utils.book_append_sheet(wb, ws, "IFRS Report");
    XLSX.writeFile(wb, "IFRS_Report.xlsx");
  };

  const generateHTML = () => {
    const blob = new Blob([reportContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'IFRS_Report.html';
    link.click();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('reportGenerator.title')}</h2>
      {generatingReport ? (
        <div className="flex items-center justify-center">
          <Download className="animate-bounce mr-2" size={20} />
          <span>{t('reportGenerator.generating')}</span>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{t('reportGenerator.preview')}</h3>
            <div 
              className="border p-4 rounded-md max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: reportContent }}
            />
          </div>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => handleDownload('pdf')}
              className="btn-primary flex items-center"
            >
              <FileText className="mr-2" size={20} />
              {t('reportGenerator.downloadPDF')}
            </button>
            <button
              onClick={() => handleDownload('excel')}
              className="btn-secondary flex items-center"
            >
              <FileSpreadsheet className="mr-2" size={20} />
              {t('reportGenerator.downloadExcel')}
            </button>
            <button
              onClick={() => handleDownload('html')}
              className="btn-primary flex items-center"
            >
              <FileCode className="mr-2" size={20} />
              {t('reportGenerator.downloadHTML')}
            </button>
          </div>
          <ReportChatbot
            reportContent={reportContent}
            onUpdateReport={setReportContent}
            additionalDocuments={additionalDocuments}
            onUpdateAdditionalDocuments={setAdditionalDocuments}
          />
        </>
      )}
    </div>
  );
};

export default ReportGenerator;