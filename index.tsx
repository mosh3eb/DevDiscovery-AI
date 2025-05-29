import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create root only once and store it in a variable
let root: ReactDOM.Root | null = null;

// Function to ensure we only create the root once
const getRoot = () => {
  if (!root) {
    root = ReactDOM.createRoot(rootElement);
  }
  return root;
};

// Initial render
getRoot().render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
