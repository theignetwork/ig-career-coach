import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('🔍 Checking for duplicate blog posts...\n');

  // Fetch all blog posts to check for duplicates manually
  const { data: allPosts, error } = await supabase
    .from('blog_posts')
    .select('id, title, url, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching posts:', error);
    return;
  }

  console.log(`📊 Total posts in database: ${allPosts.length}\n`);

  // Check 1: Group by ID to find exact ID duplicates
  console.log('🔍 Checking for duplicate IDs...');
  const postsById = {};
  allPosts.forEach(post => {
    if (!postsById[post.id]) {
      postsById[post.id] = [];
    }
    postsById[post.id].push(post);
  });

  const idDuplicates = Object.entries(postsById)
    .filter(([id, posts]) => posts.length > 1)
    .map(([id, posts]) => ({
      type: 'ID',
      id,
      title: posts[0].title,
      count: posts.length,
      posts
    }));

  if (idDuplicates.length === 0) {
    console.log('  ✅ No duplicate IDs found\n');
  } else {
    console.log(`  ⚠️  Found ${idDuplicates.length} duplicate IDs\n`);
  }

  // Check 2: Group by title to find content duplicates
  console.log('🔍 Checking for duplicate titles (same content, different IDs)...');
  const postsByTitle = {};
  allPosts.forEach(post => {
    const normalizedTitle = post.title.trim().toLowerCase();
    if (!postsByTitle[normalizedTitle]) {
      postsByTitle[normalizedTitle] = [];
    }
    postsByTitle[normalizedTitle].push(post);
  });

  const titleDuplicates = Object.entries(postsByTitle)
    .filter(([title, posts]) => posts.length > 1)
    .map(([title, posts]) => ({
      type: 'TITLE',
      title: posts[0].title,
      count: posts.length,
      posts
    }));

  if (titleDuplicates.length === 0) {
    console.log('  ✅ No duplicate titles found\n');
  } else {
    console.log(`  ⚠️  Found ${titleDuplicates.length} posts with duplicate titles\n`);
  }

  // Check 3: Group by URL to find URL duplicates
  console.log('🔍 Checking for duplicate URLs...');
  const postsByUrl = {};
  allPosts.forEach(post => {
    if (post.url) {
      const normalizedUrl = post.url.trim().toLowerCase();
      if (!postsByUrl[normalizedUrl]) {
        postsByUrl[normalizedUrl] = [];
      }
      postsByUrl[normalizedUrl].push(post);
    }
  });

  const urlDuplicates = Object.entries(postsByUrl)
    .filter(([url, posts]) => posts.length > 1)
    .map(([url, posts]) => ({
      type: 'URL',
      url,
      title: posts[0].title,
      count: posts.length,
      posts
    }));

  if (urlDuplicates.length === 0) {
    console.log('  ✅ No duplicate URLs found\n');
  } else {
    console.log(`  ⚠️  Found ${urlDuplicates.length} posts with duplicate URLs\n`);
  }

  // Combine all duplicate types
  const duplicateGroups = [...idDuplicates, ...titleDuplicates, ...urlDuplicates];

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found at all!');
    return;
  }

  console.log('='.repeat(80));
  console.log(`⚠️  FOUND ${duplicateGroups.length} DUPLICATE GROUPS\n`);

  // Show summary by type
  const idCount = idDuplicates.length;
  const titleCount = titleDuplicates.length;
  const urlCount = urlDuplicates.length;

  console.log(`📋 Breakdown:`);
  if (idCount > 0) console.log(`  - ${idCount} groups with duplicate IDs (exact duplicates)`);
  if (titleCount > 0) console.log(`  - ${titleCount} groups with duplicate titles (same content, different IDs)`);
  if (urlCount > 0) console.log(`  - ${urlCount} groups with duplicate URLs`);
  console.log('');

  // Show first 10 examples
  console.log(`📝 First 10 examples:\n`);
  duplicateGroups.slice(0, 10).forEach((group, idx) => {
    const shortTitle = group.title.length > 60 ? group.title.substring(0, 60) + '...' : group.title;
    console.log(`  ${idx + 1}. [${group.type}] "${shortTitle}"`);
    console.log(`     ${group.count} copies - IDs: ${group.posts.map(p => p.id).join(', ')}`);
  });

  if (duplicateGroups.length > 10) {
    console.log(`\n  ... and ${duplicateGroups.length - 10} more duplicate groups`);
  }

  const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + (g.count - 1), 0);
  console.log(`\n📊 Total duplicate rows that can be removed: ${totalDuplicates}`);
  console.log('='.repeat(80));

  console.log('\n🧹 Starting cleanup (keeping the most recent copy of each)...\n');

  let removed = 0;
  for (const group of duplicateGroups) {
    // Sort by created_at, keep the newest
    const sorted = group.posts.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );

    // Remove all except the first (newest) one
    const toRemove = sorted.slice(1);
    const shortTitle = group.title.length > 50 ? group.title.substring(0, 50) + '...' : group.title;

    for (const post of toRemove) {
      // Use the internal Supabase row identifier (ctid) or created_at timestamp for precise deletion
      const { data: rowsToDelete, error: selectError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', post.id)
        .eq('created_at', post.created_at)
        .limit(1)
        .single();

      if (selectError || !rowsToDelete) {
        console.error(`  ⚠️  Could not find row to delete (ID: ${post.id}, created: ${post.created_at})`);
        continue;
      }

      // Now delete using all matching fields to ensure we get the exact row
      const { error: deleteError, count } = await supabase
        .from('blog_posts')
        .delete({ count: 'exact' })
        .eq('id', post.id)
        .eq('created_at', post.created_at)
        .eq('title', post.title);

      if (deleteError) {
        console.error(`  ❌ Error removing duplicate ID ${post.id}:`, deleteError.message);
      } else if (count === 0) {
        console.error(`  ⚠️  No rows deleted for ID ${post.id}`);
      } else {
        removed++;
      }
    }

    console.log(`  ✓ [${group.type}] "${shortTitle}" - removed ${toRemove.length} copies`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ Cleanup complete! Removed ${removed} duplicate rows.\n`);

  // Suggest adding unique constraint
  console.log('📝 Next steps:');
  console.log('   1. Go to Supabase SQL Editor');
  console.log('   2. Run this to prevent future duplicates:');
  console.log('');
  console.log('   ALTER TABLE blog_posts');
  console.log('   ADD CONSTRAINT blog_posts_id_unique UNIQUE (id);');
  console.log('');
}

main().catch(console.error);
