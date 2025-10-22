// scripts/test-rag.js
// Test RAG retrieval system

require('dotenv').config();
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const MATCH_THRESHOLD = 0.7;
const MATCH_COUNT = 3;

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test queries
const TEST_QUERIES = [
  {
    query: "How do I improve my ATS score?",
    expectedTool: "resume-analyzer"
  },
  {
    query: "What's the SOAR method?",
    expectedTool: "interview-oracle"
  },
  {
    query: "How should I write a cover letter?",
    expectedTool: "cover-letter"
  },
  {
    query: "What are the best job boards for remote work?",
    expectedTool: "job-boards"
  }
];

/**
 * Generate embedding for a query
 */
async function generateQueryEmbedding(query) {
  try {
    const response = await openai.embeddings.create({
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
 * Search knowledge base using match_knowledge function
 */
async function searchKnowledge(embedding, matchCount = MATCH_COUNT, matchThreshold = MATCH_THRESHOLD) {
  try {
    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: embedding,
      match_count: matchCount,
      match_threshold: matchThreshold
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching knowledge base:', error.message);
    throw error;
  }
}

/**
 * Truncate text to specified length
 */
function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Test a single query
 */
async function testQuery(queryObj, index) {
  const { query, expectedTool } = queryObj;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST ${index + 1}: "${query}"`);
  console.log(`Expected tool: ${expectedTool}`);
  console.log('='.repeat(70));

  try {
    // Generate embedding
    console.log('🔄 Generating query embedding...');
    const embedding = await generateQueryEmbedding(query);

    // Search knowledge base
    console.log('🔍 Searching knowledge base...');
    const results = await searchKnowledge(embedding);

    if (results.length === 0) {
      console.log('⚠️  No results found');
      return { success: false, foundTool: null };
    }

    // Display results
    console.log(`\n📋 Top ${results.length} Results:\n`);

    results.forEach((result, idx) => {
      console.log(`${idx + 1}. Tool: ${result.tool}`);
      console.log(`   Section: ${result.section || 'N/A'}`);
      console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
      console.log(`   Content: ${truncate(result.content.replace(/\n/g, ' '))}`);
      console.log();
    });

    // Check if top result matches expected tool
    const topTool = results[0].tool;
    const success = topTool === expectedTool;

    if (success) {
      console.log(`✅ SUCCESS: Found correct tool (${topTool})`);
    } else {
      console.log(`❌ MISMATCH: Expected ${expectedTool}, got ${topTool}`);
    }

    return { success, foundTool: topTool };

  } catch (error) {
    console.error(`❌ Error testing query:`, error.message);
    return { success: false, foundTool: null, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting RAG System Test\n');

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env file');
    process.exit(1);
  }

  // Test connection to Supabase
  console.log('🔗 Testing Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);

    if (error) throw error;

    console.log('✅ Supabase connection successful\n');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }

  // Run all test queries
  const results = [];

  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const result = await testQuery(TEST_QUERIES[i], i);
    results.push(result);

    // Small delay between queries
    if (i < TEST_QUERIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));

  const successCount = results.filter(r => r.success).length;
  const totalTests = TEST_QUERIES.length;

  console.log(`\nTests passed: ${successCount}/${totalTests}`);

  results.forEach((result, idx) => {
    const query = TEST_QUERIES[idx];
    const status = result.success ? '✅' : '❌';
    console.log(`${status} "${query.query}"`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log();

  if (successCount === totalTests) {
    console.log('✅ RAG retrieval working correctly!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  ${totalTests - successCount} test(s) failed\n`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
