# Adding Insider Briefs to RAG - Implementation Guide

## Overview
This guide walks through adding 11 IG Insider Brief documents to the RAG knowledge base. These briefs contain cutting-edge market intelligence, hiring trends, and actionable career advice from May-October 2025.

**Why Add These:**
- ✅ Contains 2025 market data Claude doesn't have
- ✅ Specific salary ranges, hiring numbers, company announcements
- ✅ Market Temperature scores and trend analysis
- ✅ Proprietary research that differentiates your Career Coach
- ✅ Total: 22,218 words of valuable, time-sensitive content

**Cost:** ~$0.02 one-time + $0.10/month ongoing (negligible)

---

## 📊 Content Analysis

**Files Analyzed:**
- 11 Insider Brief DOCX files (drop_001 through drop_011)
- Date range: May 5, 2025 → October 13, 2025
- Total word count: 22,218 words
- Average per brief: 2,019 words

**Content Structure:**
Each brief contains:
- Market Temperature Score (0-100)
- Current hiring trends and data
- Industry-specific insights
- Company announcements
- Headlines with sources/links
- Actionable job search advice

---

## 🎯 Implementation Strategy

We'll create a specialized knowledge base table specifically for Insider Briefs, separate from the main knowledge base. This allows:
- ✅ Easy updates when new briefs are published
- ✅ Time-based filtering (show most recent data)
- ✅ Source attribution ("According to IG Insider Brief Drop 011...")
- ✅ Separate tracking and analytics

---

## STEP 1: Create Insider Briefs Database Table

### Action: Run this SQL in Supabase

```sql
-- Create table for Insider Brief embeddings
CREATE TABLE insider_briefs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_number integer NOT NULL,
  brief_date date NOT NULL,
  market_score integer,
  chunk_text text NOT NULL,
  chunk_index integer NOT NULL,
  word_count integer,
  embedding vector(1536),
  created_at timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_insider_briefs_embedding ON insider_briefs 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_insider_briefs_date ON insider_briefs(brief_date DESC);
CREATE INDEX idx_insider_briefs_number ON insider_briefs(brief_number);

-- Create search function for insider briefs
CREATE OR REPLACE FUNCTION match_insider_briefs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  brief_number integer,
  brief_date date,
  market_score integer,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    insider_briefs.id,
    insider_briefs.brief_number,
    insider_briefs.brief_date,
    insider_briefs.market_score,
    insider_briefs.chunk_text,
    1 - (insider_briefs.embedding <=> query_embedding) AS similarity
  FROM insider_briefs
  WHERE 1 - (insider_briefs.embedding <=> query_embedding) > match_threshold
  ORDER BY insider_briefs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## STEP 2: Prepare the Insider Brief Files

### Action: Move files to project folder

The 11 DOCX files are currently in `/mnt/user-data/uploads/`. We need to move them to your project.

**Files to move:**
- drop_001.docx
- drop_003.docx
- drop_004.docx
- drop_004__1_.docx (this appears to be a revised drop_004, we'll handle both)
- drop_005.docx
- drop_006.docx
- drop_007.docx
- drop_008.docx
- drop_009.docx
- drop_010.docx
- drop_011.docx

**Create folder structure:**
```bash
cd ~/ig-career-coach
mkdir -p insider-briefs/raw
```

Then copy the files (Claude Code will do this).

---

## STEP 3: Create Brief Processing Script

### File to create: `scripts/process-insider-briefs.js`

This script will:
1. Read all DOCX files from `insider-briefs/raw/`
2. Extract text content
3. Parse metadata (brief number, date, market score)
4. Chunk content into ~500-word segments
5. Generate embeddings using OpenAI
6. Upload to Supabase `insider_briefs` table

```javascript
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
  console.log('='=80);
  
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
  console.log('\n' + '='*80);
  console.log('📊 PROCESSING COMPLETE');
  console.log('='*80);
  
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
```

---

## STEP 4: Update chat.js to Search Insider Briefs

### File to modify: `netlify/functions/chat.js`

Add insider brief search alongside existing knowledge base search.

**Add new function for insider brief retrieval:**

```javascript
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
    
    // Format briefs for context
    let context = '\n\n[INSIDER BRIEFS - RECENT MARKET INTELLIGENCE]\n';
    context += 'The following are excerpts from The Interview Guys Insider Briefs (proprietary market research from 2025):\n\n';
    
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
    
    return context;
    
  } catch (error) {
    console.error('Error in retrieveInsiderBriefs:', error);
    return '';
  }
}
```

**Integrate into main chat flow:**

Find where you currently retrieve knowledge base context (around line 390-420), and ADD insider brief retrieval:

```javascript
// Existing history recall code...
const needsHistory = isReferencingHistory(message);
let historyContext = '';
if (needsHistory) {
  const pastMessages = await searchUserHistory(userId, message, 5);
  if (pastMessages.length > 0) {
    historyContext = formatHistoryForContext(pastMessages);
  }
}

// Existing knowledge base retrieval...
const knowledgeContext = await retrieveKnowledge(message, toolContext);

// NEW: Retrieve insider briefs
const insiderBriefContext = await retrieveInsiderBriefs(message, 3);

// Build system prompt with ALL context sources
const systemPrompt = `
You are IG Career Coach, an AI assistant for The Interview Guys.

[Your existing brand identity...]

${historyContext}

[KNOWLEDGE BASE]
${knowledgeContext}
[END KNOWLEDGE BASE]

${insiderBriefContext}

IMPORTANT INSTRUCTIONS:
- When citing Insider Briefs, reference them as "According to IG Insider Brief Drop #X from [date]..."
- Insider Briefs contain cutting-edge 2025 market data - prioritize this over general knowledge
- Market Temperature scores show hiring market health (70+ = strong, 50-69 = moderate, below 50 = challenging)
- Always cite specific data points when available (hiring numbers, market scores, etc.)

[Rest of your existing instructions...]
`;
```

---

## STEP 5: Update System Prompt with Brief Instructions

### File to modify: `netlify/functions/chat.js`

Add instructions to the system prompt about how to use Insider Briefs:

```javascript
const systemPrompt = `
You are IG Career Coach, an AI assistant for The Interview Guys.

[Existing brand identity...]

## INSIDER BRIEFS USAGE
When Insider Brief data is provided in the [INSIDER BRIEFS] section:
- These contain proprietary market research from May-October 2025
- Cite them as: "According to IG Insider Brief Drop #X (Date)..."
- Market Temperature scores indicate hiring market strength:
  - 70-100 = Strong hiring market
  - 50-69 = Moderate/selective hiring
  - Below 50 = Challenging market, employers pausing
- Prioritize this recent data over general knowledge
- Reference specific numbers, companies, and trends when available
- These briefs give you an insider's edge - use them to provide cutting-edge advice

Example citations:
✅ "According to IG Insider Brief Drop #11 from October 2025, the Market Temperature dropped to 40/100..."
✅ "Our latest market intelligence shows tech unemployment at a two-year low..."
❌ Don't say: "I found some information..." (be specific about the source)

[Rest of existing instructions...]
`;
```

---

## STEP 6: Install Required Dependencies

### Action: Update package.json

Add `mammoth` package for reading DOCX files:

```bash
npm install mammoth --save
```

---

## 🧪 TESTING CHECKLIST

### After Implementation:

**Test 1: Basic Brief Retrieval**
- Query: "What's the current job market like?"
- Expected: Should cite recent Insider Brief with Market Temperature score

**Test 2: Specific Industry Data**
- Query: "Are tech companies hiring right now?"
- Expected: Should reference AI hiring trends, tech unemployment data from briefs

**Test 3: Time-Sensitive Info**
- Query: "What were the job numbers in September 2025?"
- Expected: Should cite Drop #11 about phantom jobs revelation

**Test 4: Market Temperature**
- Query: "Is now a good time to look for a job?"
- Expected: Should reference Market Temperature scores and explain what they mean

**Test 5: Company-Specific**
- Query: "Tell me about recent company expansions"
- Expected: Should mention specific companies from briefs (Amgen, Microsoft, etc.)

**Test 6: Verify Database**
- Check Supabase `insider_briefs` table
- Should have ~40-50 rows (11 briefs × 4-5 chunks each)
- Check embeddings are present (not null)

---

## 📋 IMPLEMENTATION STEPS SUMMARY

1. ✅ **Run SQL** in Supabase to create `insider_briefs` table
2. ✅ **Move DOCX files** from uploads to project folder
3. ✅ **Install mammoth** package
4. ✅ **Create processing script** at `scripts/process-insider-briefs.js`
5. ✅ **Run processing script** to embed and upload briefs
6. ✅ **Add retrieveInsiderBriefs()** function to chat.js
7. ✅ **Integrate retrieval** into main chat flow
8. ✅ **Update system prompt** with brief usage instructions
9. ✅ **Test with queries** about market conditions
10. ✅ **Deploy and monitor**

---

## 💰 COST BREAKDOWN

**One-time:**
- Embedding 11 briefs (~22,000 words, ~44 chunks): $0.004
- Processing time: 15 minutes

**Monthly ongoing:**
- Supabase storage (44 rows × 1536 dimensions): $0.10
- Retrieval costs: Same as existing RAG (~$0.0004 per query)

**Total: ~$0.10/month** (negligible)

---

## 🚀 DEPLOYMENT PLAN

1. Implement Steps 1-6 above
2. Test locally with sample queries
3. Verify database is populated correctly
4. Deploy to production
5. Monitor for 24 hours
6. Adjust match_threshold if needed (0.7 is good starting point)

---

## 🎯 SUCCESS CRITERIA

Feature is successful when:
- ✅ Career Coach cites specific Insider Brief data
- ✅ Responses include Market Temperature scores
- ✅ Recent 2025 data is referenced in market questions
- ✅ Users get more specific, timely advice
- ✅ Bot differentiates from generic AI responses

---

## 📝 NOTES FOR CLAUDE CODE

- Use defensive error handling (try-catch everywhere)
- Log all steps for debugging
- Process briefs sequentially (not parallel) to avoid rate limits
- Keep original DOCX files as backup
- Test with one brief first before processing all 11
- Verify embeddings are generating correctly before batch upload

---

## 🔄 FUTURE MAINTENANCE

**When you publish Drop #12:**
1. Save DOCX to `insider-briefs/raw/`
2. Run `node scripts/process-insider-briefs.js`
3. New brief automatically added to knowledge base
4. No code changes needed!

**Optional enhancements:**
- Add automatic monthly processing via cron job
- Create admin panel to view brief analytics
- Track which briefs are cited most often
- Add date filtering (only show briefs from last 6 months)
