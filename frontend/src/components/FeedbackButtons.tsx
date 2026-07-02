import React, { useState } from 'react';
import { Button, ButtonGroup, Toast, ToastContainer } from 'react-bootstrap';
import { FaThumbsUp, FaMeh, FaThumbsDown } from 'react-icons/fa';
import { sendFeedback } from '../services/api';

interface FeedbackButtonsProps {
  question: string;
  answer: string;
  onFeedbackSent: (rating: string) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ question, answer, onFeedbackSent }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

  const handleFeedback = async (rating: string) => {
    const success = await sendFeedback(question, answer, rating);
    setToastMessage(success ? 'Thanks for the feedback!' : 'Could not save feedback.');
    setToastVariant(success ? 'success' : 'danger');
    setShowToast(true);
    
    if (success) {
      onFeedbackSent(rating);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted me-2">Was this answer helpful?</span>
        <ButtonGroup size="sm">
          <Button 
            variant="outline-success" 
            onClick={() => handleFeedback('Good')}
            className="d-flex align-items-center gap-1"
          >
            <FaThumbsUp /> Good
          </Button>
          <Button 
            variant="outline-warning" 
            onClick={() => handleFeedback('Average')}
            className="d-flex align-items-center gap-1"
          >
            <FaMeh /> Average
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={() => handleFeedback('Poor')}
            className="d-flex align-items-center gap-1"
          >
            <FaThumbsDown /> Poor
          </Button>
        </ButtonGroup>
      </div>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default FeedbackButtons;