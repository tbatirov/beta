import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileParser from './FileParser';
import EditableFinancialTable from './EditableFinancialTable';
import GaapToIfrsConverter from './GaapToIfrsConverter';
import Reconciliation from './Reconciliation';
import DisclosureGenerator from './DisclosureGenerator';
import FinancialHealthAnalysis from './FinancialHealthAnalysis';
import ReportGenerator from './ReportGenerator';
import { ParsedData } from '../utils/fileParsers';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { Project } from '../types/project';

interface ConvertedStatement {
  name: string;
  gaapData: ParsedData;
  ifrsData: ParsedData;
}

interface ConverterProps {
  projects: Project[];
  updateProject: (updatedProject: Project) => void;
}

const Converter: React.FC<ConverterProps> = ({ projects, updateProject }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [statements, setStatements] = useState<ConvertedStatement[]>([]);
  const [convertedStatements, setConvertedStatements] = useState<ConvertedStatement[]>([]);
  const [disclosures, setDisclosures] = useState<{ standard: string; content: string }[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [financialHealthAnalysis, setFinancialHealthAnalysis] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const project = projects.find(p => p.id === projectId);
  const { t } = useTranslation();

  const handleParsingComplete = (parsedFiles: { name: string; data: ParsedData }[]) => {
    logger.log(LogLevel.INFO, 'Parsing complete', { parsedFiles });
    const newStatements = parsedFiles.map(file => ({
      name: file.name,
      gaapData: file.data,
      ifrsData: {}
    }));
    setStatements(prevStatements => [...prevStatements, ...newStatements]);
    setCurrentStep(2);
  };

  const handleParsingError = (error: string) => {
    logger.log(LogLevel.ERROR, 'Error parsing file', { error });
  };

  const handleDataEdit = (index: number, newData: ParsedData) => {
    logger.log(LogLevel.INFO, 'Data edited', { index, newData });
    const updatedStatements = [...statements];
    updatedStatements[index].gaapData = newData;
    setStatements(updatedStatements);
  };

  const handleConversionComplete = (convertedStatements: ConvertedStatement[], explanations: string[], recommendations: string[]) => {
    logger.log(LogLevel.INFO, 'Conversion complete', { convertedStatements, explanations, recommendations });
    setConvertedStatements(convertedStatements);
    setExplanations(explanations);
    setRecommendations(recommendations);
    setCurrentStep(4);
  };

  const handleReconciliationComplete = (reconciledStatements: ConvertedStatement[]) => {
    logger.log(LogLevel.INFO, 'Reconciliation complete', { reconciledStatements });
    setConvertedStatements(reconciledStatements);
    setCurrentStep(5);
  };

  const handleDisclosuresGenerated = (generatedDisclosures: { standard: string; content: string }[]) => {
    logger.log(LogLevel.INFO, 'Disclosures generated', { generatedDisclosures });
    setDisclosures(generatedDisclosures);
    setCurrentStep(6);
  };

  const handleFinancialHealthAnalysisComplete = (analysis: any) => {
    logger.log(LogLevel.INFO, 'Financial health analysis complete', { analysis });
    setFinancialHealthAnalysis(analysis);
    setCurrentStep(7);
  };

  const handleReportGenerated = () => {
    logger.log(LogLevel.INFO, 'Report generated');
    if (project) {
      const updatedProject = {
        ...project,
        status: 'completed' as const,
        conversionHistory: [
          ...project.conversionHistory,
          {
            id: Date.now().toString(),
            date: new Date(),
            gaapData: statements[0].gaapData,
            ifrsData: convertedStatements[0].ifrsData,
            explanations,
            recommendations,
          },
        ],
        generatedReports: [...project.generatedReports, `Report_${Date.now()}.pdf`],
      };
      updateProject(updatedProject);
    }
    setCurrentStep(8);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileParser
            onParsingComplete={handleParsingComplete}
            onParsingError={handleParsingError}
          />
        );
      case 2:
        return (
          <EditableFinancialTable
            statements={statements}
            onDataChange={handleDataEdit}
          />
        );
      case 3:
        return (
          <GaapToIfrsConverter
            statements={statements}
            onConversionComplete={handleConversionComplete}
            onProgress={setProgress}
          />
        );
      case 4:
        return (
          <Reconciliation
            statements={convertedStatements}
            onReconciliationComplete={handleReconciliationComplete}
            onProgress={setProgress}
          />
        );
      case 5:
        return (
          <DisclosureGenerator
            statements={convertedStatements}
            onDisclosuresGenerated={handleDisclosuresGenerated}
            onProgress={setProgress}
          />
        );
      case 6:
        return (
          <FinancialHealthAnalysis
            statements={convertedStatements}
            onAnalysisComplete={handleFinancialHealthAnalysisComplete}
            onProgress={setProgress}
          />
        );
      case 7:
        return (
          <ReportGenerator
            statements={convertedStatements}
            disclosures={disclosures}
            explanations={explanations}
            recommendations={recommendations}
            financialHealthAnalysis={financialHealthAnalysis}
            onProgress={setProgress}
            onReportGenerated={handleReportGenerated}
          />
        );
      default:
        return null;
    }
  };

  const totalSteps = 7;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('converter.title')}</h1>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('converter.step', { step: currentStep, total: totalSteps })}</h2>
          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
              >
                <ArrowLeft size={20} className="mr-2" />
                {t('converter.previous')}
              </button>
            )}
            {currentStep < totalSteps && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
              >
                {t('converter.next')}
                <ArrowRight size={20} className="ml-2" />
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
      {renderStep()}
    </div>
  );
};

export default Converter;