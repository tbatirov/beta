import React, { useState, useEffect } from 'react';
import RAGConfig, { RAGConfigType } from './RAGConfig';
import { LightRAG } from '../utils/lightRAG';
import { ifrsStandards } from '../utils/ifrsStandards';
import { ifrsPrompts } from '../utils/ifrsPrompts';
import { Loader2, Send, Globe, FileText, Database, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { useTranslation } from 'react-i18next';

interface RAGComponentProps {
  knowledgeBases: any[];
}

const RAGComponent: React.FC<RAGComponentProps> = ({ knowledgeBases: externalKnowledgeBases }) => {
  const [config, setConfig] = useState<RAGConfigType>({
    openAIApiKey: '',
    embeddingModel: 'text-embedding-ada-002',
    llmModel: 'gpt-3.5-turbo',
    temperature: 0,
    maxTokens: 100,
  });
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightRAG, setLightRAG] = useState<LightRAG | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (config.openAIApiKey) {
      setLightRAG(new LightRAG(config.openAIApiKey, config.llmModel));
    }
  }, [config]);

  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadContent = async (type: 'url' | 'text') => {
    if (!lightRAG) {
      showFeedback('error', t('rag.errorNoLightRAG'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (type === 'url') {
        await lightRAG.loadFromUrl(url);
        logger.log(LogLevel.INFO, 'Content loaded from URL', { url });
      } else {
        await lightRAG.loadFromText(textContent);
        logger.log(LogLevel.INFO, 'Content loaded from text input');
      }
      showFeedback('success', t('rag.successContentLoaded', { type: type === 'url' ? t('rag.url') : t('rag.textInput') }));
    } catch (err: any) {
      logger.log(LogLevel.ERROR, 'Error loading content', { error: err, type });
      setError(t('rag.errorLoadingContent', { error: err.message }));
      showFeedback('error', t('rag.errorLoadingContent', { error: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lightRAG) {
      showFeedback('error', t('rag.errorNoLightRAG'));
      return;
    }
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const result = await lightRAG.query(question);
      setAnswer(result);
      logger.log(LogLevel.INFO, 'Question answered successfully', { question });
      showFeedback('success', t('rag.successQuestionAnswered'));
    } catch (err: any) {
      logger.log(LogLevel.ERROR, 'Error processing question', { error: err, question });
      setError(t('rag.errorProcessingQuestion', { error: err.message }));
      showFeedback('error', t('rag.errorProcessingQuestion', { error: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const StepCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">{t('rag.title')}</h1>
      
      <RAGConfig onConfigChange={setConfig} />

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{t('rag.howItWorks')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            icon={<Database className="w-12 h-12 text-blue-500" />}
            title={t('rag.step1Title')}
            description={t('rag.step1Description')}
          />
          <StepCard
            icon={<HelpCircle className="w-12 h-12 text-green-500" />}
            title={t('rag.step2Title')}
            description={t('rag.step2Description')}
          />
          <StepCard
            icon={<CheckCircle className="w-12 h-12 text-purple-500" />}
            title={t('rag.step3Title')}
            description={t('rag.step3Description')}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('rag.loadContent')}</h2>
        <div className="flex flex-col md:flex-row mb-4 gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('rag.enterUrl')}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={() => loadContent('url')}
            className="bg-blue-500 text-white p-2 rounded flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Globe className="mr-2" size={20} />}
            {t('rag.loadUrl')}
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder={t('rag.enterTextContent')}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
          <button
            onClick={() => loadContent('text')}
            className="bg-green-500 text-white p-2 rounded flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <FileText className="mr-2" size={20} />}
            {t('rag.loadText')}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('rag.askQuestion')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('rag.enterQuestion')}
            className="flex-grow p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-purple-500 text-white p-2 rounded flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Send className="mr-2" size={20} />}
            {t('rag.ask')}
          </button>
        </form>
      </div>

      {answer && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t('rag.answer')}</h2>
          <div className="p-4 bg-gray-100 rounded">{answer}</div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {feedback && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${
          feedback.type === 'success' ? 'bg-green-100 text-green-700' :
          feedback.type === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {feedback.type === 'success' && <CheckCircle className="inline-block mr-2" size={20} />}
          {feedback.type === 'error' && <AlertTriangle className="inline-block mr-2" size={20} />}
          {feedback.type === 'info' && <HelpCircle className="inline-block mr-2" size={20} />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default RAGComponent;