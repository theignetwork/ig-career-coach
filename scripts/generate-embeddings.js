// scripts/generate-embeddings.js
// Generate embeddings for chunks and upload to Supabase

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_BATCH_SIZE = 50;
const INSERT_BATCH_SIZE = 100;
const BATCH_DELAY_MS = 1000;
const COST_PER_1K_TOKENS = 0.0001; // $0.0001 per 1K tokens for ada-002

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate embeddings for a batch of texts
 */
async function generateEmbeddingsBatch(texts) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts
    });

    return {
      embeddings: response.data.map(d => d.embedding),
      tokensUsed: response.usage.total_tokens
    };
  } catch (error) {
    if (error.status === 429) {
      console.error('   ⚠️  Rate limit hit, waiting 10 seconds...');
      await sleep(10000);
      return generateEmbeddingsBatch(texts); // Retry
    }
    throw error;
  }
}

/**
 * Process chunks in batches and generate embeddings
 */
async function generateAllEmbeddings(chunks) {
  console.log('\n🔄 Generating embeddings...\n');

  const results = [];
  let totalTokensUsed = 0;
  let failedChunks = 0;

  const totalBatches = Math.ceil(chunks.length / EMBEDDING_BATCH_SIZE);

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batchNum = Math.floor(i / EMBEDDING_BATCH_SIZE) + 1;
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);

    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`);

    try {
      const texts = batch.map(c => c.content);
      const { embeddings, tokensUsed } = await generateEmbeddingsBatch(texts);

      totalTokensUsed += tokensUsed;

      // Combine chunks with their embeddings
      for (let j = 0; j < batch.length; j++) {
        results.push({
          ...batch[j],
          embedding: embeddings[j]
        });
      }

      console.log(`   ✅ Generated ${embeddings.length} embeddings (${tokensUsed} tokens)`);

      // Delay between batches to respect rate limits
      if (i + EMBEDDING_BATCH_SIZE < chunks.length) {
        await sleep(BATCH_DELAY_MS);
      }
    } catch (error) {
      console.error(`   ❌ Error in batch ${batchNum}:`, error.message);
      failedChunks += batch.length;
      // Continue with next batch
    }
  }

  return { results, totalTokensUsed, failedChunks };
}

/**
 * Insert embeddings into Supabase in batches
 */
async function insertToSupabase(embeddedChunks) {
  console.log('\n📤 Inserting into Supabase...\n');

  let successCount = 0;
  let failedCount = 0;

  const totalBatches = Math.ceil(embeddedChunks.length / INSERT_BATCH_SIZE);

  for (let i = 0; i < embeddedChunks.length; i += INSERT_BATCH_SIZE) {
    const batchNum = Math.floor(i / INSERT_BATCH_SIZE) + 1;
    const batch = embeddedChunks.slice(i, i + INSERT_BATCH_SIZE);

    console.log(`Inserting batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

    try {
      // Transform data for insertion
      const records = batch.map(chunk => ({
        content: chunk.content,
        embedding: chunk.embedding,
        tool: chunk.metadata.tool,
        content_type: chunk.metadata.content_type,
        source: chunk.metadata.source,
        section: chunk.metadata.section,
        metadata: {
          word_count: chunk.metadata.word_count
        }
      }));

      const { error } = await supabase
        .from('knowledge_base')
        .insert(records);

      if (error) throw error;

      successCount += batch.length;
      console.log(`   ✅ Inserted ${batch.length} records`);

    } catch (error) {
      console.error(`   ❌ Error inserting batch ${batchNum}:`, error.message);
      failedCount += batch.length;
      // Continue with next batch
    }
  }

  return { successCount, failedCount };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting embedding generation...\n');

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env file');
    process.exit(1);
  }

  // Load chunks
  const chunksPath = path.join(__dirname, '../chunks.json');

  if (!fs.existsSync(chunksPath)) {
    console.error('❌ Error: chunks.json not found. Run "npm run rag:chunk" first.');
    process.exit(1);
  }

  const chunks = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
  console.log(`📦 Loaded ${chunks.length} chunks from chunks.json`);

  // Calculate cost estimate
  const totalTokens = chunks.reduce((sum, chunk) => sum + estimateTokens(chunk.content), 0);
  const estimatedCost = (totalTokens / 1000) * COST_PER_1K_TOKENS;

  console.log('\n💰 Cost Estimate:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Estimated tokens: ~${totalTokens.toLocaleString()}`);
  console.log(`Estimated cost: ~$${estimatedCost.toFixed(4)}`);
  console.log(`Model: ${EMBEDDING_MODEL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Generate embeddings
  const startTime = Date.now();
  const { results, totalTokensUsed, failedChunks } = await generateAllEmbeddings(chunks);

  if (results.length === 0) {
    console.error('\n❌ No embeddings generated. Exiting.');
    process.exit(1);
  }

  // Insert into Supabase
  const { successCount, failedCount } = await insertToSupabase(results);

  const duration = Math.round((Date.now() - startTime) / 1000);
  const actualCost = (totalTokensUsed / 1000) * COST_PER_1K_TOKENS;

  // Show summary
  console.log('\n📊 FINAL SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total chunks processed: ${chunks.length}`);
  console.log(`Embeddings generated: ${results.length}`);
  console.log(`Failed during embedding: ${failedChunks}`);
  console.log(`Records inserted: ${successCount}`);
  console.log(`Failed during insertion: ${failedCount}`);
  console.log(`Total tokens used: ${totalTokensUsed.toLocaleString()}`);
  console.log(`Actual cost: $${actualCost.toFixed(4)}`);
  console.log(`Duration: ${duration}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (successCount === chunks.length) {
    console.log('\n✅ All embeddings generated and inserted successfully!');
  } else {
    console.log(`\n⚠️  Completed with ${failedChunks + failedCount} failures`);
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
