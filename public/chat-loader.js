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

    } catch (error) {
      console.error('❌ Failed to load IG Career Coach:', error);
    }
  }

  // Function to get WordPress user ID
  async function getWordPressUserId() {
    try {
      // Method 1: Check for MemberPress global variable
      if (window.mepr_user && window.mepr_user.id) {
        console.log('✓ Found user ID from mepr_user:', window.mepr_user.id);
        return window.mepr_user.id;
      }

      // Method 2: Check for WordPress user ID variable
      if (window.current_user_id) {
        console.log('✓ Found user ID from current_user_id:', window.current_user_id);
        return window.current_user_id;
      }

      // Method 3: Check for WordPress global user object
      if (window.wpUserData && window.wpUserData.id) {
        console.log('✓ Found user ID from wpUserData:', window.wpUserData.id);
        return window.wpUserData.id;
      }

      // Method 4: Try WordPress REST API
      try {
        const response = await fetch('/wp-json/wp/v2/users/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.id) {
            console.log('✓ Found user ID from WordPress REST API:', userData.id);
            return userData.id;
          }
        }
      } catch (e) {
        console.log('WordPress REST API not available:', e.message);
      }

      console.warn('⚠️ Could not find WordPress user ID - user will be anonymous');
      return null;
    } catch (error) {
      console.error('Error getting WordPress user ID:', error);
      return null;
    }
  }

  // Initialize and load chat
  async function initializeChat() {
    const userId = await getWordPressUserId();

    // Store user ID globally for the app to access
    window.__IG_CAREER_COACH_USER_ID__ = userId;

    // Load the chat app
    await loadChat();
  }

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
  } else {
    initializeChat();
  }

})();
