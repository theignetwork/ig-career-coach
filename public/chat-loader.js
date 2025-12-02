/**
 * IG Career Coach - Shadow DOM Loader
 *
 * This script loads the chat widget into a Shadow DOM for complete style isolation
 * from the host site. Add this to any page to embed the chat:
 *
 * <script src="https://ig-career-coach.netlify.app/chat-loader.js"></script>
 *
 * Authentication is handled via JWT tokens from WordPress - no client-side user ID needed.
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

  /**
   * Extract JWT token from WordPress
   * WordPress passes JWT via URL parameter: ?context=<JWT>
   */
  function getWordPressJWT() {
    // Check URL parameter first (from WordPress redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const contextParam = urlParams.get('context');

    if (contextParam) {
      console.log('✓ Found JWT token in URL parameter');
      // Store in sessionStorage for persistence
      sessionStorage.setItem('auth_token', contextParam);
      // Store globally for immediate use
      window.__IG_CAREER_COACH_JWT__ = contextParam;
      return contextParam;
    }

    // Check sessionStorage (from previous page load)
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedToken) {
      console.log('✓ Found JWT token in sessionStorage');
      window.__IG_CAREER_COACH_JWT__ = storedToken;
      return storedToken;
    }

    // Check if parent window has token (for iframe embeds)
    try {
      if (window.parent && window.parent !== window) {
        const parentToken = window.parent.__IG_CAREER_COACH_JWT__;
        if (parentToken) {
          console.log('✓ Found JWT token from parent window');
          sessionStorage.setItem('auth_token', parentToken);
          window.__IG_CAREER_COACH_JWT__ = parentToken;
          return parentToken;
        }
      }
    } catch (e) {
      // Cross-origin parent, can't access
    }

    console.warn('⚠️ No JWT token found - user may not be authenticated');
    return null;
  }

  async function loadChat() {
    // Extract and store JWT before loading the app
    getWordPressJWT();
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
      // Container takes no space but allows fixed children to render
      container.style.cssText = 'position: absolute; width: 0; height: 0; pointer-events: none;';
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
      console.log('ℹ️  Authentication handled via JWT from WordPress');

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
