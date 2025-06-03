
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// For React 19, StrictMode is often applied within the App or via ESLint config
// If explicit top-level StrictMode is still desired:
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// Or simply:
// root.render(<App />);
// The provided template uses StrictMode, so keeping it.
