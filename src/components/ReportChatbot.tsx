import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatbotQuery } from '../utils/api';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';

interface ReportChatbotProps {
  reportContent: string;
  onUpdateReport: (updatedContent: string) => void;
  additionalDocuments: string[];
  onUpdateAdditionalDocuments: (updatedDocuments: string[]) => void;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const ReportChatbot: React.FC<ReportChatbotProps> = ({
  reportContent,
  onUpdateReport,
  additionalDocuments,
  onUpdateAdditionalDocuments,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { t } = useTranslation();

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    try {
      const context = `Report content: ${reportContent}\nAdditional documents: ${additionalDocuments.join(', ')}`;
      const botResponse = await chatbotQuery(userMessage, context);

      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      logger.log(LogLevel.INFO, 'Chatbot response received', { response: botResponse });
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error in chat interaction', { error });
      setMessages(prev => [...prev, { role: 'bot', content: t('reportChatbot.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">{t('reportChatbot.title')}</h3>
      <div className="bg-gray-100 p-4 rounded-lg mb-4 h-64 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('reportChatbot.inputPlaceholder')}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300 flex items-center"
          disabled={isLoading}
        >
          {isLoading ? t('reportChatbot.sending') : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ReportChatbot;