# Bug Fixes & Enhancements for IG Career Coach

## Issues to Fix

### Issue 1: Over-Citation Problem
**Current behavior:** Every response includes sources/citations, even for simple queries like "I'm new here"

**Desired behavior:** Only show sources when:
1. User asks a specific question that requires research
2. The answer references specific blog content
3. It's actually helpful and relevant

**Examples:**
- ❌ "I'm new here" → Should NOT show sources
- ❌ "Help me with my resume" → Should NOT show sources (too general)
- ✅ "What's the SOAR method?" → CAN show sources (specific technique)
- ✅ "How do I negotiate salary?" → CAN show sources (specific advice)

### Issue 2: No Way to Return to Welcome Screen
**Current behavior:** Once you send a message, you can't get back to the welcome screen

**Desired behavior:** Add a way to return to the welcome screen

---

## Implementation Instructions

### Fix 1: Conditional Source Display

Update the **Message.tsx** component:

```tsx
interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  showSources?: boolean; // Add this prop
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
        <p className="whitespace-pre-wrap">{content}</p>
        
        {/* Only show sources if explicitly enabled AND sources exist */}
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

Update the **useChat.ts** hook to determine when to show sources:

```typescript
const sendMessage = async (content: string) => {
  // ... existing code ...
  
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        conversationId,
        toolContext
      })
    });
    
    const data = await response.json();
    
    // Determine if sources should be shown
    const shouldShowSources = isSpecificQuestion(content);
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: data.response,
      sources: data.sources,
      showSources: shouldShowSources, // Add this
      timestamp: new Date()
    };
    
    // ... rest of code ...
  }
};

// Helper function to determine if query is specific enough for sources
function isSpecificQuestion(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Don't show sources for these patterns
  const genericPatterns = [
    "i'm new here",
    "show me around",
    "help me",
    "i need help",
    "get started",
    "what can you do",
    "hello",
    "hi there",
  ];
  
  // Check if query matches generic patterns
  for (const pattern of genericPatterns) {
    if (lowerQuery.includes(pattern)) {
      return false;
    }
  }
  
  // Show sources if query contains specific indicators
  const specificIndicators = [
    "what is",
    "how do i",
    "how to",
    "explain",
    "tell me about",
    "what are",
    "when should",
    "why",
    "difference between",
  ];
  
  for (const indicator of specificIndicators) {
    if (lowerQuery.includes(indicator)) {
      return true;
    }
  }
  
  // Default: don't show sources unless query is 5+ words (likely specific)
  return query.split(' ').length >= 5;
}
```

Update the **chat.ts** types file:

```typescript
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  showSources?: boolean; // Add this
  timestamp: Date;
}
```

---

### Fix 2: Add "Back to Menu" Button

**Option A: Button in Header (Recommended)**

Update **ChatModal.tsx** header section:

```tsx
<div className="bg-gradient-to-r from-primary-teal to-primary-teal-dark p-5 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-2xl">
      🎓
    </div>
    <div>
      <h3 className="text-lg font-bold text-white">IG Career Coach</h3>
      <p className="text-xs text-white/90">Your expert guide</p>
    </div>
  </div>
  
  <div className="flex items-center gap-2">
    {/* Add "Back to Menu" button when messages exist */}
    {messages.length > 0 && (
      <button
        onClick={handleBackToMenu}
        className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        title="Back to menu"
      >
        <Home className="w-4 h-4 text-white" />
      </button>
    )}
    
    <button
      onClick={onClose}
      className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
    >
      <X className="w-5 h-5 text-white" />
    </button>
  </div>
</div>
```

Add the handler function in **ChatModal.tsx**:

```tsx
const handleBackToMenu = () => {
  // Clear messages to show welcome screen again
  // But keep the conversation in localStorage
  if (window.confirm('Return to main menu? (Your conversation will be saved)')) {
    // Don't clear messages from localStorage, just from state
    setMessages([]);
  }
};
```

**Option B: Floating Button Above Input (Alternative)**

Add this button in the input area section:

```tsx
{/* Show "New Chat" button when conversation exists */}
{messages.length > 0 && (
  <button
    onClick={handleNewChat}
    className="text-primary-teal text-sm hover:text-primary-teal-dark transition-colors flex items-center gap-1 mb-2"
  >
    <RotateCcw className="w-3 h-3" />
    Start New Chat
  </button>
)}
```

**Option C: Both (Best UX)**

Include both the header button for quick access and the "Start New Chat" button above input for discoverability.

---

### Fix 3: Better Source Label

Change the source label from "📚 Sources:" to "📚 Related Articles:" to make it clearer these are supplementary, not required reading.

---

## Testing Checklist

After implementing these fixes:

### Source Display Testing:
- [ ] "I'm new here" → No sources shown
- [ ] "Help me with my resume" → No sources shown
- [ ] "Show me around" → No sources shown
- [ ] "What is the SOAR method?" → Sources shown (if relevant)
- [ ] "How do I negotiate salary?" → Sources shown (if relevant)
- [ ] "Explain ATS systems" → Sources shown (if relevant)

### Back to Menu Testing:
- [ ] Button appears in header when messages exist
- [ ] Button is hidden on welcome screen
- [ ] Clicking button returns to welcome screen
- [ ] Conversation is preserved in localStorage
- [ ] Can start new conversation after returning
- [ ] Works on both desktop and mobile

### Edge Cases:
- [ ] Sources don't show on first message
- [ ] Sources show appropriately on follow-up questions
- [ ] Back button doesn't lose conversation data
- [ ] Multiple back-and-forth navigation works

---

## Additional Improvements (Optional)

### 1. Add a "Clear History" Option
Add to the header menu:
```tsx
<button
  onClick={handleClearHistory}
  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
  title="Clear conversation history"
>
  <Trash2 className="w-4 h-4 text-white" />
</button>
```

### 2. Show Message Count in Header
When conversation exists, show how many messages:
```tsx
<p className="text-xs text-white/90">
  {messages.length === 0 ? 'Your expert guide' : `${Math.floor(messages.length / 2)} messages`}
</p>
```

### 3. Smooth Transition
Add a fade transition when switching between welcome screen and messages:
```css
.messages-area > * {
  animation: fadeIn 0.3s ease-out;
}
```

---

## Summary of Changes

1. **Sources are now conditional** - Only shown for specific, research-oriented questions
2. **Back to menu button** - Users can return to welcome screen anytime
3. **Better source labeling** - "Related Articles" is clearer than "Sources"
4. **Conversation preserved** - Going back to menu doesn't lose chat history

These changes make the chat feel more conversational and less academic, while still providing helpful resources when truly relevant.