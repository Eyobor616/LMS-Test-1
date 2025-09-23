import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LMSProvider } from './context/LMSContext.jsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <LMSProvider>
        <App />
      </LMSProvider>
    </React.StrictMode>
  );
}
