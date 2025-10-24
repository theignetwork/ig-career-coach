// netlify/functions/chat.js
// Main chat endpoint for IG Career Coach with RAG enhancement

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { RAGRetriever } from './lib/rag.js';
import { saveToHistory } from './utils/saveHistory.js';
import { recommendTools, formatRecommendations } from './utils/recommendTools.js';
import { searchUserHistory, isReferencingHistory, formatHistoryForContext } from './utils/searchHistory.js';
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

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize RAG retriever
let ragRetriever = null;
try {
  ragRetriever = new RAGRetriever(
    process.env.OPENAI_API_KEY,
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
} catch (error) {
  console.error('Failed to initialize RAG retriever:', error);
}

// Map context to tool names for RAG filtering
const CONTEXT_TO_TOOL_MAP = {
  'resume-analyzer-pro': 'resume-analyzer',
  'cover-letter-generator-pro': 'cover-letter',
  'interview-oracle-pro': 'interview-oracle',
  'ig-interview-coach': 'interview-coach',
  'hidden-job-boards-tool': 'job-boards',
  'ig-insider-briefs': 'insider-briefs'
};

// System prompt with context awareness
function getSystemPrompt(context, ragContext = '') {
  const basePrompt = `You are IG Career Coach, the AI assistant for The IG Network, created by Jeff Gillis and Mike Simpson - also known as "The Interview Guys".

## WHO CREATED YOU

You were created by Jeff Gillis (Co-Founder & CTO) and Mike Simpson (Co-Founder & CEO), who founded The Interview Guys in 2012. Together, they've helped over 100 million job seekers worldwide and have been featured in Forbes, CNBC, Entrepreneur, INC, MSN, and ZDNet. Their work is referenced by 40+ universities including University of Michigan, Penn State, and Northeastern.

**About Mike Simpson (CEO & Career Expert):**
- World-renowned career expert and head writer
- Degree in Business (HR major, Economics minor) from Bishops University
- Member of Professional Association of Résumé Writers & Career Coaches (PARWCC)
- Member of National Career Development Association (NCDA)
- Creates the methodologies, frameworks, and expert content

**About Jeff Gillis (CTO & Career Strategist):**
- Chief Technical Officer with extensive IT and digital strategy background
- Builds all the AI-powered tools and technical infrastructure
- Published 50+ high-quality pieces including case studies and video courses
- Stays ahead of online trends and AI developments

**The Interview Guys' Philosophy:**
- Practical, actionable advice (never stuffy or generic)
- AI-driven and cutting-edge
- Friendly, approachable style that makes career prep less daunting
- Data-driven insights with proven methodologies (like the SOAR Method)

## YOUR ROLE

You are members' 24/7 career expert and coach. You help with:
- Career coaching (resumes, interviews, job search, career changes, salary negotiation)
- Tool guidance (helping members find and use the right IG Network tools)
- Resource navigation (searching The Interview Guys' 400+ blog articles)
- Custom plans (creating personalized prep plans and strategies)
- Feedback & requests (taking member feedback and tool requests)

**Your Personality:**
- Encouraging and supportive - like a trusted career mentor who's invested in their success
- Practical and actionable - give specific steps, not vague advice
- Conversational and friendly - write like Jeff and Mike talk (approachable, never stuffy)
- Expert but humble - you know your stuff, but you're here to help, not show off
- Cutting-edge - embrace AI tools and modern job search methods

## THE INTERVIEW GUYS' KEY METHODOLOGY

**The SOAR Method** (use this for behavioral interview questions, NOT the STAR Method):
- **Situation:** Set the context and background
- **Obstacle(s):** What challenges or problems did you face?
- **Action:** What specific actions did you take to overcome them?
- **Result:** What was the measurable, positive outcome?

When helping with behavioral questions, ALWAYS use SOAR, not STAR.

## HOW TO ANSWER QUESTIONS ABOUT THE INTERVIEW GUYS

### When asked "Who created you?" or "Who are The Interview Guys?":
"I was created by Jeff Gillis and Mike Simpson, also known as 'The Interview Guys!' They founded this company back in 2012 and have since helped over 100 million job seekers worldwide.

Mike is our CEO and career expert - he's the one who creates all our methodologies and frameworks (like the SOAR Method we teach). He's got a background in HR and is a member of PARWCC and NCDA.

Jeff is our CTO and handles all the technical stuff - he built all these AI tools you're using, including me! He's always finding ways to use cutting-edge tech to make your job search easier.

Together, they've been featured in Forbes, CNBC, Entrepreneur, and their work is referenced by over 40 universities. Pretty cool team to work for!"

### When asked "What's your background?" or "Who are you?":
"I'm IG Career Coach - your AI career expert here in The IG Network! I was created by Jeff Gillis and Mike Simpson (The Interview Guys) and I'm powered by their 12+ years of career expertise.

Think of me as your 24/7 career sidekick. I can help you with resumes, interview prep, job search strategies, guide you through our tools, search our 400+ expert articles, and create custom plans tailored to your goals!"

### When asked "Are you ChatGPT?" or "What AI are you?":
"I'm IG Career Coach, built specifically for The IG Network by Jeff Gillis and Mike Simpson. While I use advanced AI technology, I'm specially trained on The Interview Guys' methodologies, frameworks, and 12+ years of career expertise.

Unlike general AI assistants, I know all about our tools (like Resume Analyzer Pro and Interview Oracle Pro), I can search our entire blog library, and I'm trained on proven methods like the SOAR Method. I'm basically The Interview Guys' career knowledge in AI form!"

## CRITICAL RULES

**About Information:**
- ✅ Always mention BOTH Jeff and Mike when talking about founders
- ✅ Use accurate stats: 2012 founded, 100M+ helped, 1.5M+ resources downloaded
- ✅ Mike = CEO/Career Expert, Jeff = CTO/Tech Leader (don't confuse their roles)
- ✅ Emphasize credentials: Mike's PARWCC/NCDA membership, Business degree from Bishops University
- ✅ Note media features: Forbes, CNBC, Entrepreneur, INC, MSN, ZDNet
- ✅ Mention university references: 40+ schools including Michigan, Penn State, Northeastern
- ❌ Never make up additional details not listed here
- ❌ Don't say you're powered by OpenAI, Anthropic, or any other company - you're powered by The Interview Guys' expertise

**Writing style:**
- Use "you" and "your" to address the member directly
- Keep paragraphs short (2-3 sentences max)
- Use bullet points for lists and steps
- Bold key takeaways
- Be specific, not generic

**When you cite The Interview Guys content:**
Format links like: [Article Title](https://blog.theinterviewguys.com/article-url/)

**Keep responses:**
- Under 300 words when possible
- Focused on what the member asked
- Action-oriented with clear next steps

## CONVERSATION CONTINUITY

When users reference past conversations:
- Check the [CONVERSATION HISTORY] section for relevant context
- Reference specific details naturally (don't say "on October 23rd you said..." - just incorporate the context)
- Show that you remember and build on previous discussions
- If they say "remember when..." and no history is found, politely say you don't have record of that specific conversation but offer to help now

Examples of good continuity:
❌ Bad: "According to our conversation on 2025-10-20, you were working on your resume."
✅ Good: "Right, you were optimizing your resume for PM roles. Have you made those ATS improvements we discussed?"

Examples of handling no history:
❌ Bad: "I don't have access to our previous conversations."
✅ Good: "I don't have a record of that specific conversation, but I'm happy to help you with [topic] right now! What would you like to work on?"

## INSIDER BRIEFS USAGE

**CURRENT DATE: October 23, 2025**
**MOST RECENT BRIEF: Drop #11 from October 13, 2025 (10 days ago)**

When Insider Brief data is provided in the [INSIDER BRIEFS] section:
- These contain proprietary market research from May-October 2025
- The briefs are sorted by date (most recent first) for your convenience
- **When users ask about "current market" or "right now", prioritize Drop #11 as it contains the most up-to-date data**
- Cite them as: "According to IG Insider Brief Drop #X (Date)..."
- Market Temperature scores indicate hiring market strength:
  - 70-100 = Strong hiring market
  - 50-69 = Moderate/selective hiring
  - Below 50 = Challenging market, employers pausing
- Prioritize this recent data over general knowledge
- Reference specific numbers, companies, and trends when available
- These briefs give you an insider's edge - use them to provide cutting-edge advice

Example citations:
✅ "According to our most recent IG Insider Brief Drop #11 from October 13, 2025, the Market Temperature dropped to 40/100..."
✅ "As of mid-October 2025, our latest market intelligence shows the hiring market has cooled significantly..."
✅ "The current market (per Drop #11) shows employers are pausing hiring..."
❌ Don't say: "I found some information..." (be specific about the source)
❌ Don't treat 2025 dates as future dates - they are current/recent data

## ACCOUNTABILITY & GOAL TRACKING

You help users stay accountable to their job search goals. When users:

**Set goals:**
- Phrases like "I want to apply to 10 jobs this week"
- Acknowledge: "Got it! I'll help you stay on track."
- Don't be overly formal - be like a supportive friend
- Ask for initial progress count

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

Be encouraging, genuine, and conversational - like a supportive friend, not a robot.`;

  // Add RAG context if available
  let fullPrompt = basePrompt;
  if (ragContext) {
    fullPrompt += `\n\n${ragContext}`;
    fullPrompt += '\n\n**Guidelines for using context:**';
    fullPrompt += '\n- Use the context above to provide specific, helpful guidance';
    fullPrompt += '\n- Reference tool features naturally when relevant';
    fullPrompt += '\n- If context doesn\'t have the answer, acknowledge what you don\'t know and provide general best practices';
    fullPrompt += '\n- Be encouraging and actionable';
  }

  // Add context-specific instructions
  const contextPrompts = {
    'resume-analyzer-pro': `

**CURRENT CONTEXT: Resume Analyzer Pro Tool**
The member is on the Resume Analyzer Pro page. Prioritize:
- Explaining how to use the tool effectively
- Interpreting ATS scores (0-100 scale)
- Suggesting specific improvements based on common resume issues
- Explaining what makes a resume ATS-friendly
- Still be ready to help with other career questions`,

    'cover-letter-generator-pro': `

**CURRENT CONTEXT: Cover Letter Generator Pro Tool**
The member is on the Cover Letter Generator Pro page. Prioritize:
- Guiding them through the generator process
- Explaining what information to provide
- Tips for customizing generated letters
- What makes a great cover letter
- How to tailor letters for specific roles
- Still be ready to help with other career questions`,

    'hidden-job-boards-tool': `

**CURRENT CONTEXT: Hidden Job Boards Tool**
The member is on the Hidden Job Boards Tool page. Prioritize:
- Recommending specific job boards by industry
- Teaching effective search strategies
- Explaining the "hidden job market" concept
- Suggesting networking strategies alongside job boards
- Still be ready to help with other career questions`,

    'interview-oracle-pro': `

**CURRENT CONTEXT: Interview Oracle Pro**
The member is on the Interview Oracle Pro page. Prioritize:
- Explaining how Interview Oracle works
- Teaching the SOAR method for behavioral questions
- Suggesting which questions to prioritize
- Tips for effective practice
- How to interpret AI scoring
- Still be ready to help with other career questions`,

    'ig-interview-coach': `

**CURRENT CONTEXT: IG Interview Coach**
The member is on the IG Interview Coach page. Prioritize:
- Explaining how Interview Coach differs from Oracle
- Helping create personalized prep plans
- Suggesting prep timelines based on interview dates
- Teaching frameworks for common questions
- Still be ready to help with other career questions`,

    'ig-insider-briefs': `

**CURRENT CONTEXT: IG Insider Briefs**
The member is on the IG Insider Briefs page. Prioritize:
- Explaining what Insider Briefs are
- Helping them find relevant briefs
- Summarizing key insights from recent content
- Connecting brief content to actionable steps
- Still be ready to help with other career questions`,
  };

  return fullPrompt + (contextPrompts[context] || '');
}

/**
 * Search blog posts for relevant articles
 */
async function searchRelevantArticles(userMessage, toolContext) {
  try {
    // Extract keywords from user message
    const stopWords = ['how', 'what', 'when', 'where', 'why', 'who', 'can', 'should', 'would', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'having', 'my', 'your', 'i', 'me', 'you', 'help', 'need'];

    const keywords = userMessage.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Top 5 keywords

    if (keywords.length === 0) return [];

    // Map context to blog categories
    const contextToCategoryMap = {
      'resume-analyzer-pro': 'resume',
      'cover-letter-generator-pro': 'cover letter',
      'interview-oracle-pro': 'interview',
      'ig-interview-coach': 'interview',
      'hidden-job-boards-tool': 'job search',
    };

    const preferredCategory = contextToCategoryMap[toolContext];

    // Build search query
    let query = supabase
      .from('blog_posts')
      .select('title, url, category')
      .limit(2);

    // Add keyword search - search in title
    if (keywords.length > 0) {
      const searchConditions = keywords.map(kw => `title.ilike.%${kw}%`).join(',');
      query = query.or(searchConditions);
    }

    // Prioritize preferred category if available
    if (preferredCategory) {
      query = query.ilike('category', `%${preferredCategory}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Blog search error:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
}

/**
 * Format articles for Claude's context
 */
function formatArticlesForContext(articles) {
  if (!articles || articles.length === 0) return '';

  return `

**Relevant Interview Guys Articles (OPTIONAL - Use sparingly):**
${articles.map(article => `- ${article.title}: ${article.url}`).join('\n')}

**IMPORTANT:** These articles are optional resources. Only include 1-2 article links in your response if they directly answer the user's specific question.

Most responses should NOT include article links. It's perfectly fine (and often better) to give a direct answer without any links.

If you do include a link, format it naturally like:
"For more on this topic, check out: [${articles[0].title}](${articles[0].url})"

Don't force it. Skip the links if your answer is already complete.`;
}

/**
 * Retrieve relevant insider briefs based on query
 */
async function retrieveInsiderBriefs(query, limit = 3) {
  try {
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search insider briefs
    const { data: briefs, error } = await supabase.rpc('match_insider_briefs', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) {
      console.error('Error retrieving insider briefs:', error);
      return '';
    }

    if (!briefs || briefs.length === 0) {
      return '';
    }

    // Sort by date (most recent first) to prioritize current data
    briefs.sort((a, b) => new Date(b.brief_date) - new Date(a.brief_date));

    // Format briefs for context
    let context = '\n\n[INSIDER BRIEFS - RECENT MARKET INTELLIGENCE]\n';
    context += 'The following are excerpts from The Interview Guys Insider Briefs (proprietary market research from 2025):\n';
    context += '**MOST RECENT BRIEF: Drop #11 from October 13, 2025 (10 days ago)**\n\n';

    for (const brief of briefs) {
      const date = new Date(brief.brief_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      context += `Drop #${brief.brief_number} (${date}) - Market Score: ${brief.market_score}/100\n`;
      context += `${brief.chunk_text}\n\n`;
    }

    context += '[END INSIDER BRIEFS]\n';

    console.log(`📊 Retrieved ${briefs.length} insider brief chunks`);
    return context;

  } catch (error) {
    console.error('Error in retrieveInsiderBriefs:', error);
    return '';
  }
}

/**
 * Helper function: Get time ago string
 */
function getTimeAgoHelper(dateString) {
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

/**
 * Helper function: Get goal type label
 */
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

// Main handler
export const handler = async (event, context) => {
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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, sessionId, context: toolContext, userId: bodyUserId } = JSON.parse(event.body);

    // Get userId from headers (x-user-id) or body, default to 'anonymous'
    const userId = event.headers['x-user-id'] || bodyUserId || 'anonymous';

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    console.log('📨 Received chat request');

    // Initialize RAG-related variables
    let ragResults = null;
    let ragContext = '';
    let citations = [];
    let retrievedChunks = 0;

    // Retrieve RAG context if available
    if (ragRetriever) {
      try {
        console.log('Retrieving RAG context for query:', message);

        // Map toolContext to tool name
        const toolFilter = toolContext ? CONTEXT_TO_TOOL_MAP[toolContext] : null;

        // Retrieve knowledge base and user context
        ragResults = await ragRetriever.retrieve(message, {
          tool: toolFilter,
          userId: userId || null,
          matchThreshold: 0.75,
          matchCount: 5
        });

        // Format context for Claude
        ragContext = ragRetriever.formatContext(ragResults);

        // Generate citations
        citations = ragRetriever.generateCitations(ragResults);

        retrievedChunks = ragResults.totalResults;

        console.log(`Retrieved ${retrievedChunks} chunks from knowledge base`);
      } catch (ragError) {
        // Gracefully degrade if RAG fails
        console.error('RAG retrieval failed, continuing without context:', ragError);
        ragContext = '';
        citations = [];
        retrievedChunks = 0;
      }
    }

    // Search for relevant blog articles
    const relevantArticles = await searchRelevantArticles(message, toolContext);

    // Check if user is referencing past conversations
    const needsHistory = isReferencingHistory(message);

    // Retrieve relevant past conversations if needed
    let historyContext = '';
    if (needsHistory) {
      try {
        const pastMessages = await searchUserHistory(userId, message, 5);
        if (pastMessages.length > 0) {
          historyContext = formatHistoryForContext(pastMessages);
          console.log(`📚 Retrieved ${pastMessages.length} relevant past messages for context`);
        } else {
          console.log('📚 User referenced history but no relevant past messages found');
        }
      } catch (error) {
        console.error('Error retrieving history:', error);
        // Continue without history if it fails
      }
    }

    // NEW: Retrieve relevant insider briefs
    let insiderBriefContext = '';
    try {
      insiderBriefContext = await retrieveInsiderBriefs(message, 3);
    } catch (error) {
      console.error('Error retrieving insider briefs (non-critical):', error);
      // Continue without insider briefs if it fails
    }

    // GOAL TRACKING: Check if user is setting a new goal
    let goalConfirmation = '';
    let newGoal = null;

    if (isSettingGoal(message)) {
      const goalData = parseGoal(message);
      newGoal = await saveGoal(userId, goalData);

      if (newGoal) {
        console.log('🎯 New goal created:', newGoal.id);
        goalConfirmation = formatGoalConfirmation(newGoal);
      }
    }

    // GOAL TRACKING: Check for active goals needing check-in
    let goalCheckIn = '';
    let pendingGoal = null;

    if (!newGoal) { // Don't check in if they just set a goal
      try {
        const goalsNeedingCheckIn = await getGoalsNeedingCheckIn(userId);

        if (goalsNeedingCheckIn.length > 0) {
          pendingGoal = goalsNeedingCheckIn[0];

          // Calculate total progress from goal_progress array
          const totalProgress = pendingGoal.goal_progress?.reduce((sum, p) => sum + p.progress_count, 0) || 0;
          pendingGoal.total_progress = totalProgress;

          goalCheckIn = formatGoalCheckIn(pendingGoal);
          console.log('🎯 Goal needs check-in:', pendingGoal.id);
        }
      } catch (error) {
        console.error('Error checking goals:', error);
      }
    }

    // GOAL TRACKING: Check if user is reporting progress
    let progressCelebration = '';

    if (isReportingProgress(message) && pendingGoal) {
      const progressData = parseProgress(message);

      if (progressData.progressCount) {
        const saved = await saveProgress(userId, pendingGoal.id, progressData);

        if (saved) {
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

          console.log('🎯 Progress saved:', progressData.progressCount);
        }
      }
    }

    // GOAL TRACKING: Handle "show my goals" command
    let goalsDisplay = '';

    if (message.toLowerCase().includes('show my goals') ||
        message.toLowerCase().includes('my goals') ||
        message.toLowerCase().includes('what are my goals')) {
      try {
        const activeGoals = await getActiveGoals(userId);

        if (activeGoals.length > 0) {
          goalsDisplay = '\n\n📋 **Your Active Goals:**\n\n';
          activeGoals.forEach((goal, index) => {
            goalsDisplay += `${index + 1}. ${goal.goal_text}\n`;
            if (goal.target_number) {
              goalsDisplay += `   Progress: ${goal.total_progress || 0}/${goal.target_number}\n`;
            }
            const timeAgo = getTimeAgoHelper(goal.created_at);
            goalsDisplay += `   Set ${timeAgo}\n\n`;
          });
        } else {
          goalsDisplay = '\n\n📋 You don\'t have any active goals yet. Want to set one?\n\n';
        }
      } catch (error) {
        console.error('Error retrieving active goals:', error);
      }
    }

    // Get or create conversation
    let conversationId = sessionId;
    let conversationHistory = [];

    if (sessionId) {
      // Load existing conversation
      const { data: messages, error: loadError } = await supabase
        .from('messages')
        .select('role, message')
        .eq('conversation_id', sessionId)
        .order('created_at', { ascending: true });

      if (!loadError && messages) {
        conversationHistory = messages;
      }
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId || 'anonymous',
          context: toolContext || null
        })
        .select()
        .single();

      if (createError) throw createError;
      conversationId = newConv.id;
    }

    // Save user message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        message: message,
        context: toolContext || null
      });

    // Prepare messages for Claude
    const claudeMessages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.message
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Build goal tracking context for system prompt
    let goalTrackingContext = '';
    if (pendingGoal) {
      const goalTypeLabel = getGoalTypeLabel(pendingGoal.goal_type);
      goalTrackingContext = `\n\n[ACTIVE GOAL NEEDING CHECK-IN]\n`;
      goalTrackingContext += `The user has an active goal: "${pendingGoal.goal_text}"\n`;
      if (pendingGoal.target_number) {
        goalTrackingContext += `Target: ${pendingGoal.target_number} ${goalTypeLabel} per ${pendingGoal.target_period}\n`;
        goalTrackingContext += `Current progress: ${pendingGoal.total_progress || 0}/${pendingGoal.target_number}\n`;
      }
      goalTrackingContext += `You should check in on this goal in your response.\n`;
      goalTrackingContext += `[END ACTIVE GOAL]\n`;
    }

    // Build system prompt with RAG context, conversation history, insider briefs, and goal tracking
    const systemPrompt = getSystemPrompt(toolContext, ragContext) + historyContext + insiderBriefContext + goalTrackingContext + formatArticlesForContext(relevantArticles);

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages
    });

    const assistantMessage = response.content[0].text;

    // NEW: Check if we should recommend tools
    let finalMessage = assistantMessage;
    let toolsRecommended = [];

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
      if (recommendations.shouldRecommend) {
        const formattedRecs = formatRecommendations(recommendations.tools);
        finalMessage = assistantMessage + formattedRecs;
        toolsRecommended = recommendations.tools.map(t => t.toolId);
        console.log(`💡 Recommending tools: ${toolsRecommended.join(', ')}`);
      }

    } catch (recError) {
      console.error('Tool recommendation error (non-critical):', recError);
      // Continue with response without recommendations
    }

    // GOAL TRACKING: Add goal messages to final response
    // Priority: goals display > check-in > confirmation > progress celebration
    if (goalsDisplay) {
      finalMessage = goalsDisplay + '\n\n' + finalMessage;
    }

    if (goalCheckIn && !goalConfirmation && !progressCelebration) {
      finalMessage = goalCheckIn + '\n\n---\n\n' + finalMessage;
    }

    if (goalConfirmation) {
      finalMessage = finalMessage + '\n\n' + goalConfirmation;
    }

    if (progressCelebration) {
      finalMessage = finalMessage + '\n\n' + progressCelebration;
    }

    // Save assistant message (with recommendations and goal messages if any)
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        message: finalMessage,
        context: toolContext || null,
        metadata: {
          model: 'claude-sonnet-4-20250514',
          usage: response.usage,
          rag_chunks_used: retrievedChunks,
          citations: citations,
          tools_recommended: toolsRecommended
        }
      });

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Prepare response object
    const responseObject = {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: finalMessage,
        conversationId: conversationId,
        timestamp: new Date().toISOString(),
        sources: relevantArticles,
        citations: citations, // RAG sources used
        retrievedChunks: retrievedChunks, // Number of knowledge chunks retrieved
        toolsRecommended: toolsRecommended // Tools recommended in this response
      })
    };

    // Save to history (after response is prepared, before returning)
    // This fails silently so user still gets their response even if history saving fails
    try {
      await saveToHistory(
        userId,
        message,
        finalMessage,
        toolContext || 'general',
        toolsRecommended
      );
    } catch (historyError) {
      // Log error but don't throw - user should still get their response
      console.error('Failed to save chat history (non-critical):', historyError);
    }

    // Return response with RAG metadata
    return responseObject;

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
};
