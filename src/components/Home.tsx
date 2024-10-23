import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Shield, BarChart2, Upload, RefreshCw, Download } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">{t('home.title')}</span>
            <span className="block text-indigo-600 mt-2">{t('home.subtitle')}</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t('home.description')}
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link
              to="/projects"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
            >
              {t('home.startConversion')}
            </Link>
            <Link
              to="/dashboard"
              className="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition duration-300"
            >
              {t('home.viewDashboard')}
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('home.howItWorks')}</h2>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Upload className="h-8 w-8 text-indigo-600" />}
                title={t('home.step1Title')}
                description={t('home.step1Desc')}
              />
              <FeatureCard
                icon={<RefreshCw className="h-8 w-8 text-indigo-600" />}
                title={t('home.step2Title')}
                description={t('home.step2Desc')}
              />
              <FeatureCard
                icon={<Download className="h-8 w-8 text-indigo-600" />}
                title={t('home.step3Title')}
                description={t('home.step3Desc')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={<Globe className="h-8 w-8 text-indigo-600" />}
              title={t('home.globalCompliance')}
              description={t('home.globalComplianceDesc')}
            />
            <BenefitCard
              icon={<BarChart2 className="h-8 w-8 text-indigo-600" />}
              title={t('home.accurateAnalysis')}
              description={t('home.accurateAnalysisDesc')}
            />
            <BenefitCard
              icon={<Shield className="h-8 w-8 text-indigo-600" />}
              title={t('home.dataSecurity')}
              description={t('home.dataSecurityDesc')}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">{t('home.readyToStart')}</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/projects"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition duration-300"
              >
                {t('home.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-base text-gray-500">{description}</p>
  </div>
);

const BenefitCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-base text-gray-500">{description}</p>
  </div>
);

export default Home;