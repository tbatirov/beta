import React, { useState } from 'react';
import { User, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { useTranslation } from 'react-i18next';

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

interface CollaborationApprovalProps {
  financialData: any;
  disclosures: { standard: string; content: string }[];
  onApprove: () => void;
  onReject: () => void;
}

const CollaborationApproval: React.FC<CollaborationApprovalProps> = ({
  financialData,
  disclosures,
  onApprove,
  onReject,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { t } = useTranslation();

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'Current User', // In a real app, this would be the logged-in user
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
      };
      setComments([...comments, comment]);
      setNewComment('');
      logger.log(LogLevel.INFO, 'New comment added', { commentId: comment.id });
    }
  };

  const handleApprove = () => {
    logger.log(LogLevel.INFO, 'Financial statements approved');
    onApprove();
  };

  const handleReject = () => {
    logger.log(LogLevel.INFO, 'Financial statements rejected');
    onReject();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('collaborationApproval.title')}</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t('collaborationApproval.financialStatementsPreview')}</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
          {JSON.stringify(financialData, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t('collaborationApproval.disclosuresPreview')}</h3>
        <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
          {disclosures.map((disclosure, index) => (
            <div key={index} className="mb-4">
              <h4 className="font-semibold">{disclosure.standard}</h4>
              <p>{disclosure.content}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t('collaborationApproval.comments')}</h3>
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center mb-2">
                <User size={16} className="mr-2" />
                <span className="font-semibold">{comment.user}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              <p>{comment.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('collaborationApproval.addComment')}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleReject}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
        >
          <ThumbsDown size={20} className="mr-2" />
          {t('collaborationApproval.reject')}
        </button>
        <button
          onClick={handleApprove}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
        >
          <ThumbsUp size={20} className="mr-2" />
          {t('collaborationApproval.approve')}
        </button>
      </div>
    </div>
  );
};

export default CollaborationApproval;