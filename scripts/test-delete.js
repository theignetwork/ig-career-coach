import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function test() {
  console.log('🔍 Testing delete permissions...\n');

  // First, fetch a post to see the structure
  const { data: samplePosts, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id, title, url, created_at')
    .limit(5);

  if (fetchError) {
    console.error('❌ Error fetching posts:', fetchError);
    return;
  }

  console.log('Sample posts:');
  samplePosts.forEach((post, idx) => {
    console.log(`  ${idx + 1}. ID: ${post.id}, Title: ${post.title.substring(0, 50)}...`);
    console.log(`     URL: ${post.url}`);
    console.log(`     Created: ${post.created_at}\n`);
  });

  // Check for duplicate URLs
  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('id, title, url, created_at')
    .order('created_at', { ascending: false });

  console.log(`\n📊 Total posts: ${allPosts.length}\n`);

  // Find duplicate URLs
  const urlMap = {};
  allPosts.forEach(post => {
    if (post.url) {
      if (!urlMap[post.url]) {
        urlMap[post.url] = [];
      }
      urlMap[post.url].push(post);
    }
  });

  const duplicateUrls = Object.entries(urlMap).filter(([url, posts]) => posts.length > 1);

  console.log(`Found ${duplicateUrls.length} URLs with duplicates\n`);

  if (duplicateUrls.length > 0) {
    const [url, posts] = duplicateUrls[0];
    console.log(`Example duplicate URL: ${url}`);
    console.log(`Copies: ${posts.length}`);
    posts.forEach((post, idx) => {
      console.log(`  ${idx + 1}. ID: ${post.id}, Created: ${post.created_at}`);
    });

    // Try to delete ONE specific duplicate
    const toDelete = posts[1]; // Keep first, delete second
    console.log(`\n🧪 Testing delete of ID ${toDelete.id}...`);

    const { error: deleteError, data: deleteData, count } = await supabase
      .from('blog_posts')
      .delete({ count: 'exact' })
      .eq('id', toDelete.id)
      .eq('created_at', toDelete.created_at);

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError);
    } else {
      console.log(`✅ Delete succeeded! Rows deleted: ${count}`);
    }

    // Verify
    const { data: afterDelete } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('url', url);

    console.log(`After delete: ${afterDelete.length} copies remaining for this URL`);
  }
}

test().catch(console.error);
