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
