import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowRight, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Project } from '../types/project';
import { useTranslation } from 'react-i18next';

interface ProjectManagementProps {
  projects?: Project[];
  addProject?: (name: string) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ projects = [], addProject }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'idle' | 'in-progress' | 'completed'>('all');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() && addProject) {
      addProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || project.status === statusFilter)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('projects.title')}</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">{t('projects.instructions.title')}</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>{t('projects.instructions.step1')}</p>
              <p className="mt-1">{t('projects.instructions.step2')}</p>
              <p className="mt-1">{t('projects.instructions.step3')}</p>
              <p className="mt-1">{t('projects.instructions.step4')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('projects.createNew')}</h2>
        <form onSubmit={handleAddProject} className="flex">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder={t('projects.projectName')}
            className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            {t('projects.createNew')}
          </button>
        </form>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder={t('projects.searchProjects')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <div className="flex items-center">
          <Filter className="mr-2 text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('common.all')}</option>
            <option value="idle">{t('projects.status.idle')}</option>
            <option value="in-progress">{t('projects.status.inProgress')}</option>
            <option value="completed">{t('projects.status.completed')}</option>
          </select>
        </div>
      </div>
      
      {filteredProjects.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t(`projects.status.${project.status}`)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenProject(project.id)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-md transition duration-300 flex items-center justify-center"
                    >
                      {t('projects.openConverter')}
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('projects.noProjects')}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;