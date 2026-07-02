import React from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
import { FaGraduationCap, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar 
      bg={theme === 'dark' ? 'dark' : 'primary'} 
      variant={theme === 'dark' ? 'dark' : 'dark'} 
      className="mb-4 shadow-sm"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container>
        <Navbar.Brand className="d-flex align-items-center">
          <FaGraduationCap size={32} className="me-2" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
          <div>
            <h1 className="h4 mb-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>
              Student Support Assistant
            </h1>
            <small className="opacity-75" style={{ fontSize: '0.75rem' }}>
              Ask about courses, exams, library, ICT, hostels, fees & more
            </small>
          </div>
        </Navbar.Brand>
        
        <Button
          variant={theme === 'dark' ? 'light' : 'outline-light'}
          size="sm"
          onClick={toggleTheme}
          className="rounded-pill px-3 d-flex align-items-center gap-2"
          style={{ 
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {theme === 'dark' ? (
            <>
              <FaSun size={16} /> Light Mode
            </>
          ) : (
            <>
              <FaMoon size={16} /> Dark Mode
            </>
          )}
        </Button>
      </Container>
    </Navbar>
  );
};

export default Header;