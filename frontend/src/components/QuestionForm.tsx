import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';

interface QuestionFormProps {
  onSubmit: (question: string) => Promise<void>;
  loading: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, loading }) => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    
    if (!trimmedQuestion) {
      setError('Please enter a question first.');
      return;
    }

    setError(null);
    try {
      await onSubmit(trimmedQuestion);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Form.Group className="mb-3">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="e.g. How do I register for courses?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          className={error ? 'is-invalid' : ''}
        />
        {error && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {error}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Button 
        type="submit" 
        variant="primary" 
        disabled={loading}
        className="w-100"
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Processing...
          </>
        ) : (
          'Ask'
        )}
      </Button>
    </Form>
  );
};

export default QuestionForm;