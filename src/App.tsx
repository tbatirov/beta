import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import ProjectManagement from './components/ProjectManagement';
import Converter from './components/Converter';
import ApiConfig from './components/ApiConfig';
import RAGComponent from './components/RAGComponent';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import PrivateRoute from './components/PrivateRoute';
import { Project } from './types/project';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update document title and language attributes when language changes
    document.title = i18n.t('navigation.appName');
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const addProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description: '',
      createdAt: new Date(),
      status: 'idle',
      conversionHistory: [],
      uploadedFiles: [],
      userActions: [],
      generatedReports: [],
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <main className="container mx-auto mt-4 px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard projects={projects} />
                </PrivateRoute>
              } />
              <Route path="/projects" element={
                <PrivateRoute>
                  <ProjectManagement projects={projects} addProject={addProject} />
                </PrivateRoute>
              } />
              <Route path="/projects/:projectId" element={
                <PrivateRoute>
                  <Converter projects={projects} />
                </PrivateRoute>
              } />
              <Route path="/api-config" element={
                <PrivateRoute>
                  <ApiConfig />
                </PrivateRoute>
              } />
              <Route path="/rag" element={
                <PrivateRoute>
                  <RAGComponent knowledgeBases={[]} />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;