import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import QuestionForm from './components/QuestionForm';
import ConversationHistory from './components/ConversationHistory';
import { submitQuestion } from './services/api';
import { ConversationTurn } from './types';

// This component uses the theme context
function AppContent() {
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('conversationHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('conversationHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (question: string) => {
    setLoading(true);
    try {
      const result = await submitQuestion(question, temperature);
      const newTurn: ConversationTurn = {
        question: question.trim(),
        answer: result.answer,
        meta: result,
      };
      setHistory(prev => [...prev, newTurn]);
    } catch (error) {
      console.error('Error submitting question:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (index: number, rating: string) => {
    console.log(`Feedback for turn ${index}: ${rating}`);
  };

  return (
    <div 
      className="App" 
      style={{ 
        backgroundColor: theme === 'dark' ? '#0f0f1a' : '#f0f2f5',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease'
      }}
    >
      <Header />
      
      <Container className="py-4">
        <Row>
          <Col lg={3} className="mb-4">
            <div 
              className="p-3 rounded-4 shadow-sm"
              style={{
                backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                position: 'sticky',
                top: '20px',
                transition: 'background-color 0.3s ease'
              }}
            >
              <Sidebar 
                temperature={temperature} 
                onTemperatureChange={setTemperature} 
              />
            </div>
          </Col>
          
          <Col lg={9}>
            <div 
              className="p-4 rounded-4 shadow-sm"
              style={{
                backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'background-color 0.3s ease'
              }}
            >
              <QuestionForm onSubmit={handleSubmit} loading={loading} />
              
              {loading && (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Processing your question...</p>
                </div>
              )}
              
              <ConversationHistory 
                history={history} 
                onFeedback={handleFeedback} 
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// Main App component wraps everything in ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
