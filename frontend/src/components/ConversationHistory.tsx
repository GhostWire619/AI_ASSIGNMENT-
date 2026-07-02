import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { ConversationTurn } from '../types';
import FeedbackButtons from './FeedbackButtons';

interface ConversationHistoryProps {
  history: ConversationTurn[];
  onFeedback: (index: number, rating: string) => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ history, onFeedback }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div>
      {history.map((turn, index) => {
        const isLatest = index === history.length - 1;
        return (
          <Card key={index} className={`mb-3 ${isLatest ? 'border-primary' : ''}`}>
            <Card.Body>
              <div className="mb-2">
                <strong className="text-primary">You:</strong> {turn.question}
              </div>
              <div className="mb-2">
                <strong className="text-success">Assistant:</strong> {turn.answer}
              </div>
              
              <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                <Badge bg="secondary">
                  Model: {turn.meta.model}
                </Badge>
                <Badge bg="info">
                  Tokens: {turn.meta.tokens_used}
                </Badge>
                <Badge bg="dark">
                  {turn.meta.generation_time}s
                </Badge>
                {turn.meta.faq_section && (
                  <Badge bg="warning" text="dark">
                    FAQ: {turn.meta.faq_section}
                  </Badge>
                )}
              </div>

              {isLatest && (
                <FeedbackButtons
                  question={turn.question}
                  answer={turn.answer}
                  onFeedback={(rating) => onFeedback(index, rating)}
                />
              )}
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationHistory;