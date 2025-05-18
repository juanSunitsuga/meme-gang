import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// REMOVE any Router here if it exists
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {/* NO Router here - it's already in App.tsx */}
  </React.StrictMode>
);