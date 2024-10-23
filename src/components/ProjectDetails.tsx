import React from 'react';
import { X, File, Activity, FileText } from 'lucide-react';

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Project Information</h3>
          <p>Created: {project.createdAt.toLocaleDateString()}</p>
          <p>Status: {project.status}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            <File size={20} className="inline mr-2" />
            Uploaded Files ({project.uploadedFiles.length})
          </h3>
          <ul className="list-disc pl-6">
            {project.uploadedFiles.map((file) => (
              <li key={file.id}>
                {file.name} - {file.uploadDate.toLocaleDateString()} ({file.fileType})
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            <Activity size={20} className="inline mr-2" />
            Conversion History ({project.conversionHistory.length})
          </h3>
          <ul className="list-disc pl-6">
            {project.conversionHistory.map((conversion) => (
              <li key={conversion.id}>
                Conversion on {conversion.date.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            <FileText size={20} className="inline mr-2" />
            Generated Reports ({project.generatedReports.length})
          </h3>
          <ul className="list-disc pl-6">
            {project.generatedReports.map((report, index) => (
              <li key={index}>{report}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">User Actions</h3>
          <ul className="list-disc pl-6">
            {project.userActions.map((action) => (
              <li key={action.id}>
                {action.date.toLocaleDateString()} - {action.action}: {action.details}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;