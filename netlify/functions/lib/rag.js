// netlify/functions/lib/rag.js
// RAG (Retrieval Augmented Generation) module for knowledge base retrieval

const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const DEFAULT_MATCH_THRESHOLD = 0.75;
const DEFAULT_MATCH_COUNT = 5;

/**
 * RAGRetriever class for knowledge base and user context retrieval
 */
class RAGRetriever {
  constructor(openaiKey, supabaseUrl, supabaseKey) {
    this.openai = new OpenAI({ apiKey: openaiKey });
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Generate embedding for a query using OpenAI
   */
  async embedQuery(query) {
    try {
      const response = await this.openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: query
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      throw error;
    }
  }

  /**
   * Retrieve knowledge from knowledge_base table
   */
  async retrieveKnowledge(query, filters = {}) {
    try {
      // Generate embedding for query
      const embedding = await this.embedQuery(query);

      const {
        tool = null,
        matchThreshold = DEFAULT_MATCH_THRESHOLD,
        matchCount = DEFAULT_MATCH_COUNT
      } = filters;

      // Call match_knowledge RPC function
      let rpcQuery = this.supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      });

      // Filter by tool if provided
      if (tool) {
        rpcQuery = rpcQuery.eq('tool', tool);
      }

      const { data, error } = await rpcQuery;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error retrieving knowledge:', error.message);
      return [];
    }
  }

  /**
   * Retrieve user-specific context from user_context table
   */
  async retrieveUserContext(query, userId, options = {}) {
    try {
      if (!userId || userId === 'anonymous') {
        return [];
      }

      // Generate embedding for query
      const embedding = await this.embedQuery(query);

      const {
        matchThreshold = DEFAULT_MATCH_THRESHOLD,
        matchCount = 3
      } = options;

      // Call match_user_context RPC function
      const { data, error } = await this.supabase.rpc('match_user_context', {
        query_embedding: embedding,
        query_user_id: userId,
        match_threshold: matchThreshold,
        match_count: matchCount
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error retrieving user context:', error.message);
      return [];
    }
  }

  /**
   * Retrieve both knowledge base and user context
   */
  async retrieve(query, options = {}) {
    const {
      tool = null,
      userId = null,
      matchThreshold = DEFAULT_MATCH_THRESHOLD,
      matchCount = DEFAULT_MATCH_COUNT
    } = options;

    try {
      // Retrieve knowledge base chunks
      const knowledgeResults = await this.retrieveKnowledge(query, {
        tool,
        matchThreshold,
        matchCount
      });

      // Retrieve user-specific context
      const userResults = await this.retrieveUserContext(query, userId, {
        matchThreshold,
        matchCount: 2 // Fewer user context results
      });

      return {
        knowledge: knowledgeResults,
        userContext: userResults,
        totalResults: knowledgeResults.length + userResults.length
      };
    } catch (error) {
      console.error('Error in retrieve:', error.message);
      return {
        knowledge: [],
        userContext: [],
        totalResults: 0
      };
    }
  }

  /**
   * Format retrieved context for Claude's system prompt
   */
  formatContext(results) {
    const { knowledge, userContext } = results;

    if (!knowledge.length && !userContext.length) {
      return '';
    }

    let formatted = '\n**RELEVANT KNOWLEDGE BASE CONTEXT:**\n';

    // Add knowledge base results
    if (knowledge.length > 0) {
      formatted += '\n**Tool-Specific Information:**\n';
      knowledge.forEach((chunk, idx) => {
        formatted += `\n[Source ${idx + 1}: ${chunk.tool}${chunk.section ? ` - ${chunk.section}` : ''}]\n`;
        formatted += `${chunk.content}\n`;
      });
    }

    // Add user context results
    if (userContext.length > 0) {
      formatted += '\n**User-Specific Context:**\n';
      userContext.forEach((ctx, idx) => {
        formatted += `\n[User Context ${idx + 1}: ${ctx.context_type}]\n`;
        formatted += `${ctx.content}\n`;
      });
    }

    formatted += '\n**END OF CONTEXT**\n';
    formatted += '\nUse this context to provide specific, accurate guidance. If the context doesn\'t contain the answer, acknowledge that and provide general best practices.\n';

    return formatted;
  }

  /**
   * Generate citations from retrieved results
   */
  generateCitations(results) {
    const { knowledge } = results;

    if (!knowledge.length) {
      return [];
    }

    return knowledge.map(chunk => ({
      tool: chunk.tool,
      section: chunk.section || null,
      similarity: Math.round(chunk.similarity * 100) / 100,
      source: chunk.source || null
    }));
  }
}

/**
 * Store conversation in user_context for future RAG retrieval
 */
async function storeConversation(supabase, userId, userMsg, aiMsg, metadata = {}) {
  try {
    if (!userId || userId === 'anonymous') {
      return null;
    }

    // Create combined content for embedding
    const content = `User: ${userMsg}\n\nAssistant: ${aiMsg}`;

    // Generate embedding
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: content
    });

    const embedding = response.data[0].embedding;

    // Insert into user_context
    const { data, error } = await supabase
      .from('user_context')
      .insert({
        user_id: userId,
        context_type: 'conversation',
        content: content,
        embedding: embedding,
        metadata: {
          ...metadata,
          user_message: userMsg,
          ai_response: aiMsg
        }
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error storing conversation:', error.message);
    return null;
  }
}

/**
 * Store user resume for future reference
 */
async function storeUserResume(supabase, userId, resumeText, metadata = {}) {
  try {
    if (!userId || userId === 'anonymous') {
      return null;
    }

    // Generate embedding
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: resumeText
    });

    const embedding = response.data[0].embedding;

    // Insert into user_context
    const { data, error } = await supabase
      .from('user_context')
      .insert({
        user_id: userId,
        context_type: 'resume',
        content: resumeText,
        embedding: embedding,
        metadata: metadata
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error storing resume:', error.message);
    return null;
  }
}

module.exports = {
  RAGRetriever,
  storeConversation,
  storeUserResume
};
