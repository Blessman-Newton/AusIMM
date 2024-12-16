import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import Registration from './components/Registration';
import Certificate from './components/Certificate';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f6fa;
`;

const theme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    error: '#e74c3c',
    background: '#f5f6fa',
    text: '#2c3e50'
  }
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContainer>
          <Navbar isAuthenticated={isAuthenticated} />
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Registration />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <Dashboard /> : 
                <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/certificate/:id" 
              element={<Certificate />} 
            />
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
};

export default App;