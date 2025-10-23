# Feature: Smart Testimonial Collection

## Overview
Automatically prompt users for testimonials when they've gotten significant value from the chat, without being pushy or annoying.

---

## Trigger Conditions

Prompt for testimonial when **ALL** of these are true:
1. User has sent 10+ messages in total (shows engagement)
2. User hasn't been asked for testimonial before (check localStorage)
3. Recent message shows positive sentiment (keywords like "thanks", "helped", "great", "perfect", etc.)

**OR** when **ALL** of these are true:
1. User has used the chat on 3+ different days
2. User hasn't been asked for testimonial before
3. They just closed a helpful conversation (5+ messages in this session)

---

## Implementation

### Step 1: Add Testimonial Tracking

Add to **useChat.ts**:

```typescript
// Add to state
const [testimonialAsked, setTestimonialAsked] = useState(false);
const [showTestimonialPrompt, setShowTestimonialPrompt] = useState(false);

// Load testimonial status
useEffect(() => {
  const asked = localStorage.getItem('ig-testimonial-asked');
  setTestimonialAsked(asked === 'true');
}, []);

// Check if we should ask for testimonial
useEffect(() => {
  // Don't ask if already asked
  if (testimonialAsked) return;
  
  // Don't ask if no messages yet
  if (messages.length < 10) return;
  
  // Check if last message shows positive sentiment
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role !== 'user') return;
  
  const positiveKeywords = [
    'thanks', 'thank you', 'helpful', 'helped', 'great', 
    'perfect', 'awesome', 'excellent', 'amazing', 'love it',
    'exactly what i needed', 'this is great', 'appreciate'
  ];
  
  const hasPositiveSentiment = positiveKeywords.some(keyword => 
    lastMessage.content.toLowerCase().includes(keyword)
  );
  
  if (hasPositiveSentiment && messages.length >= 10) {
    // Wait 2 seconds after their message, then show prompt
    setTimeout(() => {
      setShowTestimonialPrompt(true);
    }, 2000);
  }
}, [messages, testimonialAsked]);

// Function to handle testimonial response
const handleTestimonialResponse = (response: 'yes' | 'later' | 'no') => {
  setShowTestimonialPrompt(false);
  
  if (response === 'yes') {
    // Open testimonial form
    window.open('https://your-testimonial-form-url.com', '_blank');
    localStorage.setItem('ig-testimonial-asked', 'true');
    setTestimonialAsked(true);
  } else if (response === 'no') {
    // Don't ask again
    localStorage.setItem('ig-testimonial-asked', 'true');
    setTestimonialAsked(true);
  }
  // If 'later', don't mark as asked - they might say yes next time
};

// Export the new state
return {
  messages,
  isLoading,
  sendMessage,
  showTestimonialPrompt,
  handleTestimonialResponse
};
```

### Step 2: Create Testimonial Prompt Component

Create **TestimonialPrompt.tsx**:

```typescript
interface TestimonialPromptProps {
  onResponse: (response: 'yes' | 'later' | 'no') => void;
}

export function TestimonialPrompt({ onResponse }: TestimonialPromptProps) {
  return (
    <div className="mb-4 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-teal/20 to-primary-teal-dark/20 border-2 border-primary-teal/40 rounded-2xl p-4 text-sm">
        {/* Icon and message */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl">🌟</div>
          <div className="flex-1">
            <p className="text-text-light font-medium mb-1">
              Loving IG Career Coach?
            </p>
            <p className="text-text-gray text-sm">
              Would you mind sharing a quick testimonial? It helps other job seekers discover how this can help them too. Takes just 2 minutes!
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onResponse('yes')}
            className="px-4 py-2 bg-primary-teal hover:bg-primary-teal-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            Yes, I'll share! 😊
          </button>
          <button
            onClick={() => onResponse('later')}
            className="px-4 py-2 bg-tile-bg hover:bg-tile-bg/80 text-text-gray hover:text-text-light rounded-lg text-sm transition-colors"
          >
            Maybe later
          </button>
          <button
            onClick={() => onResponse('no')}
            className="px-4 py-2 text-text-muted hover:text-text-gray text-sm transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Add to ChatModal

In **ChatModal.tsx**, add the testimonial prompt to the messages area:

```tsx
import { TestimonialPrompt } from './TestimonialPrompt';

export function ChatModal({ toolContext, onClose }: ChatModalProps) {
  const { 
    messages, 
    isLoading, 
    sendMessage,
    showTestimonialPrompt,
    handleTestimonialResponse
  } = useChat(toolContext);
  
  // ... rest of component
  
  return (
    <div className="...">
      {/* Header */}
      {/* ... */}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 bg-bg-dark">
        {messages.length === 0 ? (
          <WelcomeScreen toolContext={toolContext} onTileClick={sendMessage} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} {...msg} />
            ))}
            
            {/* Testimonial prompt (appears after messages) */}
            {showTestimonialPrompt && (
              <TestimonialPrompt onResponse={handleTestimonialResponse} />
            )}
            
            {isLoading && <TypingIndicator />}
          </>
        )}
      </div>
      
      {/* Input Area */}
      {/* ... */}
    </div>
  );
}
```

### Step 4: Set Up Testimonial Collection Form

**Option A: Use Typeform (Recommended)**
1. Create a Typeform with:
   - Name (optional)
   - Email (optional)
   - Testimonial text (required)
   - How they use IG Career Coach (multiple choice)
   - Permission to use testimonial (checkbox)
2. Use the Typeform URL in the 'yes' response handler

**Option B: Use Your Own Form**
Create a simple form page on your site at `/testimonial` that:
- Thanks them for sharing
- Collects their testimonial
- Optionally asks for their name/email
- Submits to your database or email

---

## Analytics to Track

Add these to your analytics:

```typescript
// When prompt is shown
analytics.track('Testimonial Prompt Shown', {
  messageCount: messages.length,
  toolContext: toolContext
});

// When user responds
analytics.track('Testimonial Prompt Response', {
  response: 'yes' | 'later' | 'no',
  messageCount: messages.length
});

// When testimonial is submitted (on form page)
analytics.track('Testimonial Submitted', {
  source: 'chat'
});
```

---

## Testing

### Manual Tests:
- [ ] Prompt appears after 10+ messages with positive sentiment
- [ ] Prompt doesn't appear if already asked
- [ ] "Yes" button opens testimonial form
- [ ] "Maybe later" dismisses but allows re-asking
- [ ] "No thanks" dismisses and never asks again
- [ ] Prompt looks good on mobile
- [ ] Prompt animates in smoothly

### Test Cases:
1. Send 15 messages ending with "Thanks, this helped!"
   - ✅ Should show prompt
2. Click "No thanks", close chat, reopen
   - ✅ Should NOT show prompt again
3. Click "Maybe later", send 5 more helpful messages, say "perfect!"
   - ✅ Should show prompt again
4. Click "Yes", check localStorage
   - ✅ `ig-testimonial-asked` should be 'true'

---

## Success Metrics

Track these over time:
- **Prompt Show Rate**: How often prompt appears (should be ~10-15% of conversations)
- **Response Rate**: % who click any button (target: 60%+)
- **Yes Rate**: % who click "Yes, I'll share" (target: 20%+)
- **Completion Rate**: % who actually submit testimonial (target: 50%+ of "yes" clicks)

---

## Future Enhancements

### Phase 2 Ideas:
1. **Contextual prompts** based on tool used:
   - "Mind sharing how Resume Analyzer helped you?"
   - "Would you share your interview prep experience?"

2. **Incentivize testimonials**:
   - "Share a testimonial and get early access to new features!"
   - "Leave a review and get a free resume template"

3. **Social proof loop**:
   - Show testimonials IN the chat
   - "See how Sarah landed her dream job with IG Career Coach"

---

## Prompt for Claude Code

```
Read this file and implement the testimonial collection feature. Create the TestimonialPrompt component, update useChat.ts with the trigger logic, and integrate it into ChatModal. Use the positive sentiment detection approach with a 10+ message threshold.
```
