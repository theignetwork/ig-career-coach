# Stay on Track - Goal Tracking & Accountability Feature

## Overview
Implement the "Stay on Track" feature shown in the IG Career Coach tiles. This creates an accountability system where the bot remembers user goals, checks in on progress, and celebrates wins.

**Core Functionality:**
- ✅ Users can set goals and reminders
- ✅ Bot proactively checks in on progress
- ✅ Tracks completions over time
- ✅ Feels like a real accountability partner

**User Experience:**
- User: "I want to apply to 10 jobs this week"
- Bot: Stores goal, checks in during future conversations
- User returns 2 days later
- Bot: "Hey! You set a goal to apply to 10 jobs. How's it going?"

---

## 🎯 Implementation Strategy

**Philosophy:**
- Make it feel natural, not robotic
- Celebrate wins enthusiastically
- Be encouraging when they fall short
- Don't nag - check in once every 2-3 days max
- Integrate seamlessly into conversations

---

## STEP 1: Create Database Tables

### Action: Run this SQL in Supabase

```sql
-- Table for storing user goals and reminders
CREATE TABLE user_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  goal_type text NOT NULL, -- e.g., 'applications', 'networking', 'follow_ups', 'interviews'
  goal_text text NOT NULL, -- What the user said
  target_number integer, -- e.g., 10 applications
  target_period text, -- 'week', 'day', 'month'
  status text DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  created_at timestamp DEFAULT now(),
  last_check_in timestamp,
  completed_at timestamp
);

-- Table for tracking progress on goals
CREATE TABLE goal_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid REFERENCES user_goals(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  progress_count integer NOT NULL, -- How many they've done
  progress_note text, -- Optional: what they said about progress
  check_in_date timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);
CREATE INDEX idx_user_goals_last_check_in ON user_goals(last_check_in);
CREATE INDEX idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX idx_goal_progress_user_id ON goal_progress(user_id);

-- View for easy goal summary
CREATE VIEW user_goal_summary AS
SELECT 
  ug.id,
  ug.user_id,
  ug.goal_type,
  ug.goal_text,
  ug.target_number,
  ug.target_period,
  ug.status,
  ug.created_at,
  ug.last_check_in,
  COALESCE(SUM(gp.progress_count), 0) as total_progress,
  COUNT(gp.id) as check_in_count
FROM user_goals ug
LEFT JOIN goal_progress gp ON ug.id = gp.goal_id
WHERE ug.status = 'active'
GROUP BY ug.id;
```

---

## STEP 2: Create Goal Management Utilities

### File to create: `netlify/functions/utils/goalTracking.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Detect if user is setting a goal
 */
export function isSettingGoal(message) {
  const goalIndicators = [
    'i want to',
    'i need to',
    'i\'m going to',
    'i\'ll',
    'remind me to',
    'set a goal',
    'my goal is',
    'i should',
    'i plan to',
    'help me stay accountable',
    'keep me on track'
  ];
  
  const messageLower = message.toLowerCase();
  
  // Must have a goal indicator AND a number
  const hasIndicator = goalIndicators.some(indicator => messageLower.includes(indicator));
  const hasNumber = /\d+/.test(message);
  
  return hasIndicator && hasNumber;
}

/**
 * Parse goal from user message
 */
export function parseGoal(message) {
  const messageLower = message.toLowerCase();
  
  // Extract number
  const numberMatch = message.match(/(\d+)/);
  const targetNumber = numberMatch ? parseInt(numberMatch[1]) : null;
  
  // Determine goal type based on keywords
  let goalType = 'general';
  if (messageLower.includes('appli') || messageLower.includes('apply')) {
    goalType = 'applications';
  } else if (messageLower.includes('network') || messageLower.includes('reach out') || messageLower.includes('connect')) {
    goalType = 'networking';
  } else if (messageLower.includes('follow up') || messageLower.includes('follow-up')) {
    goalType = 'follow_ups';
  } else if (messageLower.includes('interview')) {
    goalType = 'interviews';
  } else if (messageLower.includes('resume') || messageLower.includes('cv')) {
    goalType = 'resume_updates';
  }
  
  // Determine time period
  let targetPeriod = 'week'; // default
  if (messageLower.includes('today') || messageLower.includes('day')) {
    targetPeriod = 'day';
  } else if (messageLower.includes('week')) {
    targetPeriod = 'week';
  } else if (messageLower.includes('month')) {
    targetPeriod = 'month';
  }
  
  return {
    goalType,
    goalText: message.trim(),
    targetNumber,
    targetPeriod
  };
}

/**
 * Save a goal to the database
 */
export async function saveGoal(userId, goalData) {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        goal_type: goalData.goalType,
        goal_text: goalData.goalText,
        target_number: goalData.targetNumber,
        target_period: goalData.targetPeriod,
        status: 'active',
        last_check_in: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving goal:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveGoal:', error);
    return null;
  }
}

/**
 * Get active goals for a user that need check-in
 */
export async function getGoalsNeedingCheckIn(userId) {
  try {
    // Get active goals that haven't been checked in the last 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const { data, error } = await supabase
      .from('user_goals')
      .select(`
        *,
        goal_progress(progress_count, check_in_date)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .or(`last_check_in.is.null,last_check_in.lt.${twoDaysAgo.toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1); // Only check in on one goal at a time
    
    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getGoalsNeedingCheckIn:', error);
    return [];
  }
}

/**
 * Detect if user is reporting progress
 */
export function isReportingProgress(message) {
  const progressIndicators = [
    'i\'ve applied',
    'i applied',
    'i\'ve done',
    'i did',
    'i completed',
    'i finished',
    'i sent',
    'i reached out',
    'i connected',
    'so far',
    'i\'ve gotten',
    'progress'
  ];
  
  const messageLower = message.toLowerCase();
  return progressIndicators.some(indicator => messageLower.includes(indicator));
}

/**
 * Parse progress from user message
 */
export function parseProgress(message) {
  // Extract number from message
  const numberMatch = message.match(/(\d+)/);
  const progressCount = numberMatch ? parseInt(numberMatch[1]) : null;
  
  return {
    progressCount,
    progressNote: message.trim()
  };
}

/**
 * Save progress update
 */
export async function saveProgress(userId, goalId, progressData) {
  try {
    // Save progress
    const { error: progressError } = await supabase
      .from('goal_progress')
      .insert({
        goal_id: goalId,
        user_id: userId,
        progress_count: progressData.progressCount,
        progress_note: progressData.progressNote
      });
    
    if (progressError) {
      console.error('Error saving progress:', progressError);
      return false;
    }
    
    // Update last check-in time on goal
    const { error: updateError } = await supabase
      .from('user_goals')
      .update({ last_check_in: new Date().toISOString() })
      .eq('id', goalId);
    
    if (updateError) {
      console.error('Error updating goal check-in:', updateError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveProgress:', error);
    return false;
  }
}

/**
 * Mark a goal as completed
 */
export async function completeGoal(goalId) {
  try {
    const { error } = await supabase
      .from('user_goals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', goalId);
    
    if (error) {
      console.error('Error completing goal:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in completeGoal:', error);
    return false;
  }
}

/**
 * Get all active goals for display
 */
export async function getActiveGoals(userId) {
  try {
    const { data, error } = await supabase
      .from('user_goal_summary')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching active goals:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getActiveGoals:', error);
    return [];
  }
}

/**
 * Format goal check-in message
 */
export function formatGoalCheckIn(goal) {
  const timeAgo = getTimeAgo(goal.created_at);
  
  let message = `\n\n📊 **Quick Check-In**\n`;
  message += `${timeAgo} you set a goal: "${goal.goal_text}"\n\n`;
  
  if (goal.target_number) {
    message += `Target: ${goal.target_number} ${getGoalTypeLabel(goal.goal_type)}`;
    if (goal.target_period) {
      message += ` per ${goal.target_period}`;
    }
    message += `\n\n`;
  }
  
  message += `How's it going? How many have you completed so far?`;
  
  return message;
}

/**
 * Format progress celebration message
 */
export function formatProgressCelebration(goal, progressCount, totalProgress) {
  let message = '';
  
  if (goal.target_number && totalProgress >= goal.target_number) {
    // Goal completed!
    message = `\n\n🎉 **AMAZING!** You hit your goal!\n`;
    message += `${totalProgress}/${goal.target_number} ${getGoalTypeLabel(goal.goal_type)} `;
    message += `- that's the kind of consistency that gets results! 💪\n\n`;
    message += `Want to set a new goal for next ${goal.target_period}?`;
  } else if (goal.target_number) {
    // Progress update
    const percentage = Math.round((totalProgress / goal.target_number) * 100);
    message = `\n\n💪 **Nice work!**\n`;
    message += `You're at ${totalProgress}/${goal.target_number} ${getGoalTypeLabel(goal.goal_type)} `;
    message += `(${percentage}% of your goal). `;
    
    if (percentage >= 80) {
      message += `You're so close! Keep pushing! 🔥`;
    } else if (percentage >= 50) {
      message += `You're over halfway there! 🚀`;
    } else {
      message += `Keep at it - every step counts! 💪`;
    }
  } else {
    // No target number, just acknowledge
    message = `\n\n✅ **Good stuff!** Thanks for the update.\n`;
    message += `${progressCount} ${getGoalTypeLabel(goal.goal_type)} completed. `;
    message += `That's the consistency that gets results! 💪`;
  }
  
  return message;
}

/**
 * Format goal confirmation message
 */
export function formatGoalConfirmation(goal) {
  let message = `\n\n✅ **Goal Set!**\n`;
  
  if (goal.target_number) {
    message += `I'll help you stay accountable for: ${goal.target_number} ${getGoalTypeLabel(goal.goal_type)}`;
    if (goal.target_period) {
      message += ` per ${goal.target_period}`;
    }
    message += `\n\n`;
  } else {
    message += `I'll help you stay on track with: "${goal.goal_text}"\n\n`;
  }
  
  message += `I'll check in with you about this in our future conversations. `;
  message += `How many have you completed so far?`;
  
  return message;
}

// Helper functions
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Earlier today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'Last week';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return 'A while back';
}

function getGoalTypeLabel(goalType) {
  const labels = {
    'applications': 'applications',
    'networking': 'connections',
    'follow_ups': 'follow-ups',
    'interviews': 'interviews',
    'resume_updates': 'resume updates',
    'general': 'items'
  };
  return labels[goalType] || 'items';
}
```

---

## STEP 3: Integrate Goal Tracking into chat.js

### File to modify: `netlify/functions/chat.js`

**Add imports at the top:**

```javascript
import {
  isSettingGoal,
  parseGoal,
  saveGoal,
  getGoalsNeedingCheckIn,
  isReportingProgress,
  parseProgress,
  saveProgress,
  completeGoal,
  getActiveGoals,
  formatGoalCheckIn,
  formatProgressCelebration,
  formatGoalConfirmation
} from './utils/goalTracking.js';
```

**Add goal tracking logic BEFORE building the system prompt (around line 400-450):**

```javascript
// STEP 1: Check if user is setting a new goal
let goalConfirmation = '';
let newGoal = null;

if (isSettingGoal(message)) {
  const goalData = parseGoal(message);
  newGoal = await saveGoal(userId, goalData);
  
  if (newGoal) {
    console.log('New goal created:', newGoal.id);
    goalConfirmation = formatGoalConfirmation(newGoal);
  }
}

// STEP 2: Check for active goals needing check-in
let goalCheckIn = '';
let pendingGoal = null;

if (!newGoal) { // Don't check in if they just set a goal
  const goalsNeedingCheckIn = await getGoalsNeedingCheckIn(userId);
  
  if (goalsNeedingCheckIn.length > 0) {
    pendingGoal = goalsNeedingCheckIn[0];
    goalCheckIn = formatGoalCheckIn(pendingGoal);
    console.log('Goal needs check-in:', pendingGoal.id);
  }
}

// STEP 3: Check if user is reporting progress
let progressCelebration = '';

if (isReportingProgress(message) && pendingGoal) {
  const progressData = parseProgress(message);
  
  if (progressData.progressCount) {
    await saveProgress(userId, pendingGoal.id, progressData);
    
    // Calculate total progress
    const totalProgress = (pendingGoal.total_progress || 0) + progressData.progressCount;
    
    progressCelebration = formatProgressCelebration(
      pendingGoal,
      progressData.progressCount,
      totalProgress
    );
    
    // Mark goal as complete if target reached
    if (pendingGoal.target_number && totalProgress >= pendingGoal.target_number) {
      await completeGoal(pendingGoal.id);
    }
    
    console.log('Progress saved:', progressData.progressCount);
  }
}

// STEP 4: Handle "show my goals" command
let goalsDisplay = '';

if (message.toLowerCase().includes('show my goals') || 
    message.toLowerCase().includes('my goals') ||
    message.toLowerCase().includes('what are my goals')) {
  const activeGoals = await getActiveGoals(userId);
  
  if (activeGoals.length > 0) {
    goalsDisplay = '\n\n📋 **Your Active Goals:**\n\n';
    activeGoals.forEach((goal, index) => {
      goalsDisplay += `${index + 1}. ${goal.goal_text}\n`;
      if (goal.target_number) {
        goalsDisplay += `   Progress: ${goal.total_progress || 0}/${goal.target_number}\n`;
      }
      goalsDisplay += `   Set ${getTimeAgo(goal.created_at)}\n\n`;
    });
  } else {
    goalsDisplay = '\n\n📋 You don't have any active goals yet. Want to set one?\n\n';
  }
}
```

**Add goal context to system prompt:**

Find where you build the system prompt and ADD this section:

```javascript
// Add goal tracking context if applicable
let goalTrackingContext = '';

if (pendingGoal) {
  goalTrackingContext = `\n\n[ACTIVE GOAL NEEDING CHECK-IN]\n`;
  goalTrackingContext += `The user has an active goal: "${pendingGoal.goal_text}"\n`;
  goalTrackingContext += `Target: ${pendingGoal.target_number} ${getGoalTypeLabel(pendingGoal.goal_type)} per ${pendingGoal.target_period}\n`;
  goalTrackingContext += `Current progress: ${pendingGoal.total_progress || 0}/${pendingGoal.target_number}\n`;
  goalTrackingContext += `You should check in on this goal in your response.\n`;
  goalTrackingContext += `[END ACTIVE GOAL]\n`;
}

const systemPrompt = `
You are IG Career Coach, an AI assistant for The Interview Guys.

[Your existing brand identity and instructions...]

${historyContext}

[KNOWLEDGE BASE]
${knowledgeContext}
[END KNOWLEDGE BASE]

${insiderBriefContext}

${goalTrackingContext}

## GOAL TRACKING & ACCOUNTABILITY
When users set goals or commitments:
- Acknowledge enthusiastically
- Ask for initial progress count
- Remember to check in during future conversations

When checking in on goals:
- Be encouraging and supportive
- Celebrate wins genuinely (use emojis!)
- If they're behind, be motivating not judgmental
- Ask specific questions: "How many have you done so far?"

When they report progress:
- Calculate percentage if target exists
- Celebrate milestones (50%, 80%, 100%)
- Keep them motivated

Examples:
✅ "🎉 You crushed it! 12/10 applications - that's the consistency that gets results!"
✅ "💪 You're at 5/10 - halfway there! Keep the momentum going!"
✅ "I see you're working on it. Every application counts. What's blocking you from hitting your target?"

[Rest of your existing instructions...]
`;
```

**Append goal messages to the response AFTER getting Claude's response:**

Find where you prepare the final response (around line 480-520) and modify it:

```javascript
// Get Claude's main response
const assistantMessage = response.content[0].text;

// Build complete response with goal tracking messages
let finalMessage = assistantMessage;

// Add goal check-in BEFORE the main response if needed
if (goalCheckIn && !goalConfirmation && !progressCelebration) {
  finalMessage = goalCheckIn + '\n\n---\n\n' + assistantMessage;
}

// Add goal confirmation AFTER the main response
if (goalConfirmation) {
  finalMessage = assistantMessage + '\n\n' + goalConfirmation;
}

// Add progress celebration AFTER the main response
if (progressCelebration) {
  finalMessage = assistantMessage + '\n\n' + progressCelebration;
}

// Add goals display if requested
if (goalsDisplay) {
  finalMessage = goalsDisplay + '\n\n' + assistantMessage;
}

// Continue with tool recommendations, history saving, etc...
```

---

## STEP 4: Update System Prompt with Goal Instructions

### Already covered in Step 3, but here's the isolated version:

Add to your system prompt instructions:

```
## ACCOUNTABILITY & GOAL TRACKING

You help users stay accountable to their job search goals. When users:

**Set goals:**
- Phrases like "I want to apply to 10 jobs this week"
- Acknowledge: "Got it! I'll help you stay on track."
- Don't be overly formal - be like a supportive friend

**Report progress:**
- Listen for numbers and accomplishments
- Celebrate wins genuinely (use emojis: 🎉 💪 🔥)
- Encourage if they're behind, don't judge
- Examples:
  - 100%+: "🎉 You CRUSHED it! Above and beyond!"
  - 80-99%: "💪 So close! You're almost there!"
  - 50-79%: "🚀 You're over halfway - keep pushing!"
  - <50%: "💪 Every step counts. What's your plan to finish strong?"

**Need check-ins:**
- If [ACTIVE GOAL] is provided, naturally ask about it
- Don't interrupt urgent questions
- Time it right: "Quick check-in before we dive in..."
- Or: "By the way, how's that goal coming along?"

**Show progress:**
- When asked "show my goals", they'll see a formatted list
- You can reference this: "Looks like you're at 5/10 applications!"

Be encouraging, genuine, and conversational - like a supportive friend, not a robot.
```

---

## 🧪 TESTING CHECKLIST

### Test Scenario 1: Setting a Goal
**User says:** "I want to apply to 10 jobs this week"

**Expected:**
- ✅ Goal saved to database
- ✅ Bot acknowledges: "✅ Goal Set! I'll help you stay accountable..."
- ✅ Bot asks: "How many have you completed so far?"

**Verify in Supabase:**
- Check `user_goals` table has new row
- `goal_type` = 'applications'
- `target_number` = 10
- `target_period` = 'week'

---

### Test Scenario 2: Progress Check-In
**User returns 2 days later and says:** "Help me with my resume"

**Expected:**
- ✅ Bot says: "Quick check-in: You set a goal to apply to 10 jobs this week. How many have you done?"
- ✅ Then continues with resume help

**Verify:**
- Check console logs show goal was retrieved
- `last_check_in` timestamp should be older than 2 days

---

### Test Scenario 3: Reporting Progress
**User says:** "I've applied to 5 so far"

**Expected:**
- ✅ Bot celebrates: "💪 Nice work! You're at 5/10 (50% of your goal)..."
- ✅ Progress saved to database

**Verify in Supabase:**
- Check `goal_progress` table has new row
- `progress_count` = 5
- `goal_progress` table linked to correct `goal_id`

---

### Test Scenario 4: Completing Goal
**User says:** "I hit 12 applications!"

**Expected:**
- ✅ Bot celebrates enthusiastically: "🎉 AMAZING! You hit your goal! 12/10..."
- ✅ Asks about setting new goal
- ✅ Goal marked as completed in database

**Verify in Supabase:**
- Check `user_goals` table
- `status` = 'completed'
- `completed_at` timestamp is set

---

### Test Scenario 5: Show Goals Command
**User says:** "Show my goals"

**Expected:**
- ✅ Lists all active goals with progress
- ✅ Shows when each goal was set
- ✅ Shows progress (e.g., "Progress: 5/10")

---

### Test Scenario 6: Multiple Goal Types
**Set different goals:**
- "I want to send 5 follow-ups today"
- "I'm going to network with 3 people this week"
- "I need to update my resume"

**Expected:**
- ✅ Each goal type detected correctly
- ✅ Different labels used (follow-ups, connections, resume updates)

---

## 📊 DATABASE VERIFICATION

After implementation, check Supabase:

**user_goals table should have:**
- ✅ Rows for each goal set
- ✅ Proper goal_type categorization
- ✅ target_number and target_period populated
- ✅ status = 'active' for new goals

**goal_progress table should have:**
- ✅ Rows for each progress update
- ✅ Linked to correct goal_id
- ✅ progress_count matches what user said

**user_goal_summary view should show:**
- ✅ All active goals with aggregated progress
- ✅ total_progress calculated correctly

---

## 🎯 SUCCESS CRITERIA

Feature is successful when:
- ✅ Users can set goals naturally in conversation
- ✅ Bot checks in after 2+ days automatically
- ✅ Progress is tracked and celebrated
- ✅ Users feel accountable and motivated
- ✅ No errors in console or database
- ✅ Check-ins don't feel annoying or robotic

---

## 🚀 FUTURE ENHANCEMENTS (Not in this version)

**Phase 2 could include:**
- Email reminders (SendGrid integration)
- Progress dashboard visualization
- Streak tracking (consecutive days)
- Goal templates ("Apply to 10 jobs" button)
- Weekly summary emails
- Competition/leaderboard (for teams)

**For now, keep it simple and test with real users.**

---

## 💡 TIPS FOR NATURAL CONVERSATIONS

**Good check-ins:**
- "Quick check-in: How's that goal going?"
- "Before we dive in - you wanted to apply to 10 jobs. How many so far?"
- "By the way, let's see how you're doing on that goal..."

**Bad check-ins:**
- "REMINDER: YOU SET A GOAL" (too aggressive)
- "You have not completed your goal" (judgmental)
- Checking in every single message (annoying)

**Good celebrations:**
- "🎉 You crushed it! 12/10 - that's what I'm talking about!"
- "💪 Halfway there! Keep that momentum going!"
- "✅ Nice! Every application counts."

**Bad celebrations:**
- "Goal 50% complete" (robotic)
- Just stating numbers without emotion
- Over-the-top for small progress

---

## 📝 NOTES FOR CLAUDE CODE

- Wrap all database calls in try-catch
- Log important events (goal created, progress saved, etc.)
- Test each function individually before integration
- Be defensive with data parsing (users will say unpredictable things)
- Don't block the main chat if goal tracking fails
- Use the view for easy summary queries
- Keep check-in frequency reasonable (2-3 days minimum)

---

## 🔄 MAINTENANCE

**Adding new goal types:**
1. Add keyword detection in `parseGoal()`
2. Add label in `getGoalTypeLabel()`
3. Test with sample messages

**Adjusting check-in frequency:**
- Modify `twoDaysAgo` calculation in `getGoalsNeedingCheckIn()`
- Current: 2 days
- Can adjust to 1 day (aggressive) or 3+ days (gentle)

**Improving goal parsing:**
- Add more keywords to `isSettingGoal()`
- Enhance `parseGoal()` number extraction
- Test with edge cases

---

## ⚠️ EDGE CASES TO HANDLE

1. **User sets goal but no number:** Store as general goal, don't require target
2. **User says "0" for progress:** That's okay, acknowledge effort
3. **User has multiple active goals:** Only check in on one at a time
4. **User ignores check-in:** Don't repeat in same conversation, wait 2 more days
5. **Ambiguous messages:** When in doubt, don't parse as goal - better to miss than false positive

---

## 🎓 IMPLEMENTATION ORDER

1. ✅ Run SQL (Step 1)
2. ✅ Create goalTracking.js utility (Step 2)
3. ✅ Add imports to chat.js (Step 3)
4. ✅ Add goal detection logic (Step 3)
5. ✅ Update system prompt (Step 4)
6. ✅ Test each scenario (Testing Checklist)
7. ✅ Deploy and monitor

**Estimated time:** 3-4 hours with testing

---

## 💬 USER EDUCATION

After launch, add to documentation:
- "Set goals like 'I want to apply to 10 jobs this week'"
- "I'll check in with you to keep you accountable"
- "Say 'show my goals' to see your active goals"

Consider adding a tip in the chat interface:
*"💡 Tip: Set goals to stay accountable! Try: 'I want to apply to 5 jobs this week'"*

---

**This feature will make IG Career Coach feel like a real accountability partner, not just a Q&A bot.** 🎯
