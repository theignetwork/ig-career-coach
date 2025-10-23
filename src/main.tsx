import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Function to find container in both regular DOM and Shadow DOM
function findContainer(): HTMLElement | null {
  // Check if loaded via Shadow DOM loader (embedded mode)
  if ((window as any).__IG_CAREER_COACH_CONTAINER__) {
    console.log('🎯 Found container in Shadow DOM');
    return (window as any).__IG_CAREER_COACH_CONTAINER__;
  }

  // Fall back to regular DOM (standalone mode)
  const regularContainer = document.getElementById('ig-career-coach-root');
  if (regularContainer) {
    console.log('🎯 Found container in regular DOM');
    return regularContainer;
  }

  return null;
}

// Function to wait for element to exist
function waitForElement(callback: (element: HTMLElement) => void) {
  const container = findContainer();

  if (container) {
    callback(container);
  } else {
    // Retry every 50ms until element is found
    setTimeout(() => waitForElement(callback), 50);
  }
}

// Wait for the container div to be created
waitForElement((container) => {
  console.log('✅ Mounting IG Career Coach...');

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
