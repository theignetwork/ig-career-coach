# COMPLETE FIX: IG Career Coach Deployment Issues

Read this file and implement ALL fixes listed below, then build and deploy.

---

## Fix 1: Configure Netlify Functions and CORS

CREATE `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://members.theinterviewguys.com"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"

[[headers]]
  for = "/assets/*.js"
  [headers.values]
    Access-Control-Allow-Origin = "https://members.theinterviewguys.com"
    Content-Type = "application/javascript"

[[headers]]
  for = "/assets/*.css"
  [headers.values]
    Access-Control-Allow-Origin = "https://members.theinterviewguys.com"
    Content-Type = "text/css"
```

---

## Fix 2: Consistent Asset Naming (Remove Hashes)

UPDATE `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/ig-career-coach.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          // Ensure index.css stays as index.css (no hash)
          if (assetInfo.name === 'index.css') {
            return 'assets/index.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  }
})
```

---

## Fix 3: Context Detection for Actual URLs

UPDATE `useToolContext.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useToolContext(): string | null {
  const [toolContext, setToolContext] = useState<string | null>(null);
  
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    
    // Match actual URL patterns from members site
    if (path.includes('resume-analyzer-pro')) {
      setToolContext('resume-analyzer');
    } else if (path.includes('cover-letter-generator-pro')) {
      setToolContext('cover-letter-generator');
    } else if (path.includes('interview-oracle-pro')) {
      setToolContext('interview-oracle');
    } else if (path.includes('the-ig-interview-coach')) {
      setToolContext('interview-coach');
    } else if (path.includes('hidden-job-boards-tool')) {
      setToolContext('hidden-job-boards');
    } else if (path.includes('ig-insider-briefs')) {
      setToolContext('insider-briefs');
    } else {
      setToolContext(null);
    }
    
    // Debug logging (can remove after testing)
    console.log('🎯 Tool Context:', { path, toolContext });
  }, []);
  
  return toolContext;
}
```

---

## Fix 4: Proper Markdown Link Rendering

UPDATE `Message.tsx` to render links as clickable, not raw markdown:

```typescript
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  showSources?: boolean;
}

export function Message({ role, content, sources, showSources = true }: MessageProps) {
  return (
    <div className={`flex mb-4 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[85%] px-4 py-3 text-sm
        ${role === 'user'
          ? 'bg-gradient-to-br from-primary-teal to-primary-teal-dark text-white rounded-2xl rounded-br-sm shadow-lg shadow-primary-teal/30'
          : 'bg-tile-bg text-text-light border border-border-teal rounded-2xl rounded-bl-sm'
        }
      `}>
        {/* Render markdown with custom components */}
        <ReactMarkdown
          components={{
            // Clickable links (not raw markdown)
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-teal underline hover:text-primary-teal-dark font-medium transition-colors"
              >
                {children}
              </a>
            ),
            // Bold text
            strong: ({ children }) => (
              <strong className="font-bold text-white">{children}</strong>
            ),
            // Paragraphs with spacing
            p: ({ children }) => (
              <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
            ),
            // Unordered lists
            ul: ({ children }) => (
              <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
            ),
            // Ordered lists
            ol: ({ children }) => (
              <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
            ),
            // List items
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            // Inline code
            code: ({ children }) => (
              <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        
        {/* Sources section */}
        {showSources && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary-teal/40">
            <p className="text-xs text-text-gray mb-2">📚 Related Articles:</p>
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary-teal text-xs hover:underline mb-1"
              >
                → {source.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Fix 5: Wait for DOM Element Before Mounting React

UPDATE `main.tsx` (or `index.tsx`):

```typescript
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
```

---

## Fix 6: Better Error Logging in API Calls

UPDATE `useChat.ts` to show detailed errors:

```typescript
const sendMessage = async (content: string) => {
  const userMessage: Message = {
    role: 'user',
    content,
    timestamp: new Date()
  };
  
  setMessages(prev => [...prev, userMessage]);
  setIsLoading(true);
  
  try {
    console.log('📤 Sending message to API:', { content, conversationId, toolContext });
    
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        conversationId,
        toolContext
      })
    });
    
    console.log('📥 API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API Success:', data);
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: data.response,
      sources: data.sources,
      showSources: isSpecificQuestion(content),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setConversationId(data.conversationId);
    
  } catch (error) {
    console.error('💥 Chat error:', error);
    
    const errorMessage: Message = {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again in a moment.',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Fix 7: Ensure Backend Functions Have CORS

UPDATE `netlify/functions/chat.js` (or `chat.ts`) to include CORS headers:

```javascript
export async function handler(event) {
  // CORS headers - allow requests from members site
  const headers = {
    'Access-Control-Allow-Origin': 'https://members.theinterviewguys.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  try {
    console.log('📨 Received chat request');
    
    const { message, conversationId, toolContext } = JSON.parse(event.body);
    
    // Your existing chat logic here...
    // Call Claude API, save to Supabase, etc.
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: 'Response from AI',
        conversationId: 'some-id',
        sources: []
      })
    };
    
  } catch (error) {
    console.error('❌ Chat function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
}
```

---

## Build and Deploy Steps

After making all changes above:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Fix all deployment issues: functions config, CORS, styling, context detection"
   git push origin main
   ```

3. **Wait for Netlify to deploy** (2-3 minutes)

4. **Verify in Netlify dashboard:**
   - Go to Functions tab
   - Should see `chat` function listed
   - Check deploy log for any errors

5. **Test on production:**
   - Visit: https://members.theinterviewguys.com/hq/resume-analyzer-pro/
   - Chat bubble should appear (bottom right)
   - Styling should be correct (teal colors, dark theme)
   - Clicking tiles should work
   - Messages should send and receive
   - Links should be clickable (not raw markdown)
   - Correct context detected (Resume Analyzer tiles showing)

---

## Testing Checklist

After deployment, verify:

- [ ] Chat bubble appears on page
- [ ] Styling looks correct (teal/dark theme)
- [ ] Welcome screen shows correct tiles for tool page
- [ ] Tiles are clickable and send queries
- [ ] Can type and send messages
- [ ] Bot responds (not error message)
- [ ] Links in responses are clickable (not raw markdown like [text](url))
- [ ] Bold text renders properly
- [ ] No console errors
- [ ] Works on all 6 tool pages with correct context

---

## Debugging if Issues Persist

If something still doesn't work:

1. **Check browser console (F12):**
   - Any red errors?
   - Check Network tab for failed requests
   - Look for the debug logs we added

2. **Check Netlify Functions dashboard:**
   - Are functions listed?
   - Check function logs for errors

3. **Check Netlify deploy log:**
   - Did build succeed?
   - Were functions deployed?

4. **Test API directly:**
   - Use Postman or curl to test: `https://ig-career-coach.netlify.app/.netlify/functions/chat`
   - Should return response, not 404

---

## Summary of All Fixes

1. ✅ **netlify.toml** - Configures functions location and CORS
2. ✅ **vite.config.ts** - Consistent asset naming (no hashes)
3. ✅ **useToolContext.ts** - Match actual URL patterns
4. ✅ **Message.tsx** - Render markdown links properly
5. ✅ **main.tsx** - Wait for DOM before mounting
6. ✅ **useChat.ts** - Better error logging
7. ✅ **chat.js** - CORS headers in backend

All of these work together to make the chat functional!
