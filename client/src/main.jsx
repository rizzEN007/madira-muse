import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AppLoader from './components/AppLoader.jsx';
import './index.css';
import './config/axios.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppLoader>
      <App />
    </AppLoader>
  </StrictMode>
);