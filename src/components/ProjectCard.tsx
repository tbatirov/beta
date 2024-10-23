import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, File, Activity, FileText } from 'lucide-react';
import { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewDetails }) => {
  // Convert the createdAt string to a Date object if it's not already
  const createdAtDate = project.createdAt instanceof Date 
    ? project.createdAt 
    : new Date(project.createdAt);

  return (
    <div className="card hover:shadow-xl transition duration-300">
      <h3 className="text-xl font-semibold mb-2 text-[var(--primary-color)]">{project.name}</h3>
      <p className="text-sm text-gray-500 mb-4">
        Created: {createdAtDate.toLocaleDateString()}
      </p>
      <p className="text-sm font-medium mb-4 bg-blue-100 text-blue-800 py-1 px-2 rounded-full inline-block">
        Status: {project.status}
      </p>
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium flex items-center">
          <File size={16} className="mr-1 text-gray-500" /> {project.uploadedFiles.length} files
        </span>
        <span className="text-sm font-medium flex items-center">
          <Activity size={16} className="mr-1 text-gray-500" /> {project.conversionHistory.length} conversions
        </span>
        <span className="text-sm font-medium flex items-center">
          <FileText size={16} className="mr-1 text-gray-500" /> {project.generatedReports.length} reports
        </span>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => onViewDetails(project)}
          className="btn-secondary flex-grow text-center"
        >
          View Details
        </button>
        <Link
          to={`/projects/${project.id}`}
          className="btn-primary flex-grow text-center flex items-center justify-center"
        >
          Open Converter
          <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;