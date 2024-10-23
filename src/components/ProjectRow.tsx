import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, File, Activity, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from '../types/project';
import { useTranslation } from 'react-i18next';

interface ProjectRowProps {
  project: Project;
  isExpanded: boolean;
  onToggleDetails: () => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({ project, isExpanded, onToggleDetails }) => {
  const createdAtDate = project.createdAt instanceof Date 
    ? project.createdAt 
    : new Date(project.createdAt);
  const { t } = useTranslation();

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-[var(--primary-color)]">{project.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{createdAtDate.toLocaleDateString()}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            {t(`projectManagement.${project.status}`)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span className="flex items-center">
            <File size={16} className="mr-1" /> {project.uploadedFiles.length}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span className="flex items-center">
            <Activity size={16} className="mr-1" /> {project.conversionHistory.length}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span className="flex items-center">
            <FileText size={16} className="mr-1" /> {project.generatedReports.length}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={onToggleDetails}
            className="text-[var(--primary-color)] hover:text-[var(--secondary-color)] mr-4 flex items-center"
          >
            {isExpanded ? <ChevronUp size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
            {isExpanded ? t('projectManagement.hideDetails') : t('projectManagement.viewDetails')}
          </button>
          <Link
            to={`/projects/${project.id}`}
            className="text-[var(--accent-color)] hover:text-[var(--secondary-color)] inline-flex items-center"
          >
            {t('projectManagement.openConverter')}
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-500">
              <p>{t('projectManagement.description')}: {project.description || t('projectManagement.noDescription')}</p>
              <p>{t('projectManagement.lastUpdated')}: {project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : t('projectManagement.notAvailable')}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ProjectRow;