import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configuration
const BRIEFS_DIR = './insider-briefs/raw';
const CHUNK_SIZE = 500; // words per chunk
const OVERLAP = 50; // word overlap between chunks

/**
 * Extract text from DOCX file
 */
async function extractTextFromDocx(filepath) {
  try {
    const result = await mammoth.extractRawText({ path: filepath });
    return result.value;
  } catch (error) {
    console.error(`Error reading ${filepath}:`, error);
    return null;
  }
}

/**
 * Parse metadata from brief text
 */
function parseMetadata(text, filename) {
  // Extract brief number from filename (e.g., "drop_001.docx" -> 1)
  const numberMatch = filename.match(/drop_(\d+)/);
  const briefNumber = numberMatch ? parseInt(numberMatch[1]) : null;

  // Extract date (format: "Date: 2025-05-05" or "Date: 2025-5-5")
  const dateMatch = text.match(/Date:\s*(\d{4})-(\d{1,2})-(\d{1,2})/);
  let briefDate = null;
  if (dateMatch) {
    const [_, year, month, day] = dateMatch;
    briefDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Extract Market Temperature score (format: "Score: 71 / 100")
  const scoreMatch = text.match(/Score:\s*(\d+)\s*\/\s*100/);
  const marketScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

  return { briefNumber, briefDate, marketScore };
}

/**
 * Chunk text into segments
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = OVERLAP) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 100) { // Skip very short chunks
      chunks.push({
        text: chunk.trim(),
        wordCount: chunk.split(/\s+/).length
      });
    }
  }

  return chunks;
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Process a single brief file
 */
async function processBrief(filepath) {
  const filename = path.basename(filepath);
  console.log(`\n📄 Processing ${filename}...`);

  // Extract text
  const text = await extractTextFromDocx(filepath);
  if (!text) {
    console.error(`  ❌ Failed to extract text from ${filename}`);
    return { success: false, filename };
  }

  // Parse metadata
  const metadata = parseMetadata(text, filename);
  console.log(`  ℹ️  Brief #${metadata.briefNumber}, Date: ${metadata.briefDate}, Score: ${metadata.marketScore}`);

  // Chunk text
  const chunks = chunkText(text);
  console.log(`  ℹ️  Created ${chunks.length} chunks`);

  // Generate embeddings and upload
  let uploadedChunks = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Generate embedding
    const embedding = await generateEmbedding(chunk.text);
    if (!embedding) {
      console.error(`  ❌ Failed to generate embedding for chunk ${i + 1}`);
      continue;
    }

    // Upload to Supabase
    const { error } = await supabase.from('insider_briefs').insert({
      brief_number: metadata.briefNumber,
      brief_date: metadata.briefDate,
      market_score: metadata.marketScore,
      chunk_text: chunk.text,
      chunk_index: i,
      word_count: chunk.wordCount,
      embedding: embedding
    });

    if (error) {
      console.error(`  ❌ Error uploading chunk ${i + 1}:`, error);
    } else {
      uploadedChunks++;
    }

    // Progress indicator
    if ((i + 1) % 5 === 0) {
      console.log(`  ⏳ Processed ${i + 1}/${chunks.length} chunks...`);
    }
  }

  console.log(`  ✅ Successfully uploaded ${uploadedChunks}/${chunks.length} chunks`);
  return {
    success: true,
    filename,
    briefNumber: metadata.briefNumber,
    totalChunks: chunks.length,
    uploadedChunks
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Insider Brief Processing...\n');
  console.log('='.repeat(80));

  // Get all DOCX files
  const files = fs.readdirSync(BRIEFS_DIR)
    .filter(f => f.endsWith('.docx'))
    .map(f => path.join(BRIEFS_DIR, f))
    .sort();

  console.log(`Found ${files.length} brief files to process\n`);

  // Process each file
  const results = [];
  for (const filepath of files) {
    const result = await processBrief(filepath);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 PROCESSING COMPLETE');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success);
  const totalChunks = successful.reduce((sum, r) => sum + r.uploadedChunks, 0);

  console.log(`✅ Successfully processed: ${successful.length}/${files.length} briefs`);
  console.log(`✅ Total chunks uploaded: ${totalChunks}`);
  console.log(`📅 Date range: May 2025 - October 2025`);
  console.log(`\n💰 Estimated cost: ~$${(totalChunks * 0.0001).toFixed(2)}`);

  if (successful.length < files.length) {
    console.log(`\n⚠️  ${files.length - successful.length} files failed to process`);
    const failed = results.filter(r => !r.success);
    failed.forEach(f => console.log(`  - ${f.filename}`));
  }
}

// Run the script
main().catch(console.error);
