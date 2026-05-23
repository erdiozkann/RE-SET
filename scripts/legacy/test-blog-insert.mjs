import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEMO_EMAIL,
    password: process.env.VITE_DEMO_PASSWORD
  });

  console.log('--- Attempting insert into blog_posts ---');
  const { error } = await supabase.from('blog_posts').insert({
    title: 'Test',
    category: 'Test',
    read_time: '5 dk', 
    status: 'published'
  });

  if (error) {
     console.log('🔴 BLOG_POSTS INSERT ERROR:', error.message);
  } else {
     console.log('✅ BLOG_POSTS INSERT SUCCESS');
     await supabase.from('blog_posts').delete().eq('title', 'Test');
  }
}

check();
