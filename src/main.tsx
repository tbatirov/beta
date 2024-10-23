import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { I18nextProvider } from 'react-i18next';
import './i18n';
import i18n from './i18n';

// Set initial language
const savedLanguage = localStorage.getItem('i18nextLng');
if (savedLanguage) {
  i18n.changeLanguage(savedLanguage).catch(err => {
    console.error('Error changing language:', err);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
);