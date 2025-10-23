import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Function to wait for element to exist
function waitForElement(elementId: string, callback: (element: HTMLElement) => void) {
  const element = document.getElementById(elementId);

  if (element) {
    callback(element);
  } else {
    // Retry every 50ms until element is found
    setTimeout(() => waitForElement(elementId, callback), 50);
  }
}

// Wait for the container div to be created by embed script
waitForElement('ig-career-coach-root', (container) => {
  console.log('✅ Mounting IG Career Coach...');

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
