// netlify/functions/chat.js
// Main chat endpoint for IG Career Coach

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// System prompt with context awareness
function getSystemPrompt(context) {
  const basePrompt = `You are IG Career Coach, an expert AI assistant for The Interview Guys Network members.

Your role is to provide actionable career advice, job search strategies, resume help, interview preparation, and general career guidance.

**Your personality:**
- Friendly, encouraging, and conversational (like talking to a knowledgeable friend)
- Practical and action-oriented (always give concrete next steps)
- Concise but thorough (get to the point, but don't skip important details)
- Empathetic and supportive (job searching is hard, be encouraging)

**Writing style:**
- Use "you" and "your" to address the member directly
- Keep paragraphs short (2-3 sentences max)
- Use bullet points for lists and steps
- Bold key takeaways
- Be specific, not generic

**What you can help with:**
- Resume writing and optimization
- Cover letter creation
- Interview preparation (including SOAR method for behavioral questions)
- Job search strategies
- Career transitions
- Salary negotiation
- Professional development
- Navigating workplace challenges

**IMPORTANT: You teach the SOAR Method (not STAR):**
- S = Situation
- O = Obstacle(s)
- A = Action
- R = Result

When discussing behavioral interview answers, always reference SOAR, not STAR.

**When you cite The Interview Guys content:**
Format links like: [Article Title](https://blog.theinterviewguys.com/article-url/)

**Keep responses:**
- Under 300 words when possible
- Focused on what the member asked
- Action-oriented with clear next steps`;

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

  return basePrompt + (contextPrompts[context] || '');
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
      .limit(5);

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

**Relevant Interview Guys Articles:**
${articles.map(article => `- ${article.title}: ${article.url}`).join('\n')}

When appropriate, you can reference these articles in your response by saying something like:
"For more details, check out our guide: [${articles[0].title}](${articles[0].url})"

Only mention articles if they're truly relevant to the user's question. Don't force it.`;
}

// Main handler
exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, sessionId, context: toolContext } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' })
      };
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
          user_id: 'anonymous', // For V1, using anonymous. In V2, get from auth
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

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: getSystemPrompt(toolContext) + formatArticlesForContext(relevantArticles),
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
          usage: response.usage
        }
      });

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Return response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: assistantMessage,
        sessionId: conversationId,
        timestamp: new Date().toISOString(),
        relatedArticles: relevantArticles // Include articles in response
      })
    };

  } catch (error) {
    console.error('Chat error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to process message',
        message: 'Sorry, I encountered an error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
