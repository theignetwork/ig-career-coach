# IG Career Coach - Feature Implementation Guide

## Overview
This guide contains detailed instructions for implementing two new features:
1. **Conversation History Recall** - Let users reference past conversations
2. **Tool Recommendations** - Proactively suggest relevant tools

---

## 🥈 FEATURE #2: TOOL RECOMMENDATIONS (Implement First)

### Overview
The chatbot will analyze user messages and proactively recommend relevant tools from The Interview Guys toolkit. Recommendations should feel natural, helpful, and non-pushy.

---

### STEP 2.1: Create Tool Recommendation Utility

**File to create:** `netlify/functions/utils/recommendTools.js`

```javascript
/**
 * Tool Recommendation Engine
 * Analyzes user messages and recommends relevant tools
 */

// Tool catalog with keywords and metadata
const TOOL_CATALOG = {
  'resume-analyzer': {
    name: 'Resume Analyzer Pro',
    keywords: ['resume', 'cv', 'ats', 'optimize resume', 'resume review', 'resume score', 'applicant tracking'],
    description: 'Scans your resume for ATS optimization and gives specific improvement suggestions',
    url: '/tools/resume-analyzer',
    category: 'resume'
  },
  'interview-oracle': {
    name: 'Interview Oracle Pro',
    keywords: ['interview', 'interview questions', 'practice interview', 'mock interview', 'interview prep', 'behavioral questions'],
    description: 'Get AI-powered interview practice with personalized questions based on your role',
    url: '/tools/interview-oracle',
    category: 'interview'
  },
  'cover-letter-generator': {
    name: 'Cover Letter Generator Pro',
    keywords: ['cover letter', 'application letter', 'letter of interest', 'cover letter template'],
    description: 'Creates tailored cover letters that get you noticed by hiring managers',
    url: '/tools/cover-letter-generator',
    category: 'application'
  },
  'interview-coach': {
    name: 'IG Interview Coach',
    keywords: ['interview practice', 'soar method', 'star method', 'behavioral interview', 'answer questions'],
    description: 'Practice answering tough interview questions using our proven SOAR method',
    url: '/tools/interview-coach',
    category: 'interview'
  },
  'hidden-job-boards': {
    name: 'Hidden Job Boards Tool',
    keywords: ['job search', 'job boards', 'find jobs', 'hidden jobs', 'job listings', 'where to apply'],
    description: 'Access curated job boards that most job seekers don\'t know about',
    url: '/tools/hidden-job-boards',
    category: 'job-search'
  },
  'insider-briefs': {
    name: 'IG Insider Briefs',
    keywords: ['salary', 'compensation', 'negotiate salary', 'pay range', 'industry insights', 'company research'],
    description: 'Get insider insights on salaries, companies, and industry trends',
    url: '/tools/insider-briefs',
    category: 'research'
  }
};

/**
 * Analyzes message and returns tool recommendations
 * @param {string} message - User's message
 * @param {Array} toolsAlreadyRecommended - Tools recommended in this session
 * @returns {Object} - Recommendation result
 */
export function recommendTools(message, toolsAlreadyRecommended = []) {
  const messageLower = message.toLowerCase();
  const recommendations = [];
  
  // Score each tool based on keyword matches
  for (const [toolId, tool] of Object.entries(TOOL_CATALOG)) {
    // Skip if already recommended in this session
    if (toolsAlreadyRecommended.includes(toolId)) {
      continue;
    }
    
    // Count keyword matches
    let score = 0;
    for (const keyword of tool.keywords) {
      if (messageLower.includes(keyword)) {
        score += 1;
      }
    }
    
    // If we have matches, add to recommendations
    if (score > 0) {
      recommendations.push({
        toolId,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        category: tool.category,
        score
      });
    }
  }
  
  // Sort by score (highest first) and take top 2
  recommendations.sort((a, b) => b.score - a.score);
  const topRecommendations = recommendations.slice(0, 2);
  
  return {
    shouldRecommend: topRecommendations.length > 0,
    tools: topRecommendations
  };
}

/**
 * Formats tool recommendations for display
 * @param {Array} tools - Array of tool recommendations
 * @returns {string} - Formatted recommendation text
 */
export function formatRecommendations(tools) {
  if (!tools || tools.length === 0) {
    return '';
  }
  
  if (tools.length === 1) {
    const tool = tools[0];
    return `\n\n💡 **By the way:** Since you're working on this, you might find our **${tool.name}** helpful. It ${tool.description.toLowerCase()}. [Check it out here](${tool.url})`;
  }
  
  // Multiple tools
  let text = '\n\n💡 **Tools that might help:**\n';
  for (const tool of tools) {
    text += `\n- **[${tool.name}](${tool.url})** - ${tool.description}`;
  }
  
  return text;
}
```

---

### STEP 2.2: Update chat_history Table Schema

**Action:** Run this SQL in Supabase SQL Editor to add tracking for recommended tools

```sql
-- Add column to track which tools have been recommended to users
ALTER TABLE chat_history 
ADD COLUMN IF NOT EXISTS tools_recommended text[];

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_history_tools ON chat_history USING GIN (tools_recommended);
```

---

### STEP 2.3: Integrate Tool Recommendations into chat.js

**File to modify:** `netlify/functions/chat.js`

**Changes needed:**

1. **Add import at the top of the file:**
```javascript
import { recommendTools, formatRecommendations } from './utils/recommendTools.js';
```

2. **After retrieving the main Claude response, add recommendation logic:**

Find the section where you get the response from Claude (around line 450-480), and ADD this code AFTER you have the assistant's response but BEFORE returning it:

```javascript
// Get Claude's main response
const assistantMessage = response.content[0].text;

// NEW: Check if we should recommend tools
try {
  // Get tools already recommended in this session
  const { data: sessionHistory } = await supabase
    .from('chat_history')
    .select('tools_recommended')
    .eq('user_id', userId)
    .not('tools_recommended', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  // Collect all tools recommended in recent history
  const recentlyRecommended = new Set();
  if (sessionHistory) {
    for (const row of sessionHistory) {
      if (row.tools_recommended) {
        row.tools_recommended.forEach(tool => recentlyRecommended.add(tool));
      }
    }
  }
  
  // Get recommendations based on user's message
  const recommendations = recommendTools(message, Array.from(recentlyRecommended));
  
  // If we have recommendations, append them to the response
  let finalMessage = assistantMessage;
  let toolsToTrack = [];
  
  if (recommendations.shouldRecommend) {
    const formattedRecs = formatRecommendations(recommendations.tools);
    finalMessage = assistantMessage + formattedRecs;
    toolsToTrack = recommendations.tools.map(t => t.toolId);
  }
  
  // Save to history with tool recommendations tracked
  await saveToHistory(userId, message, finalMessage, toolContext || 'general', toolsToTrack);
  
  // Return the response with recommendations
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: finalMessage,
      toolsRecommended: toolsToTrack
    })
  };
  
} catch (error) {
  console.error('Tool recommendation error:', error);
  // Fall back to response without recommendations
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: assistantMessage
    })
  };
}
```

---

### STEP 2.4: Update saveToHistory Function

**File to modify:** `netlify/functions/utils/saveHistory.js`

**Update the function signature and implementation:**

```javascript
export async function saveToHistory(userId, userMessage, assistantMessage, toolContext = 'general', toolsRecommended = []) {
  try {
    // Save user message
    await supabase.from('chat_history').insert({
      user_id: userId,
      message: userMessage,
      role: 'user',
      tool_context: toolContext
    });

    // Save assistant message with tools recommended
    await supabase.from('chat_history').insert({
      user_id: userId,
      message: assistantMessage,
      role: 'assistant',
      tool_context: toolContext,
      tools_recommended: toolsRecommended.length > 0 ? toolsRecommended : null
    });

    console.log('Chat history saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save chat history:', error);
    return false;
  }
}
```

---

## 🥇 FEATURE #1: CONVERSATION HISTORY RECALL (Implement Second)

### Overview
Allow users to reference past conversations. When they say "remember when..." or "what did we discuss about X?", the bot will search their chat history and reference specific past interactions.

---

### STEP 1.1: Create History Search Utility

**File to create:** `netlify/functions/utils/searchHistory.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Searches user's conversation history for relevant past messages
 * @param {string} userId - User identifier
 * @param {string} query - What the user is asking about
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} - Array of relevant past conversation snippets
 */
export async function searchUserHistory(userId, query, limit = 5) {
  try {
    // Normalize query for keyword matching
    const queryLower = query.toLowerCase();
    const keywords = extractKeywords(queryLower);
    
    // Get recent user conversations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100); // Get last 100 messages to search through
    
    if (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
    
    if (!messages || messages.length === 0) {
      return [];
    }
    
    // Score messages based on keyword relevance
    const scoredMessages = messages.map(msg => {
      let score = 0;
      const msgLower = msg.message.toLowerCase();
      
      // Check for keyword matches
      for (const keyword of keywords) {
        if (msgLower.includes(keyword)) {
          score += 2; // Strong match
        }
      }
      
      // Bonus for tool_context matches
      if (msg.tool_context && queryLower.includes(msg.tool_context)) {
        score += 1;
      }
      
      return { ...msg, score };
    });
    
    // Filter to only messages with relevance, sort by score
    const relevantMessages = scoredMessages
      .filter(msg => msg.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Format for context inclusion
    return relevantMessages.map(msg => ({
      message: msg.message,
      role: msg.role,
      created_at: msg.created_at,
      tool_context: msg.tool_context
    }));
    
  } catch (error) {
    console.error('Error searching user history:', error);
    return [];
  }
}

/**
 * Detects if the user is trying to reference past conversations
 * @param {string} message - User's current message
 * @returns {boolean} - True if message references past conversations
 */
export function isReferencingHistory(message) {
  const historyIndicators = [
    'remember',
    'last time',
    'we discussed',
    'you said',
    'you told me',
    'previous',
    'earlier',
    'before',
    'we talked about',
    'when we chatted',
    'our conversation'
  ];
  
  const messageLower = message.toLowerCase();
  return historyIndicators.some(indicator => messageLower.includes(indicator));
}

/**
 * Extracts meaningful keywords from a query
 * @param {string} query - User query
 * @returns {Array} - Array of keywords
 */
function extractKeywords(query) {
  // Remove common words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'what', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'is', 'was', 'are', 'were', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'remember', 'we', 'our', 'i', 'me', 'my', 'you', 'your'
  ]);
  
  // Split into words and filter
  const words = query
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  return [...new Set(words)]; // Remove duplicates
}

/**
 * Formats conversation history for inclusion in system prompt
 * @param {Array} historyMessages - Array of past messages
 * @returns {string} - Formatted history text
 */
export function formatHistoryForContext(historyMessages) {
  if (!historyMessages || historyMessages.length === 0) {
    return '';
  }
  
  let formatted = '\n\n[CONVERSATION HISTORY]\n';
  formatted += 'Here are relevant past conversations with this user:\n\n';
  
  for (const msg of historyMessages) {
    const date = new Date(msg.created_at).toLocaleDateString();
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    formatted += `${date} - ${role}: ${msg.message}\n\n`;
  }
  
  formatted += '[END CONVERSATION HISTORY]\n\n';
  
  return formatted;
}
```

---

### STEP 1.2: Integrate History Search into chat.js

**File to modify:** `netlify/functions/chat.js`

**Changes needed:**

1. **Add import at the top:**
```javascript
import { searchUserHistory, isReferencingHistory, formatHistoryForContext } from './utils/searchHistory.js';
```

2. **Before calling Claude, check for history references and retrieve relevant past conversations:**

Find where you build the system prompt and retrieve RAG context (around line 350-400), and ADD this code:

```javascript
// Check if user is referencing past conversations
const needsHistory = isReferencingHistory(message);

// Retrieve relevant past conversations if needed
let historyContext = '';
if (needsHistory) {
  try {
    const pastMessages = await searchUserHistory(userId, message, 5);
    if (pastMessages.length > 0) {
      historyContext = formatHistoryForContext(pastMessages);
      console.log(`Retrieved ${pastMessages.length} relevant past messages`);
    }
  } catch (error) {
    console.error('Error retrieving history:', error);
    // Continue without history if it fails
  }
}

// Your existing RAG retrieval code here...
// const relevantKnowledge = await retrieveKnowledge(message);

// Build enhanced system prompt with both knowledge AND history
const systemPrompt = `
You are IG Career Coach, an AI assistant for The Interview Guys.

[Your existing brand identity and instructions here...]

${historyContext}

[KNOWLEDGE BASE]
${relevantKnowledge}
[END KNOWLEDGE BASE]

IMPORTANT INSTRUCTIONS:
- When the user references past conversations ("remember when", "last time", etc.), use the [CONVERSATION HISTORY] section above to provide context-aware responses
- Reference specific details from past conversations to show continuity
- If history is provided, acknowledge what was discussed previously
- Make the user feel heard and remembered
- Be natural - don't say "according to our conversation on X date", just reference it naturally

[Rest of your existing instructions...]
`;
```

---

### STEP 1.3: Update System Prompt Instructions

**File to modify:** `netlify/functions/chat.js`

**In your system prompt, add these instructions:**

```javascript
const systemPrompt = `
You are IG Career Coach, an AI assistant for The Interview Guys.

[Existing brand identity instructions...]

## CONVERSATION CONTINUITY
When users reference past conversations:
- Check the [CONVERSATION HISTORY] section for relevant context
- Reference specific details naturally (don't say "on October 23rd you said..." - just incorporate the context)
- Show that you remember and build on previous discussions
- If they say "remember when..." and no history is found, politely say you don't have record of that specific conversation but offer to help now

Examples of good continuity:
❌ Bad: "According to our conversation on 2025-10-20, you were working on your resume."
✅ Good: "Right, you were optimizing your resume for PM roles. Have you made those ATS improvements we discussed?"

[Rest of existing instructions...]
`;
```

---

## 🧪 TESTING CHECKLIST

### Test Feature #2: Tool Recommendations

- [ ] Send message about "resume" - Should recommend Resume Analyzer
- [ ] Send message about "interview prep" - Should recommend Interview Oracle
- [ ] Send message about "cover letter" - Should recommend Cover Letter Generator
- [ ] Send 2 messages about same topic - Should NOT recommend same tool twice
- [ ] Send generic message like "hello" - Should NOT recommend any tools
- [ ] Check Supabase chat_history table - tools_recommended column should populate

### Test Feature #1: History Recall

- [ ] Have a conversation about resumes, then in new session say "remember when we discussed resumes?" - Should reference past conversation
- [ ] Say "what did we talk about last time?" - Should summarize recent conversation
- [ ] Say "you mentioned X earlier" - Should acknowledge and build on that context
- [ ] New user says "remember when..." - Should gracefully handle no history found
- [ ] Check that history search doesn't break if user has no past conversations

---

## 📊 DEPLOYMENT CHECKLIST

After implementation:

- [ ] All tests passing
- [ ] No console errors in browser
- [ ] Supabase tables updated correctly
- [ ] Git commit with clear message
- [ ] Push to GitHub
- [ ] Verify Netlify deployment succeeds
- [ ] Test on production site
- [ ] Monitor first 24 hours for any issues

---

## 🚨 ROLLBACK PLAN

If something breaks:

1. **For Tool Recommendations:**
   - Comment out the `recommendTools()` call in chat.js
   - Deploy - chat will work normally without recommendations

2. **For History Recall:**
   - Comment out the `searchUserHistory()` call in chat.js
   - Deploy - chat will work normally without history

Both features are designed to fail gracefully - if they error, the main chat still works.

---

## 📝 NOTES FOR CLAUDE CODE

- All new files should follow the existing project structure
- Use existing Supabase client patterns
- Error handling should be defensive (try-catch everything)
- Console.log important events for debugging
- Follow existing code style and formatting
- Test locally before deploying to production
- Both features should degrade gracefully if they fail

---

## 🎯 SUCCESS CRITERIA

**Feature #2 is successful when:**
- Tool recommendations appear naturally in relevant conversations
- Recommendations are not repetitive or spammy
- Click-through rate to tools increases
- Users report discovering tools they didn't know about

**Feature #1 is successful when:**
- Users can reference past conversations and get relevant responses
- Bot demonstrates continuity across sessions
- Users feel like they're talking to someone who "remembers" them
- No increase in error rates or response times

---

## IMPLEMENTATION ORDER

1. ✅ First: Complete Feature #2 (Tool Recommendations) - Simpler, immediate value
2. ✅ Second: Complete Feature #1 (History Recall) - More complex, builds on history infrastructure
3. ✅ Third: Test both features together
4. ✅ Fourth: Deploy to production
5. ✅ Fifth: Monitor and iterate based on user feedback
