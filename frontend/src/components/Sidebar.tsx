import React, { useEffect, useState } from 'react';
import { Alert, Container, Form, Spinner, Badge } from 'react-bootstrap';
import { FaServer, FaSlidersH } from 'react-icons/fa';
import { getHealth } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  temperature: number;
  onTemperatureChange: (value: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ temperature, onTemperatureChange }) => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const checkHealth = async () => {
      const data = await getHealth();
      setHealth(data);
      setLoading(false);
    };
    checkHealth();
  }, []);

  return (
    <Container className="p-0">
      <div className="mb-4">
        <h5 className="d-flex align-items-center gap-2 mb-3">
          <FaServer size={18} /> System Status
        </h5>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" variant="primary" />
            <span className="ms-2">Checking backend...</span>
          </div>
        ) : (
          <div>
            {!health ? (
              <Alert variant="danger" className="rounded-3">
                <strong>Offline</strong>
                <br />
                <small>Start backend with <code>uvicorn main:app</code></small>
              </Alert>
            ) : health.status === 'ok' ? (
              <Alert variant="success" className="rounded-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success rounded-pill px-3 py-2">● Online</span>
                  <span className="ms-auto">
                    <Badge bg="info" pill className="px-3 py-2">
                      {health.model}
                    </Badge>
                  </span>
                </div>
              </Alert>
            ) : (
              <Alert variant="warning" className="rounded-3">
                <strong>Model not ready</strong>
                <br />
                <small>Is Ollama running?</small>
              </Alert>
            )}
          </div>
        )}
      </div>

      <div className="mb-3">
        <h5 className="d-flex align-items-center gap-2 mb-3">
          <FaSlidersH size={18} /> Settings
        </h5>
        <Form.Group>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="mb-0 fw-medium">Temperature</Form.Label>
            <Badge 
              bg={theme === 'dark' ? 'secondary' : 'primary'} 
              pill 
              className="px-3 py-2"
              style={{ fontSize: '0.85rem' }}
            >
              {temperature.toFixed(1)}
            </Badge>
          </div>
          <Form.Range
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="mb-2"
            style={{
              /*background: theme === 'dark' 
                ? 'linear-gradient(to right, #495a4e, #2a6e37)' 
                : 'linear-gradient(to right, #ddd, #11d26b)'
            */}}
          />
          <div className="d-flex justify-content-between small text-muted">
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </Form.Group>
      </div>
    </Container>
  );
};

export default Sidebar;