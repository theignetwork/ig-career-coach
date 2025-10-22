// scripts/chunk-knowledge.js
// Split knowledge base markdown files into chunks for embedding

const fs = require('fs');
const path = require('path');

// File to tool mapping
const FILE_TOOL_MAP = {
  'Resume-Analyzer-Pro-Knowledge-Base.md': 'resume-analyzer',
  'Interview-Oracle-Pro-Knowledge-Base.md': 'interview-oracle',
  'Cover-Letter-Generator-Pro-Knowledge-Base.md': 'cover-letter',
  'IG-Interview-Coach-Knowledge-Base.md': 'interview-coach',
  'Hidden-Job-Boards-Tool-Knowledge-Base.md': 'job-boards',
  'IG-Insider-Briefs-Knowledge-Base.md': 'insider-briefs'
};

// Configuration
const MIN_CHUNK_WORDS = 300;
const MAX_CHUNK_WORDS = 800;
const OVERLAP_WORDS = 50;

/**
 * Count words in text
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Extract sections from markdown content
 * Returns array of {header, content, level}
 */
function extractSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        level: headerMatch[1].length,
        header: headerMatch[2].trim(),
        content: []
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Split text into words array
 */
function splitIntoWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0);
}

/**
 * Create chunks from a section with overlap
 */
function chunkSection(section, tool, filename) {
  const fullText = section.content.join('\n').trim();
  if (!fullText) return [];

  const words = splitIntoWords(fullText);
  const chunks = [];
  let startIdx = 0;

  while (startIdx < words.length) {
    // Determine chunk size
    let endIdx = Math.min(startIdx + MAX_CHUNK_WORDS, words.length);

    // If this would create a very small final chunk, extend current chunk
    if (words.length - endIdx < MIN_CHUNK_WORDS && endIdx < words.length) {
      endIdx = words.length;
    }

    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = chunkWords.join(' ');
    const wordCount = chunkWords.length;

    // Only add chunks that meet minimum size (unless it's the only chunk)
    if (wordCount >= MIN_CHUNK_WORDS || chunks.length === 0) {
      chunks.push({
        content: `## ${section.header}\n\n${chunkText}`,
        metadata: {
          tool: tool,
          content_type: 'tool_knowledge',
          source: filename,
          section: section.header,
          word_count: wordCount
        }
      });
    }

    // Move to next chunk with overlap
    startIdx = endIdx - OVERLAP_WORDS;

    // Break if we've processed everything
    if (endIdx >= words.length) break;
  }

  return chunks;
}

/**
 * Process a single markdown file
 */
function processFile(filePath, filename) {
  const tool = FILE_TOOL_MAP[filename];
  if (!tool) {
    console.warn(`⚠️  No tool mapping found for ${filename}, skipping...`);
    return [];
  }

  console.log(`\n📄 Processing: ${filename} (tool: ${tool})`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const sections = extractSections(content);

    console.log(`   Found ${sections.length} sections`);

    let allChunks = [];
    for (const section of sections) {
      const sectionChunks = chunkSection(section, tool, filename);
      allChunks = allChunks.concat(sectionChunks);

      if (sectionChunks.length > 0) {
        console.log(`   - "${section.header}": ${sectionChunks.length} chunks`);
      }
    }

    return allChunks;
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    return [];
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting knowledge base chunking...\n');

  const knowledgeBasePath = path.join(__dirname, '../knowledge-bases');
  const outputPath = path.join(__dirname, '../chunks.json');

  // Check if knowledge-bases directory exists
  if (!fs.existsSync(knowledgeBasePath)) {
    console.error(`❌ Error: ${knowledgeBasePath} directory not found`);
    process.exit(1);
  }

  // Get all markdown files
  const files = fs.readdirSync(knowledgeBasePath)
    .filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.error('❌ Error: No .md files found in knowledge-bases/');
    process.exit(1);
  }

  console.log(`Found ${files.length} markdown files`);

  // Process all files
  let allChunks = [];
  const fileStats = {};

  for (const filename of files) {
    const filePath = path.join(knowledgeBasePath, filename);
    const chunks = processFile(filePath, filename);

    fileStats[filename] = chunks.length;
    allChunks = allChunks.concat(chunks);
  }

  // Save to JSON
  try {
    fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2));
    console.log(`\n✅ Successfully created chunks.json`);
  } catch (error) {
    console.error(`❌ Error writing chunks.json:`, error.message);
    process.exit(1);
  }

  // Show summary
  console.log('\n📊 SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total files processed: ${files.length}`);
  console.log(`Total chunks created: ${allChunks.length}`);
  console.log('\nChunks per file:');

  for (const [filename, count] of Object.entries(fileStats)) {
    const tool = FILE_TOOL_MAP[filename] || 'unknown';
    console.log(`  ${tool.padEnd(20)} ${count} chunks`);
  }

  // Calculate stats
  const wordCounts = allChunks.map(c => c.metadata.word_count);
  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
  const minWords = Math.min(...wordCounts);
  const maxWords = Math.max(...wordCounts);

  console.log('\nChunk statistics:');
  console.log(`  Average words per chunk: ${avgWords}`);
  console.log(`  Min words: ${minWords}`);
  console.log(`  Max words: ${maxWords}`);
  console.log('\n✅ Created ' + allChunks.length + ' chunks from ' + files.length + ' files');
}

// Run the script
main();
