import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('🔍 Checking for duplicate blog posts...\n');

  // First, let's see how many duplicates we have
  const { data: duplicates, error: dupError } = await supabase
    .rpc('get_duplicate_blog_posts');

  if (dupError && dupError.code === '42883') {
    console.log('Creating helper function...\n');

    // Function doesn't exist, let's check manually
    const { data: allPosts, error } = await supabase
      .from('blog_posts')
      .select('id, title, created_at, ctid');

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    // Group by ID to find duplicates
    const postsById = {};
    allPosts.forEach(post => {
      if (!postsById[post.id]) {
        postsById[post.id] = [];
      }
      postsById[post.id].push(post);
    });

    // Find duplicates
    const duplicateGroups = Object.entries(postsById)
      .filter(([id, posts]) => posts.length > 1)
      .map(([id, posts]) => ({
        id,
        title: posts[0].title,
        count: posts.length,
        posts
      }));

    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`⚠️  Found ${duplicateGroups.length} posts with duplicates:\n`);

    duplicateGroups.slice(0, 10).forEach(group => {
      console.log(`  - "${group.title}" (ID: ${group.id}) - ${group.count} copies`);
    });

    if (duplicateGroups.length > 10) {
      console.log(`  ... and ${duplicateGroups.length - 10} more`);
    }

    const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + (g.count - 1), 0);
    console.log(`\n📊 Total duplicate rows to remove: ${totalDuplicates}\n`);

    console.log('🧹 Cleaning up duplicates (keeping the most recent)...\n');

    let removed = 0;
    for (const group of duplicateGroups) {
      // Sort by created_at, keep the newest
      const sorted = group.posts.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      // Remove all except the first (newest) one
      const toRemove = sorted.slice(1);

      for (const post of toRemove) {
        // Note: ctid is a postgres internal row identifier
        // We'll use a combination of fields to identify the exact row
        const { error: deleteError } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', post.id)
          .eq('created_at', post.created_at)
          .limit(1);

        if (!deleteError) {
          removed++;
        } else {
          console.error(`  ❌ Error removing duplicate for post ${post.id}:`, deleteError.message);
        }
      }

      console.log(`  ✓ Cleaned up "${group.title}" - removed ${toRemove.length} duplicates`);
    }

    console.log(`\n✅ Cleanup complete! Removed ${removed} duplicate rows.\n`);

    // Suggest adding unique constraint
    console.log('📝 Next steps:');
    console.log('   1. Go to Supabase SQL Editor');
    console.log('   2. Run this to prevent future duplicates:');
    console.log('');
    console.log('   ALTER TABLE blog_posts');
    console.log('   ADD CONSTRAINT blog_posts_id_unique UNIQUE (id);');
    console.log('');

  } else if (dupError) {
    console.error('Error:', dupError);
  }
}

main().catch(console.error);
