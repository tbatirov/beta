import React, { useState, useEffect } from 'react';

interface RAGConfigProps {
  onConfigChange: (config: RAGConfigType) => void;
}

export interface RAGConfigType {
  openAIApiKey: string;
  embeddingModel: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
}

const RAGConfig: React.FC<RAGConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<RAGConfigType>({
    openAIApiKey: '',
    embeddingModel: 'text-embedding-ada-002',
    llmModel: 'gpt-3.5-turbo',
    temperature: 0,
    maxTokens: 100,
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('ragConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedConfig = { ...config, [name]: name === 'temperature' || name === 'maxTokens' ? Number(value) : value };
    setConfig(updatedConfig);
    localStorage.setItem('ragConfig', JSON.stringify(updatedConfig));
    onConfigChange(updatedConfig);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">RAG Configuration</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openAIApiKey">
          OpenAI API Key
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="openAIApiKey"
          type="password"
          name="openAIApiKey"
          value={config.openAIApiKey}
          onChange={handleChange}
          placeholder="Enter your OpenAI API Key"
        />
      </div>
      {/* Add more configuration fields here */}
    </div>
  );
};

export default RAGConfig;