import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

function waitForElement(id: string, callback: (element: HTMLElement) => void) {
  const element = document.getElementById(id);
  if (element) {
    callback(element);
  } else {
    setTimeout(() => waitForElement(id, callback), 50);
  }
}

waitForElement('ig-career-coach-root', (container) => {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
