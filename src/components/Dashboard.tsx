import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Clock, ArrowRight, BarChart2, DollarSign, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Project } from '../types/project';

interface DashboardProps {
  projects?: Project[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ projects = [] }) => {
  const [conversionStats, setConversionStats] = useState({
    totalConversions: 0,
    successfulConversions: 0,
    failedConversions: 0,
    averageConversionTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const calculateConversionStats = () => {
      const totalConversions = projects.length;
      const successfulConversions = projects.filter(p => p.status === 'completed').length;
      const failedConversions = projects.filter(p => p.status === 'idle').length;
      const averageConversionTime = projects.length > 0 ? 120 : 0; // Mock average time in seconds

      setConversionStats({
        totalConversions,
        successfulConversions,
        failedConversions,
        averageConversionTime,
      });
    };

    calculateConversionStats();
    setIsLoading(false);
  }, [projects]);

  const getRecentConversions = () => {
    return projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('dashboard.loading')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('dashboard.totalConversions')}
          value={conversionStats.totalConversions}
          icon={<FileText size={24} className="text-blue-600" />}
        />
        <StatCard
          title={t('dashboard.successfulConversions')}
          value={conversionStats.successfulConversions}
          icon={<CheckCircle size={24} className="text-green-500" />}
        />
        <StatCard
          title={t('dashboard.failedConversions')}
          value={conversionStats.failedConversions}
          icon={<AlertCircle size={24} className="text-red-500" />}
        />
        <StatCard
          title={t('dashboard.avgConversionTime')}
          value={`${conversionStats.averageConversionTime}s`}
          icon={<Clock size={24} className="text-indigo-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.recentConversions')}</h2>
          {projects.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {getRecentConversions().map((project) => (
                <li key={project.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <StatusIcon status={project.status} />
                    <div className="ml-4">
                      <Link to={`/projects/${project.id}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-200 transition duration-300 flex items-center"
                  >
                    {t('dashboard.viewDetails')}
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">{t('dashboard.noRecentConversions')}</p>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.conversionTrends')}</h2>
          <div className="space-y-4">
            <TrendItem
              icon={<BarChart2 size={20} className="text-blue-500" />}
              title={t('dashboard.weeklyConversions')}
              value="23"
              trend="+15%"
              trendUp={true}
            />
            <TrendItem
              icon={<DollarSign size={20} className="text-green-500" />}
              title={t('dashboard.averageProjectValue')}
              value="$15,000"
              trend="+5%"
              trendUp={true}
            />
            <TrendItem
              icon={<TrendingUp size={20} className="text-indigo-500" />}
              title={t('dashboard.conversionAccuracy')}
              value="98%"
              trend="+2%"
              trendUp={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  switch (status) {
    case 'completed':
      return <CheckCircle size={24} className="text-green-500" title={t('dashboard.statusCompleted')} />;
    case 'idle':
      return <AlertCircle size={24} className="text-red-500" title={t('dashboard.statusIdle')} />;
    case 'in-progress':
      return <Clock size={24} className="text-yellow-500" title={t('dashboard.statusInProgress')} />;
    default:
      return null;
  }
};

interface TrendItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

const TrendItem: React.FC<TrendItemProps> = ({ icon, title, value, trend, trendUp }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      {icon}
      <span className="ml-2 text-gray-700">{title}</span>
    </div>
    <div className="flex items-center">
      <span className="font-semibold mr-2">{value}</span>
      <span className={`text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trend}
      </span>
    </div>
  </div>
);

export default Dashboard;