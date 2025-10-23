/**
 * IG Career Coach - Chat Embed Script
 *
 * Usage: Add this script to any page to embed the IG Career Coach chat bubble
 * <script src="https://ig-career-coach.netlify.app/chat-embed.js"></script>
 */

(function() {
  'use strict';

  // Configuration
  const CHAT_BASE_URL = 'https://ig-career-coach.netlify.app';

  // Check if already loaded
  if (window.IGCareerCoach) {
    console.warn('IG Career Coach embed already loaded');
    return;
  }

  // Create iframe container
  function createChatIframe() {
    const iframe = document.createElement('iframe');
    iframe.id = 'ig-career-coach-iframe';
    iframe.src = CHAT_BASE_URL;
    iframe.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 999999;
      pointer-events: none;
    `;
    iframe.allow = 'clipboard-read; clipboard-write';

    document.body.appendChild(iframe);
    return iframe;
  }

  // Initialize chat
  function initChat() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initChat);
      return;
    }

    // Create and append iframe
    const iframe = createChatIframe();

    // Enable pointer events for the iframe when chat is open
    window.addEventListener('message', function(event) {
      if (event.origin !== CHAT_BASE_URL) return;

      if (event.data.type === 'ig-chat-opened') {
        iframe.style.pointerEvents = 'auto';
      } else if (event.data.type === 'ig-chat-closed') {
        iframe.style.pointerEvents = 'none';
      }
    });
  }

  // Public API
  window.IGCareerCoach = {
    init: initChat,
    version: '1.0.0'
  };

  // Auto-initialize
  initChat();
})();
