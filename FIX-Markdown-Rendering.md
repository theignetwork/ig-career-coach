# Fix: Render Markdown in Chat Messages

## Problem
Message content is displaying raw Markdown syntax (like `**bold**`) instead of rendering it as formatted HTML.

**Current:** `**text**` shows as asterisks  
**Wanted:** `**text**` shows as **bold text**

---

## Solution: Add Markdown Parser

### Step 1: Install Markdown Library

```bash
npm install react-markdown
```

### Step 2: Update Message Component

Replace the current **Message.tsx** with this:

```tsx
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
        {/* Render Markdown instead of plain text */}
        <ReactMarkdown
          className="markdown-content"
          components={{
            // Customize how elements render
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-teal underline hover:text-primary-teal-dark"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="bg-black/20 px-1 py-0.5 rounded text-xs">{children}</code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        
        {showSources && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary-teal/40">
            <p className="text-xs text-text-gray mb-2">📚 Related Articles:</p>
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary-teal text-xs hover:underline"
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

### Step 3: Add Markdown Styles

Add this to your **index.css** or create a new CSS file:

```css
/* Markdown content styling */
.markdown-content {
  line-height: 1.6;
}

.markdown-content p {
  margin-bottom: 0.5rem;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content strong {
  font-weight: 700;
  color: inherit;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
}

.markdown-content li {
  margin-bottom: 0.25rem;
}

.markdown-content code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Courier New', monospace;
}

.markdown-content a {
  color: #06d6a0;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #04a881;
}

/* Ensure proper spacing in assistant messages */
.bg-tile-bg .markdown-content p {
  color: #f1f5f9;
}

/* Ensure proper spacing in user messages */
.from-primary-teal .markdown-content p {
  color: white;
}
```

---

## What This Does

Now your messages will properly render:

**Before:**
```
**Round 3: Content Deep Dive**
- Click each highlighted section for specific suggestions
```

**After:**
```
Round 3: Content Deep Dive (in bold)
- Click each highlighted section for specific suggestions
```

### Supported Markdown:
- `**bold text**` → **bold text**
- `*italic text*` → *italic text*
- `- list item` → • list item
- `1. numbered` → 1. numbered
- `[link](url)` → clickable link
- `` `code` `` → `code` with gray background

---

## Alternative: Simple Regex Solution (Lighter Weight)

If you don't want to add a dependency, use this simpler approach in **Message.tsx**:

```tsx
function formatMarkdown(text: string): string {
  return text
    // Bold: **text** → <strong>text</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* → <em>text</em>
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code: `text` → <code>text</code>
    .replace(/`(.+?)`/g, '<code class="bg-black/20 px-1 py-0.5 rounded text-xs">$1</code>');
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
        {/* Use dangerouslySetInnerHTML with formatted content */}
        <div 
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
        />
        
        {/* Sources section remains the same */}
      </div>
    </div>
  );
}
```

This approach:
- ✅ No dependencies needed
- ✅ Handles bold, italic, code
- ⚠️ Won't handle complex Markdown (lists, headings, links)
- ⚠️ Slightly less safe (using dangerouslySetInnerHTML)

---

## Recommendation

**Use the react-markdown solution** because:
1. More robust and handles all Markdown
2. Safer (no direct HTML injection)
3. Easier to maintain
4. Better for future features (lists, links, etc.)
5. Only adds ~20KB to bundle size

---

## Testing After Implementation

Test these Markdown patterns:
- [ ] `**bold text**` renders as bold
- [ ] `*italic text*` renders as italic
- [ ] `- list items` render as bullets
- [ ] `1. numbered` renders as numbers
- [ ] `` `code` `` renders with background
- [ ] Line breaks are preserved
- [ ] Multiple paragraphs have proper spacing
- [ ] Works in both user and assistant messages
- [ ] Sources section still displays correctly

---

## Prompt for Claude Code

```
Read this file and implement the Markdown rendering fix. Use the react-markdown solution (not the regex alternative).
```