// netlify/functions/chat.js
// Main chat endpoint for IG Career Coach with RAG enhancement

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { RAGRetriever } from './lib/rag.js';

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
- Action-oriented with clear next steps`;

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
    const { message, sessionId, context: toolContext, userId } = JSON.parse(event.body);

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

    // Build system prompt with RAG context
    const systemPrompt = getSystemPrompt(toolContext, ragContext) + formatArticlesForContext(relevantArticles);

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages
    });

    const assistantMessage = response.content[0].text;

    // Save assistant message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        message: assistantMessage,
        context: toolContext || null,
        metadata: {
          model: 'claude-sonnet-4-20250514',
          usage: response.usage,
          rag_chunks_used: retrievedChunks,
          citations: citations
        }
      });

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Return response with RAG metadata
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: assistantMessage,
        conversationId: conversationId,
        timestamp: new Date().toISOString(),
        sources: relevantArticles,
        citations: citations, // RAG sources used
        retrievedChunks: retrievedChunks // Number of knowledge chunks retrieved
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
};
