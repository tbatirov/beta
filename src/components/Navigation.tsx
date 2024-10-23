import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Globe, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const NavItem: React.FC<{ to: string; title: string; isActive: boolean }> = ({ to, title, isActive }) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
          ? 'border-indigo-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {title}
    </Link>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'uz', label: 'O\'zbek' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('language-dropdown');
      const button = document.getElementById('language-button');
      if (
        dropdown &&
        button &&
        !dropdown.contains(event.target as Node) &&
        !button.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = async (code: string) => {
    try {
      await i18n.changeLanguage(code);
      setIsLanguageDropdownOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleLogout = () => {
    logout();
    // Force reload translations after logout
    i18n.reloadResources().then(() => {
      i18n.changeLanguage(i18n.language);
    });
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Logo className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">{t('navigation.appName')}</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavItem to="/" title={t('navigation.home')} isActive={location.pathname === '/'} />
              {isAuthenticated && (
                <>
                  <NavItem to="/dashboard" title={t('navigation.dashboard')} isActive={location.pathname === '/dashboard'} />
                  <NavItem to="/projects" title={t('navigation.projects')} isActive={location.pathname === '/projects'} />
                  <NavItem to="/api-config" title={t('navigation.apiConfig')} isActive={location.pathname === '/api-config'} />
                  <NavItem to="/rag" title={t('navigation.ragSystem')} isActive={location.pathname === '/rag'} />
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              <button
                id="language-button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center text-gray-500 hover:text-gray-700 transition duration-300 px-3 py-2 rounded-md"
              >
                <Globe size={20} className="mr-1" />
                {languages.find(lang => lang.code === i18n.language)?.label || 'English'}
                <ChevronDown size={16} className="ml-1" />
              </button>
              {isLanguageDropdownOpen && (
                <div
                  id="language-dropdown"
                  className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20 border border-gray-200"
                >
                  {languages.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => changeLanguage(code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        i18n.language === code
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut size={16} className="inline-block mr-1" />
                {t('navigation.logout')}
              </button>
            ) : (
              <>
                <NavItem to="/login" title={t('navigation.login')} isActive={location.pathname === '/login'} />
                <NavItem to="/register" title={t('navigation.register')} isActive={location.pathname === '/register'} />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;