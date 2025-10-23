# Complete Claude Code Prompt: Build & Deploy IG Career Coach Frontend

## Project Overview

Build a production-ready, context-aware AI chat interface for The IG Network membership site. The backend (Netlify Functions + Supabase + RAG) is already deployed and working. You need to build the React frontend that connects to it.

**Name:** IG Career Coach  
**Tech Stack:** React + TypeScript + Tailwind CSS  
**Deployment:** Netlify  
**Backend:** Already complete (Netlify Functions at `/.netlify/functions/`)

---

## Backend API (Already Built & Deployed)

### POST `/.netlify/functions/chat`
```typescript
Request: {
  message: string;
  conversationId: string | null;
  toolContext: string | null;
}

Response: {
  response: string;
  conversationId: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}
```

### GET `/.netlify/functions/get-conversation?conversationId={id}`
```typescript
Response: {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}
```

---

## Design System

### Brand Colors
```css
--primary-teal: #06d6a0;
--primary-teal-dark: #04a881;
--bg-dark: #0a1219;
--bg-darker: #0f1419;
--bg-navy: #1a2332;
--tile-bg: #1e293b;
--text-light: #f1f5f9;
--text-gray: #94a3b8;
--text-muted: #64748b;
--border-teal: rgba(6, 214, 160, 0.2);
```

### Typography
- **Font:** Inter, system-ui, -apple-system, sans-serif
- **Headers:** 24px bold (#ffffff)
- **Tile Titles:** 18px bold (#06d6a0)
- **Body:** 14px regular (#f1f5f9)
- **Descriptions:** 14px regular (#94a3b8)
- **Footer:** 12px (#64748b)

---

## Component Architecture

### 1. ChatBubble.tsx
**Floating chat button (bottom-right corner)**

**Specifications:**
- Position: Fixed, bottom: 24px, right: 24px
- Size: 64px × 64px (desktop), 56px × 56px (mobile)
- Background: Gradient from #06d6a0 to #04a881
- Border-radius: 50%
- Shadow: 0 8px 20px rgba(6, 214, 160, 0.4)
- Icon: Message bubble SVG (32px, white)
- Z-index: 1000

**Animation:**
- Pulsing rings: 2 concentric rings that expand and fade (2s loop, staggered)
- Hover: scale(1.1) + larger glow shadow
- Click: Fade out, open modal

**Code Structure:**
```tsx
interface ChatBubbleProps {
  onClick: () => void;
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary-teal to-primary-teal-dark shadow-lg shadow-primary-teal/40 hover:scale-110 hover:shadow-xl transition-all duration-300 z-[1000]"
    >
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full border-2 border-primary-teal animate-ping opacity-75" />
      <div className="absolute inset-0 rounded-full border-2 border-primary-teal animate-ping opacity-75 animation-delay-1000" />
      
      {/* Message icon */}
      <MessageCircle className="w-8 h-8 text-white" />
    </button>
  );
}
```

---

### 2. ChatModal.tsx
**Main chat interface container**

**Layout:**
```
┌────────────────────────────┐
│  Header (Teal Gradient)   │  ← 80px height
├────────────────────────────┤
│                            │
│   Messages Area            │  ← Flex-1 (scrollable)
│   (or Welcome Screen)      │
│                            │
├────────────────────────────┤
│   Input Area               │  ← 80px height
└────────────────────────────┘
```

**Specifications:**
- Position: Fixed, bottom: 24px, right: 24px
- Size: 400px × 650px (desktop), fullscreen (mobile)
- Background: #0f1419
- Border-radius: 20px
- Shadow: 0 24px 48px rgba(0, 0, 0, 0.4), border 1px rgba(6, 214, 160, 0.2)
- Animation: Slide up from bottom (0.4s cubic-bezier)
- Z-index: 999

**Header:**
- Background: linear-gradient(135deg, #06d6a0 0%, #04a881 100%)
- Height: 80px
- Padding: 20px
- Layout: Flex row, space-between
- Left side:
  - Graduation cap emoji icon (42px circle, white bg)
  - Title: "IG Career Coach" (24px bold white)
  - Subtitle: "Your expert guide" (14px white)
- Right side:
  - Close button (36px circle, white icon, rgba background)

**Messages Area:**
- Background: #0a1219
- Padding: 20px
- Overflow-y: auto
- Custom scrollbar (6px width, teal thumb)
- Shows either WelcomeScreen or message list

**Input Area:**
- Background: #0f1419
- Padding: 20px
- Border-top: 1px solid rgba(6, 214, 160, 0.2)
- Layout: Flex row, gap 12px
- Input field:
  - Flex-1
  - Background: #0a1219
  - Border: 1px solid rgba(6, 214, 160, 0.2)
  - Border-radius: 24px (full pill shape)
  - Padding: 12px 20px
  - Focus: Teal border glow
  - Placeholder: "Ask me anything..." (#64748b)
- Send button:
  - 44px × 44px circle
  - Teal gradient background
  - White send icon
  - Shadow: 0 4px 12px rgba(6, 214, 160, 0.3)
  - Hover: scale(1.05)
  - Disabled: Gray, no shadow
- Footer:
  - "Powered by The IG Network"
  - Center-aligned
  - 12px, #64748b
  - Margin-top: 12px

**Code Structure:**
```tsx
interface ChatModalProps {
  toolContext: string | null;
  onClose: () => void;
}

export function ChatModal({ toolContext, onClose }: ChatModalProps) {
  const { messages, isLoading, sendMessage } = useChat(toolContext);
  const [input, setInput] = useState('');
  
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };
  
  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[650px] bg-bg-darker rounded-2xl shadow-2xl border border-border-teal z-[999] flex flex-col animate-slide-up">
      {/* Header */}
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
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 bg-bg-dark">
        {messages.length === 0 ? (
          <WelcomeScreen toolContext={toolContext} onTileClick={sendMessage} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} {...msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-5 bg-bg-darker border-t border-border-teal">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-5 py-3 bg-bg-dark border border-border-teal rounded-full text-text-light placeholder:text-text-muted focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/20 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-teal to-primary-teal-dark shadow-lg shadow-primary-teal/40 flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-text-muted mt-3">Powered by The IG Network</p>
      </div>
    </div>
  );
}
```

---

### 3. WelcomeScreen.tsx
**Context-aware onboarding tiles**

**Layout (2×3 Grid):**
```
┌──────────────────────────────────┐
│ Header: IG Career Coach          │
│ Your expert guide                │
├──────────────────────────────────┤
│ Your 24/7 expert for every step  │
│ of your job search journey       │
├──────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐       │
│  │ Tile 1  │  │ Tile 2  │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ Tile 3  │  │ Tile 4  │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ Tile 5  │  │ Tile 6  │       │
│  └─────────┘  └─────────┘       │
└──────────────────────────────────┘
```

**Tile Specifications:**
- Background: #1e293b
- Border: 1px solid rgba(6, 214, 160, 0.2)
- Border-radius: 12px
- Padding: 20px
- Gap: 16px between tiles
- Hover: Border glows teal, translateY(-2px), shadow increases
- Click: Sends associated query to chat

**Tile Content:**
- Icon (emoji): 32px, top-left
- Title: 18px bold, #06d6a0, margin-top: 8px
- Description: 14px, #94a3b8, margin-top: 4px, 2 lines max

**Default Welcome Screen (toolContext === null):**
```typescript
const defaultTiles = [
  {
    icon: "🎓",
    title: "I'm New Here",
    description: "Let's get you set up and show you where everything is",
    query: "I'm new here, show me around and help me get started"
  },
  {
    icon: "📄",
    title: "Fix My Resume",
    description: "Get recruiter-ready with expert feedback and ATS insights",
    query: "Help me improve my resume with expert feedback"
  },
  {
    icon: "🔍",
    title: "Find Hidden Opportunities",
    description: "Discover job leads and smarter search strategies",
    query: "Help me find hidden job opportunities and improve my search strategy"
  },
  {
    icon: "🎤",
    title: "Prepare for Interviews",
    description: "Practice real questions and learn how to answer like a pro",
    query: "Help me prepare for interviews with practice questions"
  },
  {
    icon: "📅",
    title: "Stay on Track",
    description: "Stay consistent, set reminders, and track your progress",
    query: "Help me stay on track with my job search"
  },
  {
    icon: "💬",
    title: "Ask Us Anything",
    description: "Get personalized answers from our library of 600+ guides",
    query: "I have a question about my career"
  }
];
```

**Tool-Specific Tiles:**

**Resume Analyzer Pro (toolContext === 'resume-analyzer'):**
```typescript
[
  { icon: "📊", title: "Scan My Resume", description: "Upload and analyze for ATS compatibility", query: "Help me scan my resume for ATS compatibility" },
  { icon: "📈", title: "Improve My Score", description: "Get actionable tips to boost your score", query: "How can I improve my resume score?" },
  { icon: "✨", title: "Fix Formatting", description: "Ensure perfect resume structure", query: "Help me fix my resume formatting" },
  { icon: "🔑", title: "Add Keywords", description: "Optimize for job descriptions", query: "Help me optimize my resume keywords" },
  { icon: "📥", title: "Download Report", description: "Get your detailed analysis", query: "Show me how to get my resume analysis report" },
  { icon: "❓", title: "Ask About Results", description: "Questions about your resume scan", query: "I have questions about my resume scan results" }
]
```

**Cover Letter Generator Pro (toolContext === 'cover-letter-generator'):**
```typescript
[
  { icon: "✍️", title: "Write New Letter", description: "Start from scratch with AI help", query: "Help me write a new cover letter" },
  { icon: "✨", title: "Improve Existing", description: "Polish your current draft", query: "Help me improve my existing cover letter" },
  { icon: "🎯", title: "Customize for Job", description: "Tailor to specific posting", query: "Help me customize my cover letter for a specific job" },
  { icon: "📋", title: "Get Template", description: "Access proven templates", query: "Show me cover letter templates" },
  { icon: "✅", title: "Fix Grammar", description: "Perfect your writing", query: "Help me check my cover letter grammar" },
  { icon: "💡", title: "Cover Letter Tips", description: "Expert writing advice", query: "Give me cover letter writing tips" }
]
```

**Interview Oracle Pro (toolContext === 'interview-oracle'):**
```typescript
[
  { icon: "🎯", title: "Practice Questions", description: "Get AI-powered interview prep", query: "Help me practice interview questions" },
  { icon: "🏢", title: "Company Research", description: "Learn about your target company", query: "Help me research a company for my interview" },
  { icon: "📝", title: "SOAR Method Help", description: "Master behavioral questions", query: "Teach me the SOAR method for interviews" },
  { icon: "💼", title: "Industry Questions", description: "Role-specific interview prep", query: "Help me prepare for industry-specific questions" },
  { icon: "🎤", title: "Mock Interview", description: "Full practice session", query: "I want to do a mock interview" },
  { icon: "⚡", title: "Last-Minute Tips", description: "Quick confidence boosters", query: "Give me last-minute interview tips" }
]
```

**IG Interview Coach (toolContext === 'interview-coach'):**
```typescript
[
  { icon: "📹", title: "Video Practice", description: "Record and review your answers", query: "Help me practice with video interview prep" },
  { icon: "👤", title: "Body Language Tips", description: "Non-verbal communication help", query: "Give me body language tips for interviews" },
  { icon: "💪", title: "Confidence Building", description: "Overcome interview anxiety", query: "Help me build confidence for my interview" },
  { icon: "🎙️", title: "Voice Coaching", description: "Improve your delivery", query: "Give me voice and delivery tips" },
  { icon: "👔", title: "Outfit Advice", description: "Dress for success guidance", query: "Help me choose the right interview outfit" },
  { icon: "✅", title: "Final Checklist", description: "Day-of preparation", query: "Give me an interview day checklist" }
]
```

**Hidden Job Boards Tool (toolContext === 'hidden-job-boards'):**
```typescript
[
  { icon: "🏭", title: "Search by Industry", description: "Find niche job boards", query: "Help me find job boards for my industry" },
  { icon: "📍", title: "Search by Location", description: "Local opportunity boards", query: "Find job boards for my location" },
  { icon: "🌐", title: "Remote Jobs", description: "Work-from-anywhere boards", query: "Find remote job boards" },
  { icon: "🏢", title: "Company Boards", description: "Direct hiring pages", query: "Help me find company career pages" },
  { icon: "🔍", title: "Search Strategy", description: "How to use hidden boards", query: "Teach me how to use hidden job boards effectively" },
  { icon: "📝", title: "Application Tips", description: "Stand out on these platforms", query: "Give me tips for applying through hidden job boards" }
]
```

**IG Insider Briefs (toolContext === 'insider-briefs'):**
```typescript
[
  { icon: "📰", title: "Latest Brief", description: "Read the newest insights", query: "Show me the latest IG Insider Brief" },
  { icon: "📊", title: "Industry Trends", description: "What's hot in your field", query: "Tell me about current industry trends" },
  { icon: "🚀", title: "Career Opportunities", description: "Emerging roles and paths", query: "What are emerging career opportunities?" },
  { icon: "💰", title: "Salary Data", description: "Compensation trends", query: "Show me salary trends and data" },
  { icon: "📚", title: "Browse Archives", description: "Past briefs and insights", query: "Show me past Insider Briefs" },
  { icon: "✉️", title: "Request Topic", description: "What do you want covered?", query: "I want to request a topic for Insider Briefs" }
]
```

**Code Structure:**
```tsx
interface WelcomeScreenProps {
  toolContext: string | null;
  onTileClick: (query: string) => void;
}

export function WelcomeScreen({ toolContext, onTileClick }: WelcomeScreenProps) {
  const tiles = getTilesForContext(toolContext);
  
  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-center text-text-gray text-sm">
        Your 24/7 expert for every step of your job search journey
      </p>
      
      {/* Tiles Grid */}
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => onTileClick(tile.query)}
            className="bg-tile-bg border border-border-teal rounded-xl p-5 text-left hover:border-primary-teal hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-teal/20 transition-all duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-3xl mb-2">{tile.icon}</div>
            <h4 className="text-primary-teal font-bold mb-1">{tile.title}</h4>
            <p className="text-text-gray text-sm leading-snug">{tile.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function getTilesForContext(context: string | null) {
  switch (context) {
    case 'resume-analyzer': return resumeAnalyzerTiles;
    case 'cover-letter-generator': return coverLetterTiles;
    case 'interview-oracle': return interviewOracleTiles;
    case 'interview-coach': return interviewCoachTiles;
    case 'hidden-job-boards': return hiddenJobBoardsTiles;
    case 'insider-briefs': return insiderBriefsTiles;
    default: return defaultTiles;
  }
}
```

---

### 4. Message.tsx
**Individual message display**

**User Messages (Right-aligned):**
- Max-width: 85%
- Background: Gradient from #06d6a0 to #04a881
- Text: White
- Border-radius: 16px (except bottom-right: 4px)
- Shadow: 0 4px 12px rgba(6, 214, 160, 0.3)
- Padding: 12px 16px
- Margin-left: auto

**Assistant Messages (Left-aligned):**
- Max-width: 85%
- Background: #1e293b
- Text: #f1f5f9
- Border: 1px solid rgba(6, 214, 160, 0.2)
- Border-radius: 16px (except bottom-left: 4px)
- Padding: 12px 16px
- Margin-right: auto

**Sources (if present):**
- Divider: Teal line, 1px, 40% width, margin: 12px 0
- Label: "📚 Sources:" (12px, #94a3b8)
- Links: Each on new line, teal color, hover underline
- Format: "→ {title}"

**Code Structure:**
```tsx
interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
}

export function Message({ role, content, sources }: MessageProps) {
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
        
        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary-teal/40">
            <p className="text-xs text-text-gray mb-2">📚 Sources:</p>
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

---

### 5. TypingIndicator.tsx
**Loading animation**

**Specifications:**
- 3 dots in a row
- Each dot: 8px diameter, teal color
- Bouncing animation: translateY(-4px) → 0 → -4px (0.6s loop)
- Staggered timing: 0ms, 200ms, 400ms delays
- Container: Same styling as assistant message

**Code Structure:**
```tsx
export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-tile-bg border border-border-teal rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
        <div className="w-2 h-2 bg-primary-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-teal rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-2 bg-primary-teal rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
```

---

## Custom Hooks

### useToolContext.ts
**Detect which tool page user is on**

```typescript
export function useToolContext(): string | null {
  const [toolContext, setToolContext] = useState<string | null>(null);
  
  useEffect(() => {
    const path = window.location.pathname;
    
    // Adjust these to match your actual URLs
    if (path.includes('resume-analyzer')) {
      setToolContext('resume-analyzer');
    } else if (path.includes('cover-letter')) {
      setToolContext('cover-letter-generator');
    } else if (path.includes('interview-oracle')) {
      setToolContext('interview-oracle');
    } else if (path.includes('interview-coach')) {
      setToolContext('interview-coach');
    } else if (path.includes('hidden-job-boards') || path.includes('job-boards')) {
      setToolContext('hidden-job-boards');
    } else if (path.includes('insider-briefs') || path.includes('briefs')) {
      setToolContext('insider-briefs');
    } else {
      setToolContext(null);
    }
  }, []);
  
  return toolContext;
}
```

### useChat.ts
**Handle chat state and API calls**

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  timestamp: Date;
}

export function useChat(toolContext: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Load conversation from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ig-career-coach-conversation');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setMessages(data.messages || []);
        setConversationId(data.conversationId || null);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    }
  }, []);
  
  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0 || conversationId) {
      localStorage.setItem('ig-career-coach-conversation', JSON.stringify({
        messages,
        conversationId
      }));
    }
  }, [messages, conversationId]);
  
  const sendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
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
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
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
  
  return {
    messages,
    isLoading,
    sendMessage
  };
}
```

---

## Project Setup & Implementation

### Step 1: Initialize Project

```bash
# Create project
npm create vite@latest ig-career-coach-frontend -- --template react-ts

cd ig-career-coach-frontend

# Install dependencies
npm install
npm install lucide-react  # For icons

# Install and configure Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure Tailwind

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-teal': '#06d6a0',
        'primary-teal-dark': '#04a881',
        'bg-dark': '#0a1219',
        'bg-darker': '#0f1419',
        'bg-navy': '#1a2332',
        'tile-bg': '#1e293b',
        'text-light': '#f1f5f9',
        'text-gray': '#94a3b8',
        'text-muted': '#64748b',
        'border-teal': 'rgba(6, 214, 160, 0.2)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg-dark text-text-light;
    font-family: Inter, system-ui, -apple-system, sans-serif;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(6, 214, 160, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 214, 160, 0.5);
}

/* Animation delays */
.animation-delay-1000 {
  animation-delay: 1000ms;
}

/* Smooth transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Step 3: Create File Structure

```
src/
├── components/
│   ├── ChatBubble.tsx
│   ├── ChatModal.tsx
│   ├── WelcomeScreen.tsx
│   ├── Message.tsx
│   └── TypingIndicator.tsx
├── hooks/
│   ├── useChat.ts
│   └── useToolContext.ts
├── types/
│   └── chat.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Step 4: Implement Components

Build each component using the specifications above. Make sure to:
- Use TypeScript for all components
- Import icons from lucide-react
- Follow the exact styling specifications
- Implement proper error handling
- Add loading states
- Ensure accessibility (ARIA labels, keyboard navigation)

### Step 5: App Integration

**src/App.tsx:**
```tsx
import { useState } from 'react';
import ChatBubble from './components/ChatBubble';
import ChatModal from './components/ChatModal';
import { useToolContext } from './hooks/useToolContext';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const toolContext = useToolContext();
  
  return (
    <>
      {!isOpen && <ChatBubble onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <ChatModal
          toolContext={toolContext}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default App;
```

### Step 6: Build & Test Locally

```bash
# Run development server
npm run dev

# Test all features:
# - Chat bubble appears and animates
# - Modal opens/closes
# - Welcome screen shows correct context
# - Tiles are clickable
# - Messages send/receive
# - Typing indicator appears
# - Sources display correctly
# - Conversation persists on refresh

# Build for production
npm run build
```

### Step 7: Deploy to Netlify

**Option A: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Initialize Netlify site
netlify init

# Deploy
netlify deploy --prod
```

**Option B: GitHub + Netlify Dashboard**
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit: IG Career Coach frontend"
git branch -M main
git remote add origin https://github.com/theignetwork/ig-career-coach-frontend.git
git push -u origin main

# Then in Netlify:
# 1. "New site from Git"
# 2. Select your repository
# 3. Build command: npm run build
# 4. Publish directory: dist
# 5. Deploy site
```

### Step 8: Add to Existing Pages

Once deployed, you can embed the chat widget in your existing tool pages:

**Simple script tag approach:**
```html
<!-- Add to each tool page -->
<script type="module" src="https://your-netlify-url.netlify.app/assets/index-[hash].js"></script>
<link rel="stylesheet" href="https://your-netlify-url.netlify.app/assets/index-[hash].css">
```

**Or create a loader script:**
```javascript
// chat-loader.js (host on your main site)
(function() {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://ig-career-coach.netlify.app/assets/index.js';
  document.body.appendChild(script);
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://ig-career-coach.netlify.app/assets/index.css';
  document.head.appendChild(link);
})();
```

Then just add:
```html
<script src="/chat-loader.js"></script>
```

---

## Testing Checklist

### Functional Testing
- [ ] Chat bubble appears on page load
- [ ] Pulse animation works
- [ ] Clicking bubble opens modal
- [ ] Modal slides up smoothly
- [ ] Welcome screen shows default tiles when no tool context
- [ ] Welcome screen shows tool-specific tiles on tool pages
- [ ] Clicking tiles sends correct query
- [ ] Input field accepts text
- [ ] Enter key sends message
- [ ] Send button sends message
- [ ] User messages appear immediately
- [ ] Typing indicator shows while loading
- [ ] Assistant messages appear after response
- [ ] Sources display when provided
- [ ] Source links are clickable
- [ ] Conversation persists on page refresh
- [ ] Close button closes modal
- [ ] ESC key closes modal (accessibility)

### Visual Testing
- [ ] All colors match brand (#06d6a0, dark backgrounds)
- [ ] Fonts and sizes are correct
- [ ] Spacing matches design (padding, margins, gaps)
- [ ] Hover effects work on all interactive elements
- [ ] Animations are smooth (60fps)
- [ ] Scrolling works in messages area
- [ ] Custom scrollbar appears and works
- [ ] Text is readable against backgrounds
- [ ] Icons display correctly

### Responsive Testing
- [ ] Desktop 1920px
- [ ] Desktop 1440px
- [ ] Desktop 1280px
- [ ] Tablet 1024px
- [ ] Tablet 768px
- [ ] Mobile 414px
- [ ] Mobile 390px
- [ ] Mobile 375px
- [ ] Modal goes fullscreen on mobile
- [ ] Touch targets are 44×44px minimum
- [ ] Text remains readable at all sizes
- [ ] No horizontal scrolling

### Accessibility Testing
- [ ] All interactive elements have focus states
- [ ] Tab order is logical
- [ ] Enter sends message
- [ ] ESC closes modal
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested (at least one)
- [ ] Keyboard-only navigation works

### Performance Testing
- [ ] Initial load < 2s
- [ ] Message send/receive < 3s (depends on API)
- [ ] No layout shifts during loading
- [ ] Smooth scrolling with 50+ messages
- [ ] No memory leaks after extended use
- [ ] Animations maintain 60fps

---

## Success Criteria

You'll know the implementation is complete and working when:

✅ Chat bubble appears on all pages  
✅ Context detection works automatically  
✅ Welcome screens adapt to each tool  
✅ Messages send and receive successfully  
✅ Conversation history persists  
✅ All animations are smooth  
✅ Design matches brand perfectly  
✅ Works on all devices (desktop, tablet, mobile)  
✅ Accessible via keyboard and screen readers  
✅ Deployed and live on Netlify  

---

## Support & Maintenance

After deployment:
- Monitor Netlify logs for errors
- Track API usage in Netlify Functions dashboard
- Watch Supabase for database performance
- Collect user feedback
- Monitor conversation quality

For updates:
- Push to main branch → auto-deploys
- Test in dev environment first
- Use Netlify branch deploys for new features

---

That's the complete implementation guide! Build this exactly as specified and you'll have a production-ready, context-aware AI chat interface that integrates seamlessly with your existing backend.