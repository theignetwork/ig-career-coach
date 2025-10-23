// netlify/functions/search-blog-posts.js
// Search blog posts by keywords

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Extract search keywords from a user query
 */
function extractKeywords(query) {
  // Remove common words and punctuation
  const stopWords = ['how', 'what', 'when', 'where', 'why', 'who', 'can', 'should', 'would', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'having', 'my', 'your', 'i', 'me', 'you', 'help', 'need'];

  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  return [...new Set(words)]; // Remove duplicates
}

/**
 * Search blog posts using keywords
 */
async function searchBlogPosts(keywords, category = null, limit = 5) {
  try {
    // Build search query
    let query = supabase
      .from('blog_posts')
      .select('id, title, url, category');

    // If category specified, filter by it
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    // Search in title for any of the keywords
    const searchPattern = keywords.join('|'); // OR pattern
    query = query.or(`title.ilike.%${keywords[0]}%${keywords.slice(1).map(kw => `,title.ilike.%${kw}%`).join('')}`);

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('Blog search error:', error);
    return [];
  }
}

/**
 * Smart search - tries category-specific search first, then general
 */
async function smartSearch(userQuery, context = null) {
  const keywords = extractKeywords(userQuery);

  if (keywords.length === 0) {
    return [];
  }

  // Map context to blog categories
  const contextToCategoryMap = {
    'resume-analyzer-pro': 'resume',
    'cover-letter-generator-pro': 'cover letter',
    'interview-oracle-pro': 'interview',
    'ig-interview-coach': 'interview',
    'hidden-job-boards-tool': 'job search',
  };

  const preferredCategory = contextToCategoryMap[context];

  // Try category-specific search first
  let results = [];
  if (preferredCategory) {
    results = await searchBlogPosts(keywords, preferredCategory, 3);
  }

  // If not enough results, search all categories
  if (results.length < 3) {
    const generalResults = await searchBlogPosts(keywords, null, 5);
    results = [...results, ...generalResults].slice(0, 5);
  }

  // Remove duplicates
  const uniqueResults = Array.from(
    new Map(results.map(item => [item.id, item])).values()
  );

  return uniqueResults;
}

// Main handler
export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query, context } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    const results = await smartSearch(query, context);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        results,
        keywords: extractKeywords(query),
        count: results.length
      })
    };

  } catch (error) {
    console.error('Search error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to search blog posts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
