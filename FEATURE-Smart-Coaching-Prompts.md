# Feature: Smart Coaching Prompts (Contextual Reminders)

## Overview
Instead of traditional reminders, use smart, contextual prompts that guide users through their job search journey based on their activity patterns and tool usage.

---

## Key Insight
Rather than "remind me to do X", the chat should **proactively suggest next steps** based on:
- What tools they've used
- How long since their last visit
- Where they are in their job search journey
- What makes sense as a logical next step

---

## Prompt Types

### 1. **Return Prompts** (When They Come Back)

**Trigger:** User hasn't visited in 3+ days

**Examples:**
```
"Welcome back! 👋 I see you were working on your resume last week. 
Want to pick up where we left off?"
```

```
"Hey there! It's been a few days. Ready to tackle that interview prep 
we discussed?"
```

**Implementation:**
- Track `lastVisit` timestamp in localStorage
- On chat open, check if `now - lastVisit > 3 days`
- Show contextual welcome based on last tool used
- Auto-populate message with relevant suggestion

---

### 2. **Next Step Prompts** (Progressive Journey)

**Trigger:** User completed a milestone (used a tool, got help)

**Journey Flow:**
1. **After Resume Analysis** → "Great! Now let's write a cover letter to match"
2. **After Cover Letter** → "Want me to help you find the best job boards for your industry?"
3. **After Job Search** → "Found some opportunities? Let's prep you for interviews"
4. **After Interview Prep** → "Ready to practice salary negotiation?"

**Implementation:**
- Track tool usage in localStorage: `{ resumeUsed: true, coverLetterUsed: false, ... }`
- After completing an interaction with a tool, show next step
- Use a simple state machine to guide progression

---

### 3. **Encouragement Prompts** (Keep Momentum)

**Trigger:** User has been active but might be losing steam

**Examples:**
```
"You're making great progress! 🎉 Keep up the momentum - 
most successful job seekers stay consistent."
```

```
"Quick tip: Applying to 5-10 jobs per week increases your 
chances of landing interviews by 300%. Want help finding more opportunities?"
```

**Timing:**
- After 5+ productive sessions
- During a return visit after 1-2 week gap
- When they've used 2+ tools

---

### 4. **Milestone Prompts** (Celebrate Wins)

**Trigger:** User reports progress or completes actions

**Examples:**
```
"Just submitted an application? 🎉 Great job! 
Now let's prepare you for the callback."
```

```
"Interview coming up? Let's make sure you're 100% ready. 
Want to do a practice round?"
```

**Detection:**
- User mentions "interview", "applied", "got the job"
- Use sentiment analysis on their messages
- Celebrate and suggest logical next step

---

## Implementation Strategy

### Phase 1: Return Prompts (Simple)

Add to **useChat.ts**:

```typescript
// Track last visit
useEffect(() => {
  const lastVisit = localStorage.getItem('ig-last-visit');
  const now = Date.now();
  
  if (lastVisit) {
    const daysSince = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
    
    if (daysSince >= 3 && messages.length === 0) {
      // Show welcome back message
      const lastTool = localStorage.getItem('ig-last-tool');
      const welcomeMessage = getWelcomeBackMessage(lastTool, daysSince);
      
      // Add as first "assistant" message
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }
  
  // Update last visit
  localStorage.setItem('ig-last-visit', now.toString());
}, []);

function getWelcomeBackMessage(lastTool: string | null, days: number): string {
  const greeting = days > 7 
    ? "Welcome back! It's been a while. 👋" 
    : "Hey there! Good to see you again. 😊";
  
  switch (lastTool) {
    case 'resume-analyzer':
      return `${greeting} Last time we were working on your resume. Ready to continue optimizing it, or want to move on to cover letters?`;
    case 'interview-oracle':
      return `${greeting} Last time you were prepping for interviews. How did it go? Want to practice more, or shall we move to another area?`;
    case 'cover-letter-generator':
      return `${greeting} You were working on cover letters last time. Need more help with those, or ready to start your job search?`;
    default:
      return `${greeting} What would you like to work on today?`;
  }
}
```

### Phase 2: Next Step Prompts (Moderate)

Add journey tracking:

```typescript
// Tool usage tracker
const toolJourney = {
  resume: false,
  coverLetter: false,
  jobBoards: false,
  interview: false,
  salary: false
};

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('ig-tool-journey');
  if (saved) {
    Object.assign(toolJourney, JSON.parse(saved));
  }
}, []);

// After assistant responds, check if we should suggest next step
useEffect(() => {
  if (messages.length > 0 && !isLoading) {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role === 'assistant' && shouldSuggestNextStep()) {
      // Add next step suggestion after 3 seconds
      setTimeout(() => {
        const suggestion = getNextStepSuggestion();
        if (suggestion) {
          // Add suggestion message
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: suggestion,
            timestamp: new Date(),
            isNextStepPrompt: true // Flag to style differently
          }]);
        }
      }, 3000);
    }
  }
}, [messages, isLoading]);

function getNextStepSuggestion(): string | null {
  if (toolJourney.resume && !toolJourney.coverLetter) {
    return "🎯 **Ready for the next step?** Now that your resume is optimized, let's create a compelling cover letter to go with it. This dramatically increases your response rates!";
  }
  
  if (toolJourney.coverLetter && !toolJourney.jobBoards) {
    return "🔍 **You're making great progress!** With your resume and cover letter ready, let's find the best places to apply. I can show you hidden job boards in your industry.";
  }
  
  if (toolJourney.jobBoards && !toolJourney.interview) {
    return "🎤 **Time to prepare for success!** You're finding opportunities - let's make sure you ace those interviews. Want to practice?";
  }
  
  if (toolJourney.interview && !toolJourney.salary) {
    return "💰 **Don't leave money on the table!** You're crushing the interviews - now let's make sure you negotiate the best possible offer.";
  }
  
  return null; // Already completed journey
}
```

### Phase 3: Smart Suggestions (Advanced)

Add AI-powered context detection:

```typescript
// Analyze user's recent messages for context
function analyzeUserIntent(recentMessages: Message[]): string | null {
  const userMessages = recentMessages
    .filter(m => m.role === 'user')
    .slice(-3) // Last 3 user messages
    .map(m => m.content.toLowerCase());
  
  const allText = userMessages.join(' ');
  
  // Detect milestones
  if (allText.includes('got an interview') || allText.includes('interview scheduled')) {
    return "🎉 That's awesome! When's the interview? Let's make sure you're 100% prepared.";
  }
  
  if (allText.includes('applied') || allText.includes('submitted')) {
    return "Nice work! 👏 The waiting is the hardest part. While you wait, want to keep the momentum going and find more opportunities?";
  }
  
  if (allText.includes('rejected') || allText.includes('didn't get')) {
    return "I know rejections sting, but they're a normal part of the process. Every 'no' gets you closer to your 'yes'. Want to refine your approach?";
  }
  
  if (allText.includes('offer') || allText.includes('job offer')) {
    return "🎉 CONGRATULATIONS! That's amazing! Now comes the fun part - negotiating the best deal. Want help with that?";
  }
  
  return null;
}
```

---

## UI Components

### Smart Prompt Card (Different Style)

Make next-step prompts visually distinct:

```tsx
interface SmartPromptProps {
  content: string;
  actions?: Array<{
    label: string;
    query: string;
  }>;
}

export function SmartPrompt({ content, actions }: SmartPromptProps) {
  return (
    <div className="mb-4 animate-slide-in">
      <div className="bg-gradient-to-br from-primary-teal/10 to-transparent border-l-4 border-primary-teal rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-xl">💡</div>
          <div className="flex-1">
            <ReactMarkdown className="text-text-light text-sm">
              {content}
            </ReactMarkdown>
            
            {actions && actions.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.query)}
                    className="px-3 py-1.5 bg-primary-teal/20 hover:bg-primary-teal/30 text-primary-teal rounded-lg text-xs font-medium transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Example User Experience

### Scenario 1: New User Returns After 5 Days

```
User opens chat

Bot: "Welcome back! It's been a while. 👋 Last time we were 
working on your resume. Ready to continue optimizing it, or 
want to move on to cover letters?"

[Continue Resume] [Cover Letters] [Something Else]
```

### Scenario 2: User Completes Resume Analysis

```
User: "Thanks, my resume score went from 62 to 89!"

Bot: "That's an awesome improvement! 🎉"

[3 seconds later]

Bot: "🎯 Ready for the next step? Now that your resume is 
optimized, let's create a compelling cover letter to go with it. 
This dramatically increases your response rates!"

[Yes, let's do it!] [Not yet]
```

### Scenario 3: User Mentions Interview

```
User: "I have an interview next Tuesday"

Bot: "🎉 That's awesome! When's the interview? Let's make sure 
you're 100% prepared. Would you like to:
• Practice common interview questions
• Research the company
• Review the SOAR method for behavioral questions"

[Practice Questions] [Company Research] [SOAR Method]
```

---

## Settings & Control

Give users control:

```tsx
// Add to settings/preferences
const smartPromptsEnabled = localStorage.getItem('ig-smart-prompts') !== 'false';

// Option to disable
<label>
  <input 
    type="checkbox" 
    checked={smartPromptsEnabled}
    onChange={(e) => {
      localStorage.setItem('ig-smart-prompts', e.target.checked.toString());
    }}
  />
  Show smart suggestions and next steps
</label>
```

---

## Analytics

Track effectiveness:

```typescript
// When prompt is shown
analytics.track('Smart Prompt Shown', {
  type: 'return' | 'next-step' | 'milestone',
  context: toolContext,
  daysSinceLastVisit: days
});

// When user clicks action
analytics.track('Smart Prompt Action', {
  action: 'accepted' | 'dismissed',
  promptType: type
});
```

---

## Summary

**This approach is better than traditional reminders because:**

✅ No external infrastructure needed (email/SMS)  
✅ Contextual and helpful (not annoying)  
✅ Guides users through a journey  
✅ Works within the existing chat  
✅ Increases engagement and completion rates  
✅ Feels like coaching, not nagging  

**Start with Phase 1 (Return Prompts)** - it's simple and immediately valuable. Then add Phase 2 when you see it working.

---

## Prompt for Claude Code

```
Read this file and implement Phase 1 (Return Prompts). Track last visit timestamp and last tool used in localStorage. Show a contextual welcome back message when users return after 3+ days. Use the getWelcomeBackMessage function to customize the greeting based on what they were working on.
```
