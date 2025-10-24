import fetch from 'node-fetch';
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
const WORDPRESS_API_URL = 'https://blog.theinterviewguys.com/wp-json/wp/v2/posts';
const PER_PAGE = 10; // WordPress default
const BATCH_SIZE = 5; // Process 5 posts at a time to avoid rate limits

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html) {
  if (!html) return '';

  // Remove all HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#039;/g, "'");
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');

  // Remove multiple spaces and trim
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Fetch all posts from WordPress API with pagination
 */
async function fetchAllPosts() {
  console.log('📥 Fetching posts from WordPress API...\n');

  let allPosts = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const url = `${WORDPRESS_API_URL}?per_page=${PER_PAGE}&page=${page}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 400) {
          // Page out of range, we're done
          hasMorePages = false;
          break;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const posts = await response.json();

      if (posts.length === 0) {
        hasMorePages = false;
        break;
      }

      allPosts = allPosts.concat(posts);

      console.log(`  ✓ Fetched page ${page} (${posts.length} posts) - Total: ${allPosts.length}`);

      // Check if there are more pages
      const totalPages = response.headers.get('x-wp-totalpages');
      if (totalPages && page >= parseInt(totalPages)) {
        hasMorePages = false;
      }

      page++;

      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ Error fetching page ${page}:`, error.message);
      hasMorePages = false;
    }
  }

  console.log(`\n✅ Total posts fetched: ${allPosts.length}\n`);
  return allPosts;
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(text) {
  try {
    // Limit text to ~8000 characters for embedding (token limit)
    const truncatedText = text.substring(0, 8000);

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: truncatedText
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    return null;
  }
}

/**
 * Process a single blog post
 */
async function processPost(post) {
  try {
    // Extract and clean data
    const id = post.id;
    const title = stripHtml(post.title.rendered);
    const url = post.link;
    const content = stripHtml(post.content.rendered);
    const excerpt = stripHtml(post.excerpt.rendered);

    // Determine category (you can enhance this based on your category IDs)
    let category = 'general';
    if (post.categories && post.categories.length > 0) {
      // Map category IDs to names if you have them
      // For now, we'll use the first category ID
      const categoryId = post.categories[0];

      // Common category mappings (adjust based on your WordPress categories)
      const categoryMap = {
        6: 'Job Interviews',
        7: 'Job Search',
        16: 'Interview Questions',
        // Add more as needed
      };

      category = categoryMap[categoryId] || 'general';
    }

    // Generate embedding from title + excerpt + first 1000 chars of content
    const textForEmbedding = `${title}\n\n${excerpt}\n\n${content.substring(0, 1000)}`;
    const embedding = await generateEmbedding(textForEmbedding);

    if (!embedding) {
      return { success: false, id, title };
    }

    // Check if post already exists in database
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('id', id)
      .single();

    if (existing) {
      // Update existing post
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title,
          url,
          category,
          content,
          excerpt,
          embedding
        })
        .eq('id', id);

      if (error) {
        console.error(`  ❌ Error updating post ${id}:`, error.message);
        return { success: false, id, title };
      }
    } else {
      // Insert new post
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          id,
          title,
          url,
          category,
          content,
          excerpt,
          embedding
        });

      if (error) {
        console.error(`  ❌ Error inserting post ${id}:`, error.message);
        return { success: false, id, title };
      }
    }

    return { success: true, id, title };

  } catch (error) {
    console.error(`  ❌ Error processing post:`, error.message);
    return { success: false, id: post.id, title: post.title?.rendered || 'Unknown' };
  }
}

/**
 * Process posts in batches
 */
async function processBatch(posts, batchNumber, totalBatches) {
  console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${posts.length} posts)...`);

  const results = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const title = stripHtml(post.title.rendered);
    const shortTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;

    console.log(`  [${i + 1}/${posts.length}] Processing: "${shortTitle}"`);

    const result = await processPost(post);
    results.push(result);

    if (result.success) {
      console.log(`    ✓ Success`);
    } else {
      console.log(`    ✗ Failed`);
    }

    // Small delay between posts
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n  ✅ Batch complete: ${successCount}/${posts.length} successful`);

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Blog Post Import...\n');
  console.log('='.repeat(80));

  // Fetch all posts from WordPress
  const allPosts = await fetchAllPosts();

  if (allPosts.length === 0) {
    console.log('❌ No posts found. Exiting.');
    return;
  }

  // Split into batches
  const batches = [];
  for (let i = 0; i < allPosts.length; i += BATCH_SIZE) {
    batches.push(allPosts.slice(i, i + BATCH_SIZE));
  }

  console.log(`\n📊 Processing ${allPosts.length} posts in ${batches.length} batches of ${BATCH_SIZE}\n`);
  console.log('='.repeat(80));

  // Process each batch
  let allResults = [];
  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(batches[i], i + 1, batches.length);
    allResults = allResults.concat(batchResults);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 IMPORT COMPLETE');
  console.log('='.repeat(80));

  const successful = allResults.filter(r => r.success);
  const failed = allResults.filter(r => !r.success);

  console.log(`✅ Successfully processed: ${successful.length}/${allPosts.length} posts`);
  console.log(`📝 Total embeddings generated: ${successful.length}`);
  console.log(`💰 Estimated cost: ~$${(successful.length * 0.0001).toFixed(2)}`);

  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} posts failed to process:`);
    failed.forEach(f => {
      const shortTitle = f.title.length > 60 ? f.title.substring(0, 60) + '...' : f.title;
      console.log(`  - ID ${f.id}: ${shortTitle}`);
    });
  }

  console.log('\n✅ Blog posts are now searchable with semantic similarity!');
}

// Run the script
main().catch(console.error);
