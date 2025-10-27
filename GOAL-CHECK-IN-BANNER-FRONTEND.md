# Goal Check-In Banner - Frontend Implementation Guide

## Overview
The backend API now returns goal check-ins as a separate field (`goalCheckIn`) instead of prepending them to the chat response. This allows for a cleaner UX with a dismissible banner above the chat.

## Backend Changes (Already Completed)
- `goalCheckIn` is now returned as a separate field in the API response
- Structure:
```json
{
  "response": "AI's answer to the question...",
  "goalCheckIn": {
    "message": "📊 Quick Check-In\n3 days ago you set a goal: \"i want to apply to 5 jobs this week\"...",
    "goal": {
      "id": "uuid",
      "goalText": "i want to apply to 5 jobs this week",
      "targetNumber": 5,
      "targetPeriod": "week",
      "goalType": "applications",
      "currentProgress": 0
    }
  }
}
```

## Frontend Implementation

### 1. React Component (GoalCheckInBanner.tsx)

Create this component in your chat interface:

```tsx
import React, { useState } from 'react';

interface GoalCheckInProps {
  goalCheckIn: {
    message: string;
    goal: {
      id: string;
      goalText: string;
      targetNumber: number;
      targetPeriod: string;
      goalType: string;
      currentProgress: number;
    } | null;
  } | null;
  onDismiss: () => void;
}

export const GoalCheckInBanner: React.FC<GoalCheckInProps> = ({ goalCheckIn, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!goalCheckIn || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const getProgressPercentage = () => {
    if (!goalCheckIn.goal?.targetNumber) return 0;
    return Math.round((goalCheckIn.goal.currentProgress / goalCheckIn.goal.targetNumber) * 100);
  };

  const percentage = getProgressPercentage();

  return (
    <div className="goal-check-in-banner">
      <div className="banner-content">
        {/* Icon */}
        <div className="banner-icon">
          📊
        </div>

        {/* Message */}
        <div className="banner-message">
          <div className="banner-title">Quick Check-In</div>
          <p className="banner-text">
            {goalCheckIn.goal && (
              <>
                You set a goal: <strong>"{goalCheckIn.goal.goalText}"</strong>
              </>
            )}
          </p>

          {/* Progress Bar */}
          {goalCheckIn.goal?.targetNumber && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="progress-text">
                {goalCheckIn.goal.currentProgress} / {goalCheckIn.goal.targetNumber} {goalCheckIn.goal.goalType}
              </div>
            </div>
          )}

          <p className="banner-prompt">
            How's it going? How many have you completed so far?
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          className="banner-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss check-in"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
```

### 2. CSS Styles

```css
.goal-check-in-banner {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.banner-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.banner-message {
  flex: 1;
}

.banner-title {
  font-weight: 600;
  font-size: 16px;
  color: #3b82f6;
  margin-bottom: 8px;
}

.banner-text {
  color: #e2e8f0;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.banner-text strong {
  color: #fff;
}

.progress-container {
  margin: 12px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.banner-prompt {
  color: #cbd5e1;
  font-size: 14px;
  margin-top: 12px;
  font-weight: 500;
}

.banner-dismiss {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 20px;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.banner-dismiss:hover {
  color: #e2e8f0;
}
```

### 3. Integration in Chat Component

Update your chat component to handle the banner:

```tsx
import { useState, useEffect } from 'react';
import { GoalCheckInBanner } from './GoalCheckInBanner';

export const ChatInterface = () => {
  const [goalCheckIn, setGoalCheckIn] = useState(null);

  const sendMessage = async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: currentUserId })
      });

      const data = await response.json();

      // Handle goal check-in banner
      if (data.goalCheckIn) {
        setGoalCheckIn(data.goalCheckIn);
      }

      // Display the AI response as normal
      addMessageToChat(data.response);

    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const handleDismissCheckIn = () => {
    setGoalCheckIn(null);
  };

  return (
    <div className="chat-container">
      {/* Goal Check-In Banner (appears above chat) */}
      <GoalCheckInBanner
        goalCheckIn={goalCheckIn}
        onDismiss={handleDismissCheckIn}
      />

      {/* Regular chat messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input field */}
      <ChatInput onSend={sendMessage} />
    </div>
  );
};
```

### 4. Alternative: Vanilla JavaScript

If not using React:

```javascript
function createGoalCheckInBanner(goalCheckInData) {
  if (!goalCheckInData) return null;

  const banner = document.createElement('div');
  banner.className = 'goal-check-in-banner';

  const percentage = goalCheckInData.goal?.targetNumber
    ? Math.round((goalCheckInData.goal.currentProgress / goalCheckInData.goal.targetNumber) * 100)
    : 0;

  banner.innerHTML = `
    <div class="banner-content">
      <div class="banner-icon">📊</div>
      <div class="banner-message">
        <div class="banner-title">Quick Check-In</div>
        <p class="banner-text">
          You set a goal: <strong>"${goalCheckInData.goal?.goalText}"</strong>
        </p>
        ${goalCheckInData.goal?.targetNumber ? `
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-text">
              ${goalCheckInData.goal.currentProgress} / ${goalCheckInData.goal.targetNumber} ${goalCheckInData.goal.goalType}
            </div>
          </div>
        ` : ''}
        <p class="banner-prompt">
          How's it going? How many have you completed so far?
        </p>
      </div>
      <button class="banner-dismiss" aria-label="Dismiss check-in">✕</button>
    </div>
  `;

  // Add dismiss handler
  banner.querySelector('.banner-dismiss').addEventListener('click', () => {
    banner.remove();
  });

  return banner;
}

// Usage in chat
async function sendMessage(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  const data = await response.json();

  // Remove existing banner if any
  document.querySelector('.goal-check-in-banner')?.remove();

  // Add new banner if present
  if (data.goalCheckIn) {
    const banner = createGoalCheckInBanner(data.goalCheckIn);
    document.querySelector('.chat-container').prepend(banner);
  }

  // Display message
  addMessageToChat(data.response);
}
```

## Benefits of This Approach

1. **Clean Separation**: Check-ins don't interfere with the AI's answer
2. **Visual Hierarchy**: Banner stands out as a separate UI element
3. **Dismissible**: Users can close it if not ready to respond
4. **Progress Tracking**: Visual progress bar shows goal status
5. **Better UX**: User gets their answer first, then sees the check-in reminder

## Testing

Test scenarios:
1. User asks a question → Should see answer + check-in banner above (if goal is pending)
2. User dismisses banner → Banner disappears
3. User reports progress in next message → Banner should not reappear
4. User sets new goal → Confirmation appears in chat (not as banner)
5. User completes goal → Celebration appears in chat (not as banner)
