import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const testPost = {
    title: 'Schema Check TEST',
    excerpt: 'Checking for columns...',
    content: 'test',
    category: 'Test',
    read_time: '5 min',
    featured: false,
    status: 'draft',
    date: new Date().toISOString().split('T')[0]
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([testPost])
    .select();

  if (error) {
    if (error.message && error.message.includes('column') && error.message.includes('not exist')) {
      console.log('🔴 SCHEMA MISMATCH: Some columns are missing from blog_posts table.');
      console.log('Error from Supabase:', error.message);
    } else {
      console.error('Error during test insert:', error);
    }
  } else {
    console.log('✅ SCHEMA OK: Successfully inserted test post with all columns.');
    // Cleanup
    if (data && data[0]) {
      await supabase.from('blog_posts').delete().eq('id', data[0].id);
      console.log('Cleaned up test post.');
    }
  }
}

check();
