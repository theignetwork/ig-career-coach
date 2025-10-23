/**
 * IG Career Coach - Shadow DOM Loader
 *
 * This script loads the chat widget into a Shadow DOM for complete style isolation
 * from the host site. Add this to any page to embed the chat:
 *
 * <script src="https://ig-career-coach.netlify.app/chat-loader.js"></script>
 */

(function() {
  'use strict';

  // Prevent double loading
  if (window.IGCareerCoachLoaded) {
    console.warn('IG Career Coach already loaded');
    return;
  }
  window.IGCareerCoachLoaded = true;

  const CHAT_URL = 'https://ig-career-coach.netlify.app';

  // Cache-busting timestamp
  const cacheBuster = Date.now();

  async function loadChat() {
    try {
      console.log('🚀 Loading IG Career Coach...');

      // Create host element
      const host = document.createElement('div');
      host.id = 'ig-career-coach-host';
      // Ensure host doesn't interfere with layout or positioning
      host.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 0; pointer-events: none; z-index: 999999;';
      document.body.appendChild(host);

      // Create shadow root for complete style isolation
      const shadow = host.attachShadow({ mode: 'open' });

      // Create container inside shadow DOM
      const container = document.createElement('div');
      container.id = 'ig-career-coach-root';
      // Ensure container allows fixed positioning for chat bubble
      container.style.cssText = 'position: relative; width: 100%; height: 100%;';
      shadow.appendChild(container);

      // Expose shadow root and container globally so the app can find it
      window.__IG_CAREER_COACH_SHADOW_ROOT__ = shadow;
      window.__IG_CAREER_COACH_CONTAINER__ = container;

      // Load CSS into shadow DOM with cache-busting
      console.log('📦 Loading styles...');
      const cssResponse = await fetch(CHAT_URL + '/assets/index.css?v=' + cacheBuster);
      const cssText = await cssResponse.text();
      const style = document.createElement('style');
      style.textContent = cssText;
      shadow.appendChild(style);

      // Load and execute JavaScript with cache-busting
      console.log('📦 Loading script...');
      const script = document.createElement('script');
      script.type = 'module';
      script.src = CHAT_URL + '/assets/ig-career-coach.js?v=' + cacheBuster;

      // Append to document (not shadow) so it executes in global context
      document.body.appendChild(script);

      console.log('✅ IG Career Coach loaded successfully');

    } catch (error) {
      console.error('❌ Failed to load IG Career Coach:', error);
    }
  }

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadChat);
  } else {
    loadChat();
  }

})();
