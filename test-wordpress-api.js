// Test WordPress REST API
import fetch from 'node-fetch';

async function testWordPressAPI() {
  console.log('🔍 Testing WordPress REST API...\n');

  const url = 'https://blog.theinterviewguys.com/wp-json/wp/v2/posts?per_page=10';

  try {
    const response = await fetch(url);

    console.log('📊 Response Headers:');
    console.log('Status:', response.status);
    console.log('X-WP-Total:', response.headers.get('x-wp-total'));
    console.log('X-WP-TotalPages:', response.headers.get('x-wp-totalpages'));
    console.log('Link:', response.headers.get('link'));
    console.log('');

    const data = await response.json();

    console.log('📝 Response Data:');
    console.log('Posts returned:', data.length);
    console.log('');

    if (data.length > 0) {
      const firstPost = data[0];
      console.log('📄 First Post Sample:');
      console.log('ID:', firstPost.id);
      console.log('Title:', firstPost.title.rendered);
      console.log('URL:', firstPost.link);
      console.log('Excerpt length:', firstPost.excerpt.rendered.length);
      console.log('Content length:', firstPost.content.rendered.length);
      console.log('Categories:', firstPost.categories);
      console.log('Date:', firstPost.date);
      console.log('');
      console.log('Available fields:', Object.keys(firstPost).join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWordPressAPI();
